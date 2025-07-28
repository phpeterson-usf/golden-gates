import { BaseComponentGenerator } from './BaseComponentGenerator'
import type { ComponentData, GeneratedStatement } from '../types/ComponentGenerator'

interface SubtractComponentData extends ComponentData {
  type: 'subtract'
  props: {
    bits?: number
    label?: string
    rotation?: number
  }
}

export class SubtractGenerator extends BaseComponentGenerator {
  protected bits: number
  protected label: string

  constructor(componentData: SubtractComponentData) {
    super(componentData)
    this.bits = this.props.bits || 8
    this.label = this.props.label || ''
  }

  generate(): GeneratedStatement {
    const varName = this.generateVarName('sub')
    const gglParams = this.buildGglParams({ bits: this.bits })

    return {
      varName,
      code: `${varName} = arithmetic.Subtract(${gglParams})`,
      imports: new Set(['arithmetic'])
    }
  }
}