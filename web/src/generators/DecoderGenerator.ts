import { BaseComponentGenerator } from './BaseComponentGenerator'
import type { ComponentData, GeneratedStatement } from '../types/ComponentGenerator'

/**
 * Decoder component generator
 * Generates GGL code for decoder components
 */
export class DecoderGenerator extends BaseComponentGenerator {
  protected selectorBits: number

  constructor(componentData: ComponentData) {
    super(componentData)
    this.selectorBits = this.props.selectorBits || 2
  }

  generate(): GeneratedStatement {
    const varName = this.generateVarName('decoder')

    const paramString = this.buildGglParams({ selector_bits: this.selectorBits })

    return {
      varName,
      code: `${varName} = plexers.Decoder(${paramString})`
    }
  }
}
