import { CanvasRenderer } from "./canvasRenderer";
import { OfficeWorkerManager } from "./officeWorker";
import { SimulationMode, Worker } from "./types";
import { getRandomColor } from "./utils";

/**
 * Simulation constants
 */
const SIMULATION_CONSTANTS = {
    DAY_DURATION_MS: 60 * 1000, // 60 seconds for a full day
    STARTING_DAY: 1
};

/**
 * Simulation class - Controls the office simulation
 */
export class Simulation {
    private canvasRenderer: CanvasRenderer;
    private workerManager: OfficeWorkerManager;
    private simulationMode: SimulationMode = SimulationMode.CHAOTIC;
    private simulationTime: number = 0;
    private totalSimulationTime: number = SIMULATION_CONSTANTS.DAY_DURATION_MS;
    private isRunning: boolean = false;
    private dayCount: number = SIMULATION_CONSTANTS.STARTING_DAY;
    private animationFrameId: number | null = null;
    private lastFrameTime: number = 0;
    
    /**
     * Create a new simulation with the given canvas ID
     */
    constructor(canvasId: string) {
        try {
            this.canvasRenderer = new CanvasRenderer(canvasId);
            this.workerManager = new OfficeWorkerManager(
                this.canvasRenderer.getWidth(),
                this.canvasRenderer.getHeight()
            );
            
            this.initializeSimulation();
        } catch (error) {
            console.error("Failed to initialize simulation:", error);
            throw new Error(`Simulation initialization failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    
    /**
     * Initialize the simulation
     */
    private initializeSimulation(): void {
        try {
            // Initialize the office with workers, desks, and spaces
            this.workerManager.initializeOffice();
            
            // Assign colors to workers
            this.assignColorsToWorkers();
        } catch (error) {
            console.error("Error during simulation initialization:", error);
            throw new Error(`Failed to initialize office: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    
    /**
     * Assign random colors to all workers
     */
    private assignColorsToWorkers(): void {
        const workers = this.workerManager.getWorkers();
        if (!workers || workers.length === 0) {
            console.warn("No workers found to assign colors to.");
            return;
        }
        
        workers.forEach((worker: Worker) => {
            this.canvasRenderer.setWorkerColor(worker.id, getRandomColor());
        });
    }
    
    /**
     * Start the simulation
     */
    start(): void {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.animationLoop();
    }
    
    /**
     * Stop the simulation
     */
    stop(): void {
        this.isRunning = false;
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
    
    /**
     * Reset the simulation
     */
    reset(): void {
        this.stop();
        this.simulationTime = 0;
        this.dayCount = SIMULATION_CONSTANTS.STARTING_DAY;
        this.workerManager.resetDay();
        this.start();
    }
    
    /**
     * Toggle simulation mode between chaotic and managed
     */
    toggleMode(): void {
        this.simulationMode = this.simulationMode === SimulationMode.CHAOTIC ? 
            SimulationMode.MANAGED : SimulationMode.CHAOTIC;
        
        this.workerManager.setManagedMode(this.simulationMode === SimulationMode.MANAGED);
        
        // Re-initialize the office with the new mode
        this.restartSimulation();
    }
    
    /**
     * Restart the simulation completely
     */
    private restartSimulation(): void {
        try {
            this.stop();
            this.simulationTime = 0;
            this.dayCount = SIMULATION_CONSTANTS.STARTING_DAY;
            this.workerManager.initializeOffice();
            
            // Reassign colors to workers
            this.assignColorsToWorkers();
            
            this.start();
        } catch (error) {
            console.error("Failed to restart simulation:", error);
        }
    }
    
    /**
     * Get current simulation mode
     */
    getMode(): SimulationMode {
        return this.simulationMode;
    }
    
    /**
     * Main animation loop
     */
    private animationLoop(): void {
        const startTime = performance.now();
        
        const animate = (currentTime: number): void => {
            if (!this.isRunning) return;
            
            // Calculate elapsed time
            const deltaTime = currentTime - startTime;
            this.simulationTime = deltaTime % this.totalSimulationTime;
            
            // If a day has passed, reset for a new day
            if (deltaTime > this.dayCount * this.totalSimulationTime) {
                this.dayCount++;
                this.workerManager.resetDay();
            }
            
            // Update worker manager with current time
            this.workerManager.setCurrentTime(this.simulationTime);
            
            // Update worker positions and states
            this.workerManager.updateWorkers();
            
            // Render the scene
            this.render();
            
            // Calculate FPS (for debugging)
            const fps = Math.round(1000 / (currentTime - this.lastFrameTime));
            this.lastFrameTime = currentTime;
            
            // Continue animation loop
            this.animationFrameId = requestAnimationFrame(animate);
        };
        
        this.animationFrameId = requestAnimationFrame(animate);
        
        // Add a listener to enable pan/zoom responsiveness even when simulation is paused
        window.addEventListener('mousemove', () => {
            if (this.canvasRenderer.isPanningActive()) {
                this.render();
            }
        });
        
        // Update on mouse wheel for zoom
        window.addEventListener('wheel', () => {
            this.render();
        }, { passive: false });
    }
    
    /**
     * Render the current state of the simulation
     */
    private render(): void {
        try {
            // Clear canvas
            this.canvasRenderer.clear();
            
            // Render floor plan
            this.canvasRenderer.renderFloorPlan();
            
            // Render desks
            this.canvasRenderer.renderDesks(this.workerManager.getDesks());
            
            // Render meeting spaces
            this.canvasRenderer.renderSpaces(this.workerManager.getSpaces());
            
            // Render utility items
            // this.canvasRenderer.renderUtilityItems(this.workerManager.getUtilityItems());
            
            // Render workers
            this.canvasRenderer.renderWorkers(this.workerManager.getWorkers());
            
            // Render time
            this.canvasRenderer.renderSimulationTime(this.simulationTime, this.totalSimulationTime);
            
            // Render mode
            this.canvasRenderer.renderSimulationMode(this.simulationMode === SimulationMode.MANAGED);
        } catch (error) {
            console.error("Render error:", error);
            // Don't stop the simulation for render errors, just log them
        }
    }
    
    /**
     * Get the day count
     */
    getDayCount(): number {
        return this.dayCount;
    }
    
    /**
     * Get the current simulation time
     */
    getCurrentTime(): number {
        return this.simulationTime;
    }
    
    /**
     * Get the total simulation time for a day
     */
    getTotalSimulationTime(): number {
        return this.totalSimulationTime;
    }
} 