import { IOComponentGenerator } from './IOComponentGenerator'
import type { IOComponentData, GeneratedStatement } from '../types/ComponentGenerator'
import type { ComponentGeneratorOptions} from './ComponentGeneratorFactory'

/**
 * Input component generator
 * Generates GGL code for input components
 */
export class InputGenerator extends IOComponentGenerator {
  private options: ComponentGeneratorOptions

  constructor(componentData: IOComponentData, options: ComponentGeneratorOptions = {}) {
    super(componentData)
    this.options = options
  }

  generate(): GeneratedStatement {
    const varName = this.generateVarName('input')
    const valueStr = this.formatValue()

    const lines = [
      `${varName} = io.Input(${this.getGglBaseParams()})`
    ]

    // Only set values for main circuit inputs, not for component module inputs
    // Component module inputs should get their values from parent circuit connections
    if (this.options.isMainCircuit !== false) {
      lines.push(`${varName}.value = ${valueStr}`)
    }

    return {
      varName,
      code: lines.join('\n')
    }
  }
}
