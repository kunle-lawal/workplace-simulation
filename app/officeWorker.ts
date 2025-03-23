import { Worker, Desk, Space, WorkerMentalState, WorkerPhysicalState, DeskState, SpaceState, DeskMap, EventMap, SpaceMap, WorkerMap } from './types';
import { generateId, getRandomDestination, moveWorkerTowardsDestination, getRandomNumber } from './utils';

export class OfficeWorkerManager {
    private workers: Worker[] = [];
    private workersMap: WorkerMap = {};
    private desks: Desk[] = [];
    private desksMap: DeskMap = {};
    private spaces: Space[] = [];
    private spacesMap: SpaceMap = {};
    private events: EventMap = {};
    private canvasWidth: number;
    private canvasHeight: number;
    private isManaged: boolean = false;
    private currentTime: number = 0;
    
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
     * Set current simulation time
     */
    setCurrentTime(time: number): void {
        this.currentTime = time;
    }
    
    /**
     * Initialize office layout
     */
    initializeOffice(numWorkers: number = 10, numDesks: number = 5, numSpaces: number = 5): void {
        this.createDesks(numDesks);
        this.createSpaces(numSpaces);
        this.createWorkers(numWorkers);
    }
    
    /**
     * Create desks in the office
     */
    private createDesks(numDesks: number): void {
        this.desks = [];
        this.desksMap = {};
        
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
            const deskX = startX + col * spacingX;
            const deskY = startY + row * spacingY;
            
            const desk: Desk = {
                id: generateId('desk'),
                x: deskX,
                y: deskY,
                // Set destination coordinates to the center of the desk
                destinationX: deskX,
                destinationY: deskY,
                state: DeskState.AVAILABLE,
                occupiedBy: null
            };
            
            this.desks.push(desk);
            this.desksMap[desk.id] = desk;
        }
    }
    
    /**
     * Create meeting spaces in the office
     */
    private createSpaces(numSpaces: number): void {
        this.spaces = [];
        this.spacesMap = {};
        
        // Layout meeting spaces in a row at the bottom
        const startX = 150;
        const y = 450;
        const spacing = 100;
        
        for (let i = 0; i < numSpaces; i++) {
            const spaceX = startX + i * spacing;
            const space: Space = {
                id: generateId('space'),
                x: spaceX,
                y: y,
                state: SpaceState.AVAILABLE,
                destinationX: spaceX,
                destinationY: y
            };
            
            this.spaces.push(space);
            this.spacesMap[space.id] = space;
        }
    }
    
    /**
     * Create workers
     */
    private createWorkers(numWorkers: number): void {
        this.workers = [];
        this.workersMap = {};
        
        const workerNames = [
            'Alice', 'Bob', 'Charlie', 'David', 'Emma',
            'Frank', 'Grace', 'Henry', 'Ivy', 'Jack',
            'Kate', 'Leo', 'Mia', 'Noah', 'Olivia'
        ];
        
        const totalSimulationTime = 60 * 1000; // 60 seconds
        
        for (let i = 0; i < numWorkers; i++) {
            // Create worker with starting position at 0,0
            const worker: Worker = {
                id: generateId('worker'),
                name: workerNames[i % workerNames.length],
                location: {
                    x: 10,
                    y: 10
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
                physicalState: WorkerPhysicalState.ARRIVING,
                destinationLocation: null,
                nextEventTime: null,
                events: []
            };
            
            // In managed mode, assign desks to workers
            if (this.isManaged && worker.assignedDesk) {
                worker.assignedDesk.state = DeskState.ASSIGNED;
                worker.assignedDesk.occupiedBy = worker.id;
                
                // Set destination to the assigned desk
                worker.destinationLocation = {
                    x: worker.assignedDesk.destinationX,
                    y: worker.assignedDesk.destinationY
                };
                worker.physicalState = WorkerPhysicalState.MOVING_TO_DESK;
            } else {
                // In chaotic mode, pick a random unoccupied desk to navigate to
                const availableDesks = this.desks.filter(desk => desk.state === DeskState.AVAILABLE);
                if (availableDesks.length > 0) {
                    const randomDeskIndex = Math.floor(Math.random() * availableDesks.length);
                    const randomDesk = availableDesks[randomDeskIndex];
                    
                    worker.destinationLocation = {
                        x: randomDesk.destinationX,
                        y: randomDesk.destinationY
                    };
                    worker.physicalState = WorkerPhysicalState.MOVING_TO_DESK;
                }
            }
            
            // Generate random events for this worker
            this.generateRandomEvents(worker, totalSimulationTime);
            
            this.workers.push(worker);
            this.workersMap[worker.id] = worker;
        }
    }
    
    /**
     * Generate random events for a worker
     */
    private generateRandomEvents(worker: Worker, totalSimulationTime: number): void {
        // Generate 1-3 random events for this worker
        const numEvents = Math.floor(Math.random() * 3) + 1;
        const events = [];
        
        for (let i = 0; i < numEvents; i++) {
            // Generate random event times (between 20% and 80% of total time)
            const startPercentage = 0.2 + (Math.random() * 0.6);
            const startTime = Math.floor(startPercentage * totalSimulationTime);
            const duration = 5000 + (Math.random() * 10000); // 5-15 seconds event
            const endTime = Math.min(startTime + duration, totalSimulationTime);
            
            // Find an available space for the event
            const availableSpaces = this.spaces.filter(space => space.state === SpaceState.AVAILABLE);
            if (availableSpaces.length === 0) continue;
            
            const spaceIndex = Math.floor(Math.random() * availableSpaces.length);
            const eventSpace = availableSpaces[spaceIndex];
            
            // Create the worker event structure (this mirrors what's in Worker type)
            const workerEvent = {
                id: generateId('event'),
                title: `Meeting ${i + 1}`,
                timeFrame: {
                    startTime: startTime,
                    endTime: endTime
                },
                attendees: {
                    worker: [worker]
                },
                spaceForEvent: {
                    locationOfSpace: {
                        x: eventSpace.x, 
                        y: eventSpace.y
                    },
                    currentStateOfSpace: eventSpace.state
                }
            };
            
            // Create the proper Event type for the events map
            const event = {
                id: workerEvent.id,
                title: workerEvent.title,
                timeFrame: workerEvent.timeFrame,
                attendees: workerEvent.attendees,
                spaceForEvent: eventSpace
            };
            
            events.push(workerEvent);
            this.events[event.id] = event;
        }
        
        // Sort events by start time
        events.sort((a, b) => a.timeFrame.startTime - b.timeFrame.startTime);
        worker.events = events;
        
        // Set next event time if there are events
        if (events.length > 0) {
            worker.nextEventTime = events[0].timeFrame.startTime;
        }
    }
    
    /**
     * Get all workers
     */
    getWorkers(): Worker[] {
        return this.workers;
    }
    
    /**
     * Get worker by ID
     */
    getWorkerById(id: string): Worker | undefined {
        return this.workersMap[id];
    }
    
    /**
     * Get all desks
     */
    getDesks(): Desk[] {
        return this.desks;
    }
    
    /**
     * Get desk by ID
     */
    getDeskById(id: string): Desk | undefined {
        return this.desksMap[id];
    }
    
    /**
     * Get all spaces
     */
    getSpaces(): Space[] {
        return this.spaces;
    }
    
    /**
     * Get space by ID
     */
    getSpaceById(id: string): Space | undefined {
        return this.spacesMap[id];
    }
    
    /**
     * Update worker behavior and movement
     */
    updateWorkers(): void {
        this.workers.forEach(worker => {
            this.updateWorkerState(worker);
            
            // Move worker towards destination if they have one
            if (worker.destinationLocation) {
                moveWorkerTowardsDestination(worker);
                
                // Check if worker reached their destination
                if (!worker.destinationLocation) {
                    this.handleWorkerArrival(worker);
                }
            }
        });
    }
    
    /**
     * Handle logic when a worker reaches their destination
     */
    private handleWorkerArrival(worker: Worker): void {
        switch (worker.physicalState) {
            case WorkerPhysicalState.MOVING_TO_DESK:
                // Worker has arrived at a desk
                this.handleDeskArrival(worker);
                break;
                
            case WorkerPhysicalState.MOVING_TO_SPACE:
                // Worker has arrived at a meeting space
                this.handleSpaceArrival(worker);
                break;
                
            case WorkerPhysicalState.ARRIVING:
                // Worker has finished arriving, now find a desk
                this.findDeskForWorker(worker);
                break;
                
            case WorkerPhysicalState.WANDERING:
                // Just set a new random destination
                this.setRandomDestination(worker);
                break;
        }
    }
    
    /**
     * Handle worker arriving at a desk
     */
    private handleDeskArrival(worker: Worker): void {
        // Find the desk the worker arrived at
        const desk = this.findDeskAtLocation(worker.location.x, worker.location.y);
        
        if (!desk) {
            // No desk found, worker is lost, set them to wandering
            worker.physicalState = WorkerPhysicalState.WANDERING;
            this.setRandomDestination(worker);
            return;
        }
        
        // Check if the desk is available
        if (desk.state === DeskState.AVAILABLE || (desk.state === DeskState.ASSIGNED && desk.occupiedBy === worker.id)) {
            // Worker can occupy this desk
            desk.state = desk.state === DeskState.ASSIGNED ? DeskState.ASSIGNED : DeskState.OCCUPIED;
            desk.occupiedBy = worker.id;
            
            // Update worker state
            worker.physicalState = WorkerPhysicalState.WORKING;
            worker.mentalState = WorkerMentalState.HAPPY;
            
            // Update worker's occupied desk
            worker.occupiedDesk.currentOccupiedDesk = {
                deskId: desk.id,
                time: this.currentTime
            };
        } else {
            // Desk is occupied or assigned to another worker
            worker.mentalState = WorkerMentalState.CONFUSED;
            
            // Try to find another desk
            this.findDeskForWorker(worker);
        }
    }
    
    /**
     * Handle worker arriving at a meeting space
     */
    private handleSpaceArrival(worker: Worker): void {
        // Worker arrived at meeting space
        worker.physicalState = WorkerPhysicalState.ATTENDING_EVENT;
        
        // Get current event
        const currentEvent = this.getCurrentEvent(worker);
        if (currentEvent) {
            // Find the space for this event
            const space = this.findSpaceAtLocation(worker.location.x, worker.location.y);
            if (space) {
                space.state = SpaceState.OCCUPIED;
                worker.occupiedSpace.currentOccupiedSpace = {
                    spaceId: space.id,
                    time: this.currentTime
                };
            }
        }
    }
    
    /**
     * Update worker state based on current time and events
     */
    private updateWorkerState(worker: Worker): void {
        // Only update if the worker is in a steady state (WORKING or WANDERING)
        if (
            worker.physicalState !== WorkerPhysicalState.WORKING && 
            worker.physicalState !== WorkerPhysicalState.WANDERING &&
            worker.physicalState !== WorkerPhysicalState.ATTENDING_EVENT
        ) {
            return;
        }
        
        // Check if worker has events coming up
        if (worker.events.length > 0) {
            const nextEvent = this.getNextEvent(worker);
            
            if (nextEvent) {
                const timeUntilEvent = nextEvent.timeFrame.startTime - this.currentTime;
                
                // If worker is attending an event and it's over
                if (worker.physicalState === WorkerPhysicalState.ATTENDING_EVENT) {
                    const currentEvent = this.getCurrentEvent(worker);
                    if (currentEvent && currentEvent.timeFrame.endTime <= this.currentTime) {
                        // Event ended, update worker state
                        worker.physicalState = WorkerPhysicalState.WANDERING;
                        
                        // Try to return to the last occupied desk
                        if (worker.occupiedDesk.lastOccupiedDesk) {
                            const deskId = worker.occupiedDesk.lastOccupiedDesk.deskId;
                            const desk = this.getDeskById(deskId);
                            
                            if (desk && desk.state === DeskState.AVAILABLE) {
                                // Last desk is available, go to it
                                worker.destinationLocation = {
                                    x: desk.destinationX,
                                    y: desk.destinationY
                                };
                                worker.physicalState = WorkerPhysicalState.MOVING_TO_DESK;
                            } else if (desk && desk.state !== DeskState.AVAILABLE) {
                                // Last desk is occupied, worker is confused
                                worker.mentalState = WorkerMentalState.CONFUSED;
                                this.findDeskForWorker(worker);
                            } else {
                                // Find a new desk
                                this.findDeskForWorker(worker);
                            }
                        } else {
                            // No last desk, find a new one
                            this.findDeskForWorker(worker);
                        }
                        
                        // Update space state
                        if (worker.occupiedSpace.currentOccupiedSpace) {
                            const spaceId = worker.occupiedSpace.currentOccupiedSpace.spaceId;
                            const space = this.getSpaceById(spaceId);
                            
                            if (space) {
                                space.state = SpaceState.AVAILABLE;
                                
                                // Update worker's occupied space
                                worker.occupiedSpace.lastOccupiedSpace = worker.occupiedSpace.currentOccupiedSpace;
                                worker.occupiedSpace.currentOccupiedSpace = null;
                            }
                        }
                    }
                }
                // If time until next event is between 1-10 minutes (simulated)
                else if (timeUntilEvent > 0 && timeUntilEvent <= this.getRandomPreEventTime()) {
                    // Worker needs to go to the event
                    
                    // If worker is at a desk, update desk state
                    if (worker.physicalState === WorkerPhysicalState.WORKING && worker.occupiedDesk.currentOccupiedDesk) {
                        const deskId = worker.occupiedDesk.currentOccupiedDesk.deskId;
                        const desk = this.getDeskById(deskId);
                        
                        if (desk) {
                            // Update desk state
                            if (desk.state === DeskState.OCCUPIED) {
                                desk.state = DeskState.AVAILABLE;
                            }
                            desk.occupiedBy = null;
                            
                            // Update worker's desk info
                            worker.occupiedDesk.lastOccupiedDesk = worker.occupiedDesk.currentOccupiedDesk;
                            worker.occupiedDesk.currentOccupiedDesk = null;
                        }
                    }
                    
                    // Set destination to the event space
                    const eventSpace = nextEvent.spaceForEvent.locationOfSpace;
                    worker.destinationLocation = {
                        x: eventSpace.x,
                        y: eventSpace.y
                    };
                    worker.physicalState = WorkerPhysicalState.MOVING_TO_SPACE;
                }
            }
        }
        
        // Random mood changes for workers who are wandering
        if (worker.physicalState === WorkerPhysicalState.WANDERING && Math.random() < 0.01) {
            // 1% chance of mood change for wandering workers
            const moodRoll = Math.random();
            if (moodRoll < 0.6) {
                worker.mentalState = WorkerMentalState.FRUSTRATED;
            } else if (moodRoll < 0.8) {
                worker.mentalState = WorkerMentalState.CONFUSED;
            } else {
                worker.mentalState = WorkerMentalState.HAPPY;
            }
        }
    }
    
    /**
     * Get a random pre-event time (1-10 minutes in simulation time)
     */
    private getRandomPreEventTime(): number {
        // Simulation runs for 60 seconds = 9 hours (8am-5pm)
        // So 1 minute real time = 9 minutes simulation time
        // 1-10 minutes in simulation time = 6.67-66.7 seconds
        const totalTime = 60 * 1000; // 60 seconds in ms
        const simulationWorkDay = 9 * 60; // 9 hours in minutes
        
        // Conversion factor: milliseconds per simulation minute
        const msPerSimMinute = totalTime / simulationWorkDay;
        
        // Random number of minutes between 1 and 10
        const randomMinutes = Math.floor(Math.random() * 10) + 1;
        
        return randomMinutes * msPerSimMinute;
    }
    
    /**
     * Get the next event for a worker
     */
    private getNextEvent(worker: Worker): any {
        return worker.events.find(event => 
            event.timeFrame.startTime > this.currentTime
        );
    }
    
    /**
     * Get the current event for a worker
     */
    private getCurrentEvent(worker: Worker): any {
        return worker.events.find(event => 
            event.timeFrame.startTime <= this.currentTime && 
            event.timeFrame.endTime > this.currentTime
        );
    }
    
    /**
     * Find a desk at the specified location
     */
    private findDeskAtLocation(x: number, y: number): Desk | undefined {
        const DISTANCE_THRESHOLD = 15; // How close the worker needs to be to the desk
        
        return this.desks.find(desk => {
            const distance = Math.sqrt(
                Math.pow(desk.destinationX - x, 2) + 
                Math.pow(desk.destinationY - y, 2)
            );
            return distance <= DISTANCE_THRESHOLD;
        });
    }
    
    /**
     * Find a space at the specified location
     */
    private findSpaceAtLocation(x: number, y: number): Space | undefined {
        const DISTANCE_THRESHOLD = 20; // How close the worker needs to be to the space
        
        return this.spaces.find(space => {
            const destX = space.destinationX || space.x;
            const destY = space.destinationY || space.y;
            
            const distance = Math.sqrt(
                Math.pow(destX - x, 2) + 
                Math.pow(destY - y, 2)
            );
            return distance <= DISTANCE_THRESHOLD;
        });
    }
    
    /**
     * Find an available desk for a worker
     */
    private findDeskForWorker(worker: Worker): void {
        const availableDesks = this.desks.filter(desk => 
            desk.state === DeskState.AVAILABLE || 
            (desk.state === DeskState.ASSIGNED && desk.occupiedBy === worker.id)
        );
        
        if (availableDesks.length > 0) {
            // If in managed mode, try to get the assigned desk if possible
            if (this.isManaged && worker.assignedDesk) {
                const assignedDesk = availableDesks.find(desk => desk.id === worker.assignedDesk?.id);
                
                if (assignedDesk) {
                    worker.destinationLocation = {
                        x: assignedDesk.destinationX,
                        y: assignedDesk.destinationY
                    };
                    worker.physicalState = WorkerPhysicalState.MOVING_TO_DESK;
                    return;
                }
            }
            
            // Get a random available desk
            const randomIndex = Math.floor(Math.random() * availableDesks.length);
            const desk = availableDesks[randomIndex];
            
            worker.destinationLocation = {
                x: desk.destinationX,
                y: desk.destinationY
            };
            worker.physicalState = WorkerPhysicalState.MOVING_TO_DESK;
        } else {
            // No available desks, worker is frustrated
            worker.mentalState = WorkerMentalState.FRUSTRATED;
            worker.physicalState = WorkerPhysicalState.WANDERING;
            this.setRandomDestination(worker);
        }
    }
    
    /**
     * Set a random destination for a worker
     */
    private setRandomDestination(worker: Worker): void {
        const { x, y } = getRandomDestination(
            worker.location.x,
            worker.location.y,
            this.canvasWidth,
            this.canvasHeight
        );
        
        worker.destinationLocation = { x, y };
    }
    
    /**
     * Reset the simulation for a new day
     */
    resetDay(): void {
        // Reset desk and space states
        this.desks.forEach(desk => {
            desk.state = this.isManaged && desk.occupiedBy ? DeskState.ASSIGNED : DeskState.AVAILABLE;
            if (!this.isManaged) {
                desk.occupiedBy = null;
            }
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
            
            // Reset location to starting position (0,0)
            worker.location = {
                x: 10,
                y: 10
            };
            
            worker.physicalState = WorkerPhysicalState.ARRIVING;
            worker.mentalState = WorkerMentalState.HAPPY;
            worker.destinationLocation = null;
            
            // Generate new random events
            const totalSimulationTime = 60 * 1000; // 60 seconds
            worker.events = [];
            this.generateRandomEvents(worker, totalSimulationTime);
            
            // Set initial destination based on mode
            if (this.isManaged && worker.assignedDesk) {
                worker.destinationLocation = {
                    x: worker.assignedDesk.destinationX,
                    y: worker.assignedDesk.destinationY
                };
                worker.physicalState = WorkerPhysicalState.MOVING_TO_DESK;
            } else {
                this.findDeskForWorker(worker);
            }
        });
    }
} 