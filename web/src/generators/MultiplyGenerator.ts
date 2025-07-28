import { ArithmeticComponentGenerator } from './ArithmeticComponentGenerator'
import type { ComponentData } from '../types/ComponentGenerator'

interface MultiplyComponentData extends ComponentData {
  type: 'multiply'
  props: {
    bits?: number
    label?: string
    rotation?: number
  }
}

export class MultiplyGenerator extends ArithmeticComponentGenerator {
  constructor(componentData: MultiplyComponentData) {
    super(componentData, { className: 'Multiply', varPrefix: 'mul' })
  }
}