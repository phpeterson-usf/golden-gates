import { BaseComponentGenerator } from './BaseComponentGenerator'
import type { ComponentData, GeneratedStatement } from '../types/ComponentGenerator'

interface DivideComponentData extends ComponentData {
  type: 'divide'
  props: {
    bits?: number
    label?: string
    rotation?: number
  }
}

export class DivideGenerator extends BaseComponentGenerator {
  protected bits: number
  protected label: string

  constructor(componentData: DivideComponentData) {
    super(componentData)
    this.bits = this.props.bits || 8
    this.label = this.props.label || ''
  }

  generate(): GeneratedStatement {
    const varName = this.generateVarName('div')
    const gglParams = this.buildGglParams({ bits: this.bits })

    return {
      varName,
      code: `${varName} = arithmetic.Divide(${gglParams})`,
      imports: new Set(['arithmetic'])
    }
  }
}