import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import prettier from '@vue/eslint-config-prettier'

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '.vite/**',
      'public/ggl/**',
      '*.min.js',
      '*.bundle.js'
    ]
  },
  js.configs.recommended,
  ...vue.configs['flat/recommended'],
  prettier,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        console: 'readonly',
        process: 'readonly',
        alert: 'readonly',
        CustomEvent: 'readonly',
        global: 'readonly',
        SVGElement: 'readonly',
        performance: 'readonly',
        KeyboardEvent: 'readonly',
        Blob: 'readonly',
        URL: 'readonly'
      }
    },
    rules: {
      // Vue specific rules
      'vue/multi-word-component-names': 'off', // Allow single word component names for now
      'vue/no-unused-vars': 'warn',
      'vue/no-unused-components': 'warn',

      // General JavaScript rules
      'no-unused-vars': 'warn',
      'no-console': 'warn',
      'no-debugger': 'warn',
      'prefer-const': 'warn',

      // Relax some Vue rules for now
      'vue/attribute-hyphenation': 'off',
      'vue/v-on-event-hyphenation': 'off',
      'vue/attributes-order': 'off',
      'vue/order-in-components': 'off'
    }
  },
  {
    files: ['**/*.test.js', '**/*.spec.js', 'tests/**/*.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        test: 'readonly'
      }
    }
  }
]
