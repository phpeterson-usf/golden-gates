from .node import BitsNode
from .ggl_logging import new_logger

logger = new_logger(__name__)


class IONode(BitsNode):
    """
    IONode is an abstract class which encapsulates the value of an I/O node
    """

    def __init__(self, kind, num_inputs, num_outputs, js_id='', label='', bits=1):
        super().__init__(
            kind=kind,
            js_id=js_id,
            num_inputs=num_inputs,
            num_outputs=num_outputs,
            label=label,
            bits=bits)
        self._value = 0
        self.circuit = None


class Input(IONode):
    """
    Input is an IONode for the input of a circuit, e.g. A
    """

    kind = 'Input'

    def __init__(self, js_id='', label='', bits=1):
        super().__init__(
            kind=Input.kind,
            js_id=js_id,
            num_inputs=0,
            num_outputs=1,
            label=label,
            bits=bits)

    @property
    def value(self):
        return self._value

    @value.setter
    def value(self, new_value):
        if self._value != new_value:
            self._value = new_value
            if self.circuit and self.circuit.auto_propagate and self.circuit.running:
                self.circuit.step()

    def propagate(self, output_name='0', value=0):
        return super().propagate(value=self.value)

    def clone(self, instance_id):
        """Clone an Input node"""
        new_label = f"{self.label}_{instance_id}" if self.label else ""
        return Input(label=new_label, bits=self.bits)


class Output(IONode):
    """
    Output is an IONode for the output of a circuit, e.g. R
    """

    kind = 'Output'

    def __init__(self, js_id='', label='', bits=1):
        super().__init__(
            kind=Output.kind,
            js_id=js_id,
            num_inputs=1,
            num_outputs=0,
            label=label,
            bits=bits)

    @property
    def value(self):
        return self._value

    @value.setter
    def value(self, new_value):
        self._value = new_value

    def propagate(self, output_name='0', value=0):
        self.value = self.safe_read_input('0')
        logger.info(f"{self.kind} '{self.label}' gets value {self.value}")

        try:
            import builtins
            # If we have a JS object ID and we're running under pyodide,
            # use the pyodide API to update the value of the JS object
            if self.js_id and hasattr(builtins, 'updateCallback'):
                updateCallback = builtins.updateCallback
                # Use simple event protocol: (eventType, componentId, value)
                updateCallback('value', self.js_id, self.value)
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

    def __init__(self, js_id='', label='', bits=1):
        super().__init__(js_id=js_id, label=label, bits=bits)


class Clock(IONode):
    kind = 'Clock'

    def __init__(self, js_id='', label='', frequency=0, mode="manual"):
        super().__init__(
            Clock.kind,
            js_id=js_id,
            num_inputs=0,
            num_outputs=1,
            label=label,
            bits=1
        )
        # number of ticks per toggle
        self.frequency = frequency
        # tick counter since last clock toggle
        self.ticks = 0
        self.prev_value = 0
        self.mode = mode

    def propagate(self, output_name='0', value=0):
        if self.mode != 'auto':
            # skip propagation in run() if clock is manual
            return []

        self.ticks += 1
        if self.frequency > 0 and self.ticks >= self.frequency:
            self.ticks = 0
            return self.toggleCLK(output_name)
        return []

    def toggleCLK(self, output_name):
        new_val = 1 - self._value
        self.prev_value = self._value
        self.value = new_val

        logger.info(f"Clock '{self.label}' toggled to {self.value}")

        super().propagate(output_name=output_name, value=new_val)

        if self.prev_value == 0 and new_val == 1:
            return [self]  # Rising edge
        return []

    def tick(self):
        """
        Manually toggle the clock when it is assigned as mode = manual
        """
        if self.mode != 'manual':
            logger.warning("tick() is only for clocks in manual mode")
        return self.toggleCLK(output_name='0')

    def clone(self, instance_id):
        """Clone a Clock node"""
        new_label = f"{self.label}_{instance_id}" if self.label else ""
        # Don't clone js_id - it's specific to the original instance
        return Clock(label=new_label, frequency=self.frequency, js_id=None)
