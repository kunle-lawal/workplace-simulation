import { Simulation } from './simulation';
import { SimulationMode } from './types';

// Wait for the DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Get the canvas element
    const canvas = document.getElementById('office-canvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    
    // Initialize the simulation
    const simulation = new Simulation('office-canvas');
    
    // Start the simulation
    simulation.start();
    
    // Set up toggle button
    const toggleButton = document.getElementById('toggle-mode');
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            simulation.toggleMode();
            
            // Update button text
            const buttonText = simulation.getMode() === SimulationMode.MANAGED ?
                'Mode: Managed (With Management Solution)' :
                'Mode: Chaotic (No Management)';
            
            toggleButton.textContent = buttonText;
        });
    }
}); 