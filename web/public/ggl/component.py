"""
Component template system for GGL subcircuits.

This module provides the infrastructure for creating reusable component templates
that can be instantiated multiple times with isolated state.
"""

from .node import Node, Connector
from .io import Input, Output
from .ggl_logging import new_logger
import copy

logger = new_logger('component')


class ComponentConnector(Connector):
    """
    A special connector that tracks which component instance it belongs to.
    This allows the Circuit.connect() method to automatically register
    component nodes when they're first connected.
    """

    def __init__(self, node, name, component_instance, is_input=False):
        super().__init__(node, name)
        self.component_instance = component_instance
        self.is_input = is_input  # True for component inputs, False for outputs


class ComponentInputProxy:
    """
    A proxy that wraps a component's Input node to make it externally connectable.
    It looks like a normal node with inputs, but forwards values to the wrapped Input node.
    """
    inport = '0'

    def __init__(self, wrapped_input, instance_id):
        self.wrapped_input = wrapped_input
        self.kind = 'ComponentInputProxy'
        self.label = f"proxy_{wrapped_input.label}"

        # Create inputs so external nodes can connect TO this proxy
        from .node import NodeInputs, NodeOutputs
        self.inputs = NodeInputs(['0'], self)
        # Proxy outputs go to wrapped input
        self.outputs = NodeOutputs(['0'], self)

        # Connect our output to the wrapped input's value
        self._connect_to_wrapped()

    def _connect_to_wrapped(self):
        """Create internal connection to wrapped input"""
        # This proxy's output feeds the wrapped input's value
        pass  # We'll handle this in propagate()

    def propagate(self, output_name='0', value=0):
        """Receive value from external connection and forward to wrapped input"""
        # Get value from our input edge
        v = self.inputs.read_value(ComponentInputProxy.inport)
        # Set the wrapped input's value and add it to the work queue
        # Don't propagate the wrapped input immediately - let the simulation handle it
        self.wrapped_input.value = v
        logger.debug(
            f"InputProxy {self.label} setting wrapped input {self.wrapped_input.label} value to {v}")
        # Return the wrapped input to be processed in the next iteration
        return [self.wrapped_input]

    def set_input_edge(self, name, edge):
        """Accept external connections"""
        self.inputs.set_edge(name, edge)

    def append_output_edge(self, name, edge):
        """Required for node interface"""
        self.outputs.append_edge(name, edge)


class ComponentOutputProxy:
    """
    A proxy that wraps a component's Output node to make it externally connectable.
    It receives values from the wrapped Output node and provides them as outputs.
    """
    outport = '0'

    def __init__(self, wrapped_output, instance_id):
        self.wrapped_output = wrapped_output
        self.kind = 'ComponentOutputProxy'
        self.label = f"proxy_{wrapped_output.label}"

        # Create outputs so external nodes can connect FROM this proxy
        from .node import NodeInputs, NodeOutputs
        self.inputs = NodeInputs(['0'], self)    # Receive from wrapped output
        # Provide to external connections
        self.outputs = NodeOutputs(['0'], self)

        # We'll create the connection during component instantiation

    def propagate(self, output_name='0', value=0):
        """Receive value from wrapped output and propagate to external connections"""
        # Get the value from our input (which comes from the wrapped output)
        v = self.inputs.read_value(ComponentOutputProxy.outport)

        # Propagate to external connections
        new_work = self.outputs.write_value(ComponentOutputProxy.outport, v)
        return new_work

    def set_input_edge(self, name, edge):
        """Accept connection from wrapped output"""
        self.inputs.set_edge(name, edge)

    def append_output_edge(self, name, edge):
        """Accept external connections FROM this proxy"""
        self.outputs.append_edge(name, edge)


class ComponentTemplate:
    """
    A ComponentTemplate captures the structure of a circuit that can be
    instantiated multiple times as a reusable component.
    """

    def __init__(self, circuit):
        """
        Create a component template from a circuit definition.

        Args:
            circuit: A Circuit instance containing the component definition
        """
        self.circuit = circuit
        self._analyze_io()

    def _analyze_io(self):
        """
        Analyze the circuit to identify input and output nodes.
        These become the external interface of the component.
        """
        self.input_nodes = {}
        self.output_nodes = {}
        self.internal_nodes = []

        for node in self.circuit.all_nodes:
            if isinstance(node, Input):
                # Input nodes become component inputs
                self.input_nodes[node.label] = node
            elif isinstance(node, Output):
                # Output nodes become component outputs
                self.output_nodes[node.label] = node
            else:
                # Everything else is internal
                self.internal_nodes.append(node)

        logger.info(f"Template created with {len(self.input_nodes)} inputs, "
                    f"{len(self.output_nodes)} outputs, {len(self.internal_nodes)} internal nodes")

    def __call__(self):
        """
        Create a fresh instance of this component.

        Returns:
            ComponentInstance: A new instance with isolated state
        """
        return ComponentInstance(self)


class ComponentInstance:
    """
    A ComponentInstance represents a specific instantiation of a ComponentTemplate.
    Each instance has its own isolated state and can be wired independently.
    """

    def __init__(self, template):
        """
        Create a new component instance from a template.

        Args:
            template: ComponentTemplate to instantiate
        """
        self.template = template
        self._instance_id = id(self)

        # Maps from template nodes to instance nodes
        self._node_map = {}

        # External interface - these are what parent circuits connect to
        self._input_nodes = {}
        self._output_nodes = {}

        # Proxy nodes for external connections
        self._input_proxies = {}   # Proxy nodes that wrap Input nodes
        self._output_proxies = {}  # Proxy nodes that wrap Output nodes

        # Internal nodes - these are hidden from parent circuits
        self._internal_nodes = []

        self._create_instance()

    def _create_instance(self):
        """
        Create fresh instances of all nodes and recreate connections.
        """
        # Step 1: Create fresh instances of all nodes
        self._clone_nodes()

        # Step 2: Recreate all connections using the fresh nodes
        self._clone_connections()

        # Step 3: Wire up output proxies to receive from output nodes
        self._connect_output_proxies()

        logger.info(f"Component instance {self._instance_id} created")

    def _clone_nodes(self):
        """
        Create fresh instances of all nodes with unique labels.
        """
        # Clone input nodes and create proxies
        for label, template_node in self.template.input_nodes.items():
            instance_node = Input(
                label=f"{label}_{self._instance_id}",
                bits=template_node.bits
            )
            self._node_map[template_node] = instance_node
            self._input_nodes[label] = instance_node

            # Create a proxy that external circuits can connect to
            proxy = ComponentInputProxy(instance_node, self._instance_id)
            self._input_proxies[label] = proxy

        # Clone output nodes and create proxies
        for label, template_node in self.template.output_nodes.items():
            instance_node = Output(
                label=f"{label}_{self._instance_id}",
                bits=template_node.bits
            )
            self._node_map[template_node] = instance_node
            self._output_nodes[label] = instance_node

            # Create a proxy that external circuits can connect from
            proxy = ComponentOutputProxy(instance_node, self._instance_id)
            self._output_proxies[label] = proxy

        # Clone internal nodes
        for template_node in self.template.internal_nodes:
            instance_node = self._clone_node(template_node)
            self._node_map[template_node] = instance_node
            self._internal_nodes.append(instance_node)

    def _clone_node(self, template_node):
        """
        Create a fresh instance of a node with the same type and properties.

        Args:
            template_node: The node to clone

        Returns:
            Node: A fresh instance of the same type
        """
        # Use the node's clone method - proper OOP!
        return template_node.clone(self._instance_id)

    def _clone_connections(self):
        """
        Recreate all connections from the template using the fresh node instances.
        """
        # We need to rebuild the connections by examining the template circuit
        # Since edges are stored in nodes, we iterate through all template nodes
        # and recreate their output connections

        for template_node in self.template.circuit.all_nodes:
            instance_node = self._node_map[template_node]

            # For each output of the template node
            for output_name, template_edges in template_node.outputs.points.items():
                for template_edge in template_edges:
                    # Get the destination from the edge's destpoints
                    # An edge can have multiple destinations, but in our case each edge
                    # connects to exactly one destination
                    dest_points = template_edge.destpoints.points
                    if dest_points:
                        # Get first (and should be only) destination
                        dest_point = dest_points[0]
                        dest_template_node = dest_point.node
                        dest_name = dest_point.name

                        # Find corresponding instance node
                        dest_instance_node = self._node_map[dest_template_node]

                        # Create new edge connecting instance nodes
                        from .edge import Edge
                        new_edge = Edge(
                            instance_node, output_name,
                            dest_instance_node, dest_name
                        )

                        # Connect the edge
                        instance_node.append_output_edge(output_name, new_edge)
                        dest_instance_node.set_input_edge(dest_name, new_edge)

    def _connect_output_proxies(self):
        """
        Connect output proxies to receive values from their wrapped output nodes.
        We connect the proxies to the same sources that feed the output nodes.
        """
        for label, proxy in self._output_proxies.items():
            output_node = self._output_nodes[label]

            # Find what feeds the output node
            input_edge = output_node.get_input_edge('0')
            if input_edge:
                # Connect the same source to feed our proxy
                source_node = input_edge.srcpoint.node
                source_port = input_edge.srcpoint.name

                # Create edge from source to proxy (in parallel with the output node)
                from .edge import Edge
                proxy_edge = Edge(source_node, source_port, proxy, '0')
                source_node.append_output_edge(source_port, proxy_edge)
                proxy.set_input_edge('0', proxy_edge)

    def input(self, name):
        """
        Get a named input connector for this component instance.

        Args:
            name: Name of the input (from original circuit definition)

        Returns:
            Connector: Connector to the input proxy node
        """
        if name not in self._input_proxies:
            raise ValueError(f"Component has no input named '{name}'. "
                             f"Available inputs: {list(self._input_proxies.keys())}")

        # Return connector to the proxy node - external circuits connect TO the proxy
        proxy = self._input_proxies[name]
        from .node import Connector
        return Connector(proxy, '0')

    def output(self, name):
        """
        Get a named output connector for this component instance.

        Args:
            name: Name of the output (from original circuit definition)

        Returns:
            Connector: Connector to the output proxy node
        """
        if name not in self._output_proxies:
            raise ValueError(f"Component has no output named '{name}'. "
                             f"Available outputs: {list(self._output_proxies.keys())}")

        # Return connector to the proxy node - external circuits connect FROM the proxy
        proxy = self._output_proxies[name]
        from .node import Connector
        return Connector(proxy, '0')

    @property
    def inputs(self):
        """
        Get inputs by index (for array-style access like fa0.inputs[0]).

        Returns:
            List[ComponentConnector]: List of input connectors in alphabetical order
        """
        sorted_names = sorted(self._input_nodes.keys())
        return [self.input(name) for name in sorted_names]

    @property
    def outputs(self):
        """
        Get outputs by index (for array-style access like fa0.outputs[0]).

        Returns:
            List[ComponentConnector]: List of output connectors in alphabetical order
        """
        sorted_names = sorted(self._output_nodes.keys())
        return [self.output(name) for name in sorted_names]

    def get_all_nodes(self):
        """
        Get all nodes in this component instance (for adding to parent circuit).

        Returns:
            List[Node]: All nodes that should be added to the parent circuit
        """
        all_nodes = []
        # Internal Input nodes
        all_nodes.extend(self._input_nodes.values())
        # Internal Output nodes
        all_nodes.extend(self._output_nodes.values())
        # Internal logic nodes
        all_nodes.extend(self._internal_nodes)
        # External input proxy nodes
        all_nodes.extend(self._input_proxies.values())
        # External output proxy nodes
        all_nodes.extend(self._output_proxies.values())
        return all_nodes
