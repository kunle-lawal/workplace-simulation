# 3D Office Space Simulation

A 3D simulation of an office environment built with TypeScript and Three.js. This application allows you to simulate office space usage in both managed and chaotic modes, edit office layouts, and observe the behavior of characters in the environment.

## Features

- 3D visualization of office spaces using Three.js
- Two simulation modes: Managed and Chaotic
- Layout editor for customizing office spaces
- Save and load office layouts
- Adjustable simulation speed
- Character behavior simulation

## Prerequisites

- Node.js (v14+)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/office-simulation.git
cd office-simulation
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Development Mode

To run the application in development mode with hot reloading:

```bash
npm run dev
```

or

```bash
npm start
```

This will start a development server and open the application in your default browser.

### Build for Production

To build the application for production:

```bash
npm run build
```

This will create optimized files in the `dist` directory.

## Usage

### Simulation Controls

- **Mode Toggle**: Switch between Managed and Chaotic modes
- **Pause/Resume**: Pause or resume the simulation
- **Speed Controls**: Adjust simulation speed (1x, 2x, 5x)
- **Editor Toggle**: Enter or exit the layout editor

### Layout Editor

- **Space Type Selection**: Choose between desk and meeting room
- **Placement**: Click on the grid to place a selected space type
- **Removal**: Click on an existing space to remove it
- **Save Layout**: Save the current layout to a JSON file
- **Load Layout**: Load a layout from a JSON file

## Project Structure

- `src/ts/` - TypeScript source files
  - `index.ts` - Main entry point
  - `scene.ts` - 3D scene setup with Three.js
  - `simulation.ts` - Main simulation logic
  - `spaces.ts` - Space management (desks, meeting rooms)
  - `characters.ts` - Character behavior
  - `editor.ts` - Layout editor functionality
  - `utils.ts` - Utility functions
  - `types.ts` - TypeScript type definitions
  - `constants.ts` - Application constants

## License

MIT

## Acknowledgements

- Three.js for 3D rendering
- TypeScript for type-safe JavaScript
- Webpack for bundling 
