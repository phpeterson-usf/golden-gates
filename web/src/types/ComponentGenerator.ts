/**
 * TypeScript interfaces and types for component code generation
 */

export interface GeneratedStatement {
  varName: string
  code: string
  imports?: Set<string>
}

export interface ComponentGenerator {
  generate(): GeneratedStatement
}

export interface ComponentData {
  id: string
  type: string
  props: Record<string, any>
  x?: number
  y?: number
}

export interface IOComponentData extends ComponentData {
  props: {
    label?: string
    bits?: number
    value?: number
    base?: 2 | 10 | 16
    rotation?: 0 | 90 | 180 | 270
  }
}

export interface LogicGateComponentData extends ComponentData {
  props: {
    label?: string
    bits?: number
    numInputs?: number
    rotation?: 0 | 90 | 180 | 270
    invertedInputs?: number[]
    gateType?: 'and' | 'or' | 'xor' | 'not' | 'nand' | 'nor' | 'xnor'
  }
}

export interface WireComponentData extends ComponentData {
  props: {
    label?: string
    ranges?: Array<{ start: number; end: number }>
  }
}

export interface SplitterComponentData extends WireComponentData {
  props: {
    label?: string
    ranges?: Array<{ start: number; end: number }>
    inputBits?: number
  }
}

export interface MergerComponentData extends WireComponentData {
  props: {
    label?: string
    ranges?: Array<{ start: number; end: number }>
    outputBits?: number
  }
}

export interface TunnelComponentData extends WireComponentData {
  props: {
    label?: string
    bits?: number
  }
}

export interface MultiplexerComponentData extends ComponentData {
  props: {
    label?: string
    numInputs?: number
    bits?: number
    selectorPosition?: 'top' | 'bottom'
    rotation?: 0 | 90 | 180 | 270
  }
}

export interface RegisterComponentData extends ComponentData {
  props: {
    label?: string
    bits?: number
    rotation?: 0 | 90 | 180 | 270
  }
}

export interface ROMComponentData extends ComponentData {
  props: {
    label?: string
    addressBits?: number
    dataBits?: number
    data?: number[]
    rotation?: 0 | 90 | 180 | 270
  }
}

export interface RAMComponentData extends ComponentData {
  props: {
    label?: string
    addressBits?: number
    dataBits?: number
    data?: number[]
    rotation?: 0 | 90 | 180 | 270
  }
}
