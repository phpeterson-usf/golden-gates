# Frontend Testing Guide

This directory contains the test suite for the Golden Gates web application, built with [Vitest](https://vitest.dev/) and [Vue Test Utils](https://vue-test-utils.vuejs.org/).

## 📁 Directory Structure

```
tests/
├── unit/                       # Unit tests
│   ├── components/            # Vue component tests
│   │   └── MultibaseNumberInput.test.js
│   ├── composables/          # Composable/hook tests
│   │   └── useComponentView.test.js
│   └── utils/                # Utility function tests
│       └── constants.test.js
├── fixtures/                  # Test data and mock objects
├── helpers/                   # Test utilities and helpers
│   └── test-utils.js         # Common test setup functions
├── setup.js                  # Global test configuration
└── README.md                 # This file
```

## 🚀 Running Tests

### Basic Commands
```bash
# Run tests in watch mode (for development)
npm test

# Run tests once (for CI/production)
npm run test:run

# Run tests with coverage report
npm run test:coverage

# Open interactive test UI
npm run test:ui
```

### Watching Specific Files
```bash
# Watch only component tests
npm test -- tests/unit/components/

# Watch a specific test file
npm test -- tests/unit/utils/constants.test.js

# Run tests matching a pattern
npm test -- --grep "MultibaseNumberInput"
```

## 📝 Writing Tests

### Test File Naming
- **Components**: `ComponentName.test.js`
- **Composables**: `useComposableName.test.js`
- **Utils**: `fileName.test.js`
- **Integration**: `featureName.integration.test.js`

### Basic Test Structure
```javascript
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ComponentName from '@/components/ComponentName.vue'

describe('ComponentName', () => {
  describe('Props', () => {
    it('should accept required props', () => {
      // Test implementation
    })
  })
  
  describe('Events', () => {
    it('should emit events correctly', () => {
      // Test implementation
    })
  })
  
  describe('User Interactions', () => {
    it('should handle user input', () => {
      // Test implementation
    })
  })
})
```

## 🧪 Test Types and Examples

### 1. **Utils Testing** (Easiest to start)
Test pure functions, constants, and utilities:

```javascript
// tests/unit/utils/constants.test.js
import { describe, it, expect } from 'vitest'
import { GRID_SIZE, COLORS } from '@/utils/constants'

describe('Constants', () => {
  it('should have correct GRID_SIZE', () => {
    expect(GRID_SIZE).toBe(15)
    expect(typeof GRID_SIZE).toBe('number')
  })
  
  it('should have valid hex colors', () => {
    const hexColorRegex = /^#[0-9a-fA-F]{6}$/
    expect(COLORS.componentStroke).toMatch(hexColorRegex)
  })
})
```

### 2. **Composable Testing**
Test Vue composables with reactivity:

```javascript
// tests/unit/composables/useComponentView.test.js
import { describe, it, expect, vi } from 'vitest'
import { reactive } from 'vue'
import { useComponentView } from '@/composables/useComponentView'

describe('useComponentView', () => {
  it('should update colors when selected prop changes', () => {
    const props = reactive({ selected: false })
    const emit = vi.fn()
    
    const { fillColor } = useComponentView(props, emit)
    
    expect(fillColor.value).toBe(COLORS.componentFill)
    
    props.selected = true
    expect(fillColor.value).toBe(COLORS.componentSelectedFill)
  })
})
```

### 3. **Component Testing**
Test Vue components with props, events, and interactions:

```javascript
// tests/unit/components/MultibaseNumberInput.test.js
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MultibaseNumberInput from '@/components/MultibaseNumberInput.vue'

describe('MultibaseNumberInput', () => {
  const createWrapper = (props = {}) => {
    return mount(MultibaseNumberInput, {
      props: {
        modelValue: 0,
        base: 10,
        ...props
      }
    })
  }

  it('should display decimal values correctly', () => {
    const wrapper = createWrapper({ modelValue: 42, base: 10 })
    const input = wrapper.find('input')
    expect(input.element.value).toBe('42')
  })
  
  it('should emit events on input change', async () => {
    const wrapper = createWrapper()
    const input = wrapper.find('input')
    
    await input.setValue('123')
    
    expect(wrapper.emitted('update:both')).toBeTruthy()
    expect(wrapper.emitted('update:both')[0][0]).toEqual({ value: 123, base: 10 })
  })
})
```

## 🛠️ Testing Utilities

### Helper Functions
Use the utilities in `helpers/test-utils.js`:

```javascript
import { createWrapper, createMockProps, triggerAndWait } from '../helpers/test-utils'

// Create component wrapper with default setup
const wrapper = createWrapper(MyComponent, { props: { id: 'test' } })

// Create mock props for components
const props = createMockProps({ selected: true, x: 100, y: 200 })

// Trigger event and wait for updates
await triggerAndWait(wrapper, 'button', 'click')
```

### Mocking
```javascript
// Mock functions
const mockFn = vi.fn()
mockFn.mockReturnValue('mocked value')

// Mock modules
vi.mock('@/utils/constants', () => ({
  GRID_SIZE: 20,
  COLORS: { componentFill: 'red' }
}))

// Mock SVG elements (already set up in setup.js)
// No additional mocking needed for basic SVG operations
```

## 📊 Coverage Reports

### Understanding Coverage
- **Statements**: Percentage of code statements executed
- **Branches**: Percentage of if/else branches tested
- **Functions**: Percentage of functions called
- **Lines**: Percentage of lines executed

### Coverage Goals
- **Utils**: Aim for 90%+ coverage (pure functions are easy to test)
- **Composables**: Aim for 80%+ coverage (focus on main logic paths)
- **Components**: Aim for 70%+ coverage (focus on user interactions)

### Viewing Coverage
```bash
# Generate and view coverage report
npm run test:coverage

# Coverage files are generated in coverage/
open coverage/index.html  # View HTML report
```

## 🎯 Testing Best Practices

### 1. **Test Structure**
- **Arrange**: Set up test data and mocks
- **Act**: Execute the code being tested
- **Assert**: Check the results

### 2. **What to Test**
- ✅ **Props**: Component accepts correct props
- ✅ **Events**: Component emits events correctly
- ✅ **User Interactions**: Clicks, inputs, form submissions
- ✅ **Computed Properties**: Reactive calculations
- ✅ **Validation**: Error states and edge cases
- ✅ **Accessibility**: ARIA attributes, keyboard navigation

### 3. **What NOT to Test**
- ❌ **Vue internals**: Don't test Vue's reactivity system
- ❌ **Third-party libraries**: Don't test PrimeVue components
- ❌ **Implementation details**: Test behavior, not internal methods
- ❌ **Styles**: Don't test CSS unless it affects functionality

### 4. **Naming Conventions**
- Use descriptive test names: `should display error when input is invalid`
- Group related tests with `describe` blocks
- Use `it` for individual test cases
- Follow the pattern: `should [expected behavior] when [condition]`

## 🔧 Common Patterns

### Testing Component Props
```javascript
it('should accept and display modelValue prop', () => {
  const wrapper = createWrapper({ modelValue: 42 })
  expect(wrapper.props('modelValue')).toBe(42)
})
```

### Testing Events
```javascript
it('should emit update event when value changes', async () => {
  const wrapper = createWrapper()
  const input = wrapper.find('input')
  
  await input.setValue('new value')
  
  expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  expect(wrapper.emitted('update:modelValue')[0][0]).toBe('new value')
})
```

### Testing Validation
```javascript
it('should show error for invalid input', async () => {
  const wrapper = createWrapper()
  const input = wrapper.find('input')
  
  await input.setValue('invalid')
  
  expect(wrapper.find('.error-message').exists()).toBe(true)
  expect(wrapper.find('.error-message').text()).toContain('Invalid input')
})
```

### Testing Conditional Rendering
```javascript
it('should show loading state when loading prop is true', () => {
  const wrapper = createWrapper({ loading: true })
  
  expect(wrapper.find('.loading-spinner').exists()).toBe(true)
  expect(wrapper.find('.content').exists()).toBe(false)
})
```

## 🐛 Debugging Tests

### Common Issues
1. **Async operations**: Always use `await` for async operations
2. **Reactive updates**: Use `await wrapper.vm.$nextTick()` after changes
3. **DOM queries**: Use `wrapper.find()` instead of `document.querySelector()`
4. **Mocking**: Ensure mocks are set up before imports

### Debug Tools
```javascript
// Log wrapper HTML
console.log(wrapper.html())

// Log component data
console.log(wrapper.vm.$data)

// Debug specific elements
console.log(wrapper.find('input').element.value)
```

## 📚 Adding New Tests

### Step-by-step Process
1. **Identify what to test**: Props, events, user interactions, edge cases
2. **Create test file**: Follow naming conventions
3. **Write test skeleton**: Set up describe blocks and basic structure
4. **Implement tests**: Start with simple cases, add complexity
5. **Run tests**: Use `npm test` to verify they pass
6. **Check coverage**: Ensure important code paths are tested

### Example: Adding Tests for a New Component
```javascript
// tests/unit/components/NewComponent.test.js
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import NewComponent from '@/components/NewComponent.vue'

describe('NewComponent', () => {
  const createWrapper = (props = {}) => {
    return mount(NewComponent, {
      props: {
        // Default props
        ...props
      }
    })
  }

  describe('Props', () => {
    // Test prop acceptance and validation
  })

  describe('Events', () => {
    // Test event emissions
  })

  describe('User Interactions', () => {
    // Test clicks, inputs, etc.
  })

  describe('Edge Cases', () => {
    // Test error conditions and edge cases
  })
})
```

## 🤝 Contributing

When adding new features:
1. **Write tests first** (TDD approach) or alongside your implementation
2. **Ensure tests pass** before submitting PRs
3. **Maintain coverage** - don't let coverage drop significantly
4. **Follow patterns** established in existing tests
5. **Update this README** if you add new testing utilities or patterns

## 📖 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils](https://vue-test-utils.vuejs.org/)
- [Testing Best Practices](https://testing-library.com/docs/guiding-principles)
- [Jest Matchers](https://jestjs.io/docs/expect) (compatible with Vitest)

Happy testing! 🎉