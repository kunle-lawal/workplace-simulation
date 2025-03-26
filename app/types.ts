/* 
    Mental state of the worker
    FRUSTRATED: The worker is frustrated when they can't find a desk or meeting room because they are full
    HAPPY: The worker is happy when they have a desk or meeting room and they are working
    CONFUSED: The worker is confused when they try to rebook their desk or meeting room but it's already occupied
*/
export enum WorkerMentalState {
    FRUSTRATED = 'FRUSTRATED',
    HAPPY = 'HAPPY',
    CONFUSED = 'CONFUSED'
}

/*
    Physical state of the worker
    WANDERING: The worker is wandering around the office
    MOVING_TO_SPACE: The worker is moving to a space for their event
    WORKING: The worker is working at their desk or in meeting room
    MOVING_TO_DESK: The worker is moving to a desk
    ARRIVING: The worker is just entering the office
    ATTENDING_EVENT: The worker is attending an event
*/
export enum WorkerPhysicalState {
    WANDERING = 'WANDERING',
    MOVING_TO_SPACE = 'MOVING_TO_SPACE',
    WORKING = 'WORKING',
    MOVING_TO_DESK = 'MOVING_TO_DESK',
    ARRIVING = 'ARRIVING',
    ATTENDING_EVENT = 'ATTENDING_EVENT'
}

/**
 * Point type - Represents a 2D coordinate
 */
export type Point = {
    x: number;
    y: number;
};

/**
 * Location type - Represents a position with destination coordinates
 */
export type Location = Point & {
    destinationX: number;
    destinationY: number;
};

export type Attendees = {
    worker: Worker[]
}

/*
    State of the space
    AVAILABLE: The space is available to be occupied or added to an event
    OCCUPIED: The space is occupied by a worker but not assigned to a worker's event
    ASSIGNED: The space is assigned to a worker's event
*/
export enum SpaceState {
    AVAILABLE = 'AVAILABLE',
    OCCUPIED = 'OCCUPIED',
    ASSIGNED = 'ASSIGNED',
}

/*
    State of the desk
    AVAILABLE: The desk is available to be occupied or assigned to a worker
    OCCUPIED: The desk is occupied by a worker but not assigned to a worker
    ASSIGNED: The desk is assigned to a worker at the start of the simulation/day
*/
export enum DeskState {
    AVAILABLE = 'AVAILABLE',
    ASSIGNED = 'ASSIGNED',
    OCCUPIED = 'OCCUPIED',
}

/*
    Desk type
    x: The x coordinate of the desk
    y: The y coordinate of the desk
    destinationX: The x coordinate inside the desk for the worker to navigate to
    destinationY: The y coordinate inside the desk for the worker to navigate to
    id: The id of the desk
    name: The name of the desk
    state: The state of the desk
    occupiedBy: The ID of the worker currently occupying the desk, if any
*/
export type Desk = {
    x: number;
    y: number;
    width: number;
    height: number;
    destinationX: number;
    destinationY: number;
    id: string;
    name: string;
    state: DeskState;
    occupiedBy: {
        workerId: string;
        workerName: string;
    } | null;
}

export type DeskMap = Record<string, Desk>

export type WorkerEvent = {
    id: string;
    title: string;
    timeFrame: {
        startTime: number;
        endTime: number;
    };
    attendeeIds: string[]; // Only IDs referencing Workers
    spaceId: string;       // Reference by ID
}

export type WorkerEventMap = Record<string, WorkerEvent>

/*
    Space type
    x: The x coordinate of the space
    y: The y coordinate of the space
    id: The id of the space
    name: The name of the space
    state: The state of the space
*/
export type Space = {
    id: string;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    state: SpaceState;
    destinationX?: number;
    destinationY?: number;
}

export type SpaceMap = Record<string, Space>

export type AllEvents = Record<string, WorkerEvent>

/*
    Worker type
    id: The id of the worker
    name: The name of the worker
    location: The location of the worker
    workerEventIds: IDs of events the worker is attending
    assignedDeskId: ID of the desk assigned to the worker
    occupiedDesk: Records of current and last occupied desks by ID
    occupiedSpace: Records of current and last occupied spaces by ID
    mentalState: The mental state of the worker.
    physicalState: The physical state of the worker.
    destinationLocation: The location the worker is moving towards
    nextEventTime: The time of the next event that the worker is attending
    dialog: The speech bubble for the worker
    deskSearchAttempts?: Number of attempts made to find a desk
*/
export type Worker = {
    id: string;
    name: string;
    location: Point;
    workerEventIds: string[]; // Only IDs referencing WorkerEvents
    assignedDeskId: string | null;
    occupiedDesk: {
        lastOccupiedDeskId: string | null;
        lastOccupiedTime: number | null;
        currentOccupiedDeskId: string | null;
        currentOccupiedTime: number | null;
    };
    occupiedSpace: {
        lastOccupiedSpaceId: string | null;
        lastOccupiedTime: number | null;
        currentOccupiedSpaceId: string | null;
        currentOccupiedTime: number | null;
    };
    mentalState: WorkerMentalState;
    physicalState: WorkerPhysicalState;
    destinationLocation: Point | null;
    nextEventTime: number | null;
    dialog: Dialog | null;
    deskSearchAttempts?: number;
}

export type WorkerMap = Record<string, Worker>

/**
 * Dialog type for worker speech bubbles
 * text: The text content of the dialog
 * duration: How long to show the dialog (in ms)
 * startTime: When the dialog started showing
 */
export type Dialog = {
    text: string;
    duration: number;
    startTime: number;
}

// Simulation mode
export enum SimulationMode {
    CHAOTIC = 'CHAOTIC',
    MANAGED = 'MANAGED'
} 