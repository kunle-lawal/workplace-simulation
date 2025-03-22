import { OfficeSimulation } from './simulation';
import { SPACE_TYPES } from './constants';

/**
 * Entry point for the Office Simulation application
 * Initializes the simulation and sets up the user interface
 */
document.addEventListener('DOMContentLoaded', () => {
    // Get canvas element
    const canvas = document.getElementById('simulationCanvas') as HTMLCanvasElement;
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    // Function to resize canvas to fit container
    function resizeCanvas(): void {
        const container = canvas.parentElement;
        if (container) {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
        }
    }

    // Initial resize and listen for window resize
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize the simulation
    const simulation = new OfficeSimulation(canvas);

    // Start the simulation loop
    simulation.start();

    // Mode toggle
    const modeToggleBtn = document.getElementById('modeToggle');
    if (modeToggleBtn) {
        modeToggleBtn.addEventListener('click', () => {
            simulation.toggleMode();
            updateModeDisplay();
        });
    }

    // Editor toggle
    const editorToggleBtn = document.getElementById('editorToggle');
    if (editorToggleBtn) {
        editorToggleBtn.addEventListener('click', () => {
            simulation.toggleEditor();
            updateEditorButtonText();
        });
    }

    // Save layout
    const saveLayoutBtn = document.getElementById('saveLayout');
    if (saveLayoutBtn) {
        saveLayoutBtn.addEventListener('click', () => {
            simulation.saveLayout();
        });
    }

    // Load layout
    const loadLayoutBtn = document.getElementById('loadLayout');
    if (loadLayoutBtn) {
        loadLayoutBtn.addEventListener('click', () => {
            simulation.loadLayoutFromFile();
        });
    }

    // Load from editor
    const loadFromEditorBtn = document.getElementById('loadFromEditor');
    if (loadFromEditorBtn) {
        loadFromEditorBtn.addEventListener('click', () => {
            simulation.loadLayoutFromEditor();
        });
    }

    // Pause/Resume
    const pauseBtn = document.getElementById('pauseToggle');
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            simulation.togglePause();
            updatePauseButtonText();
        });
    }

    // Speed controls
    const speedButtons = document.querySelectorAll('[data-speed]');
    speedButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const speed = parseFloat(target.getAttribute('data-speed') || '1');
            simulation.setSpeed(speed);
            updateSpeedSelection(speed);
        });
    });

    // Space type selection
    const spaceTypeButtons = document.querySelectorAll('[data-space-type]');
    spaceTypeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const typeStr = target.getAttribute('data-space-type');
            if (typeStr === 'desk' || typeStr === 'meeting') {
                const spaceType = typeStr === 'desk' ? SPACE_TYPES.DESK : SPACE_TYPES.MEETING_ROOM;
                simulation.setSpaceType(spaceType);
                updateSpaceTypeSelection(typeStr);
            }
        });
    });

    // Initial UI updates
    updateModeDisplay();
    updateEditorButtonText();
    updateSpeedSelection(1);
    updateSpaceTypeSelection('desk');

    // UI update functions
    function updateModeDisplay(): void {
        const modeDisplay = document.getElementById('modeDisplay');
        if (modeDisplay) {
            const isManaged = simulation.isManaged();
            modeDisplay.textContent = isManaged ? 'Managed' : 'Chaotic';
            modeDisplay.className = isManaged ? 'mode-managed' : 'mode-chaotic';
        }
    }

    function updateEditorButtonText(): void {
        const editorToggleBtn = document.getElementById('editorToggle');
        if (editorToggleBtn) {
            const isActive = simulation.isEditorActive();
            editorToggleBtn.textContent = isActive ? 'Exit Editor' : 'Layout Editor';
        }

        // Show/hide layout controls
        const layoutControls = document.getElementById('layoutControls');
        if (layoutControls) {
            layoutControls.style.display = simulation.isEditorActive() ? 'block' : 'none';
        }
    }

    function updatePauseButtonText(): void {
        const pauseBtn = document.getElementById('pauseToggle');
        if (pauseBtn) {
            // We don't have direct access to isPaused, so we'll toggle the text based on the current text
            pauseBtn.textContent = pauseBtn.textContent === 'Pause' ? 'Resume' : 'Pause';
        }
    }

    function updateSpeedSelection(speed: number): void {
        const speedButtons = document.querySelectorAll('[data-speed]');
        speedButtons.forEach(button => {
            const buttonSpeed = parseFloat(button.getAttribute('data-speed') || '1');
            if (buttonSpeed === speed) {
                button.classList.add('selected');
            } else {
                button.classList.remove('selected');
            }
        });
    }

    function updateSpaceTypeSelection(type: string): void {
        const spaceTypeButtons = document.querySelectorAll('[data-space-type]');
        spaceTypeButtons.forEach(button => {
            const buttonType = button.getAttribute('data-space-type');
            if (buttonType === type) {
                button.classList.add('selected');
            } else {
                button.classList.remove('selected');
            }
        });
    }

    // Handle window cleanup
    window.addEventListener('beforeunload', () => {
        simulation.destroy();
    });
}); 