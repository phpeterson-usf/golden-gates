import { describe, it, expect } from 'vitest'

/**
 * Shared test utilities for arithmetic component generators
 * Eliminates massive duplication across arithmetic generator test files
 */

/**
 * Creates standard test suite for arithmetic generators
 * @param {Object} config - Test configuration
 * @param {Function} config.GeneratorClass - The generator class to test
 * @param {string} config.componentType - Component type (e.g., 'subtract', 'multiply')
 * @param {string} config.gglClassName - GGL class name (e.g., 'Subtract', 'Multiply')
 * @param {RegExp} config.varNamePattern - Variable name pattern (e.g., /^sub\d+$/)
 * @param {string} config.varPrefix - Variable prefix for naming (e.g., 'sub', 'mul')
 */
export function createArithmeticGeneratorTests(config) {
  const { GeneratorClass, componentType, gglClassName, varNamePattern, varPrefix } = config

  describe(`${GeneratorClass.name}`, () => {
    describe('generate()', () => {
      it('generates basic code with default bits', () => {
        const componentData = {
          id: `${componentType}-1`,
          type: componentType,
          props: {}
        }

        const generator = new GeneratorClass(componentData)
        const result = generator.generate()

        expect(result.varName).toMatch(varNamePattern)
        expect(result.code).toBe(
          `${result.varName} = arithmetic.${gglClassName}(bits=8, js_id="${componentType}-1")`
        )
        expect(result.imports).toEqual(new Set(['arithmetic']))
      })

      it('generates code with custom bits', () => {
        const componentData = {
          id: `${componentType}-1`,
          type: componentType,
          props: {
            bits: 16
          }
        }

        const generator = new GeneratorClass(componentData)
        const result = generator.generate()

        expect(result.code).toBe(
          `${result.varName} = arithmetic.${gglClassName}(bits=16, js_id="${componentType}-1")`
        )
      })

      it('includes label when provided', () => {
        const componentData = {
          id: `${componentType}-1`,
          type: componentType,
          props: {
            bits: 4,
            label: 'TEST0'
          }
        }

        const generator = new GeneratorClass(componentData)
        const result = generator.generate()

        expect(result.code).toBe(
          `${result.varName} = arithmetic.${gglClassName}(label="TEST0", bits=4, js_id="${componentType}-1")`
        )
      })

      it('generates unique variable names for multiple instances', () => {
        const data1 = {
          id: `${componentType}-1`,
          type: componentType,
          props: { label: 'TEST1' }
        }

        const data2 = {
          id: `${componentType}-2`,
          type: componentType,
          props: { label: 'TEST2' }
        }

        const gen1 = new GeneratorClass(data1)
        const gen2 = new GeneratorClass(data2)

        const result1 = gen1.generate()
        const result2 = gen2.generate()

        expect(result1.varName).not.toBe(result2.varName)
        expect(result1.varName).toMatch(varNamePattern)
        expect(result2.varName).toMatch(varNamePattern)
      })

      it('handles all valid bit counts', () => {
        const bitCounts = [1, 4, 8, 16, 32]

        bitCounts.forEach(bits => {
          const componentData = {
            id: `${componentType}-${bits}`,
            type: componentType,
            props: {
              bits: bits
            }
          }

          const generator = new GeneratorClass(componentData)
          const result = generator.generate()

          expect(result.code).toContain(`bits=${bits}`)
        })
      })

      it('escapes quotes in label', () => {
        const componentData = {
          id: `${componentType}-1`,
          type: componentType,
          props: {
            label: 'TEST "Quote" Label'
          }
        }

        const generator = new GeneratorClass(componentData)
        const result = generator.generate()

        // Should escape the quotes in the label
        expect(result.code).toContain('label="TEST \\"Quote\\" Label"')
      })

      it('handles missing bits prop gracefully', () => {
        const componentData = {
          id: `${componentType}-1`,
          type: componentType,
          props: {
            label: 'TEST'
            // bits is missing
          }
        }

        const generator = new GeneratorClass(componentData)
        const result = generator.generate()

        // Should use default bits of 8
        expect(result.code).toContain('bits=8')
      })

      it('generates code with consistent parameter order', () => {
        const componentData = {
          id: `${componentType}-1`,
          type: componentType,
          props: {
            label: 'TEST',
            bits: 4
          }
        }

        const generator = new GeneratorClass(componentData)
        const result = generator.generate()

        // Parameters should be in order: label="TEST", bits=4, js_id="..."
        expect(result.code).toMatch(
          new RegExp(
            `arithmetic\\.${gglClassName}\\(label="TEST", bits=4, js_id="${componentType}-1"\\)`
          )
        )
      })

      it('handles special characters in component id', () => {
        const componentData = {
          id: `${componentType}-test_123`,
          type: componentType,
          props: {
            bits: 8
          }
        }

        const generator = new GeneratorClass(componentData)
        const result = generator.generate()

        expect(result.code).toContain(`js_id="${componentType}-test_123"`)
      })

      it('includes arithmetic import', () => {
        const componentData = {
          id: `${componentType}-1`,
          type: componentType,
          props: {}
        }

        const generator = new GeneratorClass(componentData)
        const result = generator.generate()

        expect(result.imports).toEqual(new Set(['arithmetic']))
      })

      it('handles empty label correctly', () => {
        const componentData = {
          id: `${componentType}-1`,
          type: componentType,
          props: {
            label: '',
            bits: 4
          }
        }

        const generator = new GeneratorClass(componentData)
        const result = generator.generate()

        // Should not include label parameter when empty
        expect(result.code).toBe(
          `${result.varName} = arithmetic.${gglClassName}(bits=4, js_id="${componentType}-1")`
        )
      })

      it(`generates correct class name ${gglClassName}`, () => {
        const componentData = {
          id: `${componentType}-1`,
          type: componentType,
          props: {
            label: 'TEST',
            bits: 8
          }
        }

        const generator = new GeneratorClass(componentData)
        const result = generator.generate()

        expect(result.code).toContain(`arithmetic.${gglClassName}(`)
      })

      it(`generates proper variable name prefix ${varPrefix}`, () => {
        const componentData = {
          id: `${componentType}-1`,
          type: componentType,
          props: {}
        }

        const generator = new GeneratorClass(componentData)
        const result = generator.generate()

        expect(result.varName).toMatch(varNamePattern)
      })
    })
  })
}

/**
 * Creates test suite for shift generator (which has unique mode parameter)
 */
export function createShiftGeneratorTests(GeneratorClass) {
  describe(`${GeneratorClass.name}`, () => {
    describe('generate()', () => {
      it('generates basic shift code with default bits and mode', () => {
        const componentData = {
          id: 'shift-1',
          type: 'shift',
          props: {}
        }

        const generator = new GeneratorClass(componentData)
        const result = generator.generate()

        expect(result.varName).toMatch(/^shft\d+$/)
        expect(result.code).toBe(
          `${result.varName} = arithmetic.BarrelShifter(bits=8, mode="logical_left", js_id="shift-1")`
        )
        expect(result.imports).toEqual(new Set(['arithmetic']))
      })

      it('generates shift with custom bits and mode', () => {
        const componentData = {
          id: 'shift-1',
          type: 'shift',
          props: {
            bits: 16,
            mode: 'logical_right'
          }
        }

        const generator = new GeneratorClass(componentData)
        const result = generator.generate()

        expect(result.code).toBe(
          `${result.varName} = arithmetic.BarrelShifter(bits=16, mode="logical_right", js_id="shift-1")`
        )
      })

      it('includes label when provided', () => {
        const componentData = {
          id: 'shift-1',
          type: 'shift',
          props: {
            bits: 4,
            label: 'SHIFTER0',
            mode: 'arithmetic_right'
          }
        }

        const generator = new GeneratorClass(componentData)
        const result = generator.generate()

        expect(result.code).toBe(
          `${result.varName} = arithmetic.BarrelShifter(label="SHIFTER0", bits=4, mode="arithmetic_right", js_id="shift-1")`
        )
      })

      it('handles all valid shift modes', () => {
        const modes = ['logical_left', 'logical_right', 'arithmetic_right']

        modes.forEach(mode => {
          const componentData = {
            id: `shift-${mode}`,
            type: 'shift',
            props: {
              bits: 8,
              mode: mode
            }
          }

          const generator = new GeneratorClass(componentData)
          const result = generator.generate()

          expect(result.code).toContain(`mode="${mode}"`)
        })
      })

      it('uses default mode when not specified', () => {
        const componentData = {
          id: 'shift-1',
          type: 'shift',
          props: {
            bits: 8
            // mode not specified
          }
        }

        const generator = new GeneratorClass(componentData)
        const result = generator.generate()

        expect(result.code).toContain('mode="logical_left"')
      })

      // Include all the common tests from arithmetic components
      it('generates unique variable names for multiple instances', () => {
        const data1 = {
          id: 'shift-1',
          type: 'shift',
          props: { label: 'SHIFT1' }
        }

        const data2 = {
          id: 'shift-2',
          type: 'shift',
          props: { label: 'SHIFT2' }
        }

        const gen1 = new GeneratorClass(data1)
        const gen2 = new GeneratorClass(data2)

        const result1 = gen1.generate()
        const result2 = gen2.generate()

        expect(result1.varName).not.toBe(result2.varName)
        expect(result1.varName).toMatch(/^shft\d+$/)
        expect(result2.varName).toMatch(/^shft\d+$/)
      })

      it('handles all valid bit counts', () => {
        const bitCounts = [1, 4, 8, 16, 32]

        bitCounts.forEach(bits => {
          const componentData = {
            id: `shift-${bits}`,
            type: 'shift',
            props: {
              bits: bits,
              mode: 'logical_left'
            }
          }

          const generator = new GeneratorClass(componentData)
          const result = generator.generate()

          expect(result.code).toContain(`bits=${bits}`)
        })
      })

      it('escapes quotes in label', () => {
        const componentData = {
          id: 'shift-1',
          type: 'shift',
          props: {
            label: 'SHIFT "Test" Label',
            mode: 'logical_right'
          }
        }

        const generator = new GeneratorClass(componentData)
        const result = generator.generate()

        expect(result.code).toContain('label="SHIFT \\"Test\\" Label"')
      })

      it('handles missing bits prop gracefully', () => {
        const componentData = {
          id: 'shift-1',
          type: 'shift',
          props: {
            label: 'SHIFT',
            mode: 'arithmetic_right'
            // bits is missing
          }
        }

        const generator = new GeneratorClass(componentData)
        const result = generator.generate()

        expect(result.code).toContain('bits=8')
      })

      it('generates code with consistent parameter order', () => {
        const componentData = {
          id: 'shift-1',
          type: 'shift',
          props: {
            label: 'TEST',
            bits: 4,
            mode: 'logical_left'
          }
        }

        const generator = new GeneratorClass(componentData)
        const result = generator.generate()

        expect(result.code).toMatch(
          /arithmetic\.BarrelShifter\(label="TEST", bits=4, mode="logical_left", js_id="shift-1"\)/
        )
      })

      it('handles special characters in component id', () => {
        const componentData = {
          id: 'shift-test_123',
          type: 'shift',
          props: {
            bits: 8,
            mode: 'logical_right'
          }
        }

        const generator = new GeneratorClass(componentData)
        const result = generator.generate()

        expect(result.code).toContain('js_id="shift-test_123"')
      })

      it('includes arithmetic import', () => {
        const componentData = {
          id: 'shift-1',
          type: 'shift',
          props: {}
        }

        const generator = new GeneratorClass(componentData)
        const result = generator.generate()

        expect(result.imports).toEqual(new Set(['arithmetic']))
      })

      it('handles empty label correctly', () => {
        const componentData = {
          id: 'shift-1',
          type: 'shift',
          props: {
            label: '',
            bits: 4,
            mode: 'arithmetic_right'
          }
        }

        const generator = new GeneratorClass(componentData)
        const result = generator.generate()

        expect(result.code).toBe(
          `${result.varName} = arithmetic.BarrelShifter(bits=4, mode="arithmetic_right", js_id="shift-1")`
        )
      })

      it('generates correct class name BarrelShifter', () => {
        const componentData = {
          id: 'shift-1',
          type: 'shift',
          props: {
            label: 'TEST',
            bits: 8,
            mode: 'logical_left'
          }
        }

        const generator = new GeneratorClass(componentData)
        const result = generator.generate()

        expect(result.code).toContain('arithmetic.BarrelShifter(')
      })

      it('generates proper variable name prefix shft', () => {
        const componentData = {
          id: 'shift-1',
          type: 'shift',
          props: {}
        }

        const generator = new GeneratorClass(componentData)
        const result = generator.generate()

        expect(result.varName).toMatch(/^shft\d+$/)
      })
    })
  })
}

/**
 * Creates test configuration objects for common arithmetic components
 */
export const arithmeticTestConfigs = {
  subtract: {
    componentType: 'subtract',
    gglClassName: 'Subtract',
    varNamePattern: /^sub\d+$/,
    varPrefix: 'sub'
  },
  multiply: {
    componentType: 'multiply',
    gglClassName: 'Multiply',
    varNamePattern: /^mul\d+$/,
    varPrefix: 'mul'
  },
  divide: {
    componentType: 'divide',
    gglClassName: 'Divide',
    varNamePattern: /^div\d+$/,
    varPrefix: 'div'
  },
  compare: {
    componentType: 'compare',
    gglClassName: 'Comparator',
    varNamePattern: /^comp\d+$/,
    varPrefix: 'comp'
  },
  adder: {
    componentType: 'adder',
    gglClassName: 'Adder',
    varNamePattern: /^adder\d+$/,
    varPrefix: 'adder'
  }
}
