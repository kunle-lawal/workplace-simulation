/**
 * Configuration settings for the simulation
 */
export interface SimulationConfig {
    /** Duration of a workday in milliseconds */
    DAY_DURATION: number;
    /** Starting hour of the workday */
    START_HOUR: number;
    /** Ending hour of the workday */
    END_HOUR: number;
    /** Width of the canvas in pixels */
    CANVAS_WIDTH: number;
    /** Height of the canvas in pixels */
    CANVAS_HEIGHT: number;
    /** Width of a desk in 3D units */
    DESK_WIDTH: number;
    /** Height/depth of a desk in 3D units */
    DESK_HEIGHT: number;
    /** Width of a meeting room in 3D units */
    MEETING_ROOM_WIDTH: number;
    /** Height/depth of a meeting room in 3D units */
    MEETING_ROOM_HEIGHT: number;
    /** Radius of a character in 3D units */
    CHARACTER_RADIUS: number;
    /** Movement speed of characters in 3D units per frame */
    MOVEMENT_SPEED: number;
}

/**
 * Color definitions for the simulation
 */
export interface Colors {
    /** Color for available spaces */
    AVAILABLE: string;
    /** Color for booked spaces */
    BOOKED: string;
    /** Color for occupied spaces */
    OCCUPIED: string;
    /** Default character color */
    CHARACTER: string;
    /** Color for frustrated characters */
    FRUSTRATED: string;
    /** Background color */
    BACKGROUND: string;
    /** Wall color */
    WALL: string;
}

/**
 * Types of spaces in the office
 */
export enum SpaceType {
    DESK = 'DESK',
    MEETING_ROOM = 'MEETING_ROOM'
}

/**
 * States that a character can be in
 */
export enum CharacterState {
    IDLE = 'IDLE',
    MOVING = 'MOVING',
    WORKING = 'WORKING',
    FRUSTRATED = 'FRUSTRATED'
}

/**
 * Space states
 */
export enum SpaceState {
    AVAILABLE = 'AVAILABLE',
    BOOKED = 'BOOKED',
    OCCUPIED = 'OCCUPIED'
}

/**
 * 2D position
 */
export interface Position {
    x: number;
    y: number;
}

/**
 * Booking record
 */
export interface BookingRecord {
    timestamp: number;
    characterId: string;
    isManaged: boolean;
}

/**
 * Space definition
 */
export interface Space {
    type: SpaceType;
    x: number;
    y: number;
    width: number;
    height: number;
    state?: SpaceState;
}

/**
 * Character definition
 */
export interface Character {
    id: string;
    name: string;
    x: number;
    y: number;
    color: string;
    state?: CharacterState;
    targetSpaceId?: string | null;
    frustrationLevel?: number;
}

/**
 * Office layout definition
 */
export interface OfficeLayout {
    spaces: Space[];
}

/**
 * Complete simulation state
 */
export interface SimulationState {
    spaces: Space[];
    characters: Character[];
    isManaged: boolean;
    currentTime: number;
    startTime: number;
} 