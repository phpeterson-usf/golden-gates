from .node import BitsNode
from .ggl_logging import new_logger

logger = new_logger(__name__)


class Register(BitsNode):
    D = 'D'
    CLK = 'CLK'
    en = 'en'
    Q = 'Q'
    kind = 'Register'

    def __init__(self, js_id='', label='', bits=32, **kwargs):
        super().__init__(
            kind=Register.kind,
            js_id=js_id,
            label=label,
            bits=bits,
            named_inputs=[Register.D, Register.CLK, Register.en],
            named_outputs=[Register.Q])
        self.value = 0

    def propagate(self, output_name='Q', value=0):
        en = self.safe_read_input(Register.en)
        clk = self.safe_read_input(Register.CLK)
        if en and clk:
            self.value = self.safe_read_input(Register.D)
        return super().propagate(output_name=output_name, value=self.value)

    # Nothing special to do for clone(). BitsNode.clone() is enough.


class ROM(BitsNode):
    A = 'A'      # Address input
    sel = 'sel'  # Select/enable input
    D = 'D'      # Data output
    kind = 'ROM'

    def __init__(self, js_id='', address_bits=4, data_bits=8, data=None, label=''):
        super().__init__(
            kind=ROM.kind,
            js_id=js_id,
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

    def propagate(self, output_name='D', value=0):
        # Get inputs
        address = self.safe_read_input(ROM.A)
        selected = self.safe_read_input(ROM.sel)

        if address >= self.total_cells:
            # Wrap around
            address = address % self.total_cells

        if selected:
            # Only output data when selected
            v = self.memory[address]
        else:
            v = 0

        logger.info(
            f"{ROM} '{self.label}' address={address}, sel={selected}")
        return super().propagate(output_name=output_name, value=v)

    def clone(self, instance_id):
        new_label = f"{self.label}_{instance_id}" if self.label else ""
        return ROM(
            js_id=self.js_id,
            address_bits=self.address_bits,
            data_bits=self.data_bits,
            data=self.memory.copy(),  # Deep copy the data
            label=new_label
        )

    def load_data(self, data):
        """
        This is redundant with having the data in the constructor, but
        I imagined that with a larger list of ROM elements, it would be
        unwieldy to have the whole list on the constructor line, so both
        syntaxes are accepted.
        """
        if data:
            for i in range(len(data)):
                if i < self.total_cells:
                    self.memory[i] = data[i]
