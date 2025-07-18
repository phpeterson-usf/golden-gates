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

    return {
      varName,
      code: `${varName} = wires.Merger(label="${this.label || 'merger'}", bits=${this.outputBits}, merge_inputs=${mergeInputs})`
    }
  }
}
