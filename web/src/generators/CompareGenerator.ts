import { ArithmeticComponentGenerator } from './ArithmeticComponentGenerator'
import type { ComponentData } from '../types/ComponentGenerator'

export class CompareGenerator extends ArithmeticComponentGenerator {
  constructor(componentData: ComponentData) {
    super(componentData, { className: 'Comparator', varPrefix: 'comp' })
  }
}