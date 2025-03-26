import { Worker, Desk, Space, WorkerMentalState, SpaceState, DeskState, Dialog } from './types';

// Define color constants to avoid string literals
const COLORS = {
    DEFAULT_WORKER: '#000000',
    DESK: {
        AVAILABLE: '#aaffaa',
        ASSIGNED: '#aaaaff',
        OCCUPIED: '#ffaaaa'
    },
    SPACE: {
        AVAILABLE: '#ffda77', // Yellow for meeting rooms
        OCCUPIED: '#ffda77',
        ASSIGNED: '#ffda77'
    },
    UTILITY: {
        DEFAULT: '#ff7777'   // Red for office utility items
    },
    UI: {
        BLACK: '#000000',
        OUTLINE: '#333333',
        BACKGROUND: '#f9f9f9',
        GRID: '#e0e0e0',
        DIALOG_BG: '#ffff00',
        DIALOG_TEXT: '#000000',
        TIME_TEXT: '#333333',
        PROGRESS_BG: '#e0e0e0',
        PROGRESS_FG: '#4CAF50',
        MODE_MANAGED: '#4CAF50',
        MODE_CHAOTIC: '#F44336'
    }
};

// Font constants
const FONTS = {
    SMALL: '8px Arial',
    NORMAL: '10px Arial',
    EMOJI: '12px Arial',
    DIALOG: 'bold 12px Arial',
    UI: '16px Arial',
    UI_BOLD: 'bold 16px Arial'
};

// Cache frequently used values/properties
const TWO_PI = Math.PI * 2;

export class CanvasRenderer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private workerColors: Map<string, string>;
    private canvasWidth: number;
    private canvasHeight: number;
    
    // Add variables for panning and zooming
    private zoomLevel: number = 0.7;
    private panX: number = 0;
    private panY: number = 0;
    private isPanning: boolean = false;
    private lastMouseX: number = 0;
    private lastMouseY: number = 0;
    private minZoom: number = 0.5;
    private maxZoom: number = 2.5;
    
    constructor(canvasId: string) {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!canvas) {
            throw new Error(`Canvas with id ${canvasId} not found`);
        }
        this.canvas = canvas;
        
        const context = this.canvas.getContext('2d');
        if (!context) {
            throw new Error('Could not get canvas context');
        }
        this.ctx = context;
        
        this.canvasWidth = this.canvas.width;
        this.canvasHeight = this.canvas.height;
        this.workerColors = new Map<string, string>();
        
        // Initialize pan and zoom event listeners
        this.setupEventListeners();
    }
    
    /**
     * Setup event listeners for panning and zooming
     */
    private setupEventListeners(): void {
        // Mouse wheel for zooming
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
        
        // Mouse events for panning
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        window.addEventListener('mousemove', this.handleMouseMove.bind(this));
        window.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        // Touch events for mobile support
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
        // Prevent context menu when right-clicking on canvas
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });
    }
    
    /**
     * Handle mouse wheel event for zooming
     */
    private handleWheel(e: WheelEvent): void {
        e.preventDefault();
        
        // Calculate zoom center (mouse position)
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Convert mouse position to world coordinates before zoom
        const worldX = (mouseX - this.panX) / this.zoomLevel;
        const worldY = (mouseY - this.panY) / this.zoomLevel;
        
        // Adjust zoom level based on wheel direction
        const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
        this.zoomLevel *= zoomFactor;
        
        // Clamp zoom level to min/max
        this.zoomLevel = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoomLevel));
        
        // Calculate new pan offset to keep mouse position fixed
        this.panX = mouseX - worldX * this.zoomLevel;
        this.panY = mouseY - worldY * this.zoomLevel;
    }
    
    /**
     * Handle mouse down event to start panning
     */
    private handleMouseDown(e: MouseEvent): void {
        // Only enable panning with middle mouse button (wheel) or right mouse button
        if (e.button === 1 || e.button === 2) {
            e.preventDefault();
            this.isPanning = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
            this.canvas.style.cursor = 'grabbing';
        }
    }
    
    /**
     * Handle mouse move event for panning
     */
    private handleMouseMove(e: MouseEvent): void {
        if (this.isPanning) {
            const dx = e.clientX - this.lastMouseX;
            const dy = e.clientY - this.lastMouseY;
            
            this.panX += dx;
            this.panY += dy;
            
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        }
    }
    
    /**
     * Handle mouse up event to end panning
     */
    private handleMouseUp(e: MouseEvent): void {
        if (this.isPanning) {
            this.isPanning = false;
            this.canvas.style.cursor = 'default';
        }
    }
    
    /**
     * Handle touch start event for panning on mobile devices
     */
    private handleTouchStart(e: TouchEvent): void {
        if (e.touches.length === 1) {
            e.preventDefault();
            this.isPanning = true;
            this.lastMouseX = e.touches[0].clientX;
            this.lastMouseY = e.touches[0].clientY;
        }
    }
    
    /**
     * Handle touch move event for panning on mobile devices
     */
    private handleTouchMove(e: TouchEvent): void {
        if (this.isPanning && e.touches.length === 1) {
            e.preventDefault();
            const dx = e.touches[0].clientX - this.lastMouseX;
            const dy = e.touches[0].clientY - this.lastMouseY;
            
            this.panX += dx;
            this.panY += dy;
            
            this.lastMouseX = e.touches[0].clientX;
            this.lastMouseY = e.touches[0].clientY;
        }
    }
    
    /**
     * Handle touch end event to end panning on mobile devices
     */
    private handleTouchEnd(e: TouchEvent): void {
        this.isPanning = false;
    }
    
    /**
     * Apply transformation based on current pan and zoom
     */
    private applyTransform(): void {
        this.ctx.save();
        this.ctx.translate(this.panX, this.panY);
        this.ctx.scale(this.zoomLevel, this.zoomLevel);
    }
    
    /**
     * Restore canvas to normal state
     */
    private restoreTransform(): void {
        this.ctx.restore();
    }
    
    /**
     * Convert screen coordinates to world coordinates
     */
    screenToWorld(screenX: number, screenY: number): {x: number, y: number} {
        return {
            x: (screenX - this.panX) / this.zoomLevel,
            y: (screenY - this.panY) / this.zoomLevel
        };
    }
    
    /**
     * Get canvas width
     */
    getWidth(): number {
        return this.canvasWidth;
    }
    
    /**
     * Get canvas height
     */
    getHeight(): number {
        return this.canvasHeight;
    }
    
    /**
     * Clear the canvas for redrawing
     */
    clear(): void {
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    }
    
    /**
     * Render the office floor plan
     */
    renderFloorPlan(): void {
        const { ctx, canvasWidth, canvasHeight } = this;
        
        // Draw overall background
        ctx.fillStyle = COLORS.UI.BACKGROUND;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Apply pan and zoom transformation for the floor plan
        this.applyTransform();
        
        // Draw floor grid for visual reference
        ctx.strokeStyle = COLORS.UI.GRID;
        ctx.lineWidth = 1;
        
        // Batch grid lines to reduce state changes
        ctx.beginPath();
        
        // Draw vertical grid lines
        for (let x = 0; x < canvasWidth * 2; x += 50) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvasHeight * 2);
        }
        
        // Draw horizontal grid lines - fix the incorrect line direction
        for (let y = 0; y < canvasHeight * 2; y += 50) {
            ctx.moveTo(0, y);
            ctx.lineTo(canvasWidth * 2, y);
        }
        
        // Draw all lines at once
        ctx.stroke();
        
        // Reset transformation
        this.restoreTransform();
        
        // Add panning/zooming instructions
        ctx.fillStyle = COLORS.UI.BLACK;
        ctx.font = FONTS.NORMAL;
        ctx.textAlign = 'right';
        ctx.fillText('Use middle/right mouse button to pan, mouse wheel to zoom', canvasWidth - 20, canvasHeight - 20);
    }
    
    
    /**
     * Render all desks
     */
    renderDesks(desks: Desk[]): void {
        this.applyTransform();
        
        // Group desks by state to reduce state changes
        const desksByState = new Map<DeskState, Desk[]>();
        
        desks.forEach(desk => {
            if (!desksByState.has(desk.state)) {
                desksByState.set(desk.state, []);
            }
            desksByState.get(desk.state)!.push(desk);
        });
        
        // Render desks by state to minimize context changes
        desksByState.forEach((desksInState, state) => {
            this.renderDesksWithSameState(desksInState, state);
        });
        
        this.restoreTransform();
    }
    
    /**
     * Render a group of desks with the same state
     */
    private renderDesksWithSameState(desks: Desk[], state: DeskState): void {
        const { ctx } = this;
        
        // Set desk color based on state (once for the entire group)
        switch (state) {
            case DeskState.AVAILABLE:
                ctx.fillStyle = COLORS.DESK.AVAILABLE;
                break;
            case DeskState.ASSIGNED:
                ctx.fillStyle = COLORS.DESK.ASSIGNED;
                break;
            case DeskState.OCCUPIED:
                ctx.fillStyle = COLORS.DESK.OCCUPIED;
                break;
        }
        
        // Draw desk rectangles
        desks.forEach(desk => {
            const { x, y, width, height } = desk;
            ctx.fillRect(x - width / 2, y - height / 2, width, height);
        });
        
        // Draw all desk outlines
        ctx.strokeStyle = COLORS.UI.OUTLINE;
        ctx.lineWidth = 1;
        
        desks.forEach(desk => {
            const { x, y, width, height } = desk;
            ctx.strokeRect(x - width / 2, y - height / 2, width, height);
        });
        
        // Draw all desk IDs
        ctx.fillStyle = COLORS.UI.BLACK;
        ctx.font = FONTS.SMALL;
        ctx.textAlign = 'center';
        
        desks.forEach(desk => {
            const { x, y, occupiedBy } = desk;
            if (occupiedBy) {
                ctx.fillText(occupiedBy.workerName, x, y + 5);
            }
        });
    }
    
    /**
     * Render all meeting spaces
     */
    renderSpaces(spaces: Space[]): void {
        this.applyTransform();
        
        // Group spaces by state to reduce state changes
        const spacesByState = new Map<SpaceState, Space[]>();
        
        spaces.forEach(space => {
            if (!spacesByState.has(space.state)) {
                spacesByState.set(space.state, []);
            }
            spacesByState.get(space.state)!.push(space);
        });
        
        // Render spaces by state to minimize context changes
        spacesByState.forEach((spacesInState, state) => {
            this.renderSpacesWithSameState(spacesInState, state);
        });
        
        this.restoreTransform();
    }
    
    /**
     * Render a group of spaces with the same state
     */
    private renderSpacesWithSameState(spaces: Space[], state: SpaceState): void {
        const { ctx } = this;
        
        // Set space color to yellow (meeting room)
        ctx.fillStyle = COLORS.SPACE.AVAILABLE;
        
        // Draw all spaces as squares (meeting rooms) instead of circles
        spaces.forEach(space => {
            const { x, y, width, height } = space;
            ctx.fillRect(x - width / 2, y - height / 2, width, height);
        });
        
        // Draw all space outlines
        ctx.strokeStyle = COLORS.UI.OUTLINE;
        ctx.lineWidth = 1;
        
        spaces.forEach(space => {
            const { x, y, width, height } = space;
            ctx.strokeRect(x - width / 2, y - height / 2, width, height);
        });
        
        // Draw all space IDs
        ctx.fillStyle = COLORS.UI.BLACK;
        ctx.font = FONTS.SMALL;
        ctx.textAlign = 'center';
        
        spaces.forEach(space => {
            const { x, y, id, name } = space;
            ctx.fillText(name, x, y);
        });
    }
    
    /**
     * Assign a color to a worker
     */
    setWorkerColor(workerId: string, color: string): void {
        this.workerColors.set(workerId, color);
    }
    
    /**
     * Get worker color
     */
    getWorkerColor(workerId: string): string {
        return this.workerColors.get(workerId) || COLORS.DEFAULT_WORKER;
    }
    
    /**
     * Render all workers
     */
    renderWorkers(workers: Worker[]): void {
        this.applyTransform();
        
        // Sort workers so ones with dialogs render last (on top)
        const sortedWorkers = [...workers].sort((a, b) => {
            // Workers with dialogs come last (higher z-index)
            if (a.dialog && !b.dialog) return 1;
            if (!a.dialog && b.dialog) return -1;
            return 0;
        });
        
        sortedWorkers.forEach(worker => {
            this.renderWorker(worker);
        });
        
        this.restoreTransform();
    }
    
    /**
     * Render a single worker
     */
    renderWorker(worker: Worker): void {
        const { ctx } = this;
        const { id, location, name, mentalState, destinationLocation, dialog } = worker;
        const { x, y } = location;
        
        // Get worker color or use default
        const color = this.workerColors.get(id) || COLORS.DEFAULT_WORKER;
        
        // Draw worker as a colored circle
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, TWO_PI);
        ctx.fillStyle = color;
        ctx.fill();
        
        // Draw worker outline
        ctx.strokeStyle = COLORS.UI.OUTLINE;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw worker name
        ctx.fillStyle = COLORS.UI.BLACK;
        ctx.font = FONTS.NORMAL;
        ctx.textAlign = 'center';
        ctx.fillText(name, x, y - 15);
        
        // Get emoji for mental state
        let emoji = '';
        switch (mentalState) {
            case WorkerMentalState.HAPPY:
                emoji = '😊';
                break;
            case WorkerMentalState.FRUSTRATED:
                emoji = '😠';
                break;
            case WorkerMentalState.CONFUSED:
                emoji = '😕';
                break;
        }
        
        // Draw worker's mental state as an emoji
        ctx.font = FONTS.EMOJI;
        ctx.fillText(emoji, x, y + 20);
        
        // If worker has a destination, draw a line to it
        if (destinationLocation) {
            const { x: destX, y: destY } = destinationLocation;
            
            // Draw path line
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(destX, destY);
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Draw destination marker
            ctx.beginPath();
            ctx.arc(destX, destY, 3, 0, TWO_PI);
            ctx.fillStyle = color;
            ctx.fill();
        }
        
        // Draw dialog bubble if it exists
        if (dialog) {
            this.renderDialogBubble(x, y, dialog);
        }
    }
    
    /**
     * Render dialog bubble for a worker
     */
    private renderDialogBubble(x: number, y: number, dialog: Dialog): void {
        const { ctx } = this;
        const { text } = dialog;
        
        // Measure text width to adjust bubble size
        ctx.font = FONTS.DIALOG;
        const textWidth = ctx.measureText(text).width;
        
        // Create a background bubble
        const padding = 5;
        const bubbleWidth = textWidth + padding * 2;
        const bubbleHeight = 20;
        const bubbleX = x - bubbleWidth / 2;
        const bubbleY = y - 40;
        
        // Draw bubble background
        ctx.fillStyle = COLORS.UI.DIALOG_BG;
        ctx.fillRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight);
        
        // Draw bubble border
        ctx.strokeStyle = COLORS.UI.BLACK;
        ctx.lineWidth = 2;
        ctx.strokeRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight);
        
        // Draw dialog text inside bubble
        ctx.fillStyle = COLORS.UI.DIALOG_TEXT;
        ctx.textAlign = 'center';
        ctx.fillText(text, x, bubbleY + 14);
    }
    
    /**
     * Draw the simulation time indicator
     */
    renderSimulationTime(currentTime: number, totalTime: number): void {
        const { ctx, canvasWidth } = this;
        const timePercentage = (currentTime / totalTime) * 100;
        
        // Convert percentage to simulated hour (8 AM to 5 PM)
        const hour = Math.floor((timePercentage / 100) * 9) + 8;
        const minute = Math.floor(((timePercentage / 100) * 9 % 1) * 60);
        
        // Format the time
        const timeString = `${hour}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
        
        // Draw time indicator in the top right corner
        ctx.fillStyle = COLORS.UI.TIME_TEXT;
        ctx.font = FONTS.UI;
        ctx.textAlign = 'right';
        ctx.fillText(`Office Time: ${timeString}`, canvasWidth - 20, 30);
        
        // Draw progress bar background
        ctx.fillStyle = COLORS.UI.PROGRESS_BG;
        ctx.fillRect(20, 20, canvasWidth - 40, 10);
        
        // Draw progress bar foreground
        ctx.fillStyle = COLORS.UI.PROGRESS_FG;
        ctx.fillRect(20, 20, (canvasWidth - 40) * (currentTime / totalTime), 10);
    }
    
    /**
     * Render simulation mode indicator
     */
    renderSimulationMode(isManaged: boolean): void {
        const { ctx } = this;
        const modeText = isManaged ? 'Managed Office' : 'Chaotic Office';
        
        ctx.fillStyle = isManaged ? COLORS.UI.MODE_MANAGED : COLORS.UI.MODE_CHAOTIC;
        ctx.font = FONTS.UI_BOLD;
        ctx.textAlign = 'left';
        ctx.fillText(modeText, 20, 50);
    }
    
    /**
     * Render office utility items (red diamonds)
     */
    renderUtilityItems(utilityItems: {x: number, y: number}[]): void {
        this.applyTransform();
        
        const { ctx } = this;
        
        // Set utility item color
        ctx.fillStyle = COLORS.UTILITY.DEFAULT;
        
        // Draw all utility items as diamonds
        utilityItems.forEach(item => {
            const { x, y } = item;
            
            // Draw diamond shape
            ctx.beginPath();
            ctx.moveTo(x, y - 15); // Top point
            ctx.lineTo(x + 15, y); // Right point
            ctx.lineTo(x, y + 15); // Bottom point
            ctx.lineTo(x - 15, y); // Left point
            ctx.closePath();
            ctx.fill();
            
            // Draw outline
            ctx.strokeStyle = COLORS.UI.OUTLINE;
            ctx.lineWidth = 1;
            ctx.stroke();
        });
        
        this.restoreTransform();
    }
    
    /**
     * Check if panning is currently active
     */
    isPanningActive(): boolean {
        return this.isPanning;
    }
} 