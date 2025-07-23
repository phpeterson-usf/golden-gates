import logging

from .node import BitsNode
from .ggl_logging import new_logger

logger = new_logger('plexers')

class Plexer(BitsNode):
    """
    Plexer is an abstract base class which provides selector inputs to derived classes
    """
    sel = "sel"
    def __init__(self, kind, num_inputs=2, num_outputs=1, label='', bits=1):
        super().__init__(
            kind=kind,
            num_inputs=num_inputs,
            num_outputs=num_outputs,
            label=label,
            bits=bits,
            named_inputs=[Plexer.sel])


class Multiplexer(Plexer):
    """
    Multiplexer is a multiplexer :)
    """
    kind = 'Multiplexer'
    def __init__(self, num_inputs=2, label='', bits=1):
        super().__init__(
            Multiplexer.kind,
            num_inputs=num_inputs,
            num_outputs=1,
            label=label,
            bits=bits)

    def propagate(self, value=0):
        """
        Given a selector value, propagate the value of the input numbered
        with that value. So if sel == 2, propagate the value of the 2'th input
        """
        sel_value = self.get_input_edge(Plexer.sel).value
        input_name = str(sel_value)
        v = self.get_input_edge(input_name).value
        return super().propagate(v)
    
    # Don't need to implement clone() since Multiplexer has no unique state


class Decoder(Plexer):
    """
    Decoder decodes an input value on sel
    """
    kind = 'Decoder'
    def __init__(self, num_outputs=0, label='', bits=1):
        super().__init__(
            Decoder.kind,
            num_outputs=num_outputs,
            label=label,
            bits=bits)

    def propagate(self, value=0):
        """
        Given a selector value, propagate a 1 on the corresponding output
        e.g. if sel == 2, propagate 1 on the 2th output and 0 on all other outputs

        TODO: this is a dup of Node propagate (which is already a little gross), 
        but with conditional value. Can this be cleanly generalized?
        """
        new_work = []
        sel_value = self.get_input_edge(Plexer.sel).value
        hi_output = str(sel_value)
        for output_name, edges in self.outputs.points.items():
            v = 0
            if output_name == hi_output:
                v = 1
            for edge in edges:
                # TODO: maybe edge.propagate should return dest_nodes
                logger.info(f'{self.kind} {self.label} propagates {v} to output {output_name}')
                edge.propagate(v)
                new_work += edge.get_dest_nodes()
        return new_work  # Do not call super().propagate()

        # Don't need to implement clone() since Decoder has no unique state


class PriorityEncoder(BitsNode):
    """
    PriorityEncoder is a plexer but does not need a 'sel' input, so it derives
    from BitsNode rather than plexer.

    Its function is to look at its 1-bit inputs and output the ordinal number
    for that input. Priority is bottom-up, so input '1' is higher priority than
    input '0'. 
    The 1-bit output 'any' is 1 if any of the inputs were high, which disambiguates
    output of 0 when input '0' was 1, vs. output of 0 when no inputs were 1.
    """
    kind = 'PriorityEncoder'
    inum = 'inum'
    any = 'any'

    def __init__(self, num_inputs=0, label=''):
        super().__init__(
            PriorityEncoder.kind,
            num_inputs=num_inputs,
            named_outputs=[PriorityEncoder.inum, PriorityEncoder.any],
            label=label)
    
    def propagate(self, value=0):
        # TODO: this is gross but it works. Need some abstraction here.
        new_work = []
        inum = 0
        any = 0
        input_names = sorted(self.inputs.points.keys(), reverse=True)
        for i in input_names:
            edge = self.inputs.points[i]
            if edge.value == 1:
                inum = int(i)  # TODO: could raise an exception
                any = 1
                break
        inum_edges = self.outputs.points[PriorityEncoder.inum]
        for e in inum_edges:
            e.propagate(inum)
            new_work += e.get_dest_nodes()
        any_edges = self.outputs.points[PriorityEncoder.any]
        for e in any_edges:
            e.propagate(any)
            new_work += e.get_dest_nodes()
        return new_work  # Do not call super().propagate()