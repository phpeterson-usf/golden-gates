import { ArithmeticComponentGenerator } from './ArithmeticComponentGenerator'
import type { ComponentData } from '../types/ComponentGenerator'

export class MultiplyGenerator extends ArithmeticComponentGenerator {
  constructor(componentData: ComponentData) {
    super(componentData, { className: 'Multiply', varPrefix: 'mul' })
  }
}