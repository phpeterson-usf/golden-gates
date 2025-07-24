# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Golden Gates is an educational digital logic circuit simulation system with two main components:

1. **GGL (Golden Gates Language)** - Python-based circuit simulation engine (`web/public/ggl/`)
2. **Web Application** - Vue.js-based circuit designer interface (`web/`)

## Repository Structure

```
golden-gates/
├── CLAUDE.md           # Project guidance for Claude Code
├── README.md           # Main project documentation
├── gglang/             # Language design documents
│   └── design/         # GGL design specifications
└── web/                # Vue.js web application
    ├── README.md       # Web app setup instructions
    ├── package.json    # NPM dependencies
    ├── vite.config.js  # Build configuration
    ├── public/
    │   └── ggl/        # GGL simulation engine (Python package)
    │       ├── circuit.py, component.py, etc.
    │       └── tests/  # GGL test circuits
    ├── src/            # Vue.js source code
    │   ├── components/ # Vue components (LogicGate, Wire, etc.)
    │   ├── composables/# Vue 3 composition API functions
    │   ├── config/     # Component definitions and properties
    │   ├── generators/ # GGL Code generation for circuit components
    │   ├── locales/    # i18n translations
    │   ├── styles/     # CSS styles
    │   ├── types/      # TypeScript definitions
    │   └── utils/      # Utility functions
    └── tests/          # Test suite
        └── unit/       # Unit tests for components and utilities
```

## Component-Specific Guidance

- For GGL simulation engine work: See GGL documentation
- For web application work: See `web/README.md`

## Integration Plans

The web app will eventually use Pyodide to run the GGL simulation engine directly in the browser, eliminating the need for a backend server.

## Design Considerations

- Follow Vue.js best practices and composition API patterns
- Write test cases using vitest when adding new features
- Factor literal strings into locales using i18n, rather than leaving new literal strings in Vue Components
- Use centralized component styling from styles/components.css rather than making up new styles
- Maintain separation between simulation logic and UI components
- When adding Javascript or Typescript code to the web app, use object-oriented design rather than writing code which uses component type in if/else or switch statements
- When adding features to the web app, use the Model View Controller design pattern

## PrimeVue Styling Guidelines

This project uses PrimeVue components which can be challenging to style due to their scoped CSS and high specificity. Follow these guidelines:

### General Approach
1. **Check component documentation first** - Look for props, slots, and built-in styling options before attempting custom CSS
2. **Use component slots when available** - PrimeVue components often provide slots (like `#messageicon`, `#closeicon`) to override default content
3. **Leverage component props** - Many styling needs can be met with props like `icon`, `severity`, `closable`, etc.

### When Custom Styling is Needed
1. **Start with inline styles** - For simple padding, margins, or colors, inline styles (`style="padding-left: 12px"`) often work best
2. **Use `!important` sparingly but when needed** - PrimeVue's CSS has high specificity, so `!important` may be necessary
3. **Target specific PrimeVue CSS classes** - Use browser dev tools to identify the exact classes (e.g., `.p-message-text`, `.p-button-label`)
4. **Avoid nested CSS syntax in Vue components** - Use flat selectors like `.my-component .p-message-text` instead of nested syntax

### Common PrimeVue Classes
- `.p-message`, `.p-message-text`, `.p-message-icon`, `.p-message-close` - Message component
- `.p-button`, `.p-button-label`, `.p-button-icon` - Button component  
- `.p-dialog`, `.p-dialog-header`, `.p-dialog-content` - Dialog component

### Debugging Techniques
1. **Add temporary background colors** - Use bright colors like `background-color: lime !important` to verify CSS selectors work
2. **Check browser dev tools** - Inspect the actual rendered HTML structure and CSS classes
3. **Test with multiple approaches** - Try inline styles, global CSS, and scoped CSS to find what works

### Example Patterns That Work
```vue
<!-- Use slots to override default content -->
<Message>
  <template #messageicon><!-- empty to hide icon --></template>
  <div style="padding-left: 12px;">{{ message }}</div>
</Message>

<!-- Use component props when available -->
<Message :closable="true" severity="error" icon=" " />

<!-- Use specific CSS classes with !important -->
<style>
.my-notification .p-message-icon {
  display: none !important;
}
</style>
```
