import { ArithmeticComponentGenerator } from './ArithmeticComponentGenerator'
import type { ComponentData } from '../types/ComponentGenerator'

interface CompareComponentData extends ComponentData {
  type: 'compare'
  props: {
    bits?: number
    label?: string
    rotation?: number
  }
}

export class CompareGenerator extends ArithmeticComponentGenerator {
  constructor(componentData: CompareComponentData) {
    super(componentData, { className: 'Comparator', varPrefix: 'comp' })
  }
}