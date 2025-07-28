import type {
  ComponentGenerator,
  ComponentData,
  GeneratedStatement
} from '../types/ComponentGenerator'

// Extend Window interface to include our global registry
declare global {
  interface Window {
    __gglNameRegistry?: Record<string, string | number>
  }
}

/**
 * Base class for all component generators
 * Provides common functionality like variable name generation
 */
export abstract class BaseComponentGenerator implements ComponentGenerator {
  protected id: string
  protected type: string
  protected props: Record<string, any>
  protected label: string

  constructor(componentData: ComponentData) {
    this.id = componentData.id
    this.type = componentData.type
    this.props = componentData.props || {}
    this.label = this.props.label || ''
  }

  /**
   * Generate GGL code for this component
   * Must be implemented by subclasses
   */
  abstract generate(): GeneratedStatement

  /**
   * Generate the js_id parameter for GGL components
   * This enables payload-based callbacks from Pyodide
   */
  protected getJsIdParam(): string {
    return `js_id="${this.id}"`
  }

  /**
   * Build common GGL parameters that all components should have
   * Subclasses should call this method and add their specific parameters
   */
  protected buildGglParams(additionalParams: Record<string, any> = {}): string {
    const params: string[] = []

    // Add common parameters
    if (this.label) {
      // Escape quotes in label
      const escapedLabel = this.label.replace(/"/g, '\\"')
      params.push(`label="${escapedLabel}"`)
    }

    // Add additional parameters from subclass
    for (const [key, value] of Object.entries(additionalParams)) {
      if (value !== undefined && value !== null) {
        if (typeof value === 'string') {
          // Escape quotes in string values
          const escapedValue = value.replace(/"/g, '\\"')
          params.push(`${key}="${escapedValue}"`)
        } else if (Array.isArray(value)) {
          params.push(`${key}=[${value.join(', ')}]`)
        } else {
          params.push(`${key}=${value}`)
        }
      }
    }

    // Always add js_id for payload-based callbacks
    params.push(this.getJsIdParam())

    return params.join(', ')
  }

  /**
   * Generate clean variable name with sequential numbering starting from 0
   */
  protected generateVarName(type: string): string {
    if (!window.__gglNameRegistry) {
      window.__gglNameRegistry = {}
    }

    const registry = window.__gglNameRegistry

    // Check if we already have a name for this component ID
    if (registry[this.id] && typeof registry[this.id] === 'string') {
      return registry[this.id] as string
    }

    // Extract the base type for naming
    let baseType = type.replace('-gate', '')

    // Initialize counter for this type if it doesn't exist
    if (typeof registry[`${baseType}_counter`] !== 'number') {
      registry[`${baseType}_counter`] = 0
    }

    // Generate the next sequential name
    const counterKey = `${baseType}_counter`
    const counter = registry[counterKey] as number
    const varName = `${baseType}${counter}`
    registry[counterKey] = counter + 1

    // Store the mapping for this component
    registry[this.id] = varName

    return varName
  }
}

/**
 * Reset the global name registry (useful for tests or new circuits)
 */
export function resetNameRegistry(): void {
  if (typeof window !== 'undefined' && window.__gglNameRegistry) {
    window.__gglNameRegistry = {}
  }
}
