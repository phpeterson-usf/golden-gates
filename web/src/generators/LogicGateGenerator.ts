import { BaseComponentGenerator } from './BaseComponentGenerator'
import type { LogicGateComponentData, GeneratedStatement } from '../types/ComponentGenerator'

/**
 * Logic gate component generator
 * Generates GGL code for all logic gate types
 */
export class LogicGateGenerator extends BaseComponentGenerator {
  protected bits: number
  protected numInputs: number
  protected rotation: 0 | 90 | 180 | 270
  protected invertedInputs: number[]
  protected gateType: 'and' | 'or' | 'xor' | 'not' | 'nand' | 'nor' | 'xnor'

  constructor(componentData: LogicGateComponentData) {
    super(componentData)
    this.bits = this.props.bits || 1
    this.numInputs = this.props.numInputs || 2
    this.rotation = this.props.rotation || 0
    this.invertedInputs = this.props.invertedInputs || []
    this.gateType = this.props.gateType || this.extractGateTypeFromComponentType()
  }

  /**
   * Extract gate type from component type (e.g., 'and-gate' -> 'and')
   */
  private extractGateTypeFromComponentType():
    | 'and'
    | 'or'
    | 'xor'
    | 'not'
    | 'nand'
    | 'nor'
    | 'xnor' {
    const gateType = this.type.replace('-gate', '') as
      | 'and'
      | 'or'
      | 'xor'
      | 'not'
      | 'nand'
      | 'nor'
      | 'xnor'
    return gateType
  }

  generate(): GeneratedStatement {
    const varName = this.generateVarName(this.gateType)
    const gateClass = this.gateType.charAt(0).toUpperCase() + this.gateType.slice(1)

    // Build parameters
    const params: string[] = []
    if (this.bits > 1) params.push(`bits=${this.bits}`)
    if (this.label) params.push(`label="${this.label}"`)
    if (this.numInputs !== 2) params.push(`num_inputs=${this.numInputs}`)
    if (this.invertedInputs.length > 0) params.push(`inverted_inputs=[${this.invertedInputs}]`)

    const paramStr = params.length > 0 ? params.join(', ') : ''

    return {
      varName,
      code: `${varName} = logic.${gateClass}(${paramStr})`
    }
  }
}
