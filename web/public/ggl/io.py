from .node import Node, BitsNode
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
        self.value = 0


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

    def propagate(self, output_name='0', value=0):
        return super().propagate(value=self.value)


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

    def __init__(self, js_id='', label='', frequency=0, mode="auto"):
        super().__init__(
            Clock.kind,
            js_id=js_id,
            num_inputs=0,
            num_outputs=1,
            label=label,
            bits=1
        )
        self.frequency = frequency
        self.mode = mode

    def propagate(self, output_name='0', value=0):
        return super().propagate(value=self.value)

    def toggle(self):
        self.value = 1 - self.value


# class Test(Node):
#     """
#     Test is a test case in which the circuit's output values are tested
#     against the provided input values
#     """
#     kind = 'Test'

#     def __init__(self, label='', js_id='', input_specs={}, output_specs={}):
#         self.input_specs = input_specs
#         self.output_specs = output_specs
#         super().__init__(
#             kind=Test.kind,
#             js_id=js_id,
#             label=label
#         )

#     def init_inputs(self, inputs):
#         # When simulation starts, set each Input's value to be the test value
#         for i in inputs:
#             v = self.input_specs[i.label]
#             i.value = v

#     def test_outputs(self, outputs):
#         # When simulation ends, check each Output's value against the expected
#         failures = {}
#         for o in outputs:
#             v = self.output_specs[o.label]
#             if o.value != v:
#                 failures[o.name] = o.value
#         return failures
