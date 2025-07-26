import { BaseComponentGenerator } from './BaseComponentGenerator'
import type { ComponentData, GeneratedStatement } from '../types/ComponentGenerator'

/**
 * Decoder component generator
 * Generates GGL code for decoder components
 */
export class DecoderGenerator extends BaseComponentGenerator {
  protected numOutputs: number

  constructor(componentData: ComponentData) {
    super(componentData)
    this.numOutputs = this.props.numOutputs || 4
  }

  generate(): GeneratedStatement {
    const varName = this.generateVarName('decoder')
    const paramString = this.buildGglParams({ num_outputs: this.numOutputs })

    return {
      varName,
      code: `${varName} = plexers.Decoder(${paramString})`
    }
  }
}