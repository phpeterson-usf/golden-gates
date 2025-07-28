import { BaseComponentGenerator } from './BaseComponentGenerator'
import type { ComponentData, GeneratedStatement } from '../types/ComponentGenerator'

interface CompareComponentData extends ComponentData {
  type: 'compare'
  props: {
    bits?: number
    label?: string
    rotation?: number
  }
}

export class CompareGenerator extends BaseComponentGenerator {
  protected bits: number
  protected label: string

  constructor(componentData: CompareComponentData) {
    super(componentData)
    this.bits = this.props.bits || 8
    this.label = this.props.label || ''
  }

  generate(): GeneratedStatement {
    const varName = this.generateVarName('comp')
    const gglParams = this.buildGglParams({ bits: this.bits })

    return {
      varName,
      code: `${varName} = arithmetic.Comparator(${gglParams})`,
      imports: new Set(['arithmetic'])
    }
  }
}