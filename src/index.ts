import { Clock } from 'three';
import { ThreeScene } from './scene';
import { handleWindowResize, setupMouseControls } from './utils/helpers';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  init();
});

/**
 * Initialize the 3D scene and start the animation loop
 */
function init(): void {
  // Get the container element
  const container = document.getElementById('scene-container');
  
  if (!container) {
    console.error('Could not find the scene container element!');
    return;
  }
  
  // Create our scene instance
  const threeScene = new ThreeScene({ container });
  
  // Set up window resize handler
  handleWindowResize(threeScene.getCamera(), threeScene.getRenderer());
  
  // Set up mouse controls and get auto-rotation status function
  const getAutoRotate = setupMouseControls(
    threeScene.getCamera(), 
    threeScene.getOfficeLayout(), 
    container
  );
  
  // Create a clock for tracking time
  const clock = new Clock();
  
  // Start the animation loop
  animate(threeScene, clock, getAutoRotate);
}

/**
 * Animation loop function
 * @param scene The Three.js scene instance
 * @param clock The Three.js clock for time tracking
 * @param getAutoRotate Function that returns whether auto-rotation is enabled
 */
function animate(
  scene: ThreeScene, 
  clock: Clock, 
  getAutoRotate: () => boolean
): void {
  requestAnimationFrame(() => animate(scene, clock, getAutoRotate));
  
  // Get the elapsed time
  const elapsedTime = clock.getElapsedTime();
  
  // Update the scene with auto rotation info
  scene.update(elapsedTime, getAutoRotate());
}

// Log a startup message with instructions
console.log(`
Office Layout Visualization Initialized
-------------------------------------
Controls:
- Click and drag to rotate the model
- Mouse wheel to zoom in/out
- Press SPACE to toggle auto-rotation
`); 