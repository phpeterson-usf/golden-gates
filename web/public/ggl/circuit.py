from .edge import Edge
from .node import Node, Connector
from .ggl_logging import new_logger, set_global_js_logging
from collections import deque

logger = new_logger(__name__)

MAX_ITERATIONS = 100  # Prevent infinite loops


class Circuit:
    """
    Circuits are a collection of Nodes which may be run()
    to produce a value in Output Nodes
    """

    def __init__(self, label='', js_logging=None):
        self.label = label
        # These are Nodes, NOT in/outpoints, pending a design for subcircuits
        self.inputs = []
        self.outputs = []
        self.all_nodes = set()

        # Set up logging for this circuit and all its components
        if js_logging is not None:
            set_global_js_logging(js_logging)

    def step(self):
        """
        Perform one propagation step in the circuit which handles both clocked and combinational propagation.
        """
        work = list(self.inputs) + list(getattr(self, 'clocks', []))

        for node in self.all_nodes:
            for edges in node.outputs.points.values():
                for edge in edges:
                    edge.prev_value = edge.value

        new_work = set()

        while work:
            node = work.pop(0)
            downstream_nodes = node.propagate() or []

            for n in downstream_nodes:
                new_work.add(n)

            for edges in node.outputs.points.values():
                for edge in edges:
                    if edge.prev_value != edge.value:
                        for dest_node in edge.get_dest_nodes():
                            new_work.add(dest_node)

        return list(new_work)
    

    
    def run(self):
        """
        Circuit simulation supporting combinational, sequential, and cyclic logic

        run()
            comb_graph # input, constant...
            seq_graph # clock...
            loop:
                loop:
                    comb_graph.step until stabilized
                loop: # CLK HI
                    seq_graph.step until stabilized
                loop:
                    comb...
                loop: # CLK LOW
                    seq...
        """
        # helper function to check whether a circuit is sequential or combinational
        def sequential(node):
            for edge in node.inputs.points.values():
                if edge is not None and edge.srcpoint.node.kind == 'Clock':
                    return True
            return False
        
        if not hasattr(self, 'clocks'):
            self.clocks = [node for node in self.all_nodes if node.kind == 'Clock']

        iteration = 0
        output_history = deque(maxlen=10)

        # separate combinational vs sequential nodes using the helper funciton
        comb_nodes = [n for n in self.all_nodes if n.kind != 'Clock' and not sequential(n)]
        seq_nodes = [n for n in self.all_nodes if sequential(n)]

        def propagate_until_stable(nodes, name):
            work = list(nodes)
            seen = set(work)
            iterations = 0
            while work and iterations < MAX_ITERATIONS:
                iterations += 1
                new_work = set()
                while work:
                    node = work.pop(0)
                    downstream = node.propagate() or []

                    for n in downstream:
                        if n not in seen:
                            new_work.add(n)
                            seen.add(n)

                    for edges in node.outputs.points.values():
                        for edge in edges:
                            if edge.prev_value != edge.value:
                                for dest_node in edge.get_dest_nodes():
                                    if dest_node not in seen:
                                        new_work.add(dest_node)
                                        seen.add(dest_node)

                work = list(new_work)

            if iterations == MAX_ITERATIONS:
                logger.warning(f"{name} graph did not stabilize in {MAX_ITERATIONS} steps.")

        for node in self.all_nodes:
            for edges in node.outputs.points.values():
                for edge in edges:
                    edge.prev_value = edge.value

        while iteration < MAX_ITERATIONS:
            iteration += 1
            logger.info(f"Main iteration {iteration}")

            # loop through combinational logic until stable
            propagate_until_stable(comb_nodes, "Combinational")

            # propagate clocks to high
            for clock in self.clocks:
                clock.value = 1
                clock.propagate()
            propagate_until_stable(seq_nodes, "Sequential HI CLK")

            # final combinational propagation post-sequential changes
            propagate_until_stable(comb_nodes, "Combinational post-CLK HI")

            for clock in self.clocks:
                clock.value = 0  # Simulate CLK LOW
                clock.propagate()
            propagate_until_stable(seq_nodes, "Sequential CLK LOW")

            # check output stability using deque
            output_vals = {node.label: node.value for node in self.outputs}
            logger.info(f"Outputs after iteration {iteration}: {output_vals}")
            output_history.append(output_vals)

            if len(output_history) == 10 and all(v == output_history[0] for v in output_history):
                logger.info("Circuit stabilized with constant outputs for 10 iterations.")
                break

        if iteration == MAX_ITERATIONS:
            logger.warning("Circuit did not stabilize within max iterations.")


    def connect(self, src, dest):
        """
        Connect nodes using connectors or nodes directly.
        - For nodes with single outputs/inputs, can pass the node directly
        - For multiple outputs/inputs, must use node.output("name") or node.input("name")
        - For component instances, automatically registers component nodes
        """
        # Import here to avoid circular dependency
        from .component import ComponentConnector

        # Handle component instances - register their nodes if needed
        if isinstance(src, ComponentConnector):
            self._ensure_component_registered(src.component_instance)
        if isinstance(dest, ComponentConnector):
            self._ensure_component_registered(dest.component_instance)

        # Determine source
        if isinstance(src, Connector):
            srcnode, srcname = src.node, src.name
        elif isinstance(src, Node):
            # Direct node - must have single output
            output_names = list(src.outputs.points.keys())
            if len(output_names) != 1:
                raise ValueError(
                    f"Node {src} has {len(output_names)} outputs, must use .output('name')")
            srcnode, srcname = src, output_names[0]
        else:
            raise TypeError("Source must be a Node or Connector")

        # Determine destination
        if isinstance(dest, Connector):
            destnode, destname = dest.node, dest.name
        elif isinstance(dest, Node):
            # Direct node - must have single input
            input_names = list(dest.inputs.points.keys())
            if len(input_names) != 1:
                raise ValueError(
                    f"Node {dest} has {len(input_names)} inputs, must use .input('name')")
            destnode, destname = dest, input_names[0]
        else:
            raise TypeError("Destination must be a Node or Connector")

        # Create the edge
        edge = Edge(srcnode, srcname, destnode, destname)
        srcnode.append_output_edge(srcname, edge)
        destnode.set_input_edge(destname, edge)

        # Keep a list of Input Nodes so we can start the simulation from there
        if srcnode.kind == 'Input' and srcnode not in self.inputs:
            self.inputs.append(srcnode)
        if destnode.kind == 'Output' and destnode not in self.outputs:
            self.outputs.append(destnode)

        self.all_nodes.update([srcnode, destnode])

        # Keep a list of Clock Nodes for clock propagation in the circuit.run()
        if not hasattr(self, 'clocks'):
            self.clocks = []
        if srcnode.kind == 'Clock' and srcnode not in self.clocks:
            self.clocks.append(srcnode)
        if destnode.kind == 'Clock' and destnode not in self.clocks:
            self.clocks.append(destnode)

    def _ensure_component_registered(self, component_instance):
        """
        Ensure all nodes from a component instance are registered with this circuit.
        This is called automatically when connecting to/from component nodes.

        Args:
            component_instance: ComponentInstance to register
        """
        # Track which component instances we've already registered
        if not hasattr(self, '_registered_components'):
            self._registered_components = set()

        # Skip if already registered
        instance_id = id(component_instance)
        if instance_id in self._registered_components:
            return

        # Register all nodes from the component
        for node in component_instance.get_all_nodes():
            self.all_nodes.add(node)

            # Don't add component's internal Input nodes to our inputs list
            # They're not top-level inputs for this circuit

        self._registered_components.add(instance_id)
        logger.info(
            f"Registered component instance {instance_id} with circuit")


def Component(circuit):
    """
    Create a reusable component template from a circuit definition.

    This function implements the circuit.Component(c) syntax from the GGL spec.
    It returns a constructor function that creates fresh instances.

    Args:
        circuit: A Circuit instance containing the component definition

    Returns:
        ComponentTemplate: A template that can be called to create instances
    """
    from .component import ComponentTemplate
    return ComponentTemplate(circuit)
