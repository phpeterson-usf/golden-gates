import { BaseComponentGenerator } from './BaseComponentGenerator'
import type { RAMComponentData, GeneratedStatement } from '../types/ComponentGenerator'

/**
 * RAM component generator
 * Generates GGL code for RAM (Random Access Memory) components
 */
export class RAMGenerator extends BaseComponentGenerator {
  protected addressBits: number
  protected dataBits: number

  constructor(componentData: RAMComponentData) {
    super(componentData)
    this.addressBits = this.props.addressBits || 4
    this.dataBits = this.props.dataBits || 8
  }

  generate(): GeneratedStatement {
    const varName = this.generateVarName('ram')

    // Build parameters using centralized method
    const additionalParams = {
      address_bits: this.addressBits,
      data_bits: this.dataBits
    }

    const paramString = this.buildGglParams(additionalParams)

    return {
      varName,
      code: `${varName} = memory.RAM(${paramString})`,
      imports: new Set(['memory'])
    }
  }
}
