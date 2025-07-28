import { DivideGenerator } from '@/generators/DivideGenerator'
import { createArithmeticGeneratorTests, arithmeticTestConfigs } from './arithmeticTestUtils'

// Use shared test utilities to eliminate duplication
createArithmeticGeneratorTests({
  GeneratorClass: DivideGenerator,
  ...arithmeticTestConfigs.divide
})
