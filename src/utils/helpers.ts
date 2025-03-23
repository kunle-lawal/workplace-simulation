import { PerspectiveCamera, WebGLRenderer, Scene, Group, Vector3 } from 'three';

/**
 * Handles window resize events to adjust camera and renderer
 * @param camera - The Three.js camera
 * @param renderer - The Three.js renderer
 */
export function handleWindowResize(camera: PerspectiveCamera, renderer: WebGLRenderer): void {
  window.addEventListener('resize', () => {
    // Update camera aspect ratio
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    // Update renderer size
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
}

/**
 * Sets up mouse controls for orbiting around the scene
 * @param camera - The Three.js camera
 * @param officeLayout - The office layout group
 * @param container - The container element
 * @returns Function that returns whether auto-rotation is enabled
 */
export function setupMouseControls(camera: PerspectiveCamera, officeLayout: Group, container: HTMLElement): () => boolean {
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  let rotationSpeed = 0.01;
  let autoRotate = false; // Default is false - no auto-rotation
  
  // Initial position without auto-rotation
  officeLayout.rotation.y = Math.PI / 4; // Start at a 45 degree angle for better view
  
  // Mouse down event
  container.addEventListener('mousedown', (event) => {
    isDragging = true;
    previousMousePosition = {
      x: event.clientX,
      y: event.clientY
    };
  });
  
  // Mouse move event
  window.addEventListener('mousemove', (event) => {
    if (!isDragging) return;
    
    const deltaMove = {
      x: event.clientX - previousMousePosition.x,
      y: event.clientY - previousMousePosition.y
    };
    
    // Only rotate horizontally (Y-axis)
    officeLayout.rotation.y += deltaMove.x * rotationSpeed;
    
    // Ensure no tilting by keeping other rotations at 0
    officeLayout.rotation.x = 0;
    officeLayout.rotation.z = 0;
    
    previousMousePosition = {
      x: event.clientX,
      y: event.clientY
    };
  });
  
  // Mouse up event
  window.addEventListener('mouseup', () => {
    isDragging = false;
  });
  
  // Mouse leave event
  container.addEventListener('mouseleave', () => {
    isDragging = false;
  });
  
  // Wheel event for zooming
  container.addEventListener('wheel', (event) => {
    event.preventDefault();
    
    // Calculate zoom direction - only adjust z distance, not height
    const zoomFactor = 0.5;
    if (event.deltaY > 0) {
      // Zoom out
      camera.position.z += zoomFactor;
    } else {
      // Zoom in - with minimum distance
      if (camera.position.z > 5) {
        camera.position.z -= zoomFactor;
      }
    }
    
    // Make sure camera is always looking at the center
    camera.lookAt(0, 0, 0);
  });
  
  // Toggle auto-rotation with spacebar
  window.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
      autoRotate = !autoRotate;
      console.log(`Auto-rotation: ${autoRotate ? 'ON' : 'OFF'}`);
    }
  });
  
  // Return the auto-rotation state for animation loop
  return () => autoRotate;
}

/**
 * Calculates a value that oscillates between -range/2 and +range/2 over time
 * Useful for simple animations like floating objects
 * @param time - Current time value (usually from clock.getElapsedTime())
 * @param speed - Speed of oscillation
 * @param range - Range of oscillation
 * @returns Oscillated value
 */
export function oscillate(time: number, speed: number = 1, range: number = 1): number {
  return Math.sin(time * speed) * (range / 2);
} 