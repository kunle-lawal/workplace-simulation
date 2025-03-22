import * as THREE from 'three';
import { SpaceType, SpaceState, BookingRecord } from './types';
import { COLORS } from './constants';
import { generateId } from './utils';

/**
 * Represents a 3D space in the office (desk or meeting room)
 * Manages state, appearance, and interactions with characters
 */
export class Space3D {
    // Core properties
    public id: string;
    public type: SpaceType;
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    private state: SpaceState;
    
    // Booking and occupancy
    private occupantId: string | null;
    private bookingHistory: BookingRecord[];
    
    // 3D objects
    public mesh: THREE.Group;
    private baseMesh: THREE.Mesh;
    private statusIndicator: THREE.Mesh;
    private nameLabel: THREE.Sprite | null;

    /**
     * Creates a new office space
     * @param type - Type of space (desk or meeting room)
     * @param x - X position
     * @param y - Y position
     * @param width - Width of the space
     * @param height - Height of the space
     * @param id - Optional ID (generated if not provided)
     */
    constructor(
        type: SpaceType,
        x: number,
        y: number,
        width: number,
        height: number,
        id?: string
    ) {
        this.id = id || generateId();
        this.type = type;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.state = SpaceState.AVAILABLE;
        this.occupantId = null;
        this.bookingHistory = [];
        this.nameLabel = null;
        
        // Create 3D representation
        this.mesh = new THREE.Group();
        this.baseMesh = this.createBaseMesh();
        this.statusIndicator = this.createStatusIndicator();
        
        // Add meshes to group
        this.mesh.add(this.baseMesh);
        this.mesh.add(this.statusIndicator);
        
        // Set initial position
        this.updatePosition();
        
        // Set name based on type and id
        this.setName(this.type === SpaceType.DESK 
            ? `Desk ${this.id.slice(-3)}` 
            : `Room ${this.id.slice(-3)}`);
    }

    /**
     * Creates the base mesh for the space
     * @returns The created mesh
     */
    private createBaseMesh(): THREE.Mesh {
        let geometry: THREE.BufferGeometry;
        let material: THREE.Material;
        
        if (this.type === SpaceType.DESK) {
            // Create desk
            geometry = new THREE.BoxGeometry(this.width, 5, this.height);
            material = new THREE.MeshStandardMaterial({
                color: 0x8D6E63, // Brown
                roughness: 0.7,
                metalness: 0.2
            });
        } else {
            // Create meeting room
            geometry = new THREE.BoxGeometry(this.width, 30, this.height);
            material = new THREE.MeshStandardMaterial({
                color: 0xBDBDBD, // Gray
                roughness: 0.8,
                metalness: 0.1,
                transparent: true,
                opacity: 0.6
            });
        }
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = this.type === SpaceType.DESK ? 2.5 : 15; // Half height
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        return mesh;
    }

    /**
     * Creates the status indicator to show availability
     * @returns The created mesh
     */
    private createStatusIndicator(): THREE.Mesh {
        // Create a small indicator above the space
        const geometry = new THREE.SphereGeometry(2, 16, 16);
        const material = new THREE.MeshStandardMaterial({
            color: this.getStateColor(),
            emissive: this.getStateColor(),
            emissiveIntensity: 0.5,
            roughness: 0.3,
            metalness: 0.7
        });
        
        const indicator = new THREE.Mesh(geometry, material);
        indicator.position.y = this.type === SpaceType.DESK ? 10 : 35;
        indicator.position.x = 0;
        indicator.position.z = 0;
        
        return indicator;
    }

    /**
     * Sets a name label for the space
     * @param name - Name to display
     */
    private setName(name: string): void {
        // Remove existing label if present
        if (this.nameLabel) {
            this.mesh.remove(this.nameLabel);
        }
        
        // Create canvas for text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return;
        
        canvas.width = 256;
        canvas.height = 64;
        
        // Draw background and text
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.font = 'bold 24px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = '#000000';
        context.fillText(name, canvas.width / 2, canvas.height / 2);
        
        // Create sprite from canvas
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        this.nameLabel = new THREE.Sprite(material);
        
        // Position above space
        this.nameLabel.position.y = this.type === SpaceType.DESK ? 15 : 40;
        this.nameLabel.scale.set(15, 4, 1);
        
        this.mesh.add(this.nameLabel);
    }

    /**
     * Updates the position of the space
     */
    private updatePosition(): void {
        this.mesh.position.set(
            this.x,
            0,
            this.y
        );
    }

    /**
     * Gets the color for the current state
     * @returns Color hex value
     */
    private getStateColor(): number {
        switch (this.state) {
            case SpaceState.AVAILABLE:
                return parseInt(COLORS.AVAILABLE.replace('#', '0x'));
            case SpaceState.BOOKED:
                return parseInt(COLORS.BOOKED.replace('#', '0x'));
            case SpaceState.OCCUPIED:
                return parseInt(COLORS.OCCUPIED.replace('#', '0x'));
            default:
                return 0x000000;
        }
    }

    /**
     * Updates the visual appearance based on state
     */
    private updateAppearance(): void {
        const color = this.getStateColor();
        
        // Update status indicator
        if (this.statusIndicator.material instanceof THREE.MeshStandardMaterial) {
            this.statusIndicator.material.color.setHex(color);
            this.statusIndicator.material.emissive.setHex(color);
        }
    }

    /**
     * Updates the space state periodically
     * @param elapsedTime - Time elapsed since start of simulation
     */
    public update(elapsedTime: number): void {
        // If we have a booking that's been active for too long, auto-release it
        if (this.state === SpaceState.BOOKED && this.bookingHistory.length > 0) {
            const lastBooking = this.bookingHistory[this.bookingHistory.length - 1];
            const bookingTime = lastBooking.timestamp;
            
            // If booking is older than 10 seconds and no one has occupied the space
            if (elapsedTime - bookingTime > 10 && !this.occupantId) {
                this.release();
            }
        }
    }

    /**
     * Books this space for a character
     * @param characterId - ID of the booking character
     * @param isManaged - Whether the simulation is in managed mode
     * @returns Success of booking
     */
    public book(characterId: string, isManaged: boolean): boolean {
        // If already booked or occupied, managed mode prevents booking
        if (isManaged && this.state !== SpaceState.AVAILABLE) {
            return false;
        }
        
        // Record booking
        this.bookingHistory.push({
            timestamp: Date.now(),
            characterId,
            isManaged
        });
        
        // Update state
        this.state = SpaceState.BOOKED;
        this.updateAppearance();
        
        return true;
    }

    /**
     * Occupies a booked space
     * @param characterId - ID of the occupying character
     * @returns Success of occupation
     */
    public occupy(characterId: string): boolean {
        // Can only occupy a booked space
        if (this.state !== SpaceState.BOOKED) {
            return false;
        }
        
        // Verify character has a booking
        const lastBooking = this.bookingHistory[this.bookingHistory.length - 1];
        if (!lastBooking || lastBooking.characterId !== characterId) {
            return false;
        }
        
        // Update state
        this.state = SpaceState.OCCUPIED;
        this.occupantId = characterId;
        this.updateAppearance();
        
        return true;
    }

    /**
     * Releases the space (makes it available again)
     */
    public release(): void {
        this.state = SpaceState.AVAILABLE;
        this.occupantId = null;
        this.updateAppearance();
    }

    /**
     * Gets current state of the space
     * @returns Current state
     */
    public getState(): SpaceState {
        return this.state;
    }

    /**
     * Gets ID of current occupant
     * @returns Occupant ID or null
     */
    public getOccupantId(): string | null {
        return this.occupantId;
    }

    /**
     * Checks if the space is available
     * @returns True if available
     */
    public isAvailable(): boolean {
        return this.state === SpaceState.AVAILABLE;
    }

    /**
     * Checks if the space is booked
     * @returns True if booked
     */
    public isBooked(): boolean {
        return this.state === SpaceState.BOOKED;
    }

    /**
     * Checks if the space is occupied
     * @returns True if occupied
     */
    public isOccupied(): boolean {
        return this.state === SpaceState.OCCUPIED;
    }

    /**
     * Cleans up resources when space is no longer needed
     */
    public destroy(): void {
        // Dispose of geometries and materials
        if (this.baseMesh.geometry) {
            this.baseMesh.geometry.dispose();
        }
        
        if (this.baseMesh.material instanceof THREE.Material) {
            this.baseMesh.material.dispose();
        }
        
        if (this.statusIndicator.geometry) {
            this.statusIndicator.geometry.dispose();
        }
        
        if (this.statusIndicator.material instanceof THREE.Material) {
            this.statusIndicator.material.dispose();
        }
        
        if (this.nameLabel && this.nameLabel.material instanceof THREE.SpriteMaterial) {
            if (this.nameLabel.material.map) {
                this.nameLabel.material.map.dispose();
            }
            this.nameLabel.material.dispose();
        }
    }
} 