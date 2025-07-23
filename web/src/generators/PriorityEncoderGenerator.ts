import { BaseComponentGenerator } from './BaseComponentGenerator'

/**
 * Generator for Priority Encoder components
 * Creates GGL code for priority encoders with multiple inputs and two outputs (inum, any)
 */
export class PriorityEncoderGenerator extends BaseComponentGenerator {
  private numInputs: number
  private label: string

  constructor(componentData: any) {
    super(componentData)
    this.numInputs = componentData.props?.numInputs || 4
    this.label = componentData.props?.label || 'PE'
  }

  generate() {
    const varName = this.generateVarName('priorityEncoder')
    const escapedLabel = this.label.replace(/"/g, '\\"')
    
    const code = `${varName} = plexers.PriorityEncoder(num_inputs=${this.numInputs}, label="${escapedLabel}")`
    
    return {
      varName,
      code
    }
  }
}