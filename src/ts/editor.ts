import * as THREE from 'three';
import { SIMULATION_CONFIG, SPACE_TYPES } from './constants';
import { SpaceType, Position, OfficeLayout } from './types';
import { Scene3D } from './scene';

/**
 * Layout editor for creating and modifying office layouts
 * Provides a grid-based UI for adding/removing spaces
 */
export class LayoutEditor {
    private scene: Scene3D;
    private selectedSpaceType: SpaceType;
    private isActive: boolean;
    private spaces: THREE.Mesh[];
    private gridHelper: THREE.GridHelper;
    private raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;
    private hoveredCell: Position | null;
    private domElement: HTMLCanvasElement;
    private previewMesh: THREE.Mesh | null;

    /**
     * Creates a new layout editor
     * @param scene - The 3D scene to add editor elements to
     * @param domElement - The canvas element for input handling
     */
    constructor(scene: Scene3D, domElement: HTMLCanvasElement) {
        this.scene = scene;
        this.domElement = domElement;
        this.selectedSpaceType = SPACE_TYPES.DESK;
        this.isActive = false;
        this.spaces = [];
        this.hoveredCell = null;
        this.previewMesh = null;

        // Initialize raycaster and mouse position tracker
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // Create grid for placing spaces
        this.gridHelper = this.createGridHelper();
        this.scene.add(this.gridHelper);

        // Bind event listeners
        this.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.domElement.addEventListener('click', this.onClick.bind(this));
    }

    /**
     * Creates the grid helper to guide space placement
     * @returns The created grid helper
     */
    private createGridHelper(): THREE.GridHelper {
        const size = 400; // Match office size
        const divisions = 20; // 20x20 grid cells
        const grid = new THREE.GridHelper(size, divisions);
        
        // Rotate grid to horizontal plane (floor)
        grid.rotation.x = Math.PI / 2;
        
        // Initially hide the grid
        grid.visible = false;
        
        return grid;
    }

    /**
     * Sets whether the editor is active
     * @param active - Whether to activate the editor
     */
    public setActive(active: boolean): void {
        this.isActive = active;
        this.gridHelper.visible = active;
        
        // Remove preview mesh when deactivating
        if (!active && this.previewMesh) {
            this.scene.remove(this.previewMesh);
            this.previewMesh = null;
            this.hoveredCell = null;
        }
    }

    /**
     * Gets whether the editor is active
     * @returns Current active state
     */
    public isEditorActive(): boolean {
        return this.isActive;
    }

    /**
     * Sets the type of space to place (desk or meeting room)
     * @param type - The space type to use
     */
    public setSelectedSpaceType(type: SpaceType): void {
        this.selectedSpaceType = type;
        
        // Update preview if active
        if (this.hoveredCell && this.isActive) {
            this.updatePreview(this.hoveredCell.x, this.hoveredCell.y);
        }
    }

    /**
     * Handles mouse movement events
     * @param event - Mouse event
     */
    private onMouseMove(event: MouseEvent): void {
        if (!this.isActive) return;

        // Calculate mouse position in normalized device coordinates
        const rect = this.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / this.domElement.clientWidth) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / this.domElement.clientHeight) * 2 + 1;

        // Cast ray into scene to determine where mouse is pointing
        this.raycaster.setFromCamera(this.mouse, (this.scene as any).camera);

        // Create a horizontal plane at y=0 to intersect with ray
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const intersection = new THREE.Vector3();
        
        // Calculate intersection point with plane
        const intersects = this.raycaster.ray.intersectPlane(plane, intersection);
        
        if (intersects) {
            // Snap to grid (20x20 cells)
            const gridSize = 20;
            const gridX = Math.floor(intersection.x / gridSize) * gridSize;
            const gridZ = Math.floor(intersection.z / gridSize) * gridSize;
            
            // Check if cell has changed
            const newHoveredCell = { x: gridX, y: gridZ };
            
            if (!this.hoveredCell || 
                this.hoveredCell.x !== newHoveredCell.x || 
                this.hoveredCell.y !== newHoveredCell.y) {
                
                this.hoveredCell = newHoveredCell;
                this.updatePreview(gridX, gridZ);
            }
        }
    }

    /**
     * Updates the preview mesh at the hovered grid cell
     * @param x - X coordinate (grid-aligned)
     * @param y - Y coordinate (grid-aligned)
     */
    private updatePreview(x: number, y: number): void {
        // Remove existing preview
        if (this.previewMesh) {
            this.scene.remove(this.previewMesh);
        }
        
        // Get dimensions based on space type
        const width = this.selectedSpaceType === SPACE_TYPES.DESK 
            ? SIMULATION_CONFIG.DESK_WIDTH 
            : SIMULATION_CONFIG.MEETING_ROOM_WIDTH;
            
        const height = this.selectedSpaceType === SPACE_TYPES.DESK 
            ? SIMULATION_CONFIG.DESK_HEIGHT 
            : SIMULATION_CONFIG.MEETING_ROOM_HEIGHT;
        
        // Check if space already exists at this location
        const spaceExists = this.checkSpaceExists(x, y, width, height);
        
        // Create preview geometry
        const geometry = new THREE.BoxGeometry(width, 2, height);
        
        const material = new THREE.MeshBasicMaterial({
            color: spaceExists ? 0xFF0000 : 0x00FF00, // Red if space exists, green if clear
            transparent: true,
            opacity: 0.5,
            wireframe: false
        });
        
        this.previewMesh = new THREE.Mesh(geometry, material);
        this.previewMesh.position.set(x, 1, y); // Slightly above floor
        
        this.scene.add(this.previewMesh);
    }

    /**
     * Checks if a space already exists at the specified position
     * @param x - X position
     * @param y - Y position
     * @param width - Space width
     * @param height - Space height
     * @returns True if a space exists at this position
     */
    private checkSpaceExists(x: number, y: number, width: number, height: number): boolean {
        return this.spaces.some(space => {
            // Check for overlap with existing space
            const spaceX = space.position.x;
            const spaceZ = space.position.z;
            const spaceWidth = (space.geometry as THREE.BoxGeometry).parameters.width;
            const spaceHeight = (space.geometry as THREE.BoxGeometry).parameters.depth;
            
            return !(
                x + width/2 < spaceX - spaceWidth/2 ||
                x - width/2 > spaceX + spaceWidth/2 ||
                y + height/2 < spaceZ - spaceHeight/2 ||
                y - height/2 > spaceZ + spaceHeight/2
            );
        });
    }

    /**
     * Handles mouse click events
     * @param event - Mouse event
     */
    private onClick(event: MouseEvent): void {
        if (!this.isActive || !this.hoveredCell) return;
        
        const { x, y } = this.hoveredCell;
        const width = this.selectedSpaceType === SPACE_TYPES.DESK 
            ? SIMULATION_CONFIG.DESK_WIDTH 
            : SIMULATION_CONFIG.MEETING_ROOM_WIDTH;
            
        const height = this.selectedSpaceType === SPACE_TYPES.DESK 
            ? SIMULATION_CONFIG.DESK_HEIGHT 
            : SIMULATION_CONFIG.MEETING_ROOM_HEIGHT;
        
        // Find existing space at this location
        const existingSpace = this.spaces.find(space => {
            return this.checkSpaceExists(x, y, width, height);
        });
        
        if (existingSpace) {
            // Remove existing space
            this.scene.remove(existingSpace);
            this.spaces = this.spaces.filter(space => space !== existingSpace);
            
            // Update preview after removal
            this.updatePreview(x, y);
        } else {
            // Add new space
            const geometry = new THREE.BoxGeometry(width, 
                this.selectedSpaceType === SPACE_TYPES.DESK ? 5 : 30, 
                height);
                
            const material = new THREE.MeshStandardMaterial({
                color: this.selectedSpaceType === SPACE_TYPES.DESK ? 0x8D6E63 : 0xBDBDBD,
                transparent: this.selectedSpaceType === SPACE_TYPES.MEETING_ROOM,
                opacity: this.selectedSpaceType === SPACE_TYPES.MEETING_ROOM ? 0.6 : 1.0,
                roughness: 0.7,
                metalness: 0.2
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(x, this.selectedSpaceType === SPACE_TYPES.DESK ? 2.5 : 15, y);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            
            // Store space type in user data
            mesh.userData.type = this.selectedSpaceType;
            
            // Add to scene and space array
            this.scene.add(mesh);
            this.spaces.push(mesh);
            
            // Update preview to show it's occupied now
            this.updatePreview(x, y);
        }
    }

    /**
     * Gets the current office layout
     * @returns Office layout definition
     */
    public getLayout(): OfficeLayout {
        return {
            spaces: this.spaces.map(space => {
                const geometry = space.geometry as THREE.BoxGeometry;
                return {
                    type: space.userData.type,
                    x: space.position.x,
                    y: space.position.z,
                    width: geometry.parameters.width,
                    height: geometry.parameters.depth
                };
            })
        };
    }

    /**
     * Loads an office layout into the editor
     * @param layout - Office layout to load
     */
    public loadLayout(layout: OfficeLayout): void {
        // Clear existing spaces
        this.clear();
        
        // Create spaces from layout
        layout.spaces.forEach(spaceData => {
            const width = spaceData.width;
            const height = spaceData.height;
            const isDesk = spaceData.type === SPACE_TYPES.DESK;
            
            // Create geometry and material
            const geometry = new THREE.BoxGeometry(
                width, 
                isDesk ? 5 : 30, 
                height
            );
                
            const material = new THREE.MeshStandardMaterial({
                color: isDesk ? 0x8D6E63 : 0xBDBDBD,
                transparent: !isDesk,
                opacity: isDesk ? 1.0 : 0.6,
                roughness: 0.7,
                metalness: 0.2
            });
            
            // Create mesh
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(
                spaceData.x, 
                isDesk ? 2.5 : 15, 
                spaceData.y
            );
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            
            // Store space type
            mesh.userData.type = spaceData.type;
            
            // Add to scene and space array
            this.scene.add(mesh);
            this.spaces.push(mesh);
        });
    }

    /**
     * Clears all spaces from the editor
     */
    public clear(): void {
        // Remove all spaces from scene
        this.spaces.forEach(space => {
            this.scene.remove(space);
            
            // Clean up geometry and material
            if (space.geometry) {
                space.geometry.dispose();
            }
            
            if (space.material instanceof THREE.Material) {
                space.material.dispose();
            } else if (Array.isArray(space.material)) {
                space.material.forEach(material => material.dispose());
            }
        });
        
        // Clear space array
        this.spaces = [];
    }

    /**
     * Destroys the editor and cleans up resources
     */
    public destroy(): void {
        // Remove event listeners
        this.domElement.removeEventListener('mousemove', this.onMouseMove.bind(this));
        this.domElement.removeEventListener('click', this.onClick.bind(this));
        
        // Clear spaces
        this.clear();
        
        // Remove grid helper
        if (this.gridHelper) {
            this.scene.remove(this.gridHelper);
        }
        
        // Remove preview mesh
        if (this.previewMesh) {
            this.scene.remove(this.previewMesh);
            
            if (this.previewMesh.geometry) {
                this.previewMesh.geometry.dispose();
            }
            
            if (this.previewMesh.material instanceof THREE.Material) {
                this.previewMesh.material.dispose();
            }
        }
    }
} 