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
