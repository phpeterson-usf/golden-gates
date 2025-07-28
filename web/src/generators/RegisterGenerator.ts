import { BaseComponentGenerator } from './BaseComponentGenerator'
import type { RegisterComponentData, GeneratedStatement } from '../types/ComponentGenerator'

/**
 * Register component generator
 * Generates GGL code for register components
 */
export class RegisterGenerator extends BaseComponentGenerator {
  protected bits: number

  constructor(componentData: RegisterComponentData) {
    super(componentData)
    this.bits = this.props.bits || 1
  }

  generate(): GeneratedStatement {
    const varName = this.generateVarName('reg')

    // Build parameters using centralized method
    const paramString = this.buildGglParams({ bits: this.bits })

    return {
      varName,
      code: `${varName} = memory.Register(${paramString})`,
      imports: new Set(['memory'])
    }
  }
}
