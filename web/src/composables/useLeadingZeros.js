/**
 * Composable for formatting numbers with leading zeros based on bit width
 * @param {number} value - The numeric value to format
 * @param {number} base - The base (2, 10, 16)
 * @param {number} bits - The bit width for padding
 * @returns {string} - Formatted string representation
 */
export function formatWithLeadingZeros(value, base, bits) {
  if (base === 16) {
    // Calculate hex digits needed (4 bits per hex digit)
    const hexDigits = Math.ceil(bits / 4)
    const hexString = value.toString(16).padStart(hexDigits, '0')
    return '0x' + hexString
  } else if (base === 2) {
    // Pad binary to full bit width
    const binaryString = value.toString(2).padStart(bits, '0')
    return '0b' + binaryString
  } else {
    return value.toString(10)
  }
}

/**
 * Composable hook for number formatting with leading zeros
 * @param {Object} props - Component props containing value, base, and bits
 * @returns {Object} - Object with formatting functions
 */
export function useLeadingZeros(props) {
  const formatValue = () => {
    return formatWithLeadingZeros(props.value, props.base, props.bits)
  }
  
  return {
    formatValue,
    formatWithLeadingZeros
  }
}