# Shared error message IDs for i18n localization
# These IDs correspond to entries in web/src/locales/en.json

# Error message IDs
ERROR_BIT_WIDTH_MISMATCH = 'simulation.errors.bitWidthMismatch'
ERROR_INPUT_NOT_CONNECTED = 'simulation.errors.inputNotConnected'
ERROR_OUTPUT_NOT_CONNECTED = 'simulation.errors.outputNotConnected'
ERROR_INVALID_INPUT_VALUE = 'simulation.errors.invalidInputValue'
ERROR_CIRCUIT_LOOP = 'simulation.errors.circuitLoop'
ERROR_COMPONENT_NOT_FOUND = 'simulation.errors.componentNotFound'
ERROR_INVALID_PORT_CONNECTION = 'simulation.errors.invalidPortConnection'
ERROR_MULTIPLE_OUTPUTS = 'simulation.errors.multipleOutputs'
ERROR_INVALID_COMPONENT_TYPE = 'simulation.errors.invalidComponentType'
ERROR_SIMULATION_TIMEOUT = 'simulation.errors.simulationTimeout'

# Warning message IDs
WARNING_UNUSED_INPUT = 'simulation.warnings.unusedInput'
WARNING_UNUSED_OUTPUT = 'simulation.warnings.unusedOutput'
WARNING_HIGH_FANOUT = 'simulation.warnings.highFanout'


class CircuitComponentError(Exception):
    """
    Exception raised when a circuit component encounters an error during simulation.

    The error_code is used by the frontend to look up localized error messages.
    """

    def __init__(self,
                 component_id: str,
                 component_type: str,
                 error_code: str,
                 severity: str = 'error',
                 port_name: str = None,
                 connected_component_id: str = None):
        """
        Initialize a circuit component error.

        Args:
            component_id: The js_id of the component (e.g., "and-gate_1_1753544247799")
            component_type: Type of component (e.g., "and-gate", "or-gate")
            error_code: Shared error ID (e.g., "INPUT_NOT_CONNECTED", "VALUE_OUT_OF_RANGE")
            severity: 'error' or 'warning' (though errors terminate simulation)
            port_name: Name of the port involved in the error (e.g., "in0", "out")
            connected_component_id: ID of connected component if relevant
        """
        self.component_id = component_id
        self.component_type = component_type
        self.error_code = error_code
        self.severity = severity
        self.port_name = port_name
        self.connected_component_id = connected_component_id

        # String representation that includes port name for JavaScript parsing
        port_info = f" (port: {port_name})" if port_name else ""
        super().__init__(
            f"{component_type} {component_id}: {error_code}{port_info}")
