import { ArithmeticComponentGenerator } from './ArithmeticComponentGenerator'
import type { ComponentData } from '../types/ComponentGenerator'

interface AdderComponentData extends ComponentData {
  type: 'adder'
  props: {
    bits?: number
    label?: string
    rotation?: number
  }
}

export class AdderGenerator extends ArithmeticComponentGenerator {
  constructor(componentData: AdderComponentData) {
    super(componentData, { className: 'Adder', varPrefix: 'adder' })
  }
}