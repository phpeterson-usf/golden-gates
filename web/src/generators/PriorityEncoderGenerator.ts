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
    
    // Build parameters using centralized method
    const paramString = this.buildGglParams({ num_inputs: this.numInputs })
    
    const code = `${varName} = plexers.PriorityEncoder(${paramString})`
    
    return {
      varName,
      code
    }
  }
}