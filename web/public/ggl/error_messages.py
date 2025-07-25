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


def send_error_event(update_callback, component_id, message_id, details=None, severity='error'):
    """
    Send an error event to the frontend using the callback protocol

    Args:
        update_callback: The updateCallback function from builtins
        component_id: ID of the component with the error
        message_id: Localized message ID (e.g., ERROR_BIT_WIDTH_MISMATCH)
        details: Dictionary of details for message interpolation
        severity: 'error' or 'warning'
    """
    payload = {
        'type': 'validation',
        'severity': severity,
        'messageId': message_id,
        'details': details or {}
    }
    update_callback('error', component_id, payload)


def send_step_event(update_callback, component_id, active=True, style='processing', duration=500):
    """
    Send a step highlighting event to the frontend

    Args:
        update_callback: The updateCallback function from builtins
        component_id: ID of the component to highlight
        active: Whether to activate or deactivate highlighting
        style: Style of highlighting ('processing', 'active', etc.)
        duration: Duration in milliseconds before auto-clearing
    """
    payload = {
        'active': active,
        'style': style,
        'duration': duration
    }
    update_callback('step', component_id, payload)
