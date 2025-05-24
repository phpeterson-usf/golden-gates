from .node import BitsNode
import logging

logger = logging.getLogger('logic')

class Gate(BitsNode):
    """
    Gate is a logic gate, like AND, OR, XOR, etc
    """
    def __init__(self, kind, num_inputs=2, num_outputs=1, label='', bits=1):
        super().__init__(kind, num_inputs, num_outputs, label, bits)
        self.label = label

    def logic(self, v1, v2):
        logging.error(f'Gate logic() must be implemented for {self.kind}')

    def propagate(self, value=0):
        """
        Gate.propagate() loops over the Edges which are connected to
        the inpoints of this gate, getting the value. It calls
        the logic() method which is implemented for Gate subclasses
        """
        rv = 0
        # Get a list of edges from the inpoints for this Gate
        edges = self.inputs.get_edges()
        # Get the first value, then loop from the second...end
        prev = edges[0].value
        for e in edges[1:]:
            # Perform the Gate-specific logic (AND, OR, ...)
            rv = self.logic(prev, e.value)
            prev = e.value
        logger.debug(f'{self.kind} logic: {rv}')
        return super().propagate(rv)            


class And(Gate):
    """And Gates perform bitwise AND"""
    kind = 'And'
    def __init__(self, num_inputs=2, num_outputs=1, label='', bits=1):
        super().__init__(And.kind, num_inputs, num_outputs, label, bits)

    def logic(self, v1, v2):
        return v1 & v2


class Or(Gate):
    """Or Gates perform bitwise OR"""
    kind = 'Or'
    def __init__(self, num_inputs=2, num_outputs=1, label='', bits=1):
        super().__init__(Or.kind, num_inputs, num_outputs, label, bits)

    def logic(self, v1, v2):
        return v1 | v2

