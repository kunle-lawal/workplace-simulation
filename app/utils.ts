import { Worker, Point } from './types';

/**
 * Mathematical constants
 */
const MATH = {
    DEG_TO_RAD: Math.PI / 180,
    RAD_TO_DEG: 180 / Math.PI
};

/**
 * Generate a random integer between min and max (inclusive)
 */
export function getRandomNumber(min: number, max: number): number {
    // Ensure we're working with integers
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random ID with a prefix
 * Uses a more efficient approach for generating the random part
 */
export function generateId(prefix: string): string {
    // More efficient than toString(36).substr
    return `${prefix}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Calculate distance between two points using efficient calculation
 */
export function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
    // More efficient than using Math.pow
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate distance between two points using efficient calculation
 */
export function calculateDistancePoints(point1: Point, point2: Point): number {
    return calculateDistance(point1.x, point1.y, point2.x, point2.y);
}

/**
 * Check if a point is within the canvas boundaries
 */
export function isWithinBounds(x: number, y: number, width: number, height: number): boolean {
    return x >= 0 && x <= width && y >= 0 && y <= height;
}

/**
 * Get a random location on the canvas that's a bit far from the current location
 * Uses a more efficient approach with a maximum number of tries
 */
export function getRandomDestination(
    currentX: number, 
    currentY: number, 
    canvasWidth: number, 
    canvasHeight: number,
    minDistance: number = 100,
    maxTries: number = 10
): Point {
    let newX: number, newY: number, distance: number;
    let tries = 0;
    
    // Add a maximum number of attempts to prevent infinite loops
    do {
        // Keep points away from the edges
        newX = getRandomNumber(50, canvasWidth - 50);
        newY = getRandomNumber(50, canvasHeight - 50);
        distance = calculateDistance(currentX, currentY, newX, newY);
        tries++;
        
        // Break out after max tries and just return the last point
        if (tries >= maxTries) break;
    } while (distance < minDistance);
    
    return { x: newX, y: newY };
}

/**
 * Move worker towards destination with optimized calculations
 */
export function moveWorkerTowardsDestination(worker: Worker, speed: number = 2): void {
    if (!worker.destinationLocation) return;
    
    const { x: destX, y: destY } = worker.destinationLocation;
    const { x: currentX, y: currentY } = worker.location;
    
    // Calculate direction vector - no need for intermediary variables
    const dx = destX - currentX;
    const dy = destY - currentY;
    
    // Calculate distance to destination without using Math.pow
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // If we're close enough to the destination, consider it reached
    if (distance < speed) {
        worker.location.x = destX;
        worker.location.y = destY;
        worker.destinationLocation = null;
        return;
    }
    
    // Update worker position directly with calculated values
    const multiplier = speed / distance;
    worker.location.x += dx * multiplier;
    worker.location.y += dy * multiplier;
}

/**
 * Generate random color in HSL format for worker visualization
 * with more distinct colors for better visibility
 */
export function getRandomColor(): string {
    // Use golden ratio to get better distribution of colors
    // This helps prevent similar colors being generated consecutively
    const goldenRatioConjugate = 0.618033988749895;
    let h = Math.random();
    h += goldenRatioConjugate;
    h %= 1;
    
    const s = 70 + Math.random() * 30; // 70-100% saturation
    const l = 40 + Math.random() * 20; // 40-60% lightness
    
    // Convert to HSL string
    return `hsl(${Math.floor(h * 360)}, ${Math.floor(s)}%, ${Math.floor(l)}%)`;
} 