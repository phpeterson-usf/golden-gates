from .node import BitsNode
from .ggl_logging import get_logger

logger = get_logger('wires')

class WireNode(BitsNode):
    """
    Class for wire type components such as splitters, mergers, and tunnels.
    """
    def __init__(self, kind, num_inputs, num_outputs, label='', bits=1):
        super().__init__(kind, num_inputs, num_outputs, label, bits)
    
    def clone(self, instance_id):
        """Clone a WireNode - subclasses may override"""
        new_label = f"{self.label}_{instance_id}" if self.label else ""
        return self.__class__(
            num_inputs=len(self.inputs.points),
            num_outputs=len(self.outputs.points),
            label=new_label,
            bits=self.bits
        )

class Splitter(WireNode):
    """
    Splits multi bit input into individual 1 bit outputs
    """
    kind = 'Splitter'
    
    def __init__(self, label='', bits=1):
        super().__init__(Splitter.kind, num_inputs=1, num_outputs=bits, label=label, bits=bits)

    def propagate(self, value=0):
        # TODO: edit so that it can be customized to more than singular bit outputs (ex: 32 bits -> 8, 8, 8, 8 bit outputs)
        input_edge = self.inputs.get_edge('0')
        input_value = input_edge.value if input_edge else 0

        new_work = []

        for i in range(self.bits):
            # mask bit at i to get bit_val, and then propagate to the output node
            bit_val = (input_value >> i) & 1
            logger.info(f'Splitter {self.label} output {i}: {bit_val}')
            
            for edge in self.outputs.points[str(i)]:
                edge.propagate(bit_val)
                new_work += edge.get_dest_nodes()

        return new_work

class Merger(WireNode):
    """
    Merges multiple 1 bit inputs into a single output
    """
    kind = 'Merger'
    
    def __init__(self, label='', bits=1):
        super().__init__(Merger.kind, num_inputs=bits, num_outputs=1, label=label, bits=bits)

    def propagate(self, value=0):
        bits = 0
        for i, edge in enumerate(self.inputs.get_edges()):
            bit = edge.value & 1
            # or all bits together to get an output value
            bits |= (bit << i)
        logger.info(f'Merger {self.label} combined value: {bits}')
        return super().propagate(bits)
