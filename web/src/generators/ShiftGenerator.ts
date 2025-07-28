import { ArithmeticComponentGenerator } from './ArithmeticComponentGenerator'
import type { ComponentData } from '../types/ComponentGenerator'

export class ShiftGenerator extends ArithmeticComponentGenerator {
  protected mode: string

  constructor(componentData: ComponentData) {
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