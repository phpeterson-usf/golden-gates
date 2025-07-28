import { WireComponentGenerator } from './WireComponentGenerator'
import type { MergerComponentData, GeneratedStatement } from '../types/ComponentGenerator'

/**
 * Merger component generator
 * Generates GGL code for merger components
 */
export class MergerGenerator extends WireComponentGenerator {
  protected outputBits: number

  constructor(componentData: MergerComponentData) {
    super(componentData)
    this.outputBits = this.props.outputBits || 8
  }

  generate(): GeneratedStatement {
    const varName = this.generateVarName('merger')
    const mergeInputs = this.formatRanges()

    // Format merge_inputs as tuples: [(0,1), (2,3), (4,5), (6,7)]
    const mergeInputsString = `[${this.ranges.map(range => `(${range.start},${range.end})`).join(', ')}]`

    // Build parameters using centralized method, but handle merge_inputs specially
    const additionalParams = {
      bits: this.outputBits
    }

    const baseParams = this.buildGglParams(additionalParams)
    // Insert merge_inputs parameter before js_id (which is always last)
    const paramString = baseParams.replace(
      /, js_id=/,
      `, merge_inputs=${mergeInputsString}, js_id=`
    )

    return {
      varName,
      code: `${varName} = wires.Merger(${paramString})`
    }
  }
}
