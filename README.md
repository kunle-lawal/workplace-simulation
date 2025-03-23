# 3D Office Layout Visualization

An interactive 3D visualization of an office floor plan created with Three.js and TypeScript.

## Project Overview

This project demonstrates how to create an interactive 3D office layout visualization from a 2D floor plan. The visualization shows:

- Office spaces and rooms (green rectangles on the edges)
- Desk clusters that resemble lego pieces (green elements in the center)
- Various facilities like coffee machines, water dispensers, etc.

The 3D model is presented as a flat layout that rotates in 3D space, providing an intuitive view of the office arrangement.

## Features

- Interactive 3D office layout visualization
- Mouse controls for rotating and zooming
- Auto-rotation toggle with spacebar
- Responsive design that adapts to window size
- Accurately recreates the office layout with proper placement of rooms and desk clusters

## Controls

- **Click and drag**: Rotate the model
- **Mouse wheel**: Zoom in/out
- **Spacebar**: Toggle auto-rotation

## Project Structure

```
├── public/          # Static assets
├── src/             # Source code
│   ├── styles/      # CSS styles
│   ├── utils/       # Utility functions
│   ├── index.html   # Main HTML file
│   ├── index.ts     # Entry point
│   └── scene.ts     # Three.js scene setup
├── package.json     # Dependencies and scripts
├── tsconfig.json    # TypeScript configuration
└── vite.config.js   # Vite configuration
```

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Build for production:
   ```
   npm run build
   ```

4. Preview the production build:
   ```
   npm run preview
   ```

## Room Names & Features

The office layout includes the following named areas:

- **Mission Control**: Main office space on the left side
- **Naboo**: Bottom left office
- **Mandalore**: Bottom left office
- **Starship**: Top left office
- **Millennium Falcon**: Top right office
- **Solaris**: Bottom right office
- **Desk Clusters**: Pulsar, Star Dust, Comet, Meteor, Asteroid
- **Facilities**: Paper Shredder, Coffee Machine, Water Dispenser, Office Supplies, Snacks

## Customization

- Modify `scene.ts` to change the office layout or add more elements
- Add textures for more realistic surfaces in the `public` directory
- Extend the room types and facility types as needed
- Customize the UI by editing the HTML and CSS files

## Dependencies

- Three.js: A JavaScript 3D library
- TypeScript: A typed superset of JavaScript
- Vite: Next generation frontend tooling
