import { BaseComponentGenerator } from './BaseComponentGenerator'
import type { MultiplexerComponentData, GeneratedStatement } from '../types/ComponentGenerator'

/**
 * Multiplexer component generator
 * Generates GGL code for multiplexer components
 */
export class MultiplexerGenerator extends BaseComponentGenerator {
  protected numInputs: number
  protected bits: number
  protected selectorPosition: string

  constructor(componentData: MultiplexerComponentData) {
    super(componentData)
    this.numInputs = this.props.numInputs || 4
    this.bits = this.props.bits || 1
    this.selectorPosition = this.props.selectorPosition || 'bottom'
  }

  generate(): GeneratedStatement {
    const varName = this.generateVarName('mux')

    // Build parameters using centralized method
    const additionalParams: Record<string, any> = {
      num_inputs: this.numInputs
    }
    
    // Only add bits if it's not the default value of 1
    if (this.bits > 1) {
      additionalParams.bits = this.bits
    }

    const paramString = this.buildGglParams(additionalParams)

    return {
      varName,
      code: `${varName} = plexers.Multiplexer(${paramString})`
    }
  }
}
