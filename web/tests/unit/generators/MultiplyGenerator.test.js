import { MultiplyGenerator } from '@/generators/MultiplyGenerator'
import { createArithmeticGeneratorTests, arithmeticTestConfigs } from './arithmeticTestUtils'

// Use shared test utilities to eliminate duplication
createArithmeticGeneratorTests({
  GeneratorClass: MultiplyGenerator,
  ...arithmeticTestConfigs.multiply
})
