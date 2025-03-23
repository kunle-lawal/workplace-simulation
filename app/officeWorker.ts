import { Worker, Desk, Space, WorkerMentalState, WorkerPhysicalState, DeskState, SpaceState, DeskMap, WorkerEventMap, SpaceMap, WorkerMap, WorkerEvent, Dialog } from './types';
import { generateId, getRandomDestination, moveWorkerTowardsDestination, getRandomNumber } from './utils';

// Dialog phrases for different worker states and actions
const DIALOG_PHRASES = {
    DESK_OCCUPIED: [
        "Someone's sitting here already!",
        "This desk is taken.",
        "I need to find another desk.",
        "Excuse me, I thought this was free."
    ],
    SPACE_OCCUPIED: [
        "This room is occupied!",
        "Shoot, room is taken. I'll find another.",
        "Wrong meeting room.",
        "Is there another space available?"
    ],
    FRUSTRATED: [
        "I can't find a desk anywhere!",
        "This is ridiculous...",
        "I just want to sit down!",
        "Third desk that's taken, seriously?!",
        "Where am I supposed to work?!"
    ],
    CONFUSED: [
        "Where was I sitting again?",
        "I'm a bit lost...",
        "Which desk was mine?",
        "I swear I was sitting here."
    ],
    HAPPY: [
        "Great spot!",
        "Perfect, got my desk!",
        "Time to get some work done.",
        "Coffee and coding time!"
    ],
    WANDERING: [
        "Just stretching my legs.",
        "Looking around...",
        "Taking a little walk.",
        "Need some fresh perspective."
    ],
    EVENT_STARTING: [
        "Meeting time!",
        "Off to my event!",
        "Gotta run to a meeting.",
        "Time for that presentation."
    ],
    EVENT_ENDING: [
        "That meeting could have been an email.",
        "Finally, meeting's over!",
        "Back to my desk now.",
        "One meeting down, more to go."
    ],
    SHARED_EVENT: [
        "I'm here for the same meeting!",
        "We're in this meeting together.",
        "Glad to join the team.",
        "Looks like we're collaborating."
    ]
};

export class OfficeWorkerManager {
    private workers: Worker[] = [];
    private workersMap: WorkerMap = {};
    private desks: Desk[] = [];
    private desksMap: DeskMap = {};
    private spaces: Space[] = [];
    private spacesMap: SpaceMap = {};
    private events: WorkerEventMap = {};
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
        this.createEvents(60 * 1000); // Create events for the 60-second day
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
     * Create global events that can be shared between workers
     */
    private createEvents(totalSimulationTime: number, maxEvents: number = 10): void {
        this.events = {};
        
        // Generate 5-10 random events for the day
        const numEvents = 5 + Math.floor(Math.random() * 6);
        
        for (let i = 0; i < numEvents; i++) {
            // Generate random event times (between 20% and 80% of total time)
            const startPercentage = 0.2 + (Math.random() * 0.6);
            const startTime = Math.floor(startPercentage * totalSimulationTime);
            const duration = 5000 + (Math.random() * 10000); // 5-15 seconds event
            const endTime = Math.min(startTime + duration, totalSimulationTime);
            
            // Find an available space for potential event assignment
            const availableSpaces = this.spaces.filter(space => space.state === SpaceState.AVAILABLE);
            // Create the event (space will be assigned dynamically when workers attend)
            const eventId = generateId('event');
            const workerEvent: WorkerEvent = {
                id: eventId,
                title: `Meeting ${i + 1}`,
                timeFrame: {
                    startTime: startTime,
                    endTime: endTime
                },
                attendees: {
                    worker: []
                },
                // Space will be dynamically assigned when first worker arrives
                spaceForEvent: availableSpaces.length > 0 ? availableSpaces[0] : this.spaces[0]
            };
            
            this.events[eventId] = workerEvent;
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
                events: [],
                dialog: {
                    text: `Hello, I'm ${workerNames[i % workerNames.length]}!`,
                    duration: 60000, // 60 seconds in milliseconds
                    startTime: 0
                }
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
            
            // Assign random events to this worker
            this.assignEventsToWorker(worker);
            
            this.workers.push(worker);
            this.workersMap[worker.id] = worker;
        }
    }
    
    /**
     * Assign random events to a worker
     */
    private assignEventsToWorker(worker: Worker): void {
        // Get all available events
        const allEvents = Object.values(this.events);
        if (allEvents.length === 0) return;
        
        // Determine how many events this worker will have (1-3)
        const numEvents = 1 + Math.floor(Math.random() * 3);
        const assignedEvents = [];
        
        // Assign random events to this worker
        for (let i = 0; i < numEvents && allEvents.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * allEvents.length);
            const selectedEvent = allEvents[randomIndex];
            
            // Add this worker to the event's attendees
            selectedEvent.attendees.worker.push(worker);
            
            // Add to worker's events
            assignedEvents.push(selectedEvent);
        }
        
        // Sort events by start time
        assignedEvents.sort((a, b) => a.timeFrame.startTime - b.timeFrame.startTime);
        worker.events = assignedEvents;
        
        // Set next event time if there are events
        if (assignedEvents.length > 0) {
            worker.nextEventTime = assignedEvents[0].timeFrame.startTime;
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
            
            // Update worker dialog (check if it should expire)
            this.updateWorkerDialog(worker);
        });
    }
    
    /**
     * Update worker dialog (check expiration)
     */
    private updateWorkerDialog(worker: Worker): void {
        if (!worker.dialog) return;
        
        const elapsedTime = this.currentTime - worker.dialog.startTime;
        if (elapsedTime > worker.dialog.duration) {
            worker.dialog = null;
        }
    }
    
    /**
     * Set a dialog message for a worker
     */
    private setWorkerDialog(worker: Worker, text: string, duration = 5): void {
        worker.dialog = {
            text,
            duration,
            startTime: this.currentTime,
        };
        console.log(`Dialog set for ${worker.name}: "${text}" with duration ${duration}s`);
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
                
                // Increase chances of showing wandering dialog (from 0.2 to 0.5)
                if (Math.random() < 0.5) {
                    this.setWorkerDialog(worker, 'WANDERING');
                }
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
            
            // Show happy dialog
            this.setWorkerDialog(worker, 'HAPPY');
            
            // Update worker's occupied desk
            worker.occupiedDesk.currentOccupiedDesk = {
                deskId: desk.id,
                time: this.currentTime
            };
        } else {
            // Desk is occupied or assigned to another worker
            worker.mentalState = WorkerMentalState.CONFUSED;
            
            // Show desk occupied dialog
            this.setWorkerDialog(worker, 'DESK_OCCUPIED');
            
            // Try to find another desk
            this.findDeskForWorker(worker);
        }
    }
    
    /**
     * Handle worker arriving at a meeting space
     */
    private handleSpaceArrival(worker: Worker): void {
        // Find the current event the worker is headed to
        const currentEvent = this.getNextEventStartingSoon(worker);
        
        if (!currentEvent) {
            // No current event, worker is lost, set them to wandering
            worker.physicalState = WorkerPhysicalState.WANDERING;
            this.setRandomDestination(worker);
            return;
        }
        
        // Find the space the worker arrived at
        const space = this.findSpaceAtLocation(worker.location.x, worker.location.y);
        
        if (!space) {
            // No space found, worker is lost, set them to wandering
            worker.physicalState = WorkerPhysicalState.WANDERING;
            this.setRandomDestination(worker);
            return;
        }
        
        // Check if the space is already occupied
        if (space.state === SpaceState.OCCUPIED) {
            // Find out which event is currently taking place in this space
            const spaceEvent = this.findEventBySpace(space.id);
            
            // If worker has the same event, they can join
            if (spaceEvent && spaceEvent.id === currentEvent.id) {
                worker.physicalState = WorkerPhysicalState.ATTENDING_EVENT;
                worker.occupiedSpace.currentOccupiedSpace = {
                    spaceId: space.id,
                    time: this.currentTime
                };
                
                // Show shared event dialog
                this.setWorkerDialog(worker, 'SHARED_EVENT');
            } else {
                // Space is occupied by a different event, try to find another space
                worker.mentalState = WorkerMentalState.CONFUSED;
                
                // Show space occupied dialog
                this.setWorkerDialog(worker, 'SPACE_OCCUPIED');
                
                this.findSpaceForWorkerEvent(worker, currentEvent);
            }
        } else {
            // Space is available, worker can occupy it
            space.state = SpaceState.OCCUPIED;
            worker.physicalState = WorkerPhysicalState.ATTENDING_EVENT;
            worker.occupiedSpace.currentOccupiedSpace = {
                spaceId: space.id,
                time: this.currentTime
            };
            
            // Assign this space to the event
            currentEvent.spaceForEvent = space;
        }
    }
    
    /**
     * Find an event by the space it's being held in
     */
    private findEventBySpace(spaceId: string): WorkerEvent | null {
        // Look through all events to find one that's using this space
        for (const eventId in this.events) {
            const event = this.events[eventId];
            if (event.spaceForEvent && event.spaceForEvent.id === spaceId) {
                return event;
            }
        }
        return null;
    }
    
    /**
     * Get the event that's starting soon for a worker
     */
    private getNextEventStartingSoon(worker: Worker): WorkerEvent | null {
        // Look for events that are starting within the next few minutes or have just started
        const timeWindow = this.getRandomPreEventTime(); // Same window used for pre-event preparation
        
        const event = worker.events.find(event => 
            event.timeFrame.startTime - this.currentTime <= timeWindow && 
            event.timeFrame.endTime > this.currentTime
        );
        
        return event || null;
    }
    
    /**
     * Find a space for a worker to attend their event
     */
    private findSpaceForWorkerEvent(worker: Worker, event: WorkerEvent): void {
        // If the event already has a space assigned, go there
        if (event.spaceForEvent) {
            // Check if the space is still available
            const space = this.getSpaceById(event.spaceForEvent.id);
            if (space && space.state === SpaceState.AVAILABLE) {
                worker.destinationLocation = {
                    x: space.destinationX || space.x,
                    y: space.destinationY || space.y
                };
                worker.physicalState = WorkerPhysicalState.MOVING_TO_SPACE;
                return;
            }
        }
        
        // Look for an available space
        const availableSpaces = this.spaces.filter(space => space.state === SpaceState.AVAILABLE);
        
        if (availableSpaces.length > 0) {
            // Find other workers attending this event to see if any are already at a space
            const eventAttendees = event.attendees.worker;
            for (const attendee of eventAttendees) {
                if (attendee.id !== worker.id && // Not the current worker
                    attendee.occupiedSpace.currentOccupiedSpace && // Has an occupied space
                    attendee.physicalState === WorkerPhysicalState.ATTENDING_EVENT) { // Is attending an event
                    
                    // Get the space this attendee is at
                    const attendeeSpaceId = attendee.occupiedSpace.currentOccupiedSpace.spaceId;
                    const attendeeSpace = this.getSpaceById(attendeeSpaceId);
                    
                    if (attendeeSpace) {
                        // Go to this space to join the event
                        worker.destinationLocation = {
                            x: attendeeSpace.destinationX || attendeeSpace.x,
                            y: attendeeSpace.destinationY || attendeeSpace.y
                        };
                        worker.physicalState = WorkerPhysicalState.MOVING_TO_SPACE;
                        return;
                    }
                }
            }
            
            // No attendees found at a space, pick a random available space
            const randomIndex = Math.floor(Math.random() * availableSpaces.length);
            const space = availableSpaces[randomIndex];
            
            worker.destinationLocation = {
                x: space.destinationX || space.x,
                y: space.destinationY || space.y
            };
            worker.physicalState = WorkerPhysicalState.MOVING_TO_SPACE;
        } else {
            // No available spaces, worker is frustrated and goes back to desk
            worker.mentalState = WorkerMentalState.FRUSTRATED;
            
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
                } else {
                    // Last desk not available, find a new one
                    this.findDeskForWorker(worker);
                }
            } else {
                // No last desk, find a new one
                this.findDeskForWorker(worker);
            }
        }
    }
    
    /**
     * Update worker state based on current time and events
     */
    private updateWorkerState(worker: Worker): void {
        // Only update if the worker is in a steady state or attending an event
        if (
            worker.physicalState !== WorkerPhysicalState.WORKING && 
            worker.physicalState !== WorkerPhysicalState.WANDERING &&
            worker.physicalState !== WorkerPhysicalState.ATTENDING_EVENT
        ) {
            return;
        }
        
        // Check if worker is attending an event and it's over
        if (worker.physicalState === WorkerPhysicalState.ATTENDING_EVENT) {
            // Find the current event the worker is attending
            const currentEvent = worker.events.find(event => 
                this.currentTime >= event.timeFrame.startTime && 
                this.currentTime <= event.timeFrame.endTime
            );
            
            // If no current event is found, or the event has ended
            if (!currentEvent || this.currentTime > currentEvent.timeFrame.endTime) {
                
                // Show event ending dialog
                this.setWorkerDialog(worker, 'EVENT_ENDING');
                
                // Initialize desk search attempts if not already set
                if (!(worker as any).deskSearchAttempts) {
                    (worker as any).deskSearchAttempts = 0;
                }
                
                // Update space state if worker is occupying one
                if (worker.occupiedSpace.currentOccupiedSpace) {
                    const spaceId = worker.occupiedSpace.currentOccupiedSpace.spaceId;
                    const space = this.getSpaceById(spaceId);
                    
                    if (space) {
                        // Check if other workers are still using this space for the same event
                        const otherWorkersInSpace = this.workers.filter(w => 
                            w.id !== worker.id && 
                            w.occupiedSpace.currentOccupiedSpace && 
                            w.occupiedSpace.currentOccupiedSpace.spaceId === spaceId &&
                            w.physicalState === WorkerPhysicalState.ATTENDING_EVENT
                        );
                        
                        // Only set space to available if no one else is using it
                        if (otherWorkersInSpace.length === 0) {
                            space.state = SpaceState.AVAILABLE;
                        }
                        
                        // Update worker's occupied space
                        worker.occupiedSpace.lastOccupiedSpace = worker.occupiedSpace.currentOccupiedSpace;
                        worker.occupiedSpace.currentOccupiedSpace = null;
                    }
                }
                
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
                        // Reset desk search attempts on successful desk find
                        (worker as any).deskSearchAttempts = 0;
                    } else if (desk && desk.state !== DeskState.AVAILABLE) {
                        // Last desk is occupied, worker is confused
                        worker.mentalState = WorkerMentalState.CONFUSED;
                        worker.physicalState = WorkerPhysicalState.WANDERING;
                        
                        // Show confused dialog
                        this.setWorkerDialog(worker, "Someone took my desk!", 5);
                        
                        // Increment search attempts and try to find another desk
                        (worker as any).deskSearchAttempts++;
                        this.findDeskForWorker(worker);
                    } else {
                        // Desk not found, find a new one
                        (worker as any).deskSearchAttempts++;
                        worker.physicalState = WorkerPhysicalState.WANDERING;
                        this.findDeskForWorker(worker);
                    }
                } else {
                    // No last desk, find a new one
                    (worker as any).deskSearchAttempts++;
                    worker.physicalState = WorkerPhysicalState.WANDERING;
                    this.findDeskForWorker(worker);
                }
            }
            
            // If still attending an event, don't process other logic
            return;
        }
        
        // Check if worker has events coming up
        if (worker.events.length > 0) {
            const nextEvent = this.getNextEvent(worker);
            
            if (nextEvent) {
                const timeUntilEvent = nextEvent.timeFrame.startTime - this.currentTime;
                
                // If time until next event is between 1-10 minutes (simulated)
                if (timeUntilEvent > 0 && timeUntilEvent <= this.getRandomPreEventTime()) {
                    // Worker needs to go to the event
                    
                    // Show event starting dialog
                    this.setWorkerDialog(worker, 'EVENT_STARTING');
                    
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
                    
                    // Find or set destination to the event space
                    this.findSpaceForWorkerEvent(worker, nextEvent);
                }
            }
        }
        
        // Check if worker is wandering and is frustrated due to desk search failures
        if (worker.physicalState === WorkerPhysicalState.WANDERING) {
            // Occasionally try to find a desk again if frustrated
            if (worker.mentalState === WorkerMentalState.FRUSTRATED) {
                // Show frustrated dialog occasionally (increased from 0.01 to 0.03)
                if (Math.random() < 0.03) { // 3% chance per frame
                    this.setWorkerDialog(worker, 'FRUSTRATED');
                }
                
                // Try to find desk again
                if (Math.random() < 0.005) { // ~0.5% chance per frame
                    // Reset desk search attempts and try again
                    (worker as any).deskSearchAttempts = 0;
                    this.findDeskForWorker(worker);
                }
            }
            // Random mood changes for workers who are wandering
            else if (Math.random() < 0.02) { // Increased from 0.01 to 0.02
                // 2% chance of mood change for wandering workers
                const moodRoll = Math.random();
                if (moodRoll < 0.6) {
                    worker.mentalState = WorkerMentalState.FRUSTRATED;
                    // Show frustrated dialog
                    this.setWorkerDialog(worker, 'FRUSTRATED');
                } else if (moodRoll < 0.8) {
                    worker.mentalState = WorkerMentalState.CONFUSED;
                    // Show confused dialog
                    this.setWorkerDialog(worker, 'CONFUSED');
                } else {
                    worker.mentalState = WorkerMentalState.HAPPY;
                    // Occasionally show wandering dialog (increased from 0.3 to 0.7)
                    if (Math.random() < 0.7) {
                        this.setWorkerDialog(worker, 'WANDERING');
                    }
                }
            }
            console.log({worker});
            // Add random dialogs for wandering workers regardless of state
            if (!worker.dialog && Math.random() < 0.01) { // 1% chance per frame
                // Pick a dialog type based on mental state
                let dialogType: keyof typeof DIALOG_PHRASES;
                switch (worker.mentalState) {
                    case WorkerMentalState.FRUSTRATED:
                        dialogType = 'FRUSTRATED';
                        break;
                    case WorkerMentalState.CONFUSED:
                        dialogType = 'CONFUSED';
                        break;
                    default:
                        dialogType = 'WANDERING';
                }
                this.setWorkerDialog(worker, dialogType);
            }
        }
        
        // For working workers, occasionally show happy dialogs
        if (worker.physicalState === WorkerPhysicalState.WORKING && !worker.dialog && Math.random() < 0.005) {
            this.setWorkerDialog(worker, 'HAPPY');
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
        // If worker has tried 3 times to find a desk and failed, set state to frustrated and wander
        if ((worker as any).deskSearchAttempts >= 3) {
            worker.mentalState = WorkerMentalState.FRUSTRATED;
            worker.physicalState = WorkerPhysicalState.WANDERING;
            
            // Show frustrated dialog
            this.setWorkerDialog(worker, 'FRUSTRATED');
            
            this.setRandomDestination(worker);
            return;
        }
        
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
                    // Reset desk search attempts on successful desk find
                    (worker as any).deskSearchAttempts = 0;
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
            // Reset desk search attempts on successful desk find
            (worker as any).deskSearchAttempts = 0;
        } else {
            // No available desks, increment search attempts
            (worker as any).deskSearchAttempts = (worker as any).deskSearchAttempts || 0;
            (worker as any).deskSearchAttempts++;
            
            // If worker has tried 3 times, set state to frustrated
            if ((worker as any).deskSearchAttempts >= 3) {
                worker.mentalState = WorkerMentalState.FRUSTRATED;
                worker.physicalState = WorkerPhysicalState.WANDERING;
                
                // Show frustrated dialog
                this.setWorkerDialog(worker, 'FRUSTRATED');
            } else {
                // Not yet reached 3 attempts, still confused
                worker.mentalState = WorkerMentalState.CONFUSED;
                worker.physicalState = WorkerPhysicalState.WANDERING;
                
                // Show confused dialog
                this.setWorkerDialog(worker, 'CONFUSED');
            }
            
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
        
        // Create fresh events for the new day
        this.createEvents(60 * 1000);
        
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
            worker.dialog = null; // Reset dialog
            
            // Reset search attempts
            (worker as any).deskSearchAttempts = 0;
            
            // Assign new events for the day
            worker.events = [];
            this.assignEventsToWorker(worker);
            
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