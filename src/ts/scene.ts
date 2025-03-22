import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

/**
 * Manages the 3D scene, camera, lights, and renderer
 * Handles scene setup and rendering loop
 */
export class Scene3D {
    // Scene elements
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private controls: OrbitControls;
    private domElement: HTMLCanvasElement;

    // Lighting
    private ambientLight: THREE.AmbientLight;
    private directionalLight: THREE.DirectionalLight;

    /**
     * Creates a new 3D scene
     * @param canvas - The HTML canvas element for rendering
     */
    constructor(canvas: HTMLCanvasElement) {
        this.domElement = canvas;
        this.scene = new THREE.Scene();
        
        // Set background color
        this.scene.background = new THREE.Color(0xf0f0f0);
        
        // Set up camera
        this.camera = this.setupCamera();
        
        // Set up renderer
        this.renderer = this.setupRenderer();
        
        // Set up lights
        this.ambientLight = this.setupAmbientLight();
        this.directionalLight = this.setupDirectionalLight();
        
        // Add floor
        this.setupFloor();
        
        // Add walls
        this.setupWalls();
        
        // Set up orbit controls
        this.controls = this.setupControls();
        
        // Handle window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    /**
     * Sets up the camera
     * @returns The configured camera
     */
    private setupCamera(): THREE.PerspectiveCamera {
        const camera = new THREE.PerspectiveCamera(
            60, // Field of view
            this.domElement.width / this.domElement.height, // Aspect ratio
            0.1, // Near clipping plane
            1000 // Far clipping plane
        );
        
        // Position camera for good overview of the office
        camera.position.set(0, 250, 200);
        camera.lookAt(0, 0, 0);
        
        return camera;
    }

    /**
     * Sets up the WebGL renderer
     * @returns The configured renderer
     */
    private setupRenderer(): THREE.WebGLRenderer {
        const renderer = new THREE.WebGLRenderer({
            canvas: this.domElement,
            antialias: true
        });
        
        // Set renderer size to match canvas
        renderer.setSize(this.domElement.clientWidth, this.domElement.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        
        // Enable shadows for realistic rendering
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        return renderer;
    }

    /**
     * Sets up ambient lighting
     * @returns The configured ambient light
     */
    private setupAmbientLight(): THREE.AmbientLight {
        const light = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(light);
        return light;
    }

    /**
     * Sets up directional lighting (simulates sunlight)
     * @returns The configured directional light
     */
    private setupDirectionalLight(): THREE.DirectionalLight {
        const light = new THREE.DirectionalLight(0xffffff, 0.8);
        light.position.set(100, 200, 100);
        light.castShadow = true;
        
        // Configure shadow properties
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 500;
        light.shadow.camera.left = -200;
        light.shadow.camera.right = 200;
        light.shadow.camera.top = 200;
        light.shadow.camera.bottom = -200;
        
        this.scene.add(light);
        return light;
    }

    /**
     * Sets up the floor of the office
     */
    private setupFloor(): void {
        // Create floor geometry and material
        const floorGeometry = new THREE.PlaneGeometry(400, 400);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0xeeeeee,
            roughness: 0.8
        });
        
        // Create floor mesh
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        floor.receiveShadow = true;
        
        this.scene.add(floor);
    }

    /**
     * Sets up walls around the office perimeter
     */
    private setupWalls(): void {
        const wallHeight = 50;
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0xdddddd,
            roughness: 0.7
        });
        
        // Create north wall
        const northWallGeometry = new THREE.BoxGeometry(400, wallHeight, 5);
        const northWall = new THREE.Mesh(northWallGeometry, wallMaterial);
        northWall.position.set(0, wallHeight / 2, -200);
        northWall.castShadow = true;
        this.scene.add(northWall);
        
        // Create south wall
        const southWall = northWall.clone();
        southWall.position.set(0, wallHeight / 2, 200);
        this.scene.add(southWall);
        
        // Create east wall
        const eastWallGeometry = new THREE.BoxGeometry(5, wallHeight, 400);
        const eastWall = new THREE.Mesh(eastWallGeometry, wallMaterial);
        eastWall.position.set(200, wallHeight / 2, 0);
        eastWall.castShadow = true;
        this.scene.add(eastWall);
        
        // Create west wall
        const westWall = eastWall.clone();
        westWall.position.set(-200, wallHeight / 2, 0);
        this.scene.add(westWall);
    }

    /**
     * Sets up orbit controls for camera interaction
     * @returns The configured orbit controls
     */
    private setupControls(): OrbitControls {
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 50;
        controls.maxDistance = 500;
        controls.maxPolarAngle = Math.PI / 2 - 0.1; // Prevent camera going below ground
        return controls;
    }

    /**
     * Handles window resize events
     */
    private onWindowResize(): void {
        // Update camera aspect ratio
        this.camera.aspect = this.domElement.clientWidth / this.domElement.clientHeight;
        this.camera.updateProjectionMatrix();
        
        // Update renderer size
        this.renderer.setSize(this.domElement.clientWidth, this.domElement.clientHeight);
    }

    /**
     * Converts 2D coordinates to 3D world coordinates
     * @param x - X coordinate in 2D space
     * @param y - Y coordinate in 2D space
     * @returns Object containing 3D coordinates
     */
    public convertToWorldCoordinates(x: number, y: number): { x: number; y: number; z: number } {
        return {
            x: x - 200,
            y: 0,
            z: y - 200
        };
    }

    /**
     * Adds an object to the scene
     * @param object - The 3D object to add
     */
    public add(object: THREE.Object3D): void {
        this.scene.add(object);
    }

    /**
     * Removes an object from the scene
     * @param object - The 3D object to remove
     */
    public remove(object: THREE.Object3D): void {
        this.scene.remove(object);
    }

    /**
     * Renders the scene
     */
    public render(): void {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Cleans up resources when scene is no longer needed
     */
    public destroy(): void {
        // Remove event listeners
        window.removeEventListener('resize', this.onWindowResize.bind(this));
        
        // Dispose of renderer
        this.renderer.dispose();
        
        // Dispose of geometries and materials
        this.scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                if (object.geometry) {
                    object.geometry.dispose();
                }
                
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            }
        });
    }
} 