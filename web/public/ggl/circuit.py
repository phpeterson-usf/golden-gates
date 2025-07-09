from .edge import Edge
from .node import Node, Connector
from .ggl_logging import get_logger, set_global_js_logging
from collections import deque

logger = get_logger('circuit')

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

    def preflight(self):
        """
        TODO: 
        - don't allow mismatched bit widths. Can that be done here?
        - don't allow more than one output to the same input
        """
        return True

    def run(self):
        """
        run() initiates a simulation starting with Input Nodes
        Each Node in the work queue does its function, and returns
        a list of any Nodes which must be re-evaluated
        """
        """work = []
        for i in self.inputs:
            work.append(i)
        while len(work) > 0:
            node = work[0]
            new_work = node.propagate()
            work.remove(node)
            if new_work:
                work += new_work"""

               
        """work = list(self.inputs)                                # start with all input Nodes
        iteration = 0

        while iteration < MAX_ITERATIONS:
            iteration += 1
            logger.info(f"Simulation iteration {iteration}")

            changes = 0
            new_work = set()

            while work:
                node = work.pop(0)                              # first in first out queue
                downstream_nodes = node.propagate() or []

                for n in downstream_nodes:                      # queue nodes returned by propagate
                    new_work.add(n)

                for edges in node.outputs.points.values():      # queue nodes downstream of changed edge values
                    for edge in edges:
                        if edge.prev_value != edge.value:
                            changes += 1
                            for dest_node in edge.get_dest_nodes():
                                new_work.add(dest_node)

            if not new_work and changes == 0:
                logger.info("Circuit stabilized.")
                break

            work = list(new_work)
        if iteration == MAX_ITERATIONS:
            logger.warning("Circuit did not stabilize within max iterations.")"""

        work = work = list(self.inputs)                                     # start with all input Nodes
        iteration = 0

        output_history = deque(maxlen=10)                                   # use deque to track last ten inputs so that it stops before max iterations if the output values do not change

        for node in self.all_nodes:
            for edges in node.outputs.points.values():
                for edge in edges:
                    edge.prev_value = edge.value

        while iteration < MAX_ITERATIONS:       
            iteration += 1
            logger.info(f"Simulation iteration {iteration}")

            new_work = set()

            while work:                                                     # first in first out queue
                node = work.pop(0)
                downstream_nodes = node.propagate() or []

                for n in downstream_nodes:                                  # queue nodes returned by propagate
                    new_work.add(n)

                for edges in node.outputs.points.values():                  # queue nodes downstream of changed edge values
                    for edge in edges:
                        if edge.prev_value != edge.value:
                            for dest_node in edge.get_dest_nodes():
                                new_work.add(dest_node)


            output_vals = {node.label: node.value for node in self.outputs} # get output values
            logger.info(f"Outputs at iteration {iteration}: {output_vals}")

            output_history.append(output_vals)                              # append output values to output history


            if len(output_history) == 10 and all(v == output_history[0] for v in output_history):
                logger.info("Circuit stabilized (same output values for 10 iterations).")
                break                                                       # check if last 10 output states are the same + break out of loop

            work = list(new_work)

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
                raise ValueError(f"Node {src} has {len(output_names)} outputs, must use .output('name')")
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
                raise ValueError(f"Node {dest} has {len(input_names)} inputs, must use .input('name')")
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
        logger.info(f"Registered component instance {instance_id} with circuit")
    

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

