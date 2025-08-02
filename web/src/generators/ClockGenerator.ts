import { IOComponentGenerator } from './IOComponentGenerator'
import type { IOComponentData, GeneratedStatement } from '../types/ComponentGenerator'

/**
 * Clock component generator
 * Generates GGL code for clock components
 */
export class ClockGenerator extends IOComponentGenerator {
  private frequency: number
  private mode: 'auto' | 'manual'

  constructor(componentData: IOComponentData) {
    super(componentData)
    this.frequency = this.props.frequency || 1
    this.mode = (this.props.mode as 'auto' | 'manual') || 'auto'
  }

  generate(): GeneratedStatement {
    const varName = this.generateVarName('clk')

    const gglParams = this.buildGglParams({
      frequency: this.frequency,
      mode: this.mode,
      //js_id: this.jsId
    })

    const code = `${varName} = io.Clock(${gglParams})`

    return {
      varName,
      code
    }
  }
}
