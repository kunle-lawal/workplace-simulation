import { SimulationConfig, Colors, SpaceType, CharacterState, OfficeLayout } from './types';

/**
 * Simulation configuration constants
 */
export const SIMULATION_CONFIG: SimulationConfig = {
    DAY_DURATION: 60000, // 60 seconds to represent 8 hours
    START_HOUR: 9, // 9 AM
    END_HOUR: 17, // 5 PM
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    DESK_WIDTH: 30,
    DESK_HEIGHT: 20,
    MEETING_ROOM_WIDTH: 60,
    MEETING_ROOM_HEIGHT: 40,
    CHARACTER_RADIUS: 5,
    MOVEMENT_SPEED: 2
};

/**
 * Color constants for visual representation
 */
export const COLORS: Colors = {
    AVAILABLE: '#4CAF50', // Green
    BOOKED: '#FF9800', // Orange
    OCCUPIED: '#2196F3', // Blue
    CHARACTER: '#9C27B0', // Purple
    FRUSTRATED: '#F44336', // Red
    BACKGROUND: '#F5F5F5', // Light grey
    WALL: '#BDBDBD' // Medium grey
};

/**
 * Space types exported from enum
 */
export const SPACE_TYPES = SpaceType;

/**
 * Character states exported from enum
 */
export const CHARACTER_STATES = CharacterState;

/**
 * Default office layout with desks and meeting rooms
 */
export const OFFICE_LAYOUT: OfficeLayout = {
    spaces: [
        // Open space desks
        { type: SpaceType.DESK, x: -70, y: 0, width: SIMULATION_CONFIG.DESK_WIDTH, height: SIMULATION_CONFIG.DESK_HEIGHT },
        { type: SpaceType.DESK, x: -35, y: 0, width: SIMULATION_CONFIG.DESK_WIDTH, height: SIMULATION_CONFIG.DESK_HEIGHT },
        { type: SpaceType.DESK, x: 0, y: 0, width: SIMULATION_CONFIG.DESK_WIDTH, height: SIMULATION_CONFIG.DESK_HEIGHT },
        { type: SpaceType.DESK, x: 35, y: 0, width: SIMULATION_CONFIG.DESK_WIDTH, height: SIMULATION_CONFIG.DESK_HEIGHT },
        { type: SpaceType.DESK, x: 70, y: 0, width: SIMULATION_CONFIG.DESK_WIDTH, height: SIMULATION_CONFIG.DESK_HEIGHT },
        
        { type: SpaceType.DESK, x: -70, y: 40, width: SIMULATION_CONFIG.DESK_WIDTH, height: SIMULATION_CONFIG.DESK_HEIGHT },
        { type: SpaceType.DESK, x: -35, y: 40, width: SIMULATION_CONFIG.DESK_WIDTH, height: SIMULATION_CONFIG.DESK_HEIGHT },
        { type: SpaceType.DESK, x: 0, y: 40, width: SIMULATION_CONFIG.DESK_WIDTH, height: SIMULATION_CONFIG.DESK_HEIGHT },
        { type: SpaceType.DESK, x: 35, y: 40, width: SIMULATION_CONFIG.DESK_WIDTH, height: SIMULATION_CONFIG.DESK_HEIGHT },
        { type: SpaceType.DESK, x: 70, y: 40, width: SIMULATION_CONFIG.DESK_WIDTH, height: SIMULATION_CONFIG.DESK_HEIGHT },
        
        { type: SpaceType.DESK, x: -70, y: -40, width: SIMULATION_CONFIG.DESK_WIDTH, height: SIMULATION_CONFIG.DESK_HEIGHT },
        { type: SpaceType.DESK, x: -35, y: -40, width: SIMULATION_CONFIG.DESK_WIDTH, height: SIMULATION_CONFIG.DESK_HEIGHT },
        { type: SpaceType.DESK, x: 0, y: -40, width: SIMULATION_CONFIG.DESK_WIDTH, height: SIMULATION_CONFIG.DESK_HEIGHT },
        { type: SpaceType.DESK, x: 35, y: -40, width: SIMULATION_CONFIG.DESK_WIDTH, height: SIMULATION_CONFIG.DESK_HEIGHT },
        { type: SpaceType.DESK, x: 70, y: -40, width: SIMULATION_CONFIG.DESK_WIDTH, height: SIMULATION_CONFIG.DESK_HEIGHT },
        
        // Meeting rooms
        { type: SpaceType.MEETING_ROOM, x: -140, y: 140, width: SIMULATION_CONFIG.MEETING_ROOM_WIDTH, height: SIMULATION_CONFIG.MEETING_ROOM_HEIGHT },
        { type: SpaceType.MEETING_ROOM, x: -70, y: 140, width: SIMULATION_CONFIG.MEETING_ROOM_WIDTH, height: SIMULATION_CONFIG.MEETING_ROOM_HEIGHT },
        { type: SpaceType.MEETING_ROOM, x: 0, y: 140, width: SIMULATION_CONFIG.MEETING_ROOM_WIDTH, height: SIMULATION_CONFIG.MEETING_ROOM_HEIGHT },
        { type: SpaceType.MEETING_ROOM, x: 70, y: 140, width: SIMULATION_CONFIG.MEETING_ROOM_WIDTH, height: SIMULATION_CONFIG.MEETING_ROOM_HEIGHT },
        { type: SpaceType.MEETING_ROOM, x: 140, y: 140, width: SIMULATION_CONFIG.MEETING_ROOM_WIDTH, height: SIMULATION_CONFIG.MEETING_ROOM_HEIGHT },
        
        // Phone booths
        { type: SpaceType.MEETING_ROOM, x: -140, y: -140, width: SIMULATION_CONFIG.MEETING_ROOM_WIDTH/1.5, height: SIMULATION_CONFIG.MEETING_ROOM_HEIGHT/1.5 },
        { type: SpaceType.MEETING_ROOM, x: -90, y: -140, width: SIMULATION_CONFIG.MEETING_ROOM_WIDTH/1.5, height: SIMULATION_CONFIG.MEETING_ROOM_HEIGHT/1.5 },
        { type: SpaceType.MEETING_ROOM, x: -40, y: -140, width: SIMULATION_CONFIG.MEETING_ROOM_WIDTH/1.5, height: SIMULATION_CONFIG.MEETING_ROOM_HEIGHT/1.5 },
        { type: SpaceType.MEETING_ROOM, x: 40, y: -140, width: SIMULATION_CONFIG.MEETING_ROOM_WIDTH/1.5, height: SIMULATION_CONFIG.MEETING_ROOM_HEIGHT/1.5 },
        { type: SpaceType.MEETING_ROOM, x: 90, y: -140, width: SIMULATION_CONFIG.MEETING_ROOM_WIDTH/1.5, height: SIMULATION_CONFIG.MEETING_ROOM_HEIGHT/1.5 },
        { type: SpaceType.MEETING_ROOM, x: 140, y: -140, width: SIMULATION_CONFIG.MEETING_ROOM_WIDTH/1.5, height: SIMULATION_CONFIG.MEETING_ROOM_HEIGHT/1.5 },
    ]
};

/**
 * Character definitions with names and colors
 */
export const CHARACTERS = [
    { name: 'Alice', color: '#E91E63' },
    { name: 'Bob', color: '#9C27B0' },
    { name: 'Charlie', color: '#673AB7' },
    { name: 'David', color: '#3F51B5' },
    { name: 'Emma', color: '#2196F3' },
    { name: 'Frank', color: '#009688' },
    { name: 'Grace', color: '#4CAF50' },
    { name: 'Hannah', color: '#8BC34A' },
    { name: 'Ian', color: '#CDDC39' },
    { name: 'Julia', color: '#FFC107' }
]; 