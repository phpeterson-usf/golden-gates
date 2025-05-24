# Golden Gates Web Application

A web-based circuit designer for the Golden Gates Language (GGL).

## Overview

This is a single-page application built with Vue.js 3, Vite, and PrimeVue. The application will run GGL circuit simulations directly in the browser using Pyodide (Python in WebAssembly).

## Setup Instructions

1. Navigate to the web directory:
   ```bash
   cd web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   The application will be available at http://localhost:3000

## Building for Production

Build the static files:
```bash
npm run build
```

The built files will be in the `dist` directory and can be deployed to any static hosting service (GitHub Pages, Netlify, Vercel, etc.).

## Features

- **Toolbar**: Contains buttons for adding gates, inputs, outputs, and wires
- **Circuit Canvas**: 
  - Dot grid with 30px spacing for precise component placement
  - Grid snapping functionality
  - Two-layer canvas system (grid layer + circuit layer)
- **Simulation**: Will run GGL Python code directly in the browser using Pyodide
- **No Backend Required**: Everything runs client-side in the browser

## Development

The application is structured as follows:
- `src/App.vue`: Main application component with toolbar
- `src/components/CircuitCanvas.vue`: Canvas component for drawing circuits
- `src/main.js`: Application entry point with PrimeVue setup

## Future Enhancements

- Pyodide integration for running GGL simulations
- Circuit component drawing and manipulation
- Export/import circuit designs
- Real-time simulation results display