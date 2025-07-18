import { describe, it, expect } from 'vitest'
import { formatWithLeadingZeros, useLeadingZeros } from '@/composables/useLeadingZeros'

describe('useLeadingZeros', () => {
  describe('formatWithLeadingZeros', () => {
    describe('Binary formatting', () => {
      it('should format binary with leading zeros', () => {
        expect(formatWithLeadingZeros(5, 2, 8)).toBe('0b00000101')
        expect(formatWithLeadingZeros(0, 2, 4)).toBe('0b0000')
        expect(formatWithLeadingZeros(15, 2, 4)).toBe('0b1111')
      })

      it('should handle single bit values', () => {
        expect(formatWithLeadingZeros(0, 2, 1)).toBe('0b0')
        expect(formatWithLeadingZeros(1, 2, 1)).toBe('0b1')
      })

      it('should handle large bit widths', () => {
        expect(formatWithLeadingZeros(255, 2, 16)).toBe('0b0000000011111111')
        expect(formatWithLeadingZeros(1, 2, 32)).toBe('0b00000000000000000000000000000001')
      })
    })

    describe('Hexadecimal formatting', () => {
      it('should format hexadecimal with leading zeros', () => {
        expect(formatWithLeadingZeros(15, 16, 8)).toBe('0x0f')
        expect(formatWithLeadingZeros(255, 16, 8)).toBe('0xff')
        expect(formatWithLeadingZeros(0, 16, 8)).toBe('0x00')
      })

      it('should calculate correct hex digits for bit width', () => {
        expect(formatWithLeadingZeros(1, 16, 4)).toBe('0x1') // 4 bits = 1 hex digit
        expect(formatWithLeadingZeros(1, 16, 8)).toBe('0x01') // 8 bits = 2 hex digits
        expect(formatWithLeadingZeros(1, 16, 12)).toBe('0x001') // 12 bits = 3 hex digits
        expect(formatWithLeadingZeros(1, 16, 16)).toBe('0x0001') // 16 bits = 4 hex digits
      })

      it('should handle edge cases', () => {
        expect(formatWithLeadingZeros(0, 16, 1)).toBe('0x0')
        expect(formatWithLeadingZeros(65535, 16, 16)).toBe('0xffff')
      })
    })

    describe('Decimal formatting', () => {
      it('should format decimal without leading zeros', () => {
        expect(formatWithLeadingZeros(0, 10, 8)).toBe('0')
        expect(formatWithLeadingZeros(42, 10, 8)).toBe('42')
        expect(formatWithLeadingZeros(255, 10, 8)).toBe('255')
      })

      it('should ignore bit width for decimal', () => {
        expect(formatWithLeadingZeros(42, 10, 1)).toBe('42')
        expect(formatWithLeadingZeros(42, 10, 32)).toBe('42')
      })
    })
  })

  describe('useLeadingZeros composable', () => {
    it('should provide formatValue function', () => {
      const props = { value: 5, base: 2, bits: 8 }
      const { formatValue } = useLeadingZeros(props)

      expect(formatValue()).toBe('0b00000101')
    })

    it('should provide formatWithLeadingZeros function', () => {
      const props = { value: 255, base: 16, bits: 8 }
      const { formatWithLeadingZeros: fn } = useLeadingZeros(props)

      expect(fn(15, 16, 8)).toBe('0x0f')
    })

    it('should react to prop changes', () => {
      const props = { value: 10, base: 16, bits: 8 }
      const { formatValue } = useLeadingZeros(props)

      expect(formatValue()).toBe('0x0a')

      // Change props
      props.value = 255
      expect(formatValue()).toBe('0xff')
    })
  })
})
