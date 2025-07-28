import { BaseComponentGenerator } from './BaseComponentGenerator'
import type { ROMComponentData, GeneratedStatement } from '../types/ComponentGenerator'

/**
 * ROM component generator
 * Generates GGL code for ROM (Read-Only Memory) components
 */
export class ROMGenerator extends BaseComponentGenerator {
  protected addressBits: number
  protected dataBits: number
  protected data: number[]

  constructor(componentData: ROMComponentData) {
    super(componentData)
    this.addressBits = this.props.addressBits || 4
    this.dataBits = this.props.dataBits || 8
    this.data = this.props.data || []
  }

  generate(): GeneratedStatement {
    const varName = this.generateVarName('rom')

    // Format data array - ensure it's the right size
    const totalCells = Math.pow(2, this.addressBits)
    const dataArray = new Array(totalCells).fill(0)

    // Copy provided data, clamping to valid range
    const maxValue = Math.pow(2, this.dataBits) - 1
    for (let i = 0; i < Math.min(this.data.length, totalCells); i++) {
      dataArray[i] = Math.max(0, Math.min(this.data[i], maxValue))
    }

    // Build parameters using centralized method
    const additionalParams = {
      address_bits: this.addressBits,
      data_bits: this.dataBits,
      data: dataArray
    }

    const paramString = this.buildGglParams(additionalParams)

    return {
      varName,
      code: `${varName} = memory.ROM(${paramString})`,
      imports: new Set(['memory'])
    }
  }
}
