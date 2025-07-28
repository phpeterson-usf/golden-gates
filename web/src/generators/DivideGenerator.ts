import { ArithmeticComponentGenerator } from './ArithmeticComponentGenerator'
import type { ComponentData } from '../types/ComponentGenerator'

export class DivideGenerator extends ArithmeticComponentGenerator {
  constructor(componentData: ComponentData) {
    super(componentData, { className: 'Divide', varPrefix: 'div' })
  }
}