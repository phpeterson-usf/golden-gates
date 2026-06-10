import logging
from .node import Node, Connector
from .ggl_logging import new_logger
from .errors import CircuitError
from .io import ChildInput, ChildOutput

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
        logger.debug(f"Cloning circuit '{template.label}' for instance '{instance_id}'")
        # Import here to avoid circular dependency
        from .circuit import Circuit

        # Create new circuit instance
        cloned_circuit = Circuit(
            label=f"{template.label}_{instance_id}",
            circuit_name=template.circuit_name  # Preserve circuit name for error context
        )

        # Maps from template nodes to cloned nodes
        node_map = {}

        # Clone all nodes with unique labels
        for template_node in template.all_nodes:
            cloned_node = template_node.clone(instance_id)
            node_map[template_node] = cloned_node
            cloned_circuit.all_nodes.append(cloned_node)

            # Update circuit's input/output lists
            if template_node in template.inputs:
                cloned_circuit.inputs.append(cloned_node)
                cloned_node.circuit = cloned_circuit
            if template_node in template.outputs:
                cloned_circuit.outputs.append(cloned_node)

        # Clone all connections and build edge mapping for nested CircuitNode fixup
        # Maps template edge to cloned edge
        edge_map = {}

        for template_node in template.all_nodes:
            cloned_node = node_map[template_node]

            # Recreate output connections
            for output_name, template_edges in template_node.outputs.points.items():
                for template_edge in template_edges:
                    # Find destination points
                    for dest_point in template_edge.destpoints.points:
                        dest_template_node = dest_point.node
                        dest_name = dest_point.name

                        # Skip edges that go outside this circuit (e.g., ChildOutput
                        # edges that connect to the parent circuit's nodes)
                        if dest_template_node not in node_map:
                            continue

                        dest_cloned_node = node_map[dest_template_node]

                        # Create new edge
                        from .edge import Edge
                        new_edge = Edge(cloned_node, output_name,
                                        dest_cloned_node, dest_name)
                        cloned_node.append_output_edge(output_name, new_edge)
                        dest_cloned_node.set_input_edge(dest_name, new_edge)

                        # Track edge mapping using template edge's id
                        edge_map[id(template_edge)] = new_edge

        # Fix up nested CircuitNodes
        # When a CircuitNode (like sr_latch inside d_latch) is cloned, its internal
        # ChildInputs have parent_edge references that point to deepcopied edges.
        # We need to rewire them to the actual cloned edges in this circuit.
        for template_node in template.all_nodes:
            cloned_node = node_map[template_node]

            # Check if this is a CircuitNode (has _input_mapping attribute)
            if not hasattr(cloned_node, '_input_mapping'):
                continue

            # Fix up ChildInputs inside this nested CircuitNode
            for child_input in cloned_node.circuit.inputs:
                if hasattr(child_input, 'parent_edge') and child_input.parent_edge is not None:
                    # Find the port name by matching the ChildInput's label
                    port_name = None
                    for orig_name, cloned_name in cloned_node._input_mapping.items():
                        if cloned_name == child_input.label:
                            port_name = orig_name
                            break

                    if port_name is not None:
                        # Find the edge that connects to this CircuitNode's input port
                        new_edge = cloned_node.inputs.get_edge(port_name)
                        if new_edge is not None:
                            child_input.parent_edge = new_edge

            # Also fix up ChildOutputs - copy all edges from CircuitNode's outputs
            for child_output in cloned_node.circuit.outputs:
                if child_output.kind == 'ChildOutput':
                    port_name = None
                    for orig_name, cloned_name in cloned_node._output_mapping.items():
                        if cloned_name == child_output.label:
                            port_name = orig_name
                            break

                    if port_name is not None:
                        # Get all edges from the CircuitNode's output port
                        edges = cloned_node.outputs.points.get(port_name, [])
                        # Set them as the ChildOutput's output edges (fan-out list)
                        child_output.outputs.points['0'] = edges

        return cloned_circuit

    def propagate(self, output_name='0', value=0):
        """
        Return the embedded circuit's input nodes as work items.

        The ChildInput nodes inside self.circuit will read values from their
        parent edges and propagate them through the circuit. The ChildOutput
        nodes will then propagate results back to the parent circuit.

        This keeps all propagation in a single work queue.
        """
        return list(self.circuit.inputs)

    def input(self, name):
        """Get a connector for the named input"""
        return Connector(self, name)

    def output(self, name):
        """Get a connector for the named output"""
        return Connector(self, name)

    def _wire_child_input(self, port_name, parent_edge):
        """
        Replace an internal Input node with a ChildInput that reads from parent_edge.

        Called by Circuit.connect() when wiring a parent edge to this CircuitNode's input.
        The ChildInput will read values from parent_edge and propagate them into the
        child circuit's internal nodes.
        """
        # Find the cloned input node by its label
        cloned_label = self._input_mapping[port_name]
        old_input = None
        for node in self.circuit.inputs:
            if node.label == cloned_label:
                old_input = node
                break

        if old_input is None:
            raise CircuitError(
                component_id=self.js_id,
                component_type=self.kind,
                component_label=self.label,
                error_code="inputNotFound",
                port_name=port_name
            )

        # Create ChildInput with same properties but connected to parent edge
        child_input = ChildInput(
            parent_edge=parent_edge,
            js_id=old_input.js_id,
            label=old_input.label,
            bits=old_input.bits
        )

        # Copy output edges from old input to new ChildInput
        for output_name, edges in old_input.outputs.points.items():
            for edge in edges:
                child_input.append_output_edge(output_name, edge)
                # Update the edge's source to point to the new node
                edge.srcpoint.node = child_input

        # Replace in circuit's input list and all_nodes
        self.circuit.inputs.remove(old_input)
        self.circuit.inputs.append(child_input)
        if old_input in self.circuit.all_nodes:
            self.circuit.all_nodes.remove(old_input)
        self.circuit.all_nodes.append(child_input)

    def _wire_child_output(self, port_name, parent_edge):
        """
        Wire an internal Output node to propagate to the parent circuit's edge.

        Called by Circuit.connect() when wiring this CircuitNode's output to a parent edge.
        On first call, converts the Output to a ChildOutput. On subsequent calls,
        adds the new edge to the existing ChildOutput's fan-out list.
        """
        # Find the output node by its label
        cloned_label = self._output_mapping[port_name]
        existing_output = None
        for node in self.circuit.outputs:
            if node.label == cloned_label:
                existing_output = node
                break

        if existing_output is None:
            raise CircuitError(
                component_id=self.js_id,
                component_type=self.kind,
                component_label=self.label,
                error_code="outputNotFound",
                port_name=port_name
            )

        # If already a ChildOutput, just add the new edge to its outputs
        if isinstance(existing_output, ChildOutput):
            existing_output.append_output_edge('0', parent_edge)
            return

        # First time: convert Output to ChildOutput
        child_output = ChildOutput(
            js_id=existing_output.js_id,
            label=existing_output.label,
            bits=existing_output.bits
        )

        # Add the parent edge to normal outputs
        child_output.append_output_edge('0', parent_edge)

        # Copy input edge from old output to new ChildOutput
        for input_name, edge in existing_output.inputs.points.items():
            if edge is not None:
                child_output.set_input_edge(input_name, edge)
                # Update the edge's destination to point to the new node
                for dest_point in edge.destpoints.points:
                    if dest_point.node == existing_output:
                        dest_point.node = child_output

        # Replace in circuit's output list and all_nodes
        self.circuit.outputs.remove(existing_output)
        self.circuit.outputs.append(child_output)
        if existing_output in self.circuit.all_nodes:
            self.circuit.all_nodes.remove(existing_output)
        self.circuit.all_nodes.append(child_output)

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
