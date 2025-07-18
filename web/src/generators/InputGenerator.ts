import { IOComponentGenerator } from './IOComponentGenerator'
import type { IOComponentData, GeneratedStatement } from '../types/ComponentGenerator'

/**
 * Input component generator
 * Generates GGL code for input components
 */
export class InputGenerator extends IOComponentGenerator {
  constructor(componentData: IOComponentData) {
    super(componentData)
  }

  generate(): GeneratedStatement {
    const varName = this.generateVarName('input')
    const valueStr = this.formatValue()

    const lines = [
      `${varName} = io.Input(${this.getGglBaseParams()})`,
      `${varName}.value = ${valueStr}`
    ]

    return {
      varName,
      code: lines.join('\n')
    }
  }
}
