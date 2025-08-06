import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useCircuitValidator } from '@/composables/useCircuitValidator'

// Mock component registry with dynamic connections for gates
vi.mock('@/utils/componentRegistry', () => ({
  componentRegistry: {
    input: {
      connections: {
        inputs: [],
        outputs: [{ x: 2, y: 1 }]
      }
    },
    output: {
      connections: {
        inputs: [{ x: 0, y: 1 }],
        outputs: []
      }
    },
    'and-gate': {
      getConnections: props => {
        const inputCount = props?.inputCount || 2
        const inputs = []
        for (let i = 0; i < inputCount; i++) {
          inputs.push({ x: 0, y: 1 + i, name: `${i}` })
        }
        return {
          inputs,
          outputs: [{ x: 3, y: 1 + (inputCount - 1) / 2, name: 'out' }]
        }
      }
    }
  }
}))

describe('useCircuitValidator - Geometry-based connections', () => {
  let validator
  let mockComponents
  let mockWires
  let mockCircuitManager

  beforeEach(() => {
    mockCircuitManager = null

    // Create a simple circuit: input1 -> and-gate <- input2 -> output
    mockComponents = ref([
      { id: 'input1', type: 'input', x: 5, y: 5 }, // Output at (7, 6)
      { id: 'input2', type: 'input', x: 5, y: 7 }, // Output at (7, 8)
      { id: 'and1', type: 'and-gate', x: 10, y: 5, props: { inputCount: 2 } }, // Inputs at (10, 6) and (10, 7), output at (13, 6.5)
      { id: 'output1', type: 'output', x: 15, y: 6 } // Input at (15, 7)
    ])

    // Wire from input1 to and-gate first input
    // Wire from input2 to and-gate second input
    // Wire from and-gate output to output
    mockWires = ref([
      {
        id: 'wire1',
        points: [
          { x: 7, y: 6 },
          { x: 10, y: 6 }
        ],
        startConnection: { pos: { x: 7, y: 6 }, portType: 'output' },
        endConnection: { pos: { x: 10, y: 6 }, portType: 'input' }
      },
      {
        id: 'wire2',
        points: [
          { x: 7, y: 8 },
          { x: 10, y: 8 },
          { x: 10, y: 7 }
        ],
        startConnection: { pos: { x: 7, y: 8 }, portType: 'output' },
        endConnection: { pos: { x: 10, y: 7 }, portType: 'input' }
      },
      {
        id: 'wire3',
        points: [
          { x: 13, y: 6.5 },
          { x: 15, y: 6.5 },
          { x: 15, y: 7 }
        ],
        startConnection: { pos: { x: 13, y: 6.5 }, portType: 'output' },
        endConnection: { pos: { x: 15, y: 7 }, portType: 'input' }
      }
    ])

    validator = useCircuitValidator(mockComponents, mockWires, mockCircuitManager)
  })

  it('should find components at wire endpoint positions', () => {
    // Test finding input component at wire start
    const inputPorts = validator.findPortsAtPosition({ x: 7, y: 6 })
    expect(inputPorts).toHaveLength(1)
    expect(inputPorts[0].component.id).toBe('input1')
    expect(inputPorts[0].portType).toBe('output')

    // Test finding and-gate component at wire connection
    const andInputPorts = validator.findPortsAtPosition({ x: 10, y: 6 })
    expect(andInputPorts).toHaveLength(1)
    expect(andInputPorts[0].component.id).toBe('and1')
    expect(andInputPorts[0].portType).toBe('input')
    expect(andInputPorts[0].portIndex).toBe(0)

    // Test finding and-gate output
    const andOutputPorts = validator.findPortsAtPosition({ x: 13, y: 6.5 })
    expect(andOutputPorts).toHaveLength(1)
    expect(andOutputPorts[0].component.id).toBe('and1')
    expect(andOutputPorts[0].portType).toBe('output')

    // Test finding output component
    const outputPorts = validator.findPortsAtPosition({ x: 15, y: 7 })
    expect(outputPorts).toHaveLength(1)
    expect(outputPorts[0].component.id).toBe('output1')
    expect(outputPorts[0].portType).toBe('input')
  })

  it('should validate wire connections based on geometry', () => {
    const wire1Resolution = validator.resolveWireConnections(mockWires.value[0])

    expect(wire1Resolution.valid).toBe(true)
    expect(wire1Resolution.start).toHaveLength(1)
    expect(wire1Resolution.start[0].component.id).toBe('input1')
    expect(wire1Resolution.end).toHaveLength(1)
    expect(wire1Resolution.end[0].component.id).toBe('and1')
    expect(wire1Resolution.errors).toHaveLength(0)

    const wire2Resolution = validator.resolveWireConnections(mockWires.value[1])

    expect(wire2Resolution.valid).toBe(true)
    expect(wire2Resolution.start).toHaveLength(1)
    expect(wire2Resolution.start[0].component.id).toBe('input2') // wire2 connects input2 to and1
    expect(wire2Resolution.end).toHaveLength(1)
    expect(wire2Resolution.end[0].component.id).toBe('and1')
    expect(wire2Resolution.errors).toHaveLength(0)

    // Test wire3 (and1 -> output1)
    const wire3Resolution = validator.resolveWireConnections(mockWires.value[2])

    expect(wire3Resolution.valid).toBe(true)
    expect(wire3Resolution.start).toHaveLength(1)
    expect(wire3Resolution.start[0].component.id).toBe('and1')
    expect(wire3Resolution.end).toHaveLength(1)
    expect(wire3Resolution.end[0].component.id).toBe('output1')
    expect(wire3Resolution.errors).toHaveLength(0)
  })

  it('should validate entire circuit and return connections for code generation', () => {
    const validation = validator.validateCircuit()

    // Debug: log the errors to understand what's failing
    if (!validation.valid) {
      console.log('Validation errors:', validation.errors)
    }

    expect(validation.valid).toBe(true)
    expect(validation.errors).toHaveLength(0)

    const connections = validator.getValidConnections()
    expect(connections).toHaveLength(3)

    // First connection: input1 -> and1
    expect(connections[0].sourceComponent.id).toBe('input1')
    expect(connections[0].targetComponent.id).toBe('and1')
    expect(connections[0].sourcePortIndex).toBe(0)
    expect(connections[0].targetPortIndex).toBe(0)

    // Second connection: input2 -> and1
    expect(connections[1].sourceComponent.id).toBe('input2')
    expect(connections[1].targetComponent.id).toBe('and1')
    expect(connections[1].sourcePortIndex).toBe(0)
    expect(connections[1].targetPortIndex).toBe(1)

    // Third connection: and1 -> output1
    expect(connections[2].sourceComponent.id).toBe('and1')
    expect(connections[2].targetComponent.id).toBe('output1')
    expect(connections[2].sourcePortIndex).toBe(0)
    expect(connections[2].targetPortIndex).toBe(0)
  })

  it('should handle duplicated components and wires based on geometry', () => {
    // Simulate duplication by Cmd-D: add duplicated components and wires at offset positions
    const duplicatedComponents = [
      { id: 'input3', type: 'input', x: 5, y: 10 }, // Duplicated 5 units down
      { id: 'input4', type: 'input', x: 5, y: 12 },
      { id: 'and2', type: 'and-gate', x: 10, y: 10, props: { inputCount: 2 } },
      { id: 'output2', type: 'output', x: 15, y: 11 }
    ]

    const duplicatedWires = [
      {
        id: 'wire4',
        points: [
          { x: 7, y: 11 },
          { x: 10, y: 11 }
        ],
        startConnection: { pos: { x: 7, y: 11 }, portType: 'output' },
        endConnection: { pos: { x: 10, y: 11 }, portType: 'input' }
      },
      {
        id: 'wire5',
        points: [
          { x: 7, y: 13 },
          { x: 10, y: 13 },
          { x: 10, y: 12 }
        ],
        startConnection: { pos: { x: 7, y: 13 }, portType: 'output' },
        endConnection: { pos: { x: 10, y: 12 }, portType: 'input' }
      },
      {
        id: 'wire6',
        points: [
          { x: 13, y: 11.5 },
          { x: 15, y: 11.5 },
          { x: 15, y: 12 }
        ],
        startConnection: { pos: { x: 13, y: 11.5 }, portType: 'output' },
        endConnection: { pos: { x: 15, y: 12 }, portType: 'input' }
      }
    ]

    // Add duplicated elements to the existing circuit
    mockComponents.value.push(...duplicatedComponents)
    mockWires.value.push(...duplicatedWires)

    // Create new validator with updated components and wires
    const updatedValidator = useCircuitValidator(mockComponents, mockWires, mockCircuitManager)

    // Validate the circuit with duplicated elements
    const validation = updatedValidator.validateCircuit()
    expect(validation.valid).toBe(true)
    expect(validation.errors).toHaveLength(0)

    // Check that we now have 6 connections (3 original + 3 duplicated)
    const connections = updatedValidator.getValidConnections()
    expect(connections).toHaveLength(6)

    // Verify that duplicated connections are correctly resolved
    const duplicatedInput3ToAnd = connections.find(
      conn => conn.sourceComponent.id === 'input3' && conn.targetComponent.id === 'and2'
    )
    expect(duplicatedInput3ToAnd).toBeDefined()

    const duplicatedInput4ToAnd = connections.find(
      conn => conn.sourceComponent.id === 'input4' && conn.targetComponent.id === 'and2'
    )
    expect(duplicatedInput4ToAnd).toBeDefined()

    const duplicatedAndToOutput = connections.find(
      conn => conn.sourceComponent.id === 'and2' && conn.targetComponent.id === 'output2'
    )
    expect(duplicatedAndToOutput).toBeDefined()
  })

  it('should detect invalid wire connections', () => {
    // Add a wire with no destination component
    const invalidWire = {
      id: 'invalid_wire',
      points: [
        { x: 7, y: 6 },
        { x: 20, y: 20 }
      ],
      startConnection: { pos: { x: 7, y: 6 }, portType: 'output' },
      endConnection: { pos: { x: 20, y: 20 }, portType: 'input' }
    }

    mockWires.value.push(invalidWire)

    const updatedValidator = useCircuitValidator(mockComponents, mockWires, mockCircuitManager)
    const validation = updatedValidator.validateCircuit()

    expect(validation.valid).toBe(false)
    expect(validation.errors.length).toBeGreaterThan(0)

    // Should still get valid connections from the original wires
    const connections = updatedValidator.getValidConnections()
    expect(connections).toHaveLength(3) // Only the 3 valid connections
  })
})
