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
        self._value = 0
        # Set by Circuit.connect() for top-level Input nodes so that assigning
        # to .value can re-propagate the circuit (dynamic inputs at runtime).
        self.circuit = None

    @property
    def value(self):
        return self._value

    @value.setter
    def value(self, new_value):
        self._value = new_value


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
        """Assigning a new value re-propagates the circuit (dynamic inputs).

        This is what lets a test set inputs after run() and read updated
        outputs without an explicit step(). The _in_step guard prevents
        re-entrancy when the value is changed during propagation itself.
        """
        if self._value != new_value:
            self._value = new_value
            c = self.circuit
            if (c is not None and getattr(c, 'auto_propagate', False)
                    and c.running and not c._in_step):
                c.step()

    def propagate(self, output_name='0', value=0):
        return super().propagate(value=self.value)


class ChildInput(Input):
    """
    ChildInput is an Input node inside an embedded circuit (CircuitNode).
    It reads its value from a parent circuit's edge rather than from a UI input.

    When propagate() is called, it:
    1. Copies the value from the parent edge into self.value
    2. Propagates that value to the child circuit's internal edges
    """

    kind = 'ChildInput'

    # User-facing type in error messages: a ChildInput is an Input to the user.
    error_kind = 'Input'

    def __init__(self, parent_edge, js_id='', label='', bits=1):
        super().__init__(js_id=js_id, label=label, bits=bits)
        self.parent_edge = parent_edge

    @property
    def value(self):
        return self._value

    @value.setter
    def value(self, new_value):
        # Plain assignment: a ChildInput is driven by its parent edge during
        # propagation, so it must NOT trigger the dynamic-input re-propagation
        # that top-level Input does.
        self._value = new_value

    def propagate(self, output_name='0', value=0):
        # Read value from parent circuit's edge
        self.value = self.parent_edge.value
        # Propagate to child circuit's internal nodes
        return super().propagate()


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


class ChildOutput(Output):
    """
    ChildOutput is an Output node inside an embedded circuit (CircuitNode).
    It writes its value to parent circuit edges rather than to a UI output.

    Unlike Output (which has num_outputs=0 as a terminal node), ChildOutput
    has num_outputs=1 to leverage the existing NodeOutputs fan-out infrastructure.
    Multiple parent edges can be added via append_output_edge('0', edge).

    When propagate() is called, it:
    1. Reads its value from the child circuit's internal edge
    2. Propagates that value to ALL parent circuit's downstream nodes
    """

    kind = 'ChildOutput'

    # User-facing type in error messages: a ChildOutput is an Output to the user.
    error_kind = 'Output'

    def __init__(self, js_id='', label='', bits=1):
        # Override Output's num_outputs=0 with num_outputs=1
        # This gives us an output point '0' with a list for fan-out
        IONode.__init__(self,
            kind=ChildOutput.kind,
            js_id=js_id,
            num_inputs=1,
            num_outputs=1,
            label=label,
            bits=bits)

    def propagate(self, output_name='0', value=0):
        # Read value from child circuit's internal edge
        self.value = self.safe_read_input('0')
        logger.info(f"{self.kind} '{self.label}' gets value {self.value}")
        # Use normal NodeOutputs fan-out to propagate to all parent edges
        return self.outputs.write_value('0', self.value, self.bits)


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
        self.prev_value = 0

    def propagate(self, output_name='0', value=0):
        return super().propagate(value=self.value)

    def toggle(self):
        self.prev_value = self.value
        self.value = 1 - self.value

    def tick(self):
        """Manually advance a manual-mode clock by one half-period.

        Returns True only on a rising edge (0 -> 1), so test harnesses can do
        `if clk.tick(): circuit.step(rising_edge=True)`.
        """
        if self.mode != 'manual':
            logger.warning("tick() is only for clocks in manual mode")
        self.toggle()
        return self.prev_value == 0 and self.value == 1


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
