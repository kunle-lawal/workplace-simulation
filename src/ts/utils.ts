import { SIMULATION_CONFIG, OFFICE_LAYOUT, CHARACTERS, SPACE_TYPES, CHARACTER_STATES } from './constants';
import { SimulationState, SpaceState, CharacterState, Position } from './types';

/**
 * Interface for movement calculation result
 */
interface MovementResult {
    newX: number;
    newY: number;
    arrived: boolean;
}

/**
 * Formats a time value (e.g. 14) to a readable format (e.g. "2:00 PM")
 * @param hour - Hour value (0-23)
 * @returns Formatted time string
 */
export function formatTime(hour: number): string {
    const isPM = hour >= 12;
    const hour12 = hour % 12 || 12;
    const minutes = '00';
    return ""
    return `${hour12}:${minutes} ${isPM ? 'PM' : 'AM'}`;
}

/**
 * Calculates the current simulation time based on elapsed real time
 * @param startTime - Time when the simulation started
 * @param currentTime - Current real time
 * @returns Current simulated hour (e.g. 9 for 9:00 AM)
 */
export function calculateSimulationTime(startTime: number, currentTime: number): number {
    const elapsedTime = currentTime - startTime;
    const progress = elapsedTime / SIMULATION_CONFIG.DAY_DURATION;
    const simulatedHour = SIMULATION_CONFIG.START_HOUR + (SIMULATION_CONFIG.END_HOUR - SIMULATION_CONFIG.START_HOUR) * progress;
    return Math.min(simulatedHour, SIMULATION_CONFIG.END_HOUR);
}

/**
 * Calculates euclidean distance between two points
 * @param x1 - X coordinate of first point
 * @param y1 - Y coordinate of first point
 * @param x2 - X coordinate of second point
 * @param y2 - Y coordinate of second point
 * @returns Distance between the points
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates new position when moving towards a target
 * @param fromX - Starting X coordinate
 * @param fromY - Starting Y coordinate
 * @param toX - Target X coordinate
 * @param toY - Target Y coordinate
 * @param speed - Movement speed
 * @returns New position and arrival status
 */
export function calculateMovement(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    speed: number
): MovementResult {
    const dist = distance(fromX, fromY, toX, toY);
    
    // If we've arrived (or are very close)
    if (dist <= speed) {
        return {
            newX: toX,
            newY: toY,
            arrived: true
        };
    }
    
    // Calculate movement ratio and new position
    const ratio = speed / dist;
    return {
        newX: fromX + (toX - fromX) * ratio,
        newY: fromY + (toY - fromY) * ratio,
        arrived: false
    };
}

/**
 * Generates a random integer between min and max (inclusive)
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Random integer
 */
export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Picks a random element from an array
 * @param array - Array to pick from
 * @returns Randomly selected element
 */
export function randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Checks if a point is inside a rectangle
 * @param px - Point X coordinate
 * @param py - Point Y coordinate
 * @param rx - Rectangle X coordinate (center)
 * @param ry - Rectangle Y coordinate (center)
 * @param rw - Rectangle width
 * @param rh - Rectangle height
 * @returns True if point is inside rectangle
 */
export function isPointInRect(
    px: number,
    py: number,
    rx: number,
    ry: number,
    rw: number,
    rh: number
): boolean {
    return (
        px >= rx - rw / 2 &&
        px < rx + rw / 2 &&
        py >= ry - rh / 2 &&
        py < ry + rh / 2
    );
}

/**
 * Creates the initial state for the simulation
 * @returns Initial simulation state
 */
export function createInitialState(): SimulationState {
    return {
        spaces: OFFICE_LAYOUT.spaces.map((space, index) => ({
            ...space,
            state: SpaceState.AVAILABLE
        })),
        characters: CHARACTERS.map((character, index) => ({
            id: `character${index}`,
            name: character.name,
            x: randomInt(-180, 180),
            y: randomInt(-180, 180),
            color: character.color,
            state: CharacterState.IDLE,
            targetSpaceId: null,
            frustrationLevel: 0
        })),
        isManaged: true,
        currentTime: 0,
        startTime: Date.now()
    };
}

/**
 * Generates a unique ID
 * @returns Unique ID string
 */
export function generateId(): string {
    return Math.random().toString(36).substr(2, 9);
}

/**
 * Clamps a value between a minimum and maximum
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
} 