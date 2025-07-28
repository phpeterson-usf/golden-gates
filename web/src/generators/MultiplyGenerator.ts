import { BaseComponentGenerator } from './BaseComponentGenerator'
import type { ComponentData, GeneratedStatement } from '../types/ComponentGenerator'

interface MultiplyComponentData extends ComponentData {
  type: 'multiply'
  props: {
    bits?: number
    label?: string
    rotation?: number
  }
}

export class MultiplyGenerator extends BaseComponentGenerator {
  protected bits: number
  protected label: string

  constructor(componentData: MultiplyComponentData) {
    super(componentData)
    this.bits = this.props.bits || 8
    this.label = this.props.label || ''
  }

  generate(): GeneratedStatement {
    const varName = this.generateVarName('mul')
    const gglParams = this.buildGglParams({ bits: this.bits })

    return {
      varName,
      code: `${varName} = arithmetic.Multiply(${gglParams})`,
      imports: new Set(['arithmetic'])
    }
  }
}