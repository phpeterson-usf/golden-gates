// Shared error message IDs for i18n localization
// These IDs correspond to entries in locales/en.json and Python error_messages.py

// Error message IDs
export const ERROR_BIT_WIDTH_MISMATCH = 'simulation.errors.bitWidthMismatch'
export const ERROR_INPUT_NOT_CONNECTED = 'simulation.errors.inputNotConnected'
export const ERROR_OUTPUT_NOT_CONNECTED = 'simulation.errors.outputNotConnected'
export const ERROR_INVALID_INPUT_VALUE = 'simulation.errors.invalidInputValue'
export const ERROR_CIRCUIT_LOOP = 'simulation.errors.circuitLoop'
export const ERROR_COMPONENT_NOT_FOUND = 'simulation.errors.componentNotFound'
export const ERROR_INVALID_PORT_CONNECTION = 'simulation.errors.invalidPortConnection'
export const ERROR_MULTIPLE_OUTPUTS = 'simulation.errors.multipleOutputs'
export const ERROR_INVALID_COMPONENT_TYPE = 'simulation.errors.invalidComponentType'
export const ERROR_SIMULATION_TIMEOUT = 'simulation.errors.simulationTimeout'

// Warning message IDs
export const WARNING_UNUSED_INPUT = 'simulation.warnings.unusedInput'
export const WARNING_UNUSED_OUTPUT = 'simulation.warnings.unusedOutput'
export const WARNING_HIGH_FANOUT = 'simulation.warnings.highFanout'

// Error severity levels
export const SEVERITY_ERROR = 'error'
export const SEVERITY_WARNING = 'warning'
export const SEVERITY_INFO = 'info'

// Step highlighting styles
export const STEP_STYLE_PROCESSING = 'processing'
export const STEP_STYLE_ACTIVE = 'active'
export const STEP_STYLE_COMPUTING = 'computing'