import { ArithmeticComponentGenerator } from './ArithmeticComponentGenerator'
import type { ComponentData } from '../types/ComponentGenerator'

export class AdderGenerator extends ArithmeticComponentGenerator {
  constructor(componentData: ComponentData) {
    super(componentData, { className: 'Adder', varPrefix: 'adder' })
  }
}
