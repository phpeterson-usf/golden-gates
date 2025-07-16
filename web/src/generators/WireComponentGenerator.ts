import { BaseComponentGenerator } from './BaseComponentGenerator'
import type { WireComponentData } from '../types/ComponentGenerator'

/**
 * Base class for wire-based component generators (Splitter, Merger)
 * Provides common functionality for wire components
 */
export abstract class WireComponentGenerator extends BaseComponentGenerator {
  protected ranges: Array<{start: number, end: number}>

  constructor(componentData: WireComponentData) {
    super(componentData)
    this.ranges = this.props.ranges || [
      { start: 0, end: 1 },
      { start: 2, end: 3 },
      { start: 4, end: 5 },
      { start: 6, end: 7 }
    ]
  }

  /**
   * Convert ranges to the format expected by GGL Python classes
   */
  protected formatRanges(): string {
    const ranges = this.ranges.map(range => [range.start, range.end])
    return JSON.stringify(ranges)
  }
}