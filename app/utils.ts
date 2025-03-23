import { Worker } from './types';

/**
 * Generate a random number between min and max (inclusive)
 */
export function getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Generate a random ID with a prefix
 */
export function generateId(prefix: string): string {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate distance between two points
 */
export function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Check if a point is within the canvas boundaries
 */
export function isWithinBounds(x: number, y: number, width: number, height: number): boolean {
    return x >= 0 && x <= width && y >= 0 && y <= height;
}

/**
 * Get a random location on the canvas that's a bit far from the current location
 */
export function getRandomDestination(
    currentX: number, 
    currentY: number, 
    canvasWidth: number, 
    canvasHeight: number,
    minDistance: number = 100
): { x: number, y: number } {
    let newX: number, newY: number, distance: number;
    
    do {
        newX = getRandomNumber(50, canvasWidth - 50);
        newY = getRandomNumber(50, canvasHeight - 50);
        distance = calculateDistance(currentX, currentY, newX, newY);
    } while (distance < minDistance);
    
    return { x: newX, y: newY };
}

/**
 * Move worker towards destination
 */
export function moveWorkerTowardsDestination(worker: Worker, speed: number = 2): void {
    if (!worker.destinationLocation) return;
    
    const { x: destX, y: destY } = worker.destinationLocation;
    const { x: currentX, y: currentY } = worker.location;
    
    // Calculate direction vector
    const dx = destX - currentX;
    const dy = destY - currentY;
    
    // Calculate distance to destination
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // If we're close enough to the destination, consider it reached
    if (distance < speed) {
        worker.location.x = destX;
        worker.location.y = destY;
        worker.destinationLocation = null;
        return;
    }
    
    // Normalize direction vector and multiply by speed
    const normalizedDx = (dx / distance) * speed;
    const normalizedDy = (dy / distance) * speed;
    
    // Update worker position
    worker.location.x += normalizedDx;
    worker.location.y += normalizedDy;
}

/**
 * Generate random color in HSL format for worker visualization
 */
export function getRandomColor(): string {
    const h = getRandomNumber(0, 360);
    const s = getRandomNumber(70, 100);
    const l = getRandomNumber(40, 60);
    return `hsl(${h}, ${s}%, ${l}%)`;
} 