import { WireComponentGenerator } from './WireComponentGenerator'
import type { GeneratedStatement } from '../types/ComponentGenerator'

/**
 * Tunnel component generator
 * Generates GGL code for tunnel components
 */
export class TunnelGenerator extends WireComponentGenerator {
  protected bits: number
  private direction: 'input' | 'output'

  constructor(componentData: any) {
    super(componentData)
    this.bits = this.props.bits || 1
    this.direction = (this.props.direction as 'input' | 'output') || 'input'
  }

  generate(): GeneratedStatement {
    const varName = this.generateVarName('tunnel')

    const additionalParams = {
      bits: this.bits,
      direction: this.direction
    }

    const paramString = this.buildGglParams(additionalParams)

    return {
      varName,
      code: `${varName} = wires.Tunnel(${paramString})`
    }
  }
}
