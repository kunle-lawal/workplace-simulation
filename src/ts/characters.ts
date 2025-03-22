import * as THREE from 'three';
import { CharacterState } from './types';
import { CHARACTER_STATES } from './constants';
import { Space3D } from './spaces';
import { randomChoice, randomInt } from './utils';

/**
 * Represents a character in the 3D office simulation
 * Manages character appearance, movement, and interactions with spaces
 */
export class Character3D {
    // Core properties
    public id: string;
    private name: string;
    private color: string;
    public state: CharacterState;
    public targetSpace: Space3D | null;
    private frustrationLevel: number;
    
    // 3D objects
    public mesh: THREE.Group;
    private body: THREE.Mesh;
    private head: THREE.Mesh;
    private nameLabel: THREE.Sprite;
    
    // Animation properties
    private lastThinkTime: number;
    private movementSpeed: number;

    /**
     * Creates a new 3D character
     * @param id - Character ID
     * @param name - Character name
     * @param x - Initial X position
     * @param y - Initial Y position
     * @param color - Character color
     */
    constructor(id: string, name: string, x: number, y: number, color: string) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.state = CHARACTER_STATES.IDLE;
        this.targetSpace = null;
        this.frustrationLevel = 0;
        this.lastThinkTime = 0;
        this.movementSpeed = 2;
        
        // Create 3D representation
        this.mesh = new THREE.Group();
        this.mesh.position.set(x, 0, y);
        
        // Create body parts
        this.body = this.createBody();
        this.head = this.createHead();
        this.mesh.add(this.body);
        this.mesh.add(this.head);
        
        // Create name label
        this.nameLabel = this.createNameLabel();
        this.mesh.add(this.nameLabel);
    }

    /**
     * Creates the character's body
     * @returns Body mesh
     */
    private createBody(): THREE.Mesh {
        const geometry = new THREE.CylinderGeometry(3, 3, 10, 12);
        const material = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.7,
            metalness: 0.3
        });
        
        const body = new THREE.Mesh(geometry, material);
        body.position.y = 5; // Half height
        body.castShadow = true;
        
        return body;
    }

    /**
     * Creates the character's head
     * @returns Head mesh
     */
    private createHead(): THREE.Mesh {
        const geometry = new THREE.SphereGeometry(2.5, 16, 16);
        const material = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.7,
            metalness: 0.3
        });
        
        const head = new THREE.Mesh(geometry, material);
        head.position.y = 12.5; // Body height + half head
        head.castShadow = true;
        
        return head;
    }

    /**
     * Creates the character's name label
     * @returns Label sprite
     */
    private createNameLabel(): THREE.Sprite {
        // Create canvas for text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) {
            throw new Error('Could not get canvas context');
        }
        
        canvas.width = 256;
        canvas.height = 64;
        
        // Draw background and text
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.font = 'bold 24px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = '#000000';
        context.fillText(this.name, canvas.width / 2, canvas.height / 2);
        
        // Create sprite
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        
        // Position above character
        sprite.position.y = 16;
        sprite.scale.set(12, 3, 1);
        
        return sprite;
    }

    /**
     * Updates the character's position
     * @param x - New X position
     * @param y - New Y position
     */
    public updatePosition(x: number, y: number): void {
        this.mesh.position.set(x, 0, y);
    }

    /**
     * Updates the character's appearance based on state
     */
    private updateAppearance(): void {
        const targetColor = this.state === CHARACTER_STATES.FRUSTRATED
            ? new THREE.Color(0xFF9800) // Orange for frustrated
            : new THREE.Color(this.color);
        
        // Update body and head material colors
        [this.body, this.head].forEach(part => {
            if (part.material instanceof THREE.MeshStandardMaterial) {
                part.material.color.copy(targetColor);
            }
        });
        
        // Add animation effects based on state
        if (this.state === CHARACTER_STATES.FRUSTRATED) {
            // Make character appear agitated
            this.mesh.rotation.y += 0.1;
        }
    }

    /**
     * Updates the character's state and behavior
     * @param spaces - Available spaces in the simulation
     * @param isManaged - Whether the simulation is in managed mode
     * @param deltaTime - Time since last update
     */
    public update(spaces: Space3D[], isManaged: boolean, deltaTime: number = 0.1): void {
        this.lastThinkTime += deltaTime;
        
        // Handle state transitions
        switch (this.state) {
            case CHARACTER_STATES.IDLE:
                this.handleIdleState(spaces, isManaged);
                break;
                
            case CHARACTER_STATES.MOVING:
                this.handleMovingState();
                break;
                
            case CHARACTER_STATES.WORKING:
                this.handleWorkingState();
                break;
                
            case CHARACTER_STATES.FRUSTRATED:
                this.handleFrustratedState();
                break;
        }
        
        // Update visual appearance
        this.updateAppearance();
    }

    /**
     * Handles behavior when character is in idle state
     * @param spaces - Available spaces
     * @param isManaged - Whether simulation is in managed mode
     */
    private handleIdleState(spaces: Space3D[], isManaged: boolean): void {
        // Only think about finding a space occasionally
        if (this.lastThinkTime < 1) return;
        this.lastThinkTime = 0;
        
        // Decide whether to look for a space (20% chance each second)
        if (Math.random() > 0.2) return;
        
        // Filter available spaces
        let availableSpaces: Space3D[];
        
        if (isManaged) {
            // In managed mode, only consider truly available spaces
            availableSpaces = spaces.filter(space => space.isAvailable());
        } else {
            // In chaotic mode, sometimes consider any space (even if booked/occupied)
            if (Math.random() < 0.5) {
                availableSpaces = spaces.filter(space => space.isAvailable());
            } else {
                // 30% chance to try using any space regardless of availability
                availableSpaces = spaces.filter(space => Math.random() < 0.3);
            }
        }
        
        // If no spaces available, character may get frustrated
        if (availableSpaces.length === 0) {
            this.frustrationLevel += 1;
            
            if (this.frustrationLevel > 3) {
                this.state = CHARACTER_STATES.FRUSTRATED;
            }
            return;
        }
        
        // Choose a random space from available options
        const targetSpace = randomChoice(availableSpaces);
        
        // Try to book the space
        const bookingSuccess = targetSpace.book(this.id, isManaged);
        
        if (bookingSuccess) {
            // Space booked, move toward it
            this.targetSpace = targetSpace;
            this.state = CHARACTER_STATES.MOVING;
            this.frustrationLevel = 0;
        } else if (!isManaged) {
            // In chaotic mode, may still try to use the space even if booking failed
            if (Math.random() < 0.4) {
                this.targetSpace = targetSpace;
                this.state = CHARACTER_STATES.MOVING;
                this.frustrationLevel = 0;
            } else {
                // Booking failed, increase frustration
                this.frustrationLevel += 1;
                
                if (this.frustrationLevel > 3) {
                    this.state = CHARACTER_STATES.FRUSTRATED;
                }
            }
        } else {
            // Booking failed in managed mode, increase frustration
            this.frustrationLevel += 1;
            
            if (this.frustrationLevel > 3) {
                this.state = CHARACTER_STATES.FRUSTRATED;
            }
        }
    }

    /**
     * Handles behavior when character is moving to a target space
     */
    private handleMovingState(): void {
        if (!this.targetSpace) {
            // No target space, go back to idle
            this.state = CHARACTER_STATES.IDLE;
            return;
        }
        
        // Get target position from space
        const targetX = this.targetSpace.mesh.position.x;
        const targetZ = this.targetSpace.mesh.position.z;
        
        // Calculate distance and direction to target
        const dx = targetX - this.mesh.position.x;
        const dz = targetZ - this.mesh.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        if (distance < 5) {
            // Arrived at destination
            this.state = CHARACTER_STATES.WORKING;
            
            // Try to occupy the space
            const success = this.targetSpace.occupy(this.id);
            
            if (!success) {
                // Failed to occupy, someone else may have taken it
                this.state = CHARACTER_STATES.FRUSTRATED;
                this.targetSpace = null;
            }
            return;
        }
        
        // Move toward target
        const moveSpeed = this.movementSpeed;
        const ratio = moveSpeed / distance;
        
        this.mesh.position.x += dx * ratio;
        this.mesh.position.z += dz * ratio;
        
        // Rotate character to face movement direction
        this.mesh.rotation.y = Math.atan2(dx, dz);
    }

    /**
     * Handles behavior when character is working at a space
     */
    private handleWorkingState(): void {
        // Only consider leaving occasionally
        if (this.lastThinkTime < 1) return;
        this.lastThinkTime = 0;
        
        // Small chance of finishing work (0.5% per second)
        if (Math.random() < 0.005) {
            if (this.targetSpace) {
                this.targetSpace.release();
                this.targetSpace = null;
            }
            this.state = CHARACTER_STATES.IDLE;
        }
    }

    /**
     * Handles behavior when character is frustrated
     */
    private handleFrustratedState(): void {
        // Only update occasionally
        if (this.lastThinkTime < 1) return;
        this.lastThinkTime = 0;
        
        // Reduce frustration over time
        this.frustrationLevel -= 0.5;
        
        // Pace around randomly while frustrated
        this.mesh.position.x += (Math.random() - 0.5) * 2;
        this.mesh.position.z += (Math.random() - 0.5) * 2;
        
        // Keep character within bounds
        this.mesh.position.x = Math.max(-180, Math.min(180, this.mesh.position.x));
        this.mesh.position.z = Math.max(-180, Math.min(180, this.mesh.position.z));
        
        if (this.frustrationLevel <= 0) {
            this.state = CHARACTER_STATES.IDLE;
        }
    }

    /**
     * Cleans up resources when character is no longer needed
     */
    public destroy(): void {
        // Release any held space
        if (this.targetSpace) {
            this.targetSpace.release();
            this.targetSpace = null;
        }
        
        // Dispose of geometries and materials
        [this.body, this.head].forEach(mesh => {
            if (mesh.geometry) {
                mesh.geometry.dispose();
            }
            
            if (mesh.material instanceof THREE.Material) {
                mesh.material.dispose();
            }
        });
        
        if (this.nameLabel.material instanceof THREE.SpriteMaterial) {
            if (this.nameLabel.material.map) {
                this.nameLabel.material.map.dispose();
            }
            this.nameLabel.material.dispose();
        }
    }
} 