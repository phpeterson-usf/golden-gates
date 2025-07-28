import { ArithmeticComponentGenerator } from './ArithmeticComponentGenerator'
import type { ComponentData } from '../types/ComponentGenerator'

export class SubtractGenerator extends ArithmeticComponentGenerator {
  constructor(componentData: ComponentData) {
    super(componentData, { className: 'Subtract', varPrefix: 'sub' })
  }
}