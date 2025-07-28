import { BaseComponentGenerator } from './BaseComponentGenerator'
import type { ComponentData, GeneratedStatement } from '../types/ComponentGenerator'

interface ShiftComponentData extends ComponentData {
  type: 'shift'
  props: {
    bits?: number
    label?: string
    mode?: string
    rotation?: number
  }
}

export class ShiftGenerator extends BaseComponentGenerator {
  protected bits: number
  protected label: string
  protected mode: string

  constructor(componentData: ShiftComponentData) {
    super(componentData)
    this.bits = this.props.bits || 8
    this.label = this.props.label || ''
    this.mode = this.props.mode || 'logical_left'
  }

  generate(): GeneratedStatement {
    const varName = this.generateVarName('shft')
    const gglParams = this.buildGglParams({ 
      bits: this.bits,
      mode: this.mode
    })

    return {
      varName,
      code: `${varName} = arithmetic.BarrelShifter(${gglParams})`,
      imports: new Set(['arithmetic'])
    }
  }
}