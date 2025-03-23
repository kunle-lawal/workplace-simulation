import { Worker, Desk, Space, WorkerMentalState, WorkerPhysicalState, DeskState, SpaceState } from './types';
import { generateId, getRandomDestination, moveWorkerTowardsDestination } from './utils';

export class OfficeWorkerManager {
    private workers: Worker[] = [];
    private desks: Desk[] = [];
    private spaces: Space[] = [];
    private canvasWidth: number;
    private canvasHeight: number;
    private isManaged: boolean = false;
    
    constructor(canvasWidth: number, canvasHeight: number) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }
    
    /**
     * Set simulation mode
     */
    setManagedMode(isManaged: boolean): void {
        this.isManaged = isManaged;
    }
    
    /**
     * Get simulation mode
     */
    getManagedMode(): boolean {
        return this.isManaged;
    }
    
    /**
     * Initialize office layout
     */
    initializeOffice(numWorkers: number = 10, numDesks: number = 15, numSpaces: number = 5): void {
        this.createDesks(numDesks);
        this.createSpaces(numSpaces);
        this.createWorkers(numWorkers);
    }
    
    /**
     * Create desks in the office
     */
    private createDesks(numDesks: number): void {
        this.desks = [];
        
        // Grid for desk layout
        const gridCols = 5;
        const deskWidth = 30;
        const deskHeight = 20;
        const startX = 100;
        const startY = 150;
        const spacingX = 70;
        const spacingY = 60;
        
        for (let i = 0; i < numDesks; i++) {
            const row = Math.floor(i / gridCols);
            const col = i % gridCols;
            
            const desk: Desk = {
                id: generateId('desk'),
                x: startX + col * spacingX,
                y: startY + row * spacingY,
                state: DeskState.AVAILABLE
            };
            
            this.desks.push(desk);
        }
    }
    
    /**
     * Create meeting spaces in the office
     */
    private createSpaces(numSpaces: number): void {
        this.spaces = [];
        
        // Layout meeting spaces in a row at the bottom
        const startX = 150;
        const y = 450;
        const spacing = 100;
        
        for (let i = 0; i < numSpaces; i++) {
            const space: Space = {
                id: generateId('space'),
                x: startX + i * spacing,
                y: y,
                state: SpaceState.AVAILABLE
            };
            
            this.spaces.push(space);
        }
    }
    
    /**
     * Create workers
     */
    private createWorkers(numWorkers: number): void {
        this.workers = [];
        
        const workerNames = [
            'Alice', 'Bob', 'Charlie', 'David', 'Emma',
            'Frank', 'Grace', 'Henry', 'Ivy', 'Jack',
            'Kate', 'Leo', 'Mia', 'Noah', 'Olivia'
        ];
        
        for (let i = 0; i < numWorkers; i++) {
            const worker: Worker = {
                id: generateId('worker'),
                name: workerNames[i % workerNames.length],
                location: {
                    x: 50 + Math.random() * (this.canvasWidth - 100),
                    y: 50 + Math.random() * (this.canvasHeight - 100)
                },
                assignedDesk: this.isManaged ? this.desks[i % this.desks.length] : null,
                occupiedDesk: {
                    lastOccupiedDesk: null,
                    currentOccupiedDesk: null
                },
                occupiedSpace: {
                    lastOccupiedSpace: null,
                    currentOccupiedSpace: null
                },
                mentalState: WorkerMentalState.HAPPY,
                physicalState: WorkerPhysicalState.WANDERING,
                destinationLocation: null,
                events: []
            };
            
            // In managed mode, assign desks to workers
            if (this.isManaged && worker.assignedDesk) {
                worker.assignedDesk.state = DeskState.ASSIGNED;
            }
            
            this.workers.push(worker);
        }
    }
    
    /**
     * Get all workers
     */
    getWorkers(): Worker[] {
        return this.workers;
    }
    
    /**
     * Get all desks
     */
    getDesks(): Desk[] {
        return this.desks;
    }
    
    /**
     * Get all spaces
     */
    getSpaces(): Space[] {
        return this.spaces;
    }
    
    /**
     * Update worker behavior and movement
     */
    updateWorkers(): void {
        this.workers.forEach(worker => {
            // If worker doesn't have a destination, set a new random one
            if (!worker.destinationLocation) {
                const { x, y } = getRandomDestination(
                    worker.location.x,
                    worker.location.y,
                    this.canvasWidth,
                    this.canvasHeight
                );
                
                worker.destinationLocation = { x, y };
                worker.physicalState = WorkerPhysicalState.WANDERING;
            }
            
            // Move worker towards destination
            moveWorkerTowardsDestination(worker);
            
            // Update worker mental state randomly for demonstration
            if (Math.random() < 0.005) {
                const states = [
                    WorkerMentalState.HAPPY,
                    WorkerMentalState.FRUSTRATED,
                    WorkerMentalState.CONFUSED
                ];
                
                // In managed mode, workers are more likely to be happy
                if (this.isManaged) {
                    if (Math.random() < 0.7) {
                        worker.mentalState = WorkerMentalState.HAPPY;
                    } else {
                        worker.mentalState = states[Math.floor(Math.random() * states.length)];
                    }
                } else {
                    // In chaotic mode, workers are more likely to be frustrated or confused
                    if (Math.random() < 0.6) {
                        worker.mentalState = states[1 + Math.floor(Math.random() * 2)]; // FRUSTRATED or CONFUSED
                    } else {
                        worker.mentalState = states[Math.floor(Math.random() * states.length)];
                    }
                }
            }
        });
    }
    
    /**
     * Reset the simulation for a new day
     */
    resetDay(): void {
        // Reset desk and space states
        this.desks.forEach(desk => {
            desk.state = this.isManaged && desk.state === DeskState.ASSIGNED ? 
                DeskState.ASSIGNED : DeskState.AVAILABLE;
        });
        
        this.spaces.forEach(space => {
            space.state = SpaceState.AVAILABLE;
        });
        
        // Reset worker states
        this.workers.forEach(worker => {
            worker.occupiedDesk = {
                lastOccupiedDesk: null,
                currentOccupiedDesk: null
            };
            
            worker.occupiedSpace = {
                lastOccupiedSpace: null,
                currentOccupiedSpace: null
            };
            
            worker.physicalState = WorkerPhysicalState.WANDERING;
            worker.events = [];
            
            // Reset location to a random position
            worker.location = {
                x: 50 + Math.random() * (this.canvasWidth - 100),
                y: 50 + Math.random() * (this.canvasHeight - 100)
            };
            
            worker.destinationLocation = null;
        });
    }
} 