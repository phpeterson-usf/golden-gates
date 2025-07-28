import { CompareGenerator } from '@/generators/CompareGenerator'
import { createArithmeticGeneratorTests, arithmeticTestConfigs } from './arithmeticTestUtils'

// Use shared test utilities to eliminate duplication
createArithmeticGeneratorTests({
  GeneratorClass: CompareGenerator,
  ...arithmeticTestConfigs.compare
})