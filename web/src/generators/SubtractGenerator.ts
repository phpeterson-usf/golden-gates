import { ArithmeticComponentGenerator } from './ArithmeticComponentGenerator'
import type { ComponentData } from '../types/ComponentGenerator'

interface SubtractComponentData extends ComponentData {
  type: 'subtract'
  props: {
    bits?: number
    label?: string
    rotation?: number
  }
}

export class SubtractGenerator extends ArithmeticComponentGenerator {
  constructor(componentData: SubtractComponentData) {
    super(componentData, { className: 'Subtract', varPrefix: 'sub' })
  }
}