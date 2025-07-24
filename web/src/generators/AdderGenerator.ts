import { BaseComponentGenerator } from './BaseComponentGenerator'
import type { ComponentData, GeneratedStatement } from '../types/ComponentGenerator'

interface AdderComponentData extends ComponentData {
  type: 'adder'
  props: {
    bits?: number
    label?: string
    rotation?: number
  }
}

export class AdderGenerator extends BaseComponentGenerator {
  protected bits: number
  protected label: string

  constructor(componentData: AdderComponentData) {
    super(componentData)
    this.bits = this.props.bits || 8
    this.label = this.props.label || ''
  }

  generate(): GeneratedStatement {
    const varName = this.generateVarName('adder')
    const params = [`bits=${this.bits}`]
    
    if (this.label) {
      params.push(`label="${this.label}"`)
    }

    const paramString = params.join(', ')

    return {
      varName,
      code: `${varName} = arithmetic.Adder(${paramString})`,
      imports: new Set(['arithmetic'])
    }
  }
}