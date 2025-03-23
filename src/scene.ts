import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BoxGeometry,
  PlaneGeometry,
  MeshStandardMaterial,
  Mesh,
  DirectionalLight,
  AmbientLight,
  Color,
  Group,
  TextureLoader,
  DoubleSide,
  Vector3,
  GridHelper
} from 'three';

export interface SceneConfig {
  container: HTMLElement;
}

export class ThreeScene {
  private scene: Scene;
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private officeLayout: Group;

  constructor(config: SceneConfig) {
    // Create a new scene
    this.scene = new Scene();
    this.scene.background = new Color(0xe8f4ff);

    // Set up camera
    this.camera = new PerspectiveCamera(
      50, // Field of view
      window.innerWidth / window.innerHeight, // Aspect ratio
      0.1, // Near clipping plane
      1000 // Far clipping plane
    );
    this.camera.position.set(0, 15, 20);
    this.camera.lookAt(0, 0, 0);

    // Set up renderer
    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    config.container.appendChild(this.renderer.domElement);

    // Add lighting
    this.setupLights();

    // Create office layout as a group
    this.officeLayout = new Group();
    this.officeLayout.position.y = 0.1; // Keep it slightly above the floor
    this.scene.add(this.officeLayout);
    
    // Add much larger floor as stable reference
    this.createFloor();
    
    // Add white surface for office layout
    this.createOfficeSurface();
    
    // Create office elements (currently commented out)
    // this.createOfficeLayout();
  }

  /**
   * Creates basic lighting setup
   */
  private setupLights(): void {
    // Main directional light
    const directionalLight = new DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 15);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    // Ambient light for general illumination
    const ambientLight = new AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
  }

  /**
   * Creates the main floor - now invisible but still present as reference
   */
  private createFloor(): void {
    // Create a large invisible floor as stable reference
    const floorGeometry = new PlaneGeometry(100, 100);
    const floorMaterial = new MeshStandardMaterial({ 
      color: 0xbbbbbb, 
      side: DoubleSide,
      roughness: 0.8,
      transparent: true,
      opacity: 0 // Make it completely invisible
    });
    const floor = new Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);
    
    // Grid helper is commented out
    // const gridHelper = new GridHelper(30, 30, 0x888888, 0xcccccc);
    // gridHelper.position.y = 0.01;
    // this.scene.add(gridHelper);
  }

  /**
   * Creates a white surface where all offices and desks will be placed
   */
  private createOfficeSurface(): void {
    // Create a white surface slightly smaller than the floor
    const surfaceGeometry = new PlaneGeometry(28, 13);
    const surfaceMaterial = new MeshStandardMaterial({ 
      color: 0xffffff, 
      side: DoubleSide,
      roughness: 0.3
    });
    const surface = new Mesh(surfaceGeometry, surfaceMaterial);
    surface.rotation.x = -Math.PI / 2;
    surface.position.y = 0; // No offset needed since it's in the officeLayout group
    surface.receiveShadow = true;
    this.officeLayout.add(surface); // Add to officeLayout instead of scene
  }

  /**
   * Creates the office layout based on the floor plan
   * Currently commented out to show only the white surface
   */
  /*
  private createOfficeLayout(): void {
    // Create office rooms (green areas on edges)
    this.createRoom(-12, 0, 6, 14, 'Mission Control');  // Left edge tall room
    this.createRoom(-12, -5, 6, 4, 'Naboo');            // Bottom left
    this.createRoom(-12, -9, 6, 6, 'Mandalore');        // Bottom left
    this.createRoom(-12, 5, 6, 4, 'Starship');          // Top left
    this.createRoom(11, 6, 6, 3, 'Millennium Falcon');  // Top right
    this.createRoom(6, -6, 6, 3, 'Solaris');            // Middle bottom right
    
    // Create desk clusters (green lego-like pieces in middle)
    this.createDeskCluster(-2, 5, 3, 2, 'Pulsar');      // Top middle left
    this.createDeskCluster(2, 5, 3, 2, 'Star Dust');    // Top middle
    this.createDeskCluster(6, 5, 3, 2, 'Comet');        // Top middle right
    this.createDeskCluster(10, 5, 3, 2, 'Meteor');      // Top right
    this.createDeskCluster(-2, 0, 3, 2, 'Asteroid');    // Middle

    // Create facilities and extras (blue squares)
    this.createFacility(10, 0, 1, 1, 0x4040cc, 'Paper Shredder');
    this.createFacility(7, -3, 1, 1, 0x4040cc, 'Coffee');
    this.createFacility(9, -3, 1, 1, 0x4040cc, 'Water');
    this.createFacility(2, 0, 1, 1, 0x4040cc, 'Office Supplies');
    this.createFacility(6, 0, 1, 1, 0x4040cc, 'Snacks');
  }
  */

  /**
   * Creates a flat office room
   */
  /*
  private createRoom(x: number, z: number, width: number, depth: number, name: string): void {
    // Room floor (completely flat)
    const roomGeometry = new PlaneGeometry(width, depth);
    const roomMaterial = new MeshStandardMaterial({ 
      color: 0x7cb342, 
      side: DoubleSide
    });
    const room = new Mesh(roomGeometry, roomMaterial);
    room.rotation.x = -Math.PI / 2; // Make it horizontal
    room.position.set(x, 0.01, z); // Slightly above the white surface
    this.officeLayout.add(room);
    
    console.log(`Created room: ${name} at position (${x}, ${z})`);
  }
  */

  /**
   * Creates a flat desk cluster
   */
  /*
  private createDeskCluster(x: number, z: number, width: number, depth: number, name: string): void {
    // Create a flat plane for the desk cluster
    const deskGeometry = new PlaneGeometry(width, depth);
    const deskMaterial = new MeshStandardMaterial({ 
      color: 0x8bc34a, 
      side: DoubleSide
    });
    const desk = new Mesh(deskGeometry, deskMaterial);
    desk.rotation.x = -Math.PI / 2; // Make it horizontal
    desk.position.set(x, 0.01, z); // Slightly above the white surface
    this.officeLayout.add(desk);
    
    console.log(`Created desk cluster: ${name} at position (${x}, ${z})`);
  }
  */

  /**
   * Creates a flat facility object (blue squares)
   */
  /*
  private createFacility(x: number, z: number, width: number, depth: number, color: number, name: string): void {
    const facilityGeometry = new PlaneGeometry(width, depth);
    const facilityMaterial = new MeshStandardMaterial({ 
      color: color, 
      side: DoubleSide
    });
    const facility = new Mesh(facilityGeometry, facilityMaterial);
    facility.rotation.x = -Math.PI / 2; // Make it horizontal
    facility.position.set(x, 0.01, z); // Slightly above the white surface
    this.officeLayout.add(facility);
    
    console.log(`Created facility: ${name} at position (${x}, ${z})`);
  }
  */

  /**
   * Animation loop
   * @param time Current time from the animation loop
   * @param autoRotate Whether to auto-rotate the model
   */
  public update(time: number, autoRotate: boolean = false): void {
    // Rotate the entire layout if auto-rotation is enabled (default is now false)
    if (autoRotate) {
      this.officeLayout.rotation.y = time * 0.1;
    }
    
    // Ensure the layout doesn't tilt on the x-axis
    this.officeLayout.rotation.x = 0;
    this.officeLayout.rotation.z = 0;
    
    // Keep the layout at a fixed height
    this.officeLayout.position.y = 0.1; 
    
    // Render the scene
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Get the camera instance
   * @returns The scene's camera
   */
  public getCamera(): PerspectiveCamera {
    return this.camera;
  }

  /**
   * Get the renderer instance
   * @returns The scene's renderer
   */
  public getRenderer(): WebGLRenderer {
    return this.renderer;
  }
  
  /**
   * Get the office layout group
   * @returns The office layout group
   */
  public getOfficeLayout(): Group {
    return this.officeLayout;
  }
} 