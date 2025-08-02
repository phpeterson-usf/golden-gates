import { describe, it, expect, beforeEach } from 'vitest'
import { useCodeGenController } from '@/composables/useCodeGenController'

describe('Wire ID Code Generation', () => {
  let codeGenController

  beforeEach(() => {
    codeGenController = useCodeGenController()
  })

  it('includes wire ID in connect statement when wire has an ID', () => {
    const components = [
      {
        id: 'input-1',
        type: 'input',
        x: 0,
        y: 0,
        props: { bits: 1, label: 'A' }
      },
      {
        id: 'output-1',
        type: 'output',
        x: 4,
        y: 0,
        props: { bits: 1, label: 'Y' }
      }
    ]

    const wires = [
      {
        id: 'wire_1234567890',
        startConnection: { pos: { x: 1, y: 0 }, portIndex: 0, portType: 'output' },
        endConnection: { pos: { x: 4, y: 0 }, portIndex: 0, portType: 'input' },
        points: [{ x: 1, y: 0 }, { x: 4, y: 0 }]
      }
    ]

    const result = codeGenController.generateGglProgram(
      components,
      wires,
      [],
      {},
      {},
      null,
      true
    )
    const code = result.code

    // Should include wire ID in connect statement
    expect(code).toContain('circuit0.connect(input0, output0, js_id="wire_1234567890")')
  })

  it('generates connect statement without js_id when wire has no ID', () => {
    const components = [
      {
        id: 'input-1',
        type: 'input',
        x: 0,
        y: 0,
        props: { bits: 1, label: 'A' }
      },
      {
        id: 'output-1',
        type: 'output',
        x: 4,
        y: 0,
        props: { bits: 1, label: 'Y' }
      }
    ]

    const wires = [
      {
        // No ID property
        startConnection: { pos: { x: 1, y: 0 }, portIndex: 0, portType: 'output' },
        endConnection: { pos: { x: 4, y: 0 }, portIndex: 0, portType: 'input' },
        points: [{ x: 1, y: 0 }, { x: 4, y: 0 }]
      }
    ]

    const result = codeGenController.generateGglProgram(
      components,
      wires,
      [],
      {},
      {},
      null,
      true
    )
    const code = result.code

    // Should not include js_id parameter in connect statement
    expect(code).toContain('circuit0.connect(input0, output0)')
    expect(code).toMatch(/circuit0\.connect\([^)]+\)\s*#/)  // Connect should end with ) followed by comment
  })

  it('includes wire ID for junction connections', () => {
    const components = [
      {
        id: 'input-1',
        type: 'input',
        x: 0,
        y: 0,
        props: { bits: 1, label: 'A' }
      },
      {
        id: 'output-1',
        type: 'output',
        x: 6,
        y: 0,
        props: { bits: 1, label: 'Y' }
      },
      {
        id: 'output-2',
        type: 'output',
        x: 6,
        y: 4,
        props: { bits: 1, label: 'Z' }
      }
    ]

    const wires = [
      {
        id: 'wire_source',
        startConnection: { pos: { x: 1, y: 0 }, portIndex: 0, portType: 'output' },
        endConnection: { pos: { x: 6, y: 0 }, portIndex: 0, portType: 'input' },
        points: [{ x: 1, y: 0 }, { x: 3, y: 0 }, { x: 6, y: 0 }]
      },
      {
        id: 'wire_junction',
        startConnection: { pos: { x: 3, y: 0 }, portIndex: 0, portType: 'output' },
        endConnection: { pos: { x: 6, y: 4 }, portIndex: 0, portType: 'input' },
        points: [{ x: 3, y: 0 }, { x: 3, y: 4 }, { x: 6, y: 4 }]
      }
    ]

    const wireJunctions = [
      {
        pos: { x: 3, y: 0 },
        sourceWireIndex: 0,
        connectedWireId: 'wire_junction'
      }
    ]

    const result = codeGenController.generateGglProgram(
      components,
      wires,
      wireJunctions,
      {},
      {},
      null,
      true
    )
    const code = result.code

    // Should include wire IDs for both connections
    expect(code).toContain('js_id="wire_source"')
    expect(code).toContain('js_id="wire_junction"')
  })
})