from .node import BitsNode
from .ggl_logging import get_logger

logger = get_logger('io')

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
    
    def clone(self, instance_id):
        """Clone an Input node"""
        new_label = f"{self.label}_{instance_id}" if self.label else ""
        return Input(label=new_label, bits=self.bits)
        
class Output(IONode):
    """
    Output is an IONode for the output of a circuit, e.g. R
    """

    kind = 'Output'
    def __init__(self, label='', bits=1, js_id=None):
        super().__init__(Output.kind, 1, 0, label, bits)
        self.js_id = js_id

    def propagate(self, value=0):
        self.value = self.get_input_edge('0').value
        logger.info(f'Output {self.label} gets value {self.value}')
        
        try:
            import builtins
            # If we have a JS object ID and we're running under pyodide,
            # use the pyodide API to update the value of the JS object
            if self.js_id and hasattr(builtins, 'updateCallback'):
                updateCallback = builtins.updateCallback
                updateCallback(self.js_id, self.value)
        except Exception as e:
            logger.error(f'Callback failed: {e}')
    
    def clone(self, instance_id):
        """Clone an Output node"""
        new_label = f"{self.label}_{instance_id}" if self.label else ""
        # Don't clone js_id - it's specific to the original instance
        return Output(label=new_label, bits=self.bits, js_id=None)


class Constant(Input):
    """
    Constant is an IONode for constant values in a circuit, e.g. c0001093
    Maybe it's odd to make it an alias for Input, but for simulation
    purposes, it seems to behave like an input
    """
    def __init__(self, label='', bits=1):
        super().__init__(label, bits)
