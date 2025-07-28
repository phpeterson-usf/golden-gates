import type {
  ComponentGenerator,
  ComponentData,
  GeneratedStatement
} from '../types/ComponentGenerator'
import { BaseComponentGenerator } from './BaseComponentGenerator'

/**
 * Base class for arithmetic component generators
 * Eliminates duplication across arithmetic components (Adder, Subtract, Multiply, Divide, Compare)
 */
export abstract class ArithmeticComponentGenerator
  extends BaseComponentGenerator
  implements ComponentGenerator
{
  protected bits: number
  protected label: string
  protected className: string
  protected varPrefix: string

  constructor(componentData: ComponentData, config: { className: string; varPrefix: string }) {
    super(componentData)
    this.bits = this.props.bits || 8
    this.label = this.props.label || ''
    this.className = config.className
    this.varPrefix = config.varPrefix
  }

  generate(): GeneratedStatement {
    const varName = this.generateVarName(this.varPrefix)
    const additionalParams = this.getAdditionalParams()
    const gglParams = this.buildGglParams(additionalParams)

    return {
      varName,
      code: `${varName} = arithmetic.${this.className}(${gglParams})`,
      imports: new Set(['arithmetic'])
    }
  }

  /**
   * Override this method to add component-specific parameters
   * Base implementation includes bits parameter
   */
  protected getAdditionalParams(): Record<string, any> {
    return { bits: this.bits }
  }
}
