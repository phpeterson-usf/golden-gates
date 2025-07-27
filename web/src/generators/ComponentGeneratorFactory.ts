import type { ComponentGenerator, ComponentData } from '../types/ComponentGenerator'
import { InputGenerator } from './InputGenerator'
import { OutputGenerator } from './OutputGenerator'
import { ConstantGenerator } from './ConstantGenerator'
import { ClockGenerator } from './ClockGenerator'
import { LogicGateGenerator } from './LogicGateGenerator'
import { SplitterGenerator } from './SplitterGenerator'
import { MergerGenerator } from './MergerGenerator'
import { MultiplexerGenerator } from './MultiplexerGenerator'
import { DecoderGenerator } from './DecoderGenerator'
import { PriorityEncoderGenerator } from './PriorityEncoderGenerator'
import { RegisterGenerator } from './RegisterGenerator'
import { ROMGenerator } from './ROMGenerator'
import { AdderGenerator } from './AdderGenerator'

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

    case 'constant':
      return new ConstantGenerator(componentData)

    case 'clock':
      return new ClockGenerator(componentData)

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

    case 'multiplexer':
      return new MultiplexerGenerator(componentData)

    case 'decoder':
      return new DecoderGenerator(componentData)

    case 'priorityEncoder':
      return new PriorityEncoderGenerator(componentData)

    case 'register':
      return new RegisterGenerator(componentData)

    case 'rom':
      return new ROMGenerator(componentData)

    case 'adder':
      return new AdderGenerator(componentData)

    default:
      throw new Error(`Unknown component type: ${componentData.type}`)
  }
}
