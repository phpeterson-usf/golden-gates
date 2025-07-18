import { IOComponentGenerator } from './IOComponentGenerator'
import type { IOComponentData, GeneratedStatement } from '../types/ComponentGenerator'

/**
 * Output component generator
 * Generates GGL code for output components
 */
export class OutputGenerator extends IOComponentGenerator {
  constructor(componentData: IOComponentData) {
    super(componentData)
  }

  generate(): GeneratedStatement {
    const varName = this.generateVarName('output')

    return {
      varName,
      code: `${varName} = io.Output(${this.getGglBaseParams()}, js_id="${this.id}")`
    }
  }
}
