from .node import BitsNode
from .ggl_logging import new_logger

logger = new_logger('memory')

class Register(BitsNode):
    D = 'D'
    CLK = 'CLK'
    en = 'en'
    Q = 'Q'
    kind = 'Register'
    def __init__(self, label='', bits=32):
        super().__init__(
            kind=Register.kind,
            label=label,
            bits=bits,
            named_inputs=[Register.D, Register.CLK, Register.en],
            named_outputs=[Register.Q])

    def propagate(self, value=0):
        en = self.get_input_edge(Register.en).value
        clk = self.get_input_edge(Register.CLK).value
        if en and clk:
            self.value = self.get_input_edge(Register.D).value
        logger.info(f'Register {self.label} propagates {self.value}')
        return super().propagate(self.value)
    
    # Nothing special to do for clone(). BitsNode.clone() is enough.