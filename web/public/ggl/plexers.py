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
