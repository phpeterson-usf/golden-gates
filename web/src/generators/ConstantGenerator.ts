import { IOComponentGenerator } from './IOComponentGenerator'
import type { IOComponentData, GeneratedStatement } from '../types/ComponentGenerator'

/**
 * Constant component generator
 * Generates GGL code for constant components
 */
export class ConstantGenerator extends IOComponentGenerator {
  constructor(componentData: IOComponentData) {
    super(componentData)
  }

  generate(): GeneratedStatement {
    const varName = this.generateVarName('constant')
    const valueStr = this.formatValue()

    // For constants, we set the value directly in the constructor
    const lines = [
      `${varName} = io.Constant(${this.getGglBaseParams()})`,
      `${varName}.value = ${valueStr}`
    ]

    return {
      varName,
      code: lines.join('\n')
    }
  }
}
