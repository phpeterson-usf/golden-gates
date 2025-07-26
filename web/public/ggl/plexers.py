import logging

from .node import BitsNode
from .ggl_logging import new_logger

logger = new_logger(__name__)


class Plexer(BitsNode):
    """
    Plexer is an abstract base class which provides selector inputs to derived classes
    """
    sel = "sel"

    def __init__(self, kind, js_id='', num_inputs=2, num_outputs=1, label='', bits=1):
        super().__init__(
            kind=kind,
            js_id=js_id,
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

    def __init__(self, js_id='', num_inputs=2, label='', bits=1):
        super().__init__(
            Multiplexer.kind,
            js_id=js_id,
            num_inputs=num_inputs,
            num_outputs=1,
            label=label,
            bits=bits)

    def propagate(self, output_name='0', value=0):
        """
        Given a selector value, propagate the value of the input numbered
        with that value. So if sel == 2, propagate the value of the 2'th input
        """
        sel_value = self.inputs.read_value(Plexer.sel)
        input_name = str(sel_value)
        v = self.inputs.read_value(input_name)
        return super().propagate(value=v)

    # Don't need to implement clone() since Multiplexer has no unique state


class Decoder(Plexer):
    """
    Decoder decodes an input value on sel
    """
    kind = 'Decoder'

    def __init__(self, js_id='', num_outputs=0, label='', bits=1):
        super().__init__(
            Decoder.kind,
            js_id=js_id,
            num_outputs=num_outputs,
            label=label,
            bits=bits)

    def propagate(self, output_name='0', value=0):
        """
        Given a selector value, propagate a 1 on the corresponding output
        e.g. if sel == 2, propagate 1 on the 2th output and 0 on all other outputs

        TODO: this is a dup of Node propagate (which is already a little gross), 
        but with conditional value. Can this be cleanly generalized?
        """
        new_work = []
        sel_value = self.inputs.read_value(Plexer.sel)
        hi_output = str(sel_value)
        for oname in self.outputs.get_names():
            v = 1 if oname == hi_output else 0
            new_work += super().propagate(output_name=oname, value=v)
        return new_work

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

    def __init__(self, js_id='', num_inputs=0, label=''):
        super().__init__(
            PriorityEncoder.kind,
            js_id=js_id,
            num_inputs=num_inputs,
            named_outputs=[PriorityEncoder.inum, PriorityEncoder.any],
            label=label)

    def propagate(self, output_name='0', value=0):
        inum = 0
        any = 0
        # reverse=True gives us bottom-up traversal
        input_names = sorted(self.inputs.get_names(), reverse=True)
        for iname in input_names:
            if self.inputs.read_value(iname) == 1:
                inum = int(iname)
                any = 1
                break
        new_work = super().propagate(output_name=PriorityEncoder.inum, value=inum)
        new_work += super().propagate(output_name=PriorityEncoder.any, value=any)
        return new_work
