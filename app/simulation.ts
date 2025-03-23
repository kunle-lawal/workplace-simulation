import { CanvasRenderer } from "./canvasRenderer";
import { OfficeWorkerManager } from "./officeWorker";
import { SimulationMode } from "./types";
import { getRandomColor } from "./utils";

export class Simulation {
    private canvasRenderer: CanvasRenderer;
    private workerManager: OfficeWorkerManager;
    private simulationMode: SimulationMode = SimulationMode.CHAOTIC;
    private simulationTime: number = 0;
    private totalSimulationTime: number = 60 * 1000; // 60 seconds for a full day
    private isRunning: boolean = false;
    private dayCount: number = 1;
    private animationFrameId: number | null = null;
    
    constructor(canvasId: string) {
        this.canvasRenderer = new CanvasRenderer(canvasId);
        this.workerManager = new OfficeWorkerManager(
            this.canvasRenderer.getWidth(),
            this.canvasRenderer.getHeight()
        );
        
        this.initializeSimulation();
    }
    
    /**
     * Initialize the simulation
     */
    private initializeSimulation(): void {
        // Initialize the office with workers, desks, and spaces
        this.workerManager.initializeOffice();
        
        // Assign colors to workers
        this.workerManager.getWorkers().forEach(worker => {
            this.canvasRenderer.setWorkerColor(worker.id, getRandomColor());
        });
    }
    
    /**
     * Start the simulation
     */
    start(): void {
        if (this.isRunning) return;
        
        this.isRunning = true;
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
        this.dayCount = 1;
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
        this.stop();
        this.simulationTime = 0;
        this.dayCount = 1;
        this.workerManager.initializeOffice();
        
        // Reassign colors to workers
        this.workerManager.getWorkers().forEach(worker => {
            this.canvasRenderer.setWorkerColor(worker.id, getRandomColor());
        });
        
        this.start();
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
        
        const animate = (currentTime: number) => {
            if (!this.isRunning) return;
            
            // Calculate elapsed time
            const deltaTime = currentTime - startTime;
            this.simulationTime = deltaTime % this.totalSimulationTime;
            
            // If a day has passed, reset for a new day
            if (deltaTime > this.dayCount * this.totalSimulationTime) {
                this.dayCount++;
                this.workerManager.resetDay();
            }
            
            // Update worker positions and states
            this.workerManager.updateWorkers();
            
            // Render the scene
            this.render();
            
            // Continue animation loop
            this.animationFrameId = requestAnimationFrame(animate);
        };
        
        this.animationFrameId = requestAnimationFrame(animate);
    }
    
    /**
     * Render the current state of the simulation
     */
    private render(): void {
        // Clear canvas
        this.canvasRenderer.clear();
        
        // Render floor plan
        this.canvasRenderer.renderFloorPlan();
        
        // Render desks
        this.canvasRenderer.renderDesks(this.workerManager.getDesks());
        
        // Render meeting spaces
        this.canvasRenderer.renderSpaces(this.workerManager.getSpaces());
        
        // Render workers
        this.canvasRenderer.renderWorkers(this.workerManager.getWorkers());
        
        // Render time
        this.canvasRenderer.renderSimulationTime(this.simulationTime, this.totalSimulationTime);
        
        // Render mode
        this.canvasRenderer.renderSimulationMode(this.simulationMode === SimulationMode.MANAGED);
    }
} 