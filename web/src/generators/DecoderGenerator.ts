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

    // Build parameters
    const params: string[] = []
    params.push(`num_outputs=${this.numOutputs}`)
    if (this.label) {
      // Escape quotes in label
      const escapedLabel = this.label.replace(/"/g, '\\"')
      params.push(`label="${escapedLabel}"`)
    }

    const paramString = params.join(', ')

    return {
      varName,
      code: `${varName} = plexers.Decoder(${paramString})`
    }
  }
}