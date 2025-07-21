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
    
    // Build parameters
    const params: string[] = []
    params.push(`n_inputs=${this.numInputs}`)
    if (this.bits > 1) params.push(`bits=${this.bits}`)
    if (this.label) params.push(`label="${this.label}"`)
    
    const paramString = params.join(', ')

    return {
      varName,
      code: `${varName} = plexers.Multiplexer(${paramString})`
    }
  }
}