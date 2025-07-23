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
        self.value = 0

    def propagate(self, value=0):
        en = self.get_input_edge(Register.en).value
        clk = self.get_input_edge(Register.CLK).value
        if en and clk:
            self.value = self.get_input_edge(Register.D).value
        logger.info(f'Register {self.label} propagates {self.value}')
        return super().propagate(self.value)
    
    # Nothing special to do for clone(). BitsNode.clone() is enough.


class ROM(BitsNode):
    A = 'A'      # Address input
    sel = 'sel'  # Select/enable input
    D = 'D'      # Data output
    kind = 'ROM'
    
    def __init__(self, address_bits=4, data_bits=8, data=None, label=''):
        super().__init__(
            kind=ROM.kind,
            label=label,
            bits=data_bits,
            named_inputs=[ROM.A, ROM.sel],
            named_outputs=[ROM.D])
        
        self.address_bits = address_bits
        self.data_bits = data_bits
        self.total_cells = 2 ** address_bits
        self.max_value = (2 ** data_bits) - 1
        
        # Initialize memory with provided data or zeros
        self.memory = [0] * self.total_cells
        if data:
            for i, value in enumerate(data[:self.total_cells]):
                self.memory[i] = max(0, min(value, self.max_value))
    
    def propagate(self, value=0):
        # Get inputs
        address = self.get_input_edge(ROM.A).value
        select = self.get_input_edge(ROM.sel).value
        
        # Only output data when selected
        if select and address < self.total_cells:
            output_value = self.memory[address]
        else:
            output_value = 0
            
        logger.info(f'ROM {self.label} at address {address}, sel={select} outputs {output_value}')
        return super().propagate(output_value)
    
    # Nothing special to do for clone(). BitsNode.clone() is enough.