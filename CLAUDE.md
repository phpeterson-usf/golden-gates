# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Golden Gates is an educational digital logic circuit simulation system with two main components:

1. **GGL (Golden Gates Language)** - Python-based circuit simulation engine (`model/`)
2. **Web Application** - Vue.js-based circuit designer interface (`web/`)

## Repository Structure

```
golden-gates/
├── model/               # GGL simulation engine
│   ├── ggl/            # Core Python package
│   └── CLAUDE.md       # Detailed GGL development guide
├── web/                # Web application
│   ├── src/            # Vue.js source code
│   └── README.md       # Web app setup instructions
└── gglang/             # Language design documents
```

## Component-Specific Guidance

- For GGL simulation engine work: See `model/CLAUDE.md`
- For web application work: See `web/README.md`

## Integration Plans

The web app will eventually use Pyodide to run the GGL simulation engine directly in the browser, eliminating the need for a backend server.