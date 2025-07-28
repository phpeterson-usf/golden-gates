import { ShiftGenerator } from '@/generators/ShiftGenerator'
import { createShiftGeneratorTests } from './arithmeticTestUtils'

// Use shared test utilities for shift component (which has unique mode parameter)
createShiftGeneratorTests(ShiftGenerator)