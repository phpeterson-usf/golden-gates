import { WireComponentGenerator } from './WireComponentGenerator'
import type { SplitterComponentData, GeneratedStatement } from '../types/ComponentGenerator'

/**
 * Splitter component generator
 * Generates GGL code for splitter components
 */
export class SplitterGenerator extends WireComponentGenerator {
  protected inputBits: number

  constructor(componentData: SplitterComponentData) {
    super(componentData)
    this.inputBits = this.props.inputBits || 8
  }

  generate(): GeneratedStatement {
    const varName = this.generateVarName('splitter')
    const splits = this.formatRanges()
    
    return {
      varName,
      code: `${varName} = wires.Splitter(label="${this.label || 'splitter'}", bits=${this.inputBits}, splits=${splits})`
    }
  }
}