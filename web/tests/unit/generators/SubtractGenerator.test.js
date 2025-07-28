import { SubtractGenerator } from '@/generators/SubtractGenerator'
import { createArithmeticGeneratorTests, arithmeticTestConfigs } from './arithmeticTestUtils'

// Use shared test utilities to eliminate duplication
createArithmeticGeneratorTests({
  GeneratorClass: SubtractGenerator,
  ...arithmeticTestConfigs.subtract
})
