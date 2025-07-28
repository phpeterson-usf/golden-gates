import { IOComponentGenerator } from './IOComponentGenerator'
import type { IOComponentData, GeneratedStatement } from '../types/ComponentGenerator'

/**
 * Clock component generator
 * Generates GGL code for clock components
 */
export class ClockGenerator extends IOComponentGenerator {
  private frequency: number

  constructor(componentData: IOComponentData) {
    super(componentData)
    this.frequency = this.props.frequency || 1
  }

  generate(): GeneratedStatement {
    const varName = this.generateVarName('clk')

    const gglParams = this.buildGglParams({
      frequency: this.frequency,
      js_id: this.jsId
    })

    const code = `${varName} = io.Clock(${gglParams})`

    return {
      varName,
      code
    }
  }
}
