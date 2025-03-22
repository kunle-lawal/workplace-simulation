import * as THREE from 'three';
import { SIMULATION_CONFIG, OFFICE_LAYOUT, CHARACTERS, CHARACTER_STATES, SPACE_TYPES } from './constants';
import { Scene3D } from './scene';
import { Space3D } from './spaces';
import { Character3D } from './characters';
import { LayoutEditor } from './editor';
import { OfficeLayout, SpaceType, CharacterState } from './types';
import { calculateSimulationTime, formatTime } from './utils';

/**
 * Main office simulation class
 * Manages the 3D scene, spaces, characters, and simulation loop
 */
export class OfficeSimulation {
    // Core components
    private scene: Scene3D;
    private spaces: Space3D[];
    private characters: Character3D[];
    private layoutEditor: LayoutEditor;
    
    // State
    private _isManaged: boolean;
    private animationFrameId: number | null;
    private startTime: number;
    private lastUpdateTime: number;
    private simulationSpeed: number;
    private isPaused: boolean;
    
    // UI elements
    private timeDisplay: HTMLElement | null;

    /**
     * Creates a new office simulation
     * @param canvas - Canvas element for rendering
     */
    constructor(canvas: HTMLCanvasElement) {
        // Initialize scene
        this.scene = new Scene3D(canvas);
        
        // Initialize collections
        this.spaces = [];
        this.characters = [];
        
        // Initialize state
        this._isManaged = true;
        this.animationFrameId = null;
        this.startTime = Date.now();
        this.lastUpdateTime = this.startTime;
        this.simulationSpeed = 1.0;
        this.isPaused = false;
        
        // Create layout editor
        this.layoutEditor = new LayoutEditor(this.scene, canvas);
        
        // Get UI elements
        this.timeDisplay = document.getElementById('timeDisplay');
        
        // Initialize simulation
        this.loadLayout(OFFICE_LAYOUT);
        this.createCharacters();
    }

    /**
     * Creates characters for the simulation
     */
    private createCharacters(): void {
        // Clear existing characters
        this.characters.forEach(character => {
            this.scene.remove(character.mesh);
        });
        this.characters = [];
        
        // Create new characters from config
        CHARACTERS.forEach((characterData, index) => {
            const character = new Character3D(
                `character${index}`,
                characterData.name,
                Math.random() * 300 - 150, // Random X position
                Math.random() * 300 - 150, // Random Y position
                characterData.color
            );
            
            this.characters.push(character);
            this.scene.add(character.mesh);
        });
    }

    /**
     * Loads an office layout
     * @param layout - Office layout definition
     */
    public loadLayout(layout: OfficeLayout): void {
        // Clear existing spaces
        this.spaces.forEach(space => {
            this.scene.remove(space.mesh);
            space.destroy();
        });
        this.spaces = [];
        
        // Create new spaces from layout
        layout.spaces.forEach(spaceData => {
            const space = new Space3D(
                spaceData.type,
                spaceData.x,
                spaceData.y,
                spaceData.width,
                spaceData.height
            );
            
            this.spaces.push(space);
            this.scene.add(space.mesh);
        });
    }

    /**
     * Loads layout from the layout editor
     */
    public loadLayoutFromEditor(): void {
        const layout = this.layoutEditor.getLayout();
        this.loadLayout(layout);
    }

    /**
     * Loads layout from a file via a file input dialog
     */
    public loadLayoutFromFile(): void {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e: Event) => {
            const target = e.target as HTMLInputElement;
            if (!target.files || !target.files[0]) return;
            
            const reader = new FileReader();
            
            reader.onload = (e: ProgressEvent<FileReader>) => {
                try {
                    if (!e.target || typeof e.target.result !== 'string') return;
                    
                    const layout = JSON.parse(e.target.result) as OfficeLayout;
                    this.loadLayout(layout);
                } catch (error) {
                    console.error('Failed to load layout:', error);
                    alert('Failed to load layout. Invalid file format.');
                }
            };
            
            reader.readAsText(target.files[0]);
        };
        
        input.click();
    }

    /**
     * Saves the current layout to a JSON file
     */
    public saveLayout(): void {
        const layout = this.layoutEditor.getLayout();
        const json = JSON.stringify(layout, null, 2);
        
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'office_layout.json';
        a.click();
        
        URL.revokeObjectURL(url);
    }

    /**
     * Updates the simulation state
     */
    private update(): void {
        const currentTime = Date.now();
        const deltaTime = (currentTime - this.lastUpdateTime) / 1000;
        const acceleratedDelta = deltaTime * this.simulationSpeed;
        this.lastUpdateTime = currentTime;
        
        if (this.isPaused) return;
        
        // Calculate simulation time
        const simulationTime = calculateSimulationTime(this.startTime, currentTime);
        
        // Update time display
        this.updateTimeDisplay(simulationTime);
        
        // Reset day if complete
        if (simulationTime >= SIMULATION_CONFIG.END_HOUR) {
            this.resetDay();
            return;
        }
        
        // Update characters
        this.characters.forEach(character => {
            character.update(this.spaces, this._isManaged, acceleratedDelta);
        });
        
        // Update spaces
        this.spaces.forEach(space => {
            space.update(currentTime - this.startTime);
        });
        
        // Render scene
        this.scene.render();
    }

    /**
     * Updates the time display
     * @param hour - Current hour (0-24)
     */
    private updateTimeDisplay(hour: number): void {
        if (this.timeDisplay) {
            this.timeDisplay.textContent = '' //`Time: ${formatTime(hour)}`;
        }
    }

    /**
     * Resets the simulation to start a new day
     */
    private resetDay(): void {
        // Reset start time
        this.startTime = Date.now();
        
        // Reset all spaces to available
        this.spaces.forEach(space => {
            space.release();
        });
        
        // Reset all characters to idle with no target
        this.characters.forEach(character => {
            character.state = CHARACTER_STATES.IDLE;
            if (character.targetSpace) {
                character.targetSpace = null;
            }
            
            // Move characters to random positions
            character.updatePosition(
                Math.random() * 300 - 150,
                Math.random() * 300 - 150
            );
        });
    }

    /**
     * Starts the simulation loop
     */
    public start(): void {
        if (this.animationFrameId !== null) return;
        
        const animate = (): void => {
            this.update();
            this.animationFrameId = requestAnimationFrame(animate);
        };
        
        this.lastUpdateTime = Date.now();
        animate();
    }

    /**
     * Stops the simulation loop
     */
    public stop(): void {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * Toggles the simulation pause state
     */
    public togglePause(): void {
        this.isPaused = !this.isPaused;
    }

    /**
     * Sets the simulation speed
     * @param speed - Simulation speed multiplier
     */
    public setSpeed(speed: number): void {
        this.simulationSpeed = speed;
    }

    /**
     * Toggles between managed and chaotic modes
     */
    public toggleMode(): void {
        this._isManaged = !this._isManaged;
    }

    /**
     * Gets the current management mode
     * @returns True if in managed mode
     */
    public isManaged(): boolean {
        return this._isManaged;
    }

    /**
     * Toggles the layout editor
     */
    public toggleEditor(): void {
        const isActive = this.layoutEditor.isEditorActive();
        this.layoutEditor.setActive(!isActive);
        
        // Pause simulation while editing
        if (!isActive) {
            this.stop();
        } else {
            this.start();
        }
    }

    /**
     * Checks if the layout editor is active
     * @returns True if the editor is active
     */
    public isEditorActive(): boolean {
        return this.layoutEditor.isEditorActive();
    }
    
    /**
     * Sets the type of space to be placed in the editor
     * @param type - Space type (desk or meeting room)
     */
    public setSpaceType(type: SpaceType): void {
        this.layoutEditor.setSelectedSpaceType(type);
    }

    /**
     * Destroys the simulation and releases resources
     */
    public destroy(): void {
        // Stop animation loop
        this.stop();
        
        // Destroy all spaces
        this.spaces.forEach(space => {
            this.scene.remove(space.mesh);
            space.destroy();
        });
        
        // Destroy all characters
        this.characters.forEach(character => {
            this.scene.remove(character.mesh);
            character.destroy();
        });
        
        // Destroy layout editor
        this.layoutEditor.destroy();
        
        // Destroy scene
        this.scene.destroy();
    }
} 