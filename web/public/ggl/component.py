from .node import Node, Connector
from .ggl_logging import new_logger

logger = new_logger(__name__)


class CircuitNode(Node):
    """
    A CircuitNode wraps a Circuit instance to make it behave like a Node.
    This enables circuits to be composed hierarchically as components within other circuits.
    Each CircuitNode maintains its own state.
    """

    def __init__(self, template, instance_id):
        """
        Create a CircuitNode that wraps a cloned circuit instance.        
        """
        # Clone the circuit to ensure independent state
        self.circuit = self._clone_circuit(template, instance_id)
        self._instance_id = instance_id

        # Extract input and output names from the ORIGINAL template (not cloned circuit)
        # This ensures the external interface uses the original names
        input_names = [inp.label for inp in template.inputs]
        output_names = [out.label for out in template.outputs]

        # Initialize as a Node with the circuit's interface
        super().__init__(
            kind='CircuitNode',
            js_id='',
            innames=input_names,
            outnames=output_names,
            label=f"{template.label}_{instance_id}" if template.label else f"circuit_{instance_id}"
        )

        # Create mapping from original names to cloned node names for internal use
        self._input_mapping = {
            i.label: f"{i.label}_{instance_id}" for i in template.inputs}
        self._output_mapping = {
            o.label: f"{o.label}_{instance_id}" for o in template.outputs}

    def _clone_circuit(self, template, instance_id):
        """
        Create a deep copy of the template circuit with independent state.
        """
        # Import here to avoid circular dependency
        from .circuit import Circuit

        # Create new circuit instance
        cloned_circuit = Circuit(label=f"{template.label}_{instance_id}")

        # Maps from template nodes to cloned nodes
        node_map = {}

        # Clone all nodes with unique labels
        for template_node in template.all_nodes:
            cloned_node = template_node.clone(instance_id)
            node_map[template_node] = cloned_node
            cloned_circuit.all_nodes.add(cloned_node)

            # Update circuit's input/output lists
            if template_node in template.inputs:
                cloned_circuit.inputs.append(cloned_node)
                cloned_node.circuit = cloned_circuit
            if template_node in template.outputs:
                cloned_circuit.outputs.append(cloned_node)

        # Clone all connections
        for template_node in template.all_nodes:
            cloned_node = node_map[template_node]

            # Recreate output connections
            for output_name, template_edges in template_node.outputs.points.items():
                for template_edge in template_edges:
                    # Find destination points
                    for dest_point in template_edge.destpoints.points:
                        dest_template_node = dest_point.node
                        dest_name = dest_point.name
                        dest_cloned_node = node_map[dest_template_node]

                        # Create new edge
                        from .edge import Edge
                        new_edge = Edge(cloned_node, output_name,
                                        dest_cloned_node, dest_name)
                        cloned_node.append_output_edge(output_name, new_edge)
                        dest_cloned_node.set_input_edge(dest_name, new_edge)

        return cloned_circuit

    def propagate(self, output_name='0', value=0):
        """
        Propagate values through this circuit node:
        1. Update input values from connected edges
        2. Run one circuit step to process the inputs
        3. Read output values and propagate them to connected nodes

        Returns:
            List[Node]: Nodes that need further propagation
        """
        logger.debug(f"{self.kind} {self.label} propagate() called")

        # Step 1: Update circuit input values from our input edges using name mapping
        logger.debug(
            f"{self.kind} {self.label}: Step 1 - Reading input values from edges")
        for original_name, cloned_name in self._input_mapping.items():
            if original_name in self.inputs.points:
                edge = self.get_input_edge(original_name)
                if edge is not None:
                    input_value = edge.value
                    # Find the cloned input node and set its value
                    for input_node in self.circuit.inputs:
                        if input_node.label == cloned_name:
                            logger.debug(
                                f"{self.kind} {self.label}: Setting input '{original_name}' -> '{cloned_name}' = 0x{input_value:02x}")
                            input_node.value = input_value
                            break
                else:
                    logger.debug(
                        f"{self.kind} {self.label}: Input '{original_name}' has no edge")

        # Step 2: Show internal circuit state before running step
        logger.debug(
            f"{self.kind} {self.label}: Step 2 - Internal circuit state before step()")
        internal_circuit_nodes = [
            n for n in self.circuit.all_nodes if isinstance(n, CircuitNode)]
        logger.debug(
            f"{self.kind} {self.label}: Internal circuit has {len(internal_circuit_nodes)} nested CircuitNodes")
        for i, cn in enumerate(internal_circuit_nodes):
            logger.debug(
                f"{self.kind} {self.label}: Nested CircuitNode {i}: {cn.label}")
            # Show the input edges of nested CircuitNodes
            for input_name in cn.inputs.points.keys():
                nested_edge = cn.get_input_edge(input_name)
                if nested_edge:
                    logger.debug(
                        f"{self.kind} {self.label}: Nested {cn.label} input '{input_name}' edge value = 0x{nested_edge.value:02x}")
                else:
                    logger.debug(
                        f"{self.kind} {self.label}: Nested {cn.label} input '{input_name}' has no edge")

        # Step 2: Manually propagate input nodes to edges
        logger.debug(
            f"{self.kind} {self.label}: Manually propagating internal INPUT nodes first")
        for input_node in self.circuit.inputs:
            input_node.propagate()

        # Step 3: Run one simulation step on the wrapped circuit
        logger.debug(
            f"{self.kind} {self.label}: Running internal circuit.step()")
        self.circuit.step(rising_edge=False)

        # Step 4: Show internal circuit state after running step
        logger.debug(
            f"{self.kind} {self.label}: Step 4 - Internal circuit state after step()")
        for output_node in self.circuit.outputs:
            logger.debug(
                f"{self.kind} {self.label}: Internal output '{output_node.label}' = 0x{getattr(output_node, 'value', 0)}")

        # Step 5: Propagate output values using original names
        logger.debug(f"{self.kind} {self.label}: Step 5 - Propagating outputs")
        propagation_work = []
        for original_name, cloned_name in self._output_mapping.items():
            if original_name in self.outputs.points:
                # Find the cloned output node and get its value
                for output_node in self.circuit.outputs:
                    if output_node.label == cloned_name and hasattr(output_node, 'value'):
                        output_value = output_node.value
                        # Get the bit width from the output node
                        output_bits = getattr(output_node, 'bits', 1)
                        logger.debug(
                            f"{self.kind} {self.label}: Propagating output '{cloned_name}' -> '{original_name}' = 0x{output_value:02x} ({output_bits} bits)")

                        # Use Node's propagate method with original name and correct bit width
                        work = super().propagate(output_name=original_name, value=output_value, bits=output_bits)
                        propagation_work.extend(work)
                        break

        logger.debug(
            f"{self.kind} {self.label}: propagate() complete, returning {len(propagation_work)} nodes")
        return propagation_work

    def input(self, name):
        """Get a connector for the named input"""
        return Connector(self, name)

    def output(self, name):
        """Get a connector for the named output"""
        return Connector(self, name)

    def clone(self, instance_id):
        """
        Clone this CircuitNode with a new instance ID
        Create a new instance of the template but preserve input/output names
        """
        # For CircuitNode, we want to

        # Create a brand new CircuitNode with the same template circuit
        # This will give it a fresh internal circuit but the same interface
        new_label = f"{self.label}_{instance_id}" if self.label else f"circuit_{instance_id}"

        # Create new CircuitNode - but we need to bypass the template interface extraction
        # and preserve our current external interface exactly
        cloned_node = object.__new__(CircuitNode)

        # Initialize the Node base class with our exact current interface
        from .node import Node
        Node.__init__(cloned_node,
                      kind=self.kind,
                      js_id=self.js_id,
                      innames=list(self.inputs.points.keys()),
                      outnames=list(self.outputs.points.keys()),
                      label=new_label)

        # Clone the internal circuit
        cloned_node.circuit = self._clone_circuit(self.circuit, instance_id)
        cloned_node._instance_id = instance_id

        # Update the input/output mappings to use the new instance_id
        # The cloned circuit has nodes with double instance IDs (original_id_new_id)
        cloned_node._input_mapping = {}
        cloned_node._output_mapping = {}

        for original_name, old_cloned_name in self._input_mapping.items():
            # Update mapping to point to the double-cloned node name
            new_cloned_name = f"{old_cloned_name}_{instance_id}"
            cloned_node._input_mapping[original_name] = new_cloned_name

        for original_name, old_cloned_name in self._output_mapping.items():
            # Update mapping to point to the double-cloned node name
            new_cloned_name = f"{old_cloned_name}_{instance_id}"
            cloned_node._output_mapping[original_name] = new_cloned_name

        return cloned_node
