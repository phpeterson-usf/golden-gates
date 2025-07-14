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
    
    def __init__(self, label='', bits=1, splits=None):
        if splits is None:
            splits = [1] * bits                                         # default to 1-bit outputs
        # TODO: error checking if the splits don't add up to total input bits
        self.splits = splits
        super().__init__(Splitter.kind, num_inputs=1, num_outputs=len(splits), label=label, bits=bits)

    def propagate(self, value=0):
        # TODO: edit so that it can be customized to more than singular bit outputs (ex: 32 bits -> 8, 8, 8, 8 bit outputs)
        input_edge = self.inputs.get_edge('0')
        input_value = input_edge.value if input_edge else 0

        new_work = []
        offset = 0
        for i, width in enumerate(self.splits):
            mask = (1 << width) - 1                                     # mask bit at i to get bit_val, and then propagate to the output node
            chunk = (input_value >> offset) & mask
            logger.info(f'{self.kind} {self.label} output {i}: {bin(chunk)}')

            for edge in self.outputs.points[str(i)]:
                edge.propagate(chunk)
                new_work += edge.get_dest_nodes()

            offset += width

        return new_work

class Merger(WireNode):
    """
    Merges multiple 1 bit inputs into a single output
    """
    kind = 'Merger'
    
    def __init__(self, label='', bits=1, merge_inputs=None):
        if merge_inputs is None:
            merge_inputs = [1] * bits                                   # default to 1-bit inputs

        self.merge_inputs = merge_inputs
        super().__init__(Merger.kind, num_inputs=len(merge_inputs), num_outputs=1, label=label, bits=bits)

    def propagate(self, value=0):
        output_val = 0
        offset = 0

        for i, width in enumerate(self.merge_inputs):
            edge = self.inputs.get_edge(str(i))
            input_val = edge.value if edge else 0                       # mask to width and shift into position
            chunk = input_val & ((1 << width) - 1)
            output_val |= (chunk << offset)                             # or all bits together to get an output value
            offset += width

        logger.info(f'{self.kind} {self.label} combined value: {bin(output_val)}')
        return super().propagate(output_val)
    
class Tunnel(WireNode):
    """
    Tunnels a value from input to output, used for readability and to reduce wiring
    """
    kind = 'Tunnel'

    def __init__(self, label='', bits=1):
        super().__init__(Tunnel.kind, num_inputs=1, num_outputs=1, label=label, bits=bits)

    def propagate(self, value=0):
        input_edge = self.inputs.get_edge('0')
        input_value = input_edge.value
        logger.info(f'{self.kind} {self.label} passes value: {input_value}')
        return super().propagate(input_value)