from .node import BitsNode
import logging

logger = logging.getLogger('io')

class IONode(BitsNode):
    """
    IONode is an abstract class which encapsulates the value of an I/O node
    """
    def __init__(self, kind, n_inputs, n_outputs, label='', bits=1):
        super().__init__(kind, n_inputs, n_outputs, label, bits)
        self.value = 0

class Input(IONode):
    """
    Input is an IONode for the input of a circuit, e.g. A
    """

    kind = 'Input'
    def __init__(self, label='', bits=1):
        super().__init__(Input.kind, 0, 1, label, bits)

    def propagate(self, value=0):
        return super().propagate(self.value)
        
class Output(IONode):
    """
    Output is an IONode for the output of a circuit, e.g. R
    """

    kind = 'Output'
    def __init__(self, label='', bits=1):
        super().__init__(Output.kind, 1, 0, label, bits)

    def propagate(self, value=0):
        self.value = self.get_input_edge('0').value
        logger.debug(f'Output {self.label} gets value {self.value}')


class Constant(IONode):
    """
    Constant is an IONode for constant values in a circuit, e.g. c0001093
    """

    kind = 'Constant'
    def __init__(self, label='', bits=1):
        super().__init__(Constant.kind, 0, 1, label, bits)
