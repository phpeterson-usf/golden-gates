import { BaseComponentGenerator } from './BaseComponentGenerator'
import type { IOComponentData } from '../types/ComponentGenerator'

/**
 * Base class for input/output component generators
 * Provides common functionality for IO components
 */
export abstract class IOComponentGenerator extends BaseComponentGenerator {
  protected bits: number
  protected value: number
  protected base: 2 | 10 | 16
  protected rotation: 0 | 90 | 180 | 270

  constructor(componentData: IOComponentData) {
    super(componentData)
    this.bits = this.props.bits || 1
    this.value = this.props.value || 0
    this.base = this.props.base || 10
    this.rotation = this.props.rotation || 0
  }

  /**
   * Format value with leading zeros based on base and bit width
   */
  protected formatValue(): string {
    if (this.base === 16) {
      return `0x${this.value
        .toString(16)
        .padStart(Math.ceil(this.bits / 4), '0')
        .toUpperCase()}`
    } else if (this.base === 2) {
      return `0b${this.value.toString(2).padStart(this.bits, '0')}`
    } else {
      return this.value.toString()
    }
  }

  /**
   * Generate GGL base parameters common to all IO nodes
   */
  protected getGglBaseParams(): string {
    return this.buildGglParams({ bits: this.bits })
  }
}
