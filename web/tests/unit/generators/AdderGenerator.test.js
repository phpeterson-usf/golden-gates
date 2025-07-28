import { AdderGenerator } from '@/generators/AdderGenerator'
import { createArithmeticGeneratorTests, arithmeticTestConfigs } from './arithmeticTestUtils'

// Use shared test utilities to eliminate duplication
createArithmeticGeneratorTests({
  GeneratorClass: AdderGenerator,
  ...arithmeticTestConfigs.adder
})