import { ArithmeticComponentGenerator } from './ArithmeticComponentGenerator'
import type { ComponentData } from '../types/ComponentGenerator'

interface DivideComponentData extends ComponentData {
  type: 'divide'
  props: {
    bits?: number
    label?: string
    rotation?: number
  }
}

export class DivideGenerator extends ArithmeticComponentGenerator {
  constructor(componentData: DivideComponentData) {
    super(componentData, { className: 'Divide', varPrefix: 'div' })
  }
}