/* 
    Mental state of the worker
    FRUSTRATED: The worker is frustrated when they can't find a desk or meeting room because they are full
    HAPPY: The worker is happy when they have a desk or meeting room and they are working
    CONFUSED: The worker is confused when they try to rebook their desk or meeting room but it's already occupied
*/
export enum WorkerMentalState {
    FRUSTRATED,
    HAPPY,
    CONFUSED
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
    WANDERING,
    MOVING_TO_SPACE,
    WORKING,
    MOVING_TO_DESK,
    ARRIVING,
    ATTENDING_EVENT
}

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
    AVAILABLE,
    OCCUPIED,
    ASSIGNED,
}

/*
    State of the desk
    AVAILABLE: The desk is available to be occupied or assigned to a worker
    OCCUPIED: The desk is occupied by a worker but not assigned to a worker
    ASSIGNED: The desk is assigned to a worker at the start of the simulation/day
*/
export enum DeskState {
    AVAILABLE,
    ASSIGNED,
    OCCUPIED,
}

/*
    Desk type
    x: The x coordinate of the desk
    y: The y coordinate of the desk
    destinationX: The x coordinate inside the desk for the worker to navigate to
    destinationY: The y coordinate inside the desk for the worker to navigate to
    id: The id of the desk
    state: The state of the desk
    occupiedBy: The ID of the worker currently occupying the desk, if any
*/
export type Desk = {
    x: number,
    y: number,
    destinationX: number,
    destinationY: number,
    id: string,
    state: DeskState,
    occupiedBy: string | null
}

export type DeskMap = {
    [key: string]: Desk
}

export type WorkerEvent = {
    id: string,
    title: string,
    timeFrame: {
        startTime: number, 
        endTime: number
    },
    attendees: Attendees,
    spaceForEvent: Space
}

export type WorkerEventMap = {
    [key: string]: WorkerEvent
}

/*
    Space type
    x: The x coordinate of the space
    y: The y coordinate of the space
    id: The id of the space
    state: The state of the space
*/
export type Space = {
    id: string,
    x: number,
    y: number,
    state: SpaceState,
    destinationX?: number,
    destinationY?: number
}

export type SpaceMap = {
    [key: string]: Space
}

export type AllEvents = {
    [key: string]: WorkerEvent & {
        spaceForEvent: Space
    }
}

/*
    Worker type
    id: The id of the worker
    name: The name of the worker
    location: The location of the worker
    assignedDesk: The desk that the worker is assigned to at the start of the simulation/day
    occupiedDesk: The desk that the worker is currently occupying or last occupied
    occupiedSpace: The space that the worker is currently occupying or last occupied
    mentalState: The mental state of the worker.
    physicalState: The physical state of the worker.
    events: The events that the worker is attending
    nextEventTime: The time of the next event that the worker is attending
*/
export type Worker = {
    id: string,
    name: string,
    location: {
        x: number, 
        y: number
    },
    assignedDesk: Desk | null,
    occupiedDesk: {
        lastOccupiedDesk: {
            deskId: string,
            time: number
        } | null,
        currentOccupiedDesk: {
            deskId: string,
            time: number
        } | null
    },
    occupiedSpace: {
        lastOccupiedSpace: {
            spaceId: string,
            time: number
        } | null,
        currentOccupiedSpace: {
            spaceId: string,
            time: number
        } | null
    },
    mentalState: WorkerMentalState,
    physicalState: WorkerPhysicalState,
    destinationLocation: {
        x: number,
        y: number
    } | null,
    nextEventTime: number | null,
    events: WorkerEvent[],
}

export type WorkerMap = {
    [key: string]: Worker
}

// Simulation mode
export enum SimulationMode {
    CHAOTIC,
    MANAGED
} 