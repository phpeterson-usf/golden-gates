import { ArithmeticComponentGenerator } from './ArithmeticComponentGenerator'
import type { ComponentData } from '../types/ComponentGenerator'

interface ShiftComponentData extends ComponentData {
  type: 'shift'
  props: {
    bits?: number
    label?: string
    mode?: string
    rotation?: number
  }
}

export class ShiftGenerator extends ArithmeticComponentGenerator {
  protected mode: string

  constructor(componentData: ShiftComponentData) {
    super(componentData, { className: 'BarrelShifter', varPrefix: 'shft' })
    this.mode = this.props.mode || 'logical_left'
  }

  protected getAdditionalParams(): Record<string, any> {
    return { 
      bits: this.bits,
      mode: this.mode
    }
  }
}