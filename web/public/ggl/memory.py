from .node import BitsNode
from .ggl_logging import new_logger

logger = new_logger(__name__)


class Register(BitsNode):
    D = 'D'
    CLK = 'CLK'
    en = 'en'
    Q = 'Q'
    kind = 'Register'

    def __init__(self, js_id='', label='', bits=32):
        super().__init__(
            kind=Register.kind,
            js_id=js_id,
            label=label,
            bits=bits,
            named_inputs=[Register.D, Register.CLK, Register.en],
            named_outputs=[Register.Q])
        self.value = 0

    def propagate(self, output_name='Q', value=0):
        en = self.safe_read_input(Register.en, bits=1)
        clk = self.safe_read_input(Register.CLK, bits=1)
        if en and clk:
            self.value = self.safe_read_input(Register.D)
        return super().propagate(output_name=output_name, value=self.value)

    # Nothing special to do for clone(). BitsNode.clone() is enough.


class Addressable(BitsNode):
    """
    Addressable is for code shared between ROM and RAM
    """
    A = 'A'      # Address input
    D = 'D'      # Data output

    def __init__(self, kind, label='', js_id='', address_bits=4, data_bits=8, named_inputs=[], named_outputs=[]):
        named_inputs.append(Addressable.A)
        named_outputs.append(Addressable.D)
        super().__init__(kind=kind, label=label, js_id=js_id, bits=data_bits,
                         named_inputs=named_inputs, named_outputs=named_outputs)
        self.address_bits = address_bits
        self.data_bits = data_bits
        self.total_cells = 2 ** address_bits
        self.max_value = (2 ** data_bits) - 1
        self.memory = [0] * self.total_cells

    def calc_address(self):
        addr = self.safe_read_input(Addressable.A, bits=self.address_bits)
        if addr >= self.total_cells:
            # Wrap around
            logger.warning(
                f'Addressable address {addr} wraps {self.address_bits} bits')
            addr = addr % self.total_cells
        return addr

    def read_address(self, addr=None):
        if addr is None:
            addr = self.calc_address()
        val = self.memory[addr]
        logger.info(f'Addressable address: {addr}, value: {val}')
        return val

    def write_address(self, addr=None, val=0):
        if addr is None:
            addr = self.calc_address()
        if val > self.max_value:
            logger.warning(
                f'Addressable value {val} overflows {self.data_bits} bits')
            val &= self.mask()
        self.memory[addr] = val


class ROM(Addressable):
    kind = 'ROM'
    sel = 'sel'  # Select/enable input

    def __init__(self, js_id='', address_bits=4, data_bits=8, data=None, label=''):
        super().__init__(
            kind=ROM.kind,
            js_id=js_id,
            label=label,
            named_inputs=[ROM.sel],
            named_outputs=[],
            address_bits=address_bits,
            data_bits=data_bits)
        # Initialize memory with provided data or zeros
        self.load_data(data)

    def propagate(self, output_name='D', value=0):
        # Get inputs
        selected = self.safe_read_input(ROM.sel, bits=1)
        val = self.read_address()
        if not selected:
            val = 0
        return super().propagate(output_name=output_name, value=val)

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


class RAM(Addressable):
    kind = 'RAM'
    Din = 'Din'
    ld = 'ld'
    st = 'st'
    CLK = 'CLK'

    def __init__(self, label='', js_id='', address_bits=4, data_bits=8):
        super().__init__(kind=RAM.kind, label=label, js_id=js_id,
                         named_inputs=[RAM.Din, RAM.ld, RAM.st, RAM.CLK],
                         named_outputs=[], address_bits=address_bits, data_bits=data_bits)

    def propagate(self, output_name=Addressable.D, value=0, bits=None):
        clk = self.safe_read_input(RAM.CLK, bits=1)
        if clk == 0:
            return []
        addr = self.calc_address()

        st = self.safe_read_input(RAM.st, bits=1)
        if st == 1:
            din = self.safe_read_input(RAM.Din)
            self.write_address(addr, din)

        ld = self.safe_read_input(RAM.ld, bits=1)
        if ld == 1:
            value = self.read_address(addr)
            return super().propagate(output_name=output_name, value=value)
        else:
            # Digital propagates 'Z' when when 'ld' is low
            return []
