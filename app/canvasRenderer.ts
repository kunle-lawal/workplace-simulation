import { Worker, Desk, Space, WorkerMentalState, SpaceState, DeskState } from './types';

export class CanvasRenderer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private workerColors: Map<string, string>;
    
    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        const context = this.canvas.getContext('2d');
        if (!context) {
            throw new Error('Could not get canvas context');
        }
        this.ctx = context;
        this.workerColors = new Map<string, string>();
    }
    
    /**
     * Get canvas width
     */
    getWidth(): number {
        return this.canvas.width;
    }
    
    /**
     * Get canvas height
     */
    getHeight(): number {
        return this.canvas.height;
    }
    
    /**
     * Clear the canvas for redrawing
     */
    clear(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    /**
     * Render the office floor plan
     */
    renderFloorPlan(): void {
        // Draw background
        this.ctx.fillStyle = '#f9f9f9';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw floor grid for visual reference
        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 1;
        
        // Draw vertical grid lines
        for (let x = 0; x < this.canvas.width; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Draw horizontal grid lines
        for (let y = 0; y < this.canvas.height; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    /**
     * Render all desks
     */
    renderDesks(desks: Desk[]): void {
        desks.forEach(desk => {
            this.renderDesk(desk);
        });
    }
    
    /**
     * Render a single desk
     */
    renderDesk(desk: Desk): void {
        const { x, y, state } = desk;
        
        // Set desk color based on state
        switch (state) {
            case DeskState.AVAILABLE:
                this.ctx.fillStyle = '#aaffaa';
                break;
            case DeskState.ASSIGNED:
                this.ctx.fillStyle = '#aaaaff';
                break;
            case DeskState.OCCUPIED:
                this.ctx.fillStyle = '#ffaaaa';
                break;
        }
        
        // Draw desk as a rectangle
        this.ctx.fillRect(x - 15, y - 10, 30, 20);
        
        // Draw desk outline
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x - 15, y - 10, 30, 20);
        
        // Draw desk ID for reference
        this.ctx.fillStyle = '#000000';
        this.ctx.font = '8px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(desk.id, x, y + 5);
    }
    
    /**
     * Render all meeting spaces
     */
    renderSpaces(spaces: Space[]): void {
        spaces.forEach(space => {
            this.renderSpace(space);
        });
    }
    
    /**
     * Render a single meeting space
     */
    renderSpace(space: Space): void {
        const { x, y, state, id } = space;
        
        // Set space color based on state
        switch (state) {
            case SpaceState.AVAILABLE:
                this.ctx.fillStyle = 'rgba(170, 255, 170, 0.5)';
                break;
            case SpaceState.OCCUPIED:
                this.ctx.fillStyle = 'rgba(255, 170, 170, 0.5)';
                break;
            case SpaceState.ASSIGNED:
                this.ctx.fillStyle = 'rgba(170, 170, 255, 0.5)';
                break;
        }
        
        // Draw space as a circle
        this.ctx.beginPath();
        this.ctx.arc(x, y, 25, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw space outline
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        // Draw space ID for reference
        this.ctx.fillStyle = '#000000';
        this.ctx.font = '8px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(id, x, y);
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
        return this.workerColors.get(workerId) || '#000000';
    }
    
    /**
     * Render all workers
     */
    renderWorkers(workers: Worker[]): void {
        workers.forEach(worker => {
            this.renderWorker(worker);
        });
    }
    
    /**
     * Render a single worker
     */
    renderWorker(worker: Worker): void {
        const { id, location, name, mentalState } = worker;
        const { x, y } = location;
        
        // Get worker color or use default
        const color = this.workerColors.get(id) || '#000000';
        
        // Draw worker as a colored circle
        this.ctx.beginPath();
        this.ctx.arc(x, y, 10, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        
        // Draw worker outline
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        // Draw worker name
        this.ctx.fillStyle = '#000000';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(name, x, y - 15);
        
        // Draw worker's mental state as an emoji
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
        
        this.ctx.font = '12px Arial';
        this.ctx.fillText(emoji, x, y + 20);
        
        // If worker has a destination, draw a line to it
        if (worker.destinationLocation) {
            const { x: destX, y: destY } = worker.destinationLocation;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(destX, destY);
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
            
            // Draw a small circle at the destination
            this.ctx.beginPath();
            this.ctx.arc(destX, destY, 3, 0, Math.PI * 2);
            this.ctx.fillStyle = color;
            this.ctx.fill();
        }
    }
    
    /**
     * Draw the simulation time indicator
     */
    renderSimulationTime(currentTime: number, totalTime: number): void {
        const timePercentage = (currentTime / totalTime) * 100;
        
        // Convert percentage to simulated hour (8 AM to 5 PM)
        const hour = Math.floor((timePercentage / 100) * 9) + 8;
        const minute = Math.floor(((timePercentage / 100) * 9 % 1) * 60);
        
        // Format the time
        const timeString = `${hour}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
        
        // Draw time indicator in the top right corner
        this.ctx.fillStyle = '#333333';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`Office Time: ${timeString}`, this.canvas.width - 20, 30);
        
        // Draw progress bar
        this.ctx.fillStyle = '#e0e0e0';
        this.ctx.fillRect(20, 20, this.canvas.width - 40, 10);
        
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(20, 20, (this.canvas.width - 40) * (currentTime / totalTime), 10);
    }
    
    /**
     * Render simulation mode indicator
     */
    renderSimulationMode(isManaged: boolean): void {
        const modeText = isManaged ? 'Managed Office' : 'Chaotic Office';
        
        this.ctx.fillStyle = isManaged ? '#4CAF50' : '#F44336';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(modeText, 20, 50);
    }
} 