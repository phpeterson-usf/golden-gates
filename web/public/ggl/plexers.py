from .node import BitsNode
from .ggl_logging import get_logger

logger = get_logger('plexers')

class Plexer(BitsNode):
    """
    Plexer is an abstract base class which provides selector inputs to derived classes
    """
    selector_name = "sel"
    def __init__(self, kind, n_inputs=2, n_outputs=1, label='', bits=1):
        super().__init__(kind, n_inputs, n_outputs, label, bits)
        self.inputs.append_input("sel")

class Multiplexer(Plexer):
    """
    Multiplexer is a multiplexer :)
    """
    kind = 'Multiplexer'
    def __init__(self, n_inputs=2, n_outputs=1, label='', bits=1):
        super().__init__(Multiplexer.kind, n_inputs, 1, label, bits)

    def propagate(self, value=0):
        """
        Given a selector value, propagate the value of the input numbered
        with that value. So if sel == 2, propagate the value of the 2'th input
        """
        sel_value = self.get_input_edge(Plexer.selector_name).value
        input_name = str(sel_value)
        v = self.get_input_edge(input_name).value

        logger.info(f'mux propagates {v}')
        return super().propagate(v)
