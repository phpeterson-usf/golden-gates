import { WireComponentGenerator } from './WireComponentGenerator'
import type { GeneratedStatement } from '../types/ComponentGenerator'

/**
 * Tunnel component generator
 * Generates GGL code for tunnel components
 */
export class TunnelGenerator extends WireComponentGenerator {
  protected bits: number

  constructor(componentData: any) {
    super(componentData)
    this.bits = this.props.bits || 1
  }

  generate(): GeneratedStatement {
    const varName = this.generateVarName('tunnel')

    const additionalParams = {
      bits: this.bits
    }

    const paramString = this.buildGglParams(additionalParams)

    return {
      varName,
      code: `${varName} = wires.Tunnel(${paramString})`
    }
  }
}