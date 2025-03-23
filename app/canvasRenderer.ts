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
        AVAILABLE: 'rgba(170, 255, 170, 0.5)',
        OCCUPIED: 'rgba(255, 170, 170, 0.5)',
        ASSIGNED: 'rgba(170, 170, 255, 0.5)'
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
        
        // Draw background
        ctx.fillStyle = COLORS.UI.BACKGROUND;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Draw floor grid for visual reference
        ctx.strokeStyle = COLORS.UI.GRID;
        ctx.lineWidth = 1;
        
        // Batch grid lines to reduce state changes
        ctx.beginPath();
        
        // Draw vertical grid lines
        for (let x = 0; x < canvasWidth; x += 50) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvasHeight);
        }
        
        // Draw horizontal grid lines
        for (let y = 0; y < canvasHeight; y += 50) {
            ctx.moveTo(0, y);
            ctx.lineTo(canvasWidth, y);
        }
        
        // Draw all lines at once
        ctx.stroke();
    }
    
    /**
     * Render all desks
     */
    renderDesks(desks: Desk[]): void {
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
            const { x, y } = desk;
            ctx.fillRect(x - 15, y - 10, 30, 20);
        });
        
        // Draw all desk outlines
        ctx.strokeStyle = COLORS.UI.OUTLINE;
        ctx.lineWidth = 1;
        
        desks.forEach(desk => {
            const { x, y } = desk;
            ctx.strokeRect(x - 15, y - 10, 30, 20);
        });
        
        // Draw all desk IDs
        ctx.fillStyle = COLORS.UI.BLACK;
        ctx.font = FONTS.SMALL;
        ctx.textAlign = 'center';
        
        desks.forEach(desk => {
            const { x, y, id } = desk;
            ctx.fillText(id, x, y + 5);
        });
    }
    
    /**
     * Render all meeting spaces
     */
    renderSpaces(spaces: Space[]): void {
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
    }
    
    /**
     * Render a group of spaces with the same state
     */
    private renderSpacesWithSameState(spaces: Space[], state: SpaceState): void {
        const { ctx } = this;
        
        // Set space color based on state (once for the entire group)
        switch (state) {
            case SpaceState.AVAILABLE:
                ctx.fillStyle = COLORS.SPACE.AVAILABLE;
                break;
            case SpaceState.OCCUPIED:
                ctx.fillStyle = COLORS.SPACE.OCCUPIED;
                break;
            case SpaceState.ASSIGNED:
                ctx.fillStyle = COLORS.SPACE.ASSIGNED;
                break;
        }
        
        // Draw all space circles
        ctx.beginPath();
        spaces.forEach(space => {
            const { x, y } = space;
            ctx.moveTo(x + 25, y);
            ctx.arc(x, y, 25, 0, TWO_PI);
        });
        ctx.fill();
        
        // Draw all space outlines
        ctx.strokeStyle = COLORS.UI.OUTLINE;
        ctx.lineWidth = 1;
        ctx.beginPath();
        spaces.forEach(space => {
            const { x, y } = space;
            ctx.moveTo(x + 25, y);
            ctx.arc(x, y, 25, 0, TWO_PI);
        });
        ctx.stroke();
        
        // Draw all space IDs
        ctx.fillStyle = COLORS.UI.BLACK;
        ctx.font = FONTS.SMALL;
        ctx.textAlign = 'center';
        
        spaces.forEach(space => {
            const { x, y, id } = space;
            ctx.fillText(id, x, y);
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
} 