import type { ComponentGenerator, ComponentData } from '../types/ComponentGenerator'
import { InputGenerator } from './InputGenerator'
import { OutputGenerator } from './OutputGenerator'
import { LogicGateGenerator } from './LogicGateGenerator'
import { SplitterGenerator } from './SplitterGenerator'
import { MergerGenerator } from './MergerGenerator'

/**
 * Factory function to create the appropriate component generator
 * This is the single place where we switch on component type
 */
export function createComponentGenerator(componentData: ComponentData): ComponentGenerator {
  switch (componentData.type) {
    case 'input':
      return new InputGenerator(componentData)
    
    case 'output':
      return new OutputGenerator(componentData)
    
    case 'and-gate':
    case 'or-gate':
    case 'xor-gate':
    case 'not-gate':
    case 'nand-gate':
    case 'nor-gate':
    case 'xnor-gate':
      return new LogicGateGenerator(componentData)
    
    case 'splitter':
      return new SplitterGenerator(componentData)
    
    case 'merger':
      return new MergerGenerator(componentData)
    
    default:
      throw new Error(`Unknown component type: ${componentData.type}`)
  }
}