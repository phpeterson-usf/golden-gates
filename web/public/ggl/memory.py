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
        self.load_data(data)
    
    def propagate(self, value=0):
        # Get inputs
        address = self.get_input_edge(ROM.A).value
        selected = self.get_input_edge(ROM.sel).value
        
        if address >= self.total_cells:
            address = address % self.total_cells

        # Only output data when selected
        if selected:
            value = self.memory[address]
        else:
            value = 0
            
        logger.info(f'ROM {self.label} address={address}, sel={selected} outputs {value}')
        return super().propagate(value)
    
    def clone(self, instance_id):
        new_label = f"{self.label}_{instance_id}" if self.label else ""
        return ROM(
            address_bits=self.address_bits,
            data_bits=self.data_bits,
            data=self.memory.copy(),  # Deep copy the data
            label=new_label
        )

    def load_data(self, data):
        """
        This is sort of redundant with having the data in the constructor,
        but I imagined that with a larger list of ROM elements, it would be
        unwieldy to have the whole list on the constructor line. 
        """
        if data:
            for i in range(len(data)):
                if i < self.total_cells:
                    self.memory[i] = data[i]
