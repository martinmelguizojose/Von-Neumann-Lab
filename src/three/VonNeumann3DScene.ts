import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createPcbTexture, createChipTexture } from './proceduralTextures';
import { PieceId, PlacedPiecesState } from '../types/puzzle';

export interface ComponentMeshItem {
  id: PieceId;
  name: string;
  group: THREE.Group;
  mountedPos: THREE.Vector3;
  unmountedPos: THREE.Vector3;
  explodedOffset: THREE.Vector3;
  isMounted: boolean;
  color: number;
}

export interface SocketItem {
  id: PieceId;
  name: string;
  mesh: THREE.Mesh;
  position: THREE.Vector3; // relative or world
  color: number;
  highlightMaterial: THREE.MeshStandardMaterial;
  baseMaterial: THREE.MeshStandardMaterial;
  lineMesh: THREE.LineSegments;
  neutralLineMaterial: THREE.LineBasicMaterial;
  activeLineMaterial: THREE.LineBasicMaterial;
}

interface StraightBusSegment {
  start: THREE.Vector3;
  end: THREE.Vector3;
  color: number;
  particles: THREE.Points;
  direction: 'forward' | 'backward' | 'bidirectional';
}

export class VonNeumann3DScene {
  public container: HTMLElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private animationFrameId: number | null = null;
  private clock: THREE.Clock;
  private resizeObserver: ResizeObserver | null = null;

  // Orbit controls state
  public target: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private cameraRadius: number = 30;
  private cameraTheta: number = Math.PI / 4;
  private cameraPhi: number = Math.PI / 3.4;
  private targetRadius: number = 30;
  private targetTheta: number = Math.PI / 4;
  private targetPhi: number = Math.PI / 3.4;

  private isDraggingCamera: boolean = false;
  private isPanning: boolean = false;
  private previousMousePosition = { x: 0, y: 0 };

  // 3D Drag & Drop state
  public draggedItem: ComponentMeshItem | null = null;
  private dragPlane: THREE.Plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.6);
  private planeIntersectPoint: THREE.Vector3 = new THREE.Vector3();

  // Exploded view
  public explodedValue: number = 0;
  private targetExplodedValue: number = 0;

  // Raycasting & selection
  private raycaster: THREE.Raycaster;
  private mouseVec: THREE.Vector2;
  public onSelectPiece?: (pieceId: PieceId | null) => void;
  public onPieceMountChanged?: (pieceId: PieceId, isMounted: boolean) => void;
  public onWrongSlotClicked?: (attemptedPiece: string, targetSlot: string) => void;
  public selectedPieceId: PieceId | null = null;

  // Sockets & Highlight
  public sockets: Map<PieceId, SocketItem> = new Map();
  public hoveredSocketId: PieceId | null = null;

  // 3D Groups
  public cpuGroup!: THREE.Group;
  public aluGroup!: THREE.Group;
  public ucGroup!: THREE.Group;
  public regGroup!: THREE.Group;

  // 3D Objects mapping
  public components: Map<PieceId, ComponentMeshItem> = new Map();
  public busSegments: StraightBusSegment[] = [];
  public isSimulating: boolean = false;

  constructor(container: HTMLElement) {
    this.container = container;
    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.mouseVec = new THREE.Vector2();

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#030712');

    // 2. Camera - safe dimensions preventing Infinity or NaN
    const initialWidth = container.clientWidth > 0 ? container.clientWidth : (window.innerWidth || 1280);
    const initialHeight = container.clientHeight > 0 ? container.clientHeight : (Math.max(580, window.innerHeight - 64));
    const aspect = initialWidth / initialHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    this.updateCameraPosition();

    // 3. Renderer with PBR standard configuration and drawing buffer preservation for certificates
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: false, 
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true 
    });
    this.renderer.setSize(initialWidth, initialHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(this.renderer.domElement);

    // 4. RoomEnvironment for metallic PBR reflections
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Studio Lighting Rig
    this.setupLighting();

    // 6. Build 3D Models & Sockets
    this.buildGroundGrid();
    this.buildMotherboard();
    this.buildCpuAndInternals();
    this.buildMotherboardSockets();
    this.buildRamModule();
    this.buildIoInterface();
    this.buildOrthogonalBuses();

    // 7. Event listeners & ResizeObserver
    this.bindEvents();

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.onResize();
      });
      this.resizeObserver.observe(this.container);
    }

    // 8. Animation loop
    this.animate = this.animate.bind(this);
    this.animate();
  }

  private _loggedOnce = false;

  private setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(18, 30, 18);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 90;
    keyLight.shadow.camera.left = -22;
    keyLight.shadow.camera.right = 22;
    keyLight.shadow.camera.top = 22;
    keyLight.shadow.camera.bottom = -22;
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
    rimLight.position.set(-18, 14, -18);
    this.scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xfde047, 0.8);
    fillLight.position.set(0, 12, -20);
    this.scene.add(fillLight);
  }

  private buildGroundGrid() {
    const gridHelper = new THREE.GridHelper(56, 56, 0x38bdf8, 0x1e293b);
    gridHelper.position.y = -0.05;
    this.scene.add(gridHelper);

    const shadowGeo = new THREE.PlaneGeometry(36, 36);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.5,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -0.02;
    this.scene.add(shadowMesh);
  }

  private buildMotherboard() {
    const pcbTexture = createPcbTexture(this.renderer);

    // Main PCB board (24 x 24 units, thickness 0.4)
    const pcbGeo = new THREE.BoxGeometry(24, 0.4, 24);
    const pcbMat = new THREE.MeshStandardMaterial({
      map: pcbTexture,
      roughness: 0.35,
      metalness: 0.15
    });
    const pcbMesh = new THREE.Mesh(pcbGeo, pcbMat);
    pcbMesh.position.y = 0.2;
    pcbMesh.receiveShadow = true;
    this.scene.add(pcbMesh);

    // 4 Corner Gold Screws
    const screwGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.5, 16);
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.9, roughness: 0.2 });
    const screwCoords = [
      [-11, 0.45, -11],
      [11, 0.45, -11],
      [-11, 0.45, 11],
      [11, 0.45, 11]
    ];
    screwCoords.forEach(([x, y, z]) => {
      const screw = new THREE.Mesh(screwGeo, goldMat);
      screw.position.set(x, y, z);
      this.scene.add(screw);
    });

    // Outer workbench trays to hold unmounted pieces at the SAME LEVEL Y ≈ 0.55 (spacious, zero overlaps)
    const trayGeoL = new THREE.BoxGeometry(14, 0.2, 32);
    const trayMat = new THREE.MeshStandardMaterial({ color: 0x09121d, roughness: 0.7, metalness: 0.1 });
    const trayL = new THREE.Mesh(trayGeoL, trayMat);
    trayL.position.set(-21, 0.1, 0);
    this.scene.add(trayL);

    const trayGeoR = new THREE.BoxGeometry(14, 0.2, 32);
    const trayR = new THREE.Mesh(trayGeoR, trayMat);
    trayR.position.set(21, 0.1, 0);
    this.scene.add(trayR);

    // Official engraved student identification nameplate on Motherboard
    this.buildStudentNamePlate();
  }

  /**
   * Sockets directly on the Motherboard (CPU, RAM, IO, Buses).
   */
  private buildMotherboardSockets() {
    // 1. CPU Socket on Motherboard
    this.createSocket(
      'cpu',
      'Zócalo CPU en la Placa',
      new THREE.Vector3(-5, 0.42, -4),
      new THREE.BoxGeometry(8, 0.22, 8),
      0xf59e0b,
      this.scene
    );

    // 2. RAM Slot on Motherboard
    this.createSocket(
      'memoria',
      'Ranura Memoria RAM',
      new THREE.Vector3(5.5, 0.42, -3),
      new THREE.BoxGeometry(2.4, 0.25, 13.5),
      0x10b981,
      this.scene
    );

    // 3. I/O Socket on Motherboard
    this.createSocket(
      'io',
      'Zócalo Entrada y Salida (E/S)',
      new THREE.Vector3(-5, 0.42, 6),
      new THREE.BoxGeometry(7, 0.22, 6.2),
      0xa855f7,
      this.scene
    );

    // 4. Buses Bed on Motherboard
    this.createSocket(
      'buses',
      'Canal de Buses del Sistema',
      new THREE.Vector3(0, 0.42, 0.5),
      new THREE.BoxGeometry(18, 0.16, 12),
      0x38bdf8,
      this.scene
    );
  }

  /**
   * Builds the CPU and its internal sockets & sub-pieces.
   * Note: The sockets for ALU, UC, and Registros are children of cpuGroup,
   * so they are ON THE CPU whether the CPU is on the workbench or on the motherboard!
   */
  private buildCpuAndInternals() {
    this.cpuGroup = new THREE.Group();
    this.cpuGroup.name = 'cpu';

    // Substrate
    const subGeo = new THREE.BoxGeometry(7.2, 0.3, 7.2);
    const subMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.3, metalness: 0.4 });
    const subMesh = new THREE.Mesh(subGeo, subMat);
    subMesh.position.y = 0.15;
    subMesh.castShadow = true;
    this.cpuGroup.add(subMesh);

    // Heatspreader frame
    const hsGeo = new THREE.BoxGeometry(6.6, 0.2, 6.6);
    const hsMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.2 });
    const hsMesh = new THREE.Mesh(hsGeo, hsMat);
    hsMesh.position.y = 0.35;
    this.cpuGroup.add(hsMesh);

    // INTERNAL SOCKETS INSIDE THE CPU!
    // Elevated slightly (Y = 0.46) so they sit clearly on top of heatspreader with vivid colors
    this.createSocket(
      'alu',
      'Hueco ALU (Calculadora)',
      new THREE.Vector3(-1.5, 0.46, -1.5),
      new THREE.BoxGeometry(2.9, 0.12, 2.9),
      0x10b981, // Vibrant Green
      this.cpuGroup
    );

    this.createSocket(
      'uc',
      'Hueco UC (Unidad de Control)',
      new THREE.Vector3(1.5, 0.46, -1.5),
      new THREE.BoxGeometry(2.9, 0.12, 2.9),
      0xf43f5e, // Vibrant Rose
      this.cpuGroup
    );

    this.createSocket(
      'registros',
      'Hueco Registros Internos',
      new THREE.Vector3(0, 0.46, 1.6),
      new THREE.BoxGeometry(5.9, 0.12, 2.3),
      0xf59e0b, // Vibrant Gold
      this.cpuGroup
    );

    // Build the sub-piece groups:
    // 1. ALU Module
    this.aluGroup = new THREE.Group();
    this.aluGroup.name = 'alu';
    const aluGeo = new THREE.BoxGeometry(2.8, 0.35, 2.8);
    const aluTex = createChipTexture('ALU', 'CALCULADORA', this.renderer);
    const aluMat = new THREE.MeshStandardMaterial({ map: aluTex, roughness: 0.3, metalness: 0.3 });
    const aluMesh = new THREE.Mesh(aluGeo, aluMat);
    aluMesh.position.y = 0.2;
    aluMesh.castShadow = true;
    this.aluGroup.add(aluMesh);

    // 2. UC Module
    this.ucGroup = new THREE.Group();
    this.ucGroup.name = 'uc';
    const ucGeo = new THREE.BoxGeometry(2.8, 0.35, 2.8);
    const ucTex = createChipTexture('UC', 'CONTROL UNIT', this.renderer);
    const ucMat = new THREE.MeshStandardMaterial({ map: ucTex, roughness: 0.3, metalness: 0.3 });
    const ucMesh = new THREE.Mesh(ucGeo, ucMat);
    ucMesh.position.y = 0.2;
    ucMesh.castShadow = true;
    this.ucGroup.add(ucMesh);

    // 3. Registros Module
    this.regGroup = new THREE.Group();
    this.regGroup.name = 'registros';
    const regGeo = new THREE.BoxGeometry(5.8, 0.3, 2.2);
    const regTex = createChipTexture('REGISTROS', 'PC - IR - ACC', this.renderer);
    const regMat = new THREE.MeshStandardMaterial({ map: regTex, roughness: 0.3, metalness: 0.5 });
    const regMesh = new THREE.Mesh(regGeo, regMat);
    regMesh.position.y = 0.2;
    regMesh.castShadow = true;
    this.regGroup.add(regMesh);

    // Non-overlapping initial placement on Left Workbench
    const cpuMountedPos = new THREE.Vector3(-5, 0.55, -4);
    const cpuUnmountedPos = new THREE.Vector3(-21, 0.55, 6);
    this.cpuGroup.position.copy(cpuUnmountedPos);
    this.scene.add(this.cpuGroup);

    // Cleanly spaced unmounted positions for ALU, UC, Registros (NO OVERLAP)
    const aluUnmountedPos = new THREE.Vector3(-24, 0.55, -7);
    const ucUnmountedPos = new THREE.Vector3(-18, 0.55, -7);
    const regUnmountedPos = new THREE.Vector3(-21, 0.55, -0.5);

    this.aluGroup.position.copy(aluUnmountedPos);
    this.ucGroup.position.copy(ucUnmountedPos);
    this.regGroup.position.copy(regUnmountedPos);

    this.scene.add(this.aluGroup);
    this.scene.add(this.ucGroup);
    this.scene.add(this.regGroup);

    this.components.set('cpu', {
      id: 'cpu',
      name: 'CPU (Microprocesador)',
      group: this.cpuGroup,
      mountedPos: cpuMountedPos,
      unmountedPos: cpuUnmountedPos,
      explodedOffset: new THREE.Vector3(0, 4, 0),
      isMounted: false,
      color: 0xf59e0b
    });

    this.components.set('alu', {
      id: 'alu',
      name: 'ALU (Unidad Aritmético-Lógica)',
      group: this.aluGroup,
      mountedPos: new THREE.Vector3(-1.5, 0.52, -1.5), // relative to CPU!
      unmountedPos: aluUnmountedPos,
      explodedOffset: new THREE.Vector3(-1.5, 6, -1.5),
      isMounted: false,
      color: 0x10b981
    });

    this.components.set('uc', {
      id: 'uc',
      name: 'Unidad de Control (UC)',
      group: this.ucGroup,
      mountedPos: new THREE.Vector3(1.5, 0.52, -1.5), // relative to CPU!
      unmountedPos: ucUnmountedPos,
      explodedOffset: new THREE.Vector3(1.5, 6, -1.5),
      isMounted: false,
      color: 0xf43f5e
    });

    this.components.set('registros', {
      id: 'registros',
      name: 'Registros Internos',
      group: this.regGroup,
      mountedPos: new THREE.Vector3(0, 0.52, 1.6), // relative to CPU!
      unmountedPos: regUnmountedPos,
      explodedOffset: new THREE.Vector3(0, 6, 2),
      isMounted: false,
      color: 0xeab308
    });
  }

  private createSocket(
    id: PieceId, 
    name: string, 
    pos: THREE.Vector3, 
    geo: THREE.BufferGeometry, 
    color: number,
    parent: THREE.Object3D
  ) {
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x0b1320,
      emissive: color,
      emissiveIntensity: 0.25, // Visible colored tint on the socket floor
      roughness: 0.6,
      metalness: 0.3,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1
    });

    const highlightMaterial = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 1.3, // Bright vibrant illumination when hovered/targeted
      roughness: 0.2,
      metalness: 0.5
    });

    const mesh = new THREE.Mesh(geo, baseMaterial);
    mesh.position.copy(pos);
    mesh.name = `socket_${id}`;
    mesh.receiveShadow = true;
    parent.add(mesh);

    // Border frame for the socket: clearly colored outline matching component
    const edges = new THREE.EdgesGeometry(geo);
    const neutralLineMaterial = new THREE.LineBasicMaterial({ color: color, linewidth: 2, transparent: true, opacity: 0.65 });
    const activeLineMaterial = new THREE.LineBasicMaterial({ color: color, linewidth: 3, transparent: true, opacity: 1.0 });
    const lineMesh = new THREE.LineSegments(edges, neutralLineMaterial);
    lineMesh.position.copy(pos);
    parent.add(lineMesh);

    this.sockets.set(id, {
      id,
      name,
      mesh,
      position: pos,
      color,
      baseMaterial,
      highlightMaterial,
      lineMesh,
      neutralLineMaterial,
      activeLineMaterial
    });
  }

  private buildRamModule() {
    const ramGroup = new THREE.Group();
    ramGroup.name = 'memoria';

    const pcbGeo = new THREE.BoxGeometry(0.3, 3.2, 12);
    const ramMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.35, metalness: 0.2 });
    const ramStick = new THREE.Mesh(pcbGeo, ramMat);
    ramStick.position.y = 1.6;
    ramStick.castShadow = true;
    ramGroup.add(ramStick);

    const goldPinsGeo = new THREE.BoxGeometry(0.35, 0.4, 11.6);
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.9, roughness: 0.1 });
    const goldPins = new THREE.Mesh(goldPinsGeo, goldMat);
    goldPins.position.y = 0.2;
    ramGroup.add(goldPins);

    const chipGeo = new THREE.BoxGeometry(0.2, 1.2, 1.6);
    const chipTex = createChipTexture('DRAM', 'RAM', this.renderer);
    const chipMat = new THREE.MeshStandardMaterial({ map: chipTex, roughness: 0.4, metalness: 0.2 });

    for (let i = 0; i < 4; i++) {
      const z = -4.2 + i * 2.8;
      const chipF = new THREE.Mesh(chipGeo, chipMat);
      chipF.position.set(0.2, 1.8, z);
      chipF.castShadow = true;
      ramGroup.add(chipF);
      const chipB = new THREE.Mesh(chipGeo, chipMat);
      chipB.position.set(-0.2, 1.8, z);
      chipB.castShadow = true;
      ramGroup.add(chipB);
    }

    const mountedPos = new THREE.Vector3(5.5, 0.6, -3);
    const unmountedPos = new THREE.Vector3(21, 0.6, -8);
    ramGroup.position.copy(unmountedPos);
    this.scene.add(ramGroup);

    this.components.set('memoria', {
      id: 'memoria',
      name: 'Memoria Principal (RAM)',
      group: ramGroup,
      mountedPos,
      unmountedPos,
      explodedOffset: new THREE.Vector3(0, 5, 0),
      isMounted: false,
      color: 0x10b981
    });
  }

  private buildIoInterface() {
    const ioGroup = new THREE.Group();
    ioGroup.name = 'io';

    const baseGeo = new THREE.BoxGeometry(6.4, 0.3, 5.4);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.4, metalness: 0.3 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.15;
    base.castShadow = true;
    ioGroup.add(base);

    const chipGeo = new THREE.BoxGeometry(2.6, 0.35, 2.6);
    const chipTex = createChipTexture('I/O', 'PERIFÉRICOS', this.renderer);
    const chipMat = new THREE.MeshStandardMaterial({ map: chipTex, roughness: 0.3, metalness: 0.3 });
    const chip = new THREE.Mesh(chipGeo, chipMat);
    chip.position.set(-1, 0.4, 0);
    chip.castShadow = true;
    ioGroup.add(chip);

    const portGeo = new THREE.BoxGeometry(1.6, 1.1, 1.2);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xcfd8dc, metalness: 0.9, roughness: 0.15 });

    const usb1 = new THREE.Mesh(portGeo, metalMat);
    usb1.position.set(2, 0.6, -1.4);
    ioGroup.add(usb1);

    const usb2 = new THREE.Mesh(portGeo, metalMat);
    usb2.position.set(2, 0.6, 0.4);
    ioGroup.add(usb2);

    const videoPort = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 1.8), metalMat);
    videoPort.position.set(2, 0.55, 2.0);
    ioGroup.add(videoPort);

    const mountedPos = new THREE.Vector3(-5, 0.55, 6);
    const unmountedPos = new THREE.Vector3(21, 0.55, 8);
    ioGroup.position.copy(unmountedPos);
    this.scene.add(ioGroup);

    this.components.set('io', {
      id: 'io',
      name: 'Interfaces de Entrada y Salida (E/S)',
      group: ioGroup,
      mountedPos,
      unmountedPos,
      explodedOffset: new THREE.Vector3(0, 4, 0),
      isMounted: false,
      color: 0xa855f7
    });
  }

  private buildOrthogonalBuses() {
    const busGroup = new THREE.Group();
    busGroup.name = 'buses';

    const createStraightConduit = (start: THREE.Vector3, end: THREE.Vector3, color: number, emissiveColor: number, radius = 0.16) => {
      const dir = new THREE.Vector3().subVectors(end, start);
      const len = dir.length();
      const geom = new THREE.CylinderGeometry(radius, radius, len, 8);
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: emissiveColor,
        emissiveIntensity: 0.75,
        metalness: 0.8,
        roughness: 0.2
      });
      const mesh = new THREE.Mesh(geom, mat);
      const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      mesh.position.copy(mid);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
      busGroup.add(mesh);
      return mesh;
    };

    const addStraightParticles = (start: THREE.Vector3, end: THREE.Vector3, color: number, direction: 'forward' | 'backward' | 'bidirectional' = 'forward') => {
      const count = 30;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const alpha = i / count;
        const p = new THREE.Vector3().lerpVectors(start, end, alpha);
        positions[i * 3] = p.x;
        positions[i * 3 + 1] = p.y + 0.08;
        positions[i * 3 + 2] = p.z;
      }
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const pMat = new THREE.PointsMaterial({
        color,
        size: 0.42,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending
      });
      const points = new THREE.Points(pGeo, pMat);
      this.scene.add(points);

      this.busSegments.push({
        start,
        end,
        color,
        particles: points,
        direction
      });
    };

    // 1. DIRECT CPU <-> E/S (Green)
    const cpuToIoStart = new THREE.Vector3(-5, 0.65, -0.4);
    const cpuToIoEnd = new THREE.Vector3(-5, 0.65, 3.3);
    createStraightConduit(cpuToIoStart, cpuToIoEnd, 0x10b981, 0x059669, 0.2);
    addStraightParticles(cpuToIoStart, cpuToIoEnd, 0x34d399, 'bidirectional');

    const cpuToIoReturnStart = new THREE.Vector3(-3.8, 0.65, -0.4);
    const cpuToIoReturnEnd = new THREE.Vector3(-3.8, 0.65, 3.3);
    createStraightConduit(cpuToIoReturnStart, cpuToIoReturnEnd, 0x10b981, 0x059669, 0.16);
    addStraightParticles(cpuToIoReturnEnd, cpuToIoReturnStart, 0x34d399, 'backward');

    // 2. CPU <-> RAM (Cyan, Purple, Amber)
    const dataStart = new THREE.Vector3(-1.4, 0.65, -5.5);
    const dataEnd = new THREE.Vector3(5.2, 0.65, -5.5);
    createStraightConduit(dataStart, dataEnd, 0x06b6d4, 0x0891b2, 0.18);
    addStraightParticles(dataStart, dataEnd, 0x38bdf8, 'bidirectional');

    const addrStart = new THREE.Vector3(-1.4, 0.65, -3.8);
    const addrEnd = new THREE.Vector3(5.2, 0.65, -3.8);
    createStraightConduit(addrStart, addrEnd, 0xa855f7, 0x7c3aed, 0.18);
    addStraightParticles(addrStart, addrEnd, 0xc084fc, 'forward');

    const ctrlStart = new THREE.Vector3(-1.4, 0.65, -2.1);
    const ctrlEnd = new THREE.Vector3(5.2, 0.65, -2.1);
    createStraightConduit(ctrlStart, ctrlEnd, 0xf59e0b, 0xd97706, 0.18);
    addStraightParticles(ctrlStart, ctrlEnd, 0xfbbf24, 'bidirectional');

    // 3. SYSTEM TRUNK BUS (Red/Gold)
    const trunkStart = new THREE.Vector3(-8.5, 0.62, 1.2);
    const trunkEnd = new THREE.Vector3(8.5, 0.62, 1.2);
    createStraightConduit(trunkStart, trunkEnd, 0xe11d48, 0xbe123c, 0.28);
    addStraightParticles(trunkStart, trunkEnd, 0xf43f5e, 'forward');

    const ramTapStart = new THREE.Vector3(5.2, 0.65, 1.2);
    const ramTapEnd = new THREE.Vector3(5.2, 0.65, -0.4);
    createStraightConduit(ramTapStart, ramTapEnd, 0xe11d48, 0xbe123c, 0.18);
    addStraightParticles(ramTapStart, ramTapEnd, 0xf43f5e, 'forward');

    const cpuTapStart = new THREE.Vector3(-2.6, 0.65, 1.2);
    const cpuTapEnd = new THREE.Vector3(-2.6, 0.65, -0.4);
    createStraightConduit(cpuTapStart, cpuTapEnd, 0xe11d48, 0xbe123c, 0.18);
    addStraightParticles(cpuTapStart, cpuTapEnd, 0xf43f5e, 'backward');

    const ioTapStart = new THREE.Vector3(-2.6, 0.65, 1.2);
    const ioTapEnd = new THREE.Vector3(-2.6, 0.65, 3.3);
    createStraightConduit(ioTapStart, ioTapEnd, 0xe11d48, 0xbe123c, 0.18);
    addStraightParticles(ioTapStart, ioTapEnd, 0xf43f5e, 'forward');

    const junctionGeo = new THREE.BoxGeometry(0.7, 0.45, 0.7);
    const junctionMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.9, roughness: 0.2 });
    [
      new THREE.Vector3(-5, 0.65, 1.2),
      new THREE.Vector3(-2.6, 0.65, 1.2),
      new THREE.Vector3(5.2, 0.65, 1.2)
    ].forEach(pos => {
      const junc = new THREE.Mesh(junctionGeo, junctionMat);
      junc.position.copy(pos);
      busGroup.add(junc);
    });

    const mountedPos = new THREE.Vector3(0, 0, 0);
    const unmountedPos = new THREE.Vector3(21, 0.55, 0); // Centered on right workbench between RAM and IO
    busGroup.position.copy(unmountedPos);
    this.scene.add(busGroup);

    this.components.set('buses', {
      id: 'buses',
      name: 'Buses del Sistema (Autopistas)',
      group: busGroup,
      mountedPos,
      unmountedPos,
      explodedOffset: new THREE.Vector3(0, 2, 0),
      isMounted: false,
      color: 0x38bdf8
    });
  }

  // Camera presets
  public setCameraView(view: 'iso' | 'top' | 'front' | 'side') {
    switch (view) {
      case 'iso':
        this.targetRadius = 30;
        this.targetTheta = Math.PI / 4;
        this.targetPhi = Math.PI / 3.4;
        this.target.set(0, 0, 0);
        break;
      case 'top':
        this.targetRadius = 28;
        this.targetTheta = 0;
        this.targetPhi = 0.05;
        this.target.set(0, 0, 0);
        break;
      case 'front':
        this.targetRadius = 30;
        this.targetTheta = 0;
        this.targetPhi = Math.PI / 2.1;
        this.target.set(0, 1, 0);
        break;
      case 'side':
        this.targetRadius = 30;
        this.targetTheta = Math.PI / 2;
        this.targetPhi = Math.PI / 2.2;
        this.target.set(0, 1, 0);
        break;
    }
  }

  public setExplodedView(val: number) {
    this.targetExplodedValue = THREE.MathUtils.clamp(val, 0, 1);
  }

  public togglePieceMount(pieceId: PieceId) {
    const item = this.components.get(pieceId);
    if (!item) return;
    item.isMounted = !item.isMounted;
    this.updatePieceHierarchy(pieceId, item.isMounted);
    if (this.onPieceMountChanged) {
      this.onPieceMountChanged(pieceId, item.isMounted);
    }
  }

  /**
   * Dynamically handles parenting of ALU, UC, and Registros to the CPU!
   */
  private updatePieceHierarchy(pieceId: PieceId, isMounted: boolean) {
    if (pieceId === 'alu') {
      if (isMounted) {
        this.cpuGroup.add(this.aluGroup);
        this.aluGroup.position.set(-1.5, 0.52, -1.5);
      } else {
        this.scene.add(this.aluGroup);
        this.aluGroup.position.set(-24, 0.55, -7);
      }
    } else if (pieceId === 'uc') {
      if (isMounted) {
        this.cpuGroup.add(this.ucGroup);
        this.ucGroup.position.set(1.5, 0.52, -1.5);
      } else {
        this.scene.add(this.ucGroup);
        this.ucGroup.position.set(-18, 0.55, -7);
      }
    } else if (pieceId === 'registros') {
      if (isMounted) {
        this.cpuGroup.add(this.regGroup);
        this.regGroup.position.set(0, 0.52, 1.6);
      } else {
        this.scene.add(this.regGroup);
        this.regGroup.position.set(-21, 0.55, -0.5);
      }
    }
  }

  public syncPlacedPieces(state: PlacedPiecesState) {
    this.components.forEach((item, id) => {
      item.isMounted = !!state[id];
      this.updatePieceHierarchy(id, item.isMounted);
    });
  }

  private updateCameraPosition() {
    const x = this.target.x + this.cameraRadius * Math.sin(this.cameraPhi) * Math.sin(this.cameraTheta);
    const y = this.target.y + this.cameraRadius * Math.cos(this.cameraPhi);
    const z = this.target.z + this.cameraRadius * Math.sin(this.cameraPhi) * Math.cos(this.cameraTheta);
    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.target);
  }

  private bindEvents() {
    const dom = this.renderer.domElement;

    dom.addEventListener('pointerdown', (e: PointerEvent) => {
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
      const rect = dom.getBoundingClientRect();
      this.mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouseVec, this.camera);

      // Check if clicked on a component first
      const interactiveMeshes: THREE.Object3D[] = [];
      this.components.forEach(c => {
        c.group.traverse(child => {
          if (child instanceof THREE.Mesh) {
            interactiveMeshes.push(child);
          }
        });
      });

      const compIntersects = this.raycaster.intersectObjects(interactiveMeshes, false);
      if (compIntersects.length > 0) {
        let current: THREE.Object3D | null = compIntersects[0].object;
        let foundPieceId: PieceId | null = null;
        while (current && current !== this.scene) {
          if (current.name && this.components.has(current.name as PieceId)) {
            foundPieceId = current.name as PieceId;
            break;
          }
          current = current.parent;
        }

        if (foundPieceId) {
          this.selectedPieceId = foundPieceId;
          const pieceItem = this.components.get(foundPieceId);

          if (this.onSelectPiece) {
            this.onSelectPiece(foundPieceId);
          }

          // If piece is unmounted, start 3D Drag & Drop!
          if (pieceItem && !pieceItem.isMounted) {
            this.draggedItem = pieceItem;
            const worldPos = new THREE.Vector3();
            pieceItem.group.getWorldPosition(worldPos);
            this.dragPlane.constant = -worldPos.y;
            return;
          }
        }
      }

      // Check if clicked directly on a Socket!
      const socketMeshes: THREE.Object3D[] = [];
      this.sockets.forEach(s => socketMeshes.push(s.mesh));
      const socketIntersects = this.raycaster.intersectObjects(socketMeshes, false);

      if (socketIntersects.length > 0) {
        const socketMesh = socketIntersects[0].object;
        let clickedSocketId: PieceId | null = null;
        this.sockets.forEach((s, id) => {
          if (s.mesh === socketMesh) clickedSocketId = id;
        });

        if (clickedSocketId) {
          if (this.selectedPieceId) {
            if (this.selectedPieceId === clickedSocketId) {
              const item = this.components.get(this.selectedPieceId);
              if (item) {
                item.isMounted = true;
                this.updatePieceHierarchy(this.selectedPieceId, true);
                if (this.onPieceMountChanged) {
                  this.onPieceMountChanged(this.selectedPieceId, true);
                }
              }
            } else {
              if (this.onWrongSlotClicked) {
                this.onWrongSlotClicked(this.selectedPieceId, clickedSocketId);
              }
            }
          }
          return;
        }
      }

      // Empty space -> Camera navigation
      this.isDraggingCamera = true;
      this.isPanning = e.button === 2 || e.shiftKey;
    });

    window.addEventListener('pointermove', (e: PointerEvent) => {
      const rect = dom.getBoundingClientRect();
      this.mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.raycaster.setFromCamera(this.mouseVec, this.camera);

      // 1. If currently dragging a 3D piece
      if (this.draggedItem) {
        if (this.raycaster.ray.intersectPlane(this.dragPlane, this.planeIntersectPoint)) {
          this.draggedItem.group.position.x = this.planeIntersectPoint.x;
          this.draggedItem.group.position.z = this.planeIntersectPoint.z;
          this.draggedItem.group.position.y = 1.2;
        }

        // Highlight socket underneath the dragged item ONLY when attempting to put it on top!
        this.updateSocketHover(true);
        return;
      }

      // 2. If orbiting / panning camera
      if (this.isDraggingCamera) {
        const deltaX = e.clientX - this.previousMousePosition.x;
        const deltaY = e.clientY - this.previousMousePosition.y;

        if (this.isPanning) {
          const panSpeed = 0.03 * (this.cameraRadius / 25);
          const forward = new THREE.Vector3().subVectors(this.target, this.camera.position).normalize();
          const right = new THREE.Vector3().crossVectors(forward, this.camera.up).normalize();
          const up = new THREE.Vector3().crossVectors(right, forward).normalize();
          this.target.addScaledVector(right, -deltaX * panSpeed);
          this.target.addScaledVector(up, deltaY * panSpeed);
        } else {
          this.targetTheta -= deltaX * 0.007;
          this.targetPhi -= deltaY * 0.007;
          this.targetPhi = THREE.MathUtils.clamp(this.targetPhi, 0.05, Math.PI / 2.05);
        }

        this.previousMousePosition = { x: e.clientX, y: e.clientY };
        return;
      }

      // 3. Passive hover over sockets: only illuminate when mouse is directly ON that socket!
      this.updateSocketHover(false);
    });

    window.addEventListener('pointerup', () => {
      if (this.draggedItem) {
        // Find which socket is closest to where the piece was dropped
        let closestSocket: SocketItem | null = null;
        let closestDist = 9999;
        const itemWorldPos = new THREE.Vector3();
        this.draggedItem.group.getWorldPosition(itemWorldPos);

        for (const s of this.sockets.values()) {
          const sPos = new THREE.Vector3();
          s.mesh.getWorldPosition(sPos);
          const d = itemWorldPos.distanceTo(sPos);
          if (d < closestDist) {
            closestDist = d;
            closestSocket = s;
          }
        }

        // Drop threshold: 4.5 world units
        if (closestSocket !== null && closestDist < 4.5) {
          const matchedSocket: SocketItem = closestSocket;
          if (matchedSocket.id === this.draggedItem.id) {
            // Correct socket!
            this.draggedItem.isMounted = true;
            this.updatePieceHierarchy(this.draggedItem.id, true);
            if (this.onPieceMountChanged) {
              this.onPieceMountChanged(this.draggedItem.id, true);
            }
          } else {
            // Wrong socket! Inform student
            if (this.onWrongSlotClicked) {
              this.onWrongSlotClicked(this.draggedItem.id, matchedSocket.id);
            }
          }
        }

        this.draggedItem = null;
      }

      this.isDraggingCamera = false;
      this.isPanning = false;
    });

    dom.addEventListener('wheel', (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY * 0.02;
      this.targetRadius = THREE.MathUtils.clamp(this.targetRadius + zoomFactor, 8, 65);
    }, { passive: false });

    dom.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('resize', this.onResize.bind(this));
  }

  /**
   * Highlights ONLY the socket where the user is attempting to place a piece on top!
   * No clues or automatic hints are shown when merely touching or selecting a piece.
   */
  private updateSocketHover(isDragging: boolean) {
    const socketMeshes: THREE.Object3D[] = [];
    this.sockets.forEach(s => socketMeshes.push(s.mesh));
    const intersects = this.raycaster.intersectObjects(socketMeshes, false);

    let newHoveredId: PieceId | null = null;
    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      this.sockets.forEach((s, id) => {
        if (s.mesh === hitMesh) newHoveredId = id;
      });
    }

    this.hoveredSocketId = newHoveredId;

    // Marks and illuminates the socket whenever the mouse hovers over it
    this.sockets.forEach((socket, id) => {
      const isDirectlyHovered = this.hoveredSocketId === id;

      if (isDirectlyHovered) {
        socket.mesh.material = socket.highlightMaterial;
        socket.highlightMaterial.emissiveIntensity = 1.35;
        socket.lineMesh.material = socket.activeLineMaterial;
      } else {
        socket.mesh.material = socket.baseMaterial;
        socket.lineMesh.material = socket.neutralLineMaterial;
      }
    });
  }

  public onResize() {
    if (!this.container) return;
    const width = this.container.clientWidth > 0 ? this.container.clientWidth : (window.innerWidth || 1280);
    const height = this.container.clientHeight > 0 ? this.container.clientHeight : (Math.max(580, window.innerHeight - 64));
    if (width > 0 && height > 0) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }
  }

  public resetCamera() {
    this.setCameraView('iso');
  }

  private animate() {
    this.animationFrameId = requestAnimationFrame(this.animate);
    const delta = Math.min(this.clock.getDelta(), 0.1);

    // Auto-correct camera aspect if container was resized or aspect was degenerate
    if (
      this.camera.aspect === Infinity || 
      isNaN(this.camera.aspect) || 
      (this.container && this.container.clientHeight > 50 && Math.abs(this.camera.aspect - (this.container.clientWidth / this.container.clientHeight)) > 0.05)
    ) {
      this.onResize();
    }

    this.cameraRadius = THREE.MathUtils.damp(this.cameraRadius, this.targetRadius, 8, delta);
    this.cameraTheta = THREE.MathUtils.damp(this.cameraTheta, this.targetTheta, 8, delta);
    this.cameraPhi = THREE.MathUtils.damp(this.cameraPhi, this.targetPhi, 8, delta);
    this.updateCameraPosition();

    this.explodedValue = THREE.MathUtils.damp(this.explodedValue, this.targetExplodedValue, 6, delta);

    // Update 3D components positions
    this.components.forEach((item) => {
      // If currently dragging this item with mouse, skip physics interpolation
      if (this.draggedItem && this.draggedItem.id === item.id) {
        return;
      }

      // For ALU, UC, Registros that are mounted: they are children of cpuGroup and stay locked inside CPU!
      if ((item.id === 'alu' || item.id === 'uc' || item.id === 'registros') && item.isMounted) {
        return;
      }

      const basePos = item.isMounted ? item.mountedPos : item.unmountedPos;
      const targetPos = new THREE.Vector3().copy(basePos);

      if (item.isMounted) {
        targetPos.addScaledVector(item.explodedOffset, this.explodedValue);
      }

      item.group.position.x = THREE.MathUtils.damp(item.group.position.x, targetPos.x, 8, delta);
      item.group.position.y = THREE.MathUtils.damp(item.group.position.y, targetPos.y, 8, delta);
      item.group.position.z = THREE.MathUtils.damp(item.group.position.z, targetPos.z, 8, delta);

      if (!item.isMounted) {
        item.group.position.y += Math.sin(this.clock.getElapsedTime() * 2 + item.color) * 0.005;
      }
    });

    // Animate straight bus energy pulses
    const time = this.clock.getElapsedTime();
    const speed = this.isSimulating ? 0.8 : 0.25;

    this.busSegments.forEach((seg) => {
      const positions = seg.particles.geometry.attributes.position.array as Float32Array;
      const count = positions.length / 3;

      for (let i = 0; i < count; i++) {
        let t = (i / count + time * speed) % 1;
        if (seg.direction === 'backward') {
          t = 1 - t;
        }

        const currentP = new THREE.Vector3().lerpVectors(seg.start, seg.end, t);
        positions[i * 3] = currentP.x;
        positions[i * 3 + 1] = currentP.y + 0.08;
        positions[i * 3 + 2] = currentP.z;
      }
      seg.particles.geometry.attributes.position.needsUpdate = true;
    });

    this.renderer.render(this.scene, this.camera);
  }

  // ==========================================
  // ENGRAVED MOTHERBOARD NAMEPLATE SYSTEM
  // ==========================================
  private namePlateMesh: THREE.Mesh | null = null;
  private namePlateCanvas: HTMLCanvasElement | null = null;
  private namePlateTexture: THREE.CanvasTexture | null = null;
  public studentName: string = '';
  public studentGroup: string = '';

  private buildStudentNamePlate() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    this.namePlateCanvas = canvas;
    this.drawNamePlateTexture('PENDIENTE DE GRADUACIÓN', 'IES BEATRIZ GALINDO LA LATINA');

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    this.namePlateTexture = texture;

    // Gold bezel plate
    const plateGeo = new THREE.BoxGeometry(7.4, 0.08, 3.8);
    const plateMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.3,
      metalness: 0.4,
      emissive: 0x1e293b,
      emissiveIntensity: 0.2
    });

    const plateGroup = new THREE.Group();
    plateGroup.position.set(4.5, 0.44, 7.0);

    const plateMesh = new THREE.Mesh(plateGeo, plateMat);
    plateMesh.receiveShadow = true;
    plateMesh.castShadow = true;
    plateGroup.add(plateMesh);
    this.namePlateMesh = plateMesh;

    // Gold corner rivets
    const rivetGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.12, 12);
    const rivetMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.15 });
    const rivetPositions = [
      [-3.4, 0.05, -1.6],
      [3.4, 0.05, -1.6],
      [-3.4, 0.05, 1.6],
      [3.4, 0.05, 1.6]
    ];
    rivetPositions.forEach(([rx, ry, rz]) => {
      const rivet = new THREE.Mesh(rivetGeo, rivetMat);
      rivet.position.set(rx, ry, rz);
      plateGroup.add(rivet);
    });

    this.scene.add(plateGroup);
  }

  private drawNamePlateTexture(name: string, group: string) {
    if (!this.namePlateCanvas) return;
    const ctx = this.namePlateCanvas.getContext('2d');
    if (!ctx) return;

    const w = this.namePlateCanvas.width;
    const h = this.namePlateCanvas.height;

    // Background: brushed dark metallic finish
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.5, '#1e293b');
    grad.addColorStop(1, '#090d16');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Golden metallic border
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 14;
    ctx.strokeRect(16, 16, w - 32, h - 32);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, w - 60, h - 60);

    // Header 1: School Name
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('IES BEATRIZ GALINDO LA LATINA', w / 2, 85);

    // Header 2: Architecture
    ctx.fillStyle = '#38bdf8';
    ctx.font = '600 26px "Chakra Petch", sans-serif';
    ctx.fillText('ARQUITECTURA DE VON NEUMANN // PLACA OFICIAL', w / 2, 130);

    // Divider line
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(80, 160);
    ctx.lineTo(w - 80, 160);
    ctx.stroke();

    // Section title
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('DISEÑADO Y ENSAMBLADO POR:', w / 2, 215);

    // Student Name (large, engraved, glowing!)
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.font = 'bold 50px "Plus Jakarta Sans", sans-serif';
    const displayName = (name && name.trim()) ? name.trim().toUpperCase() : 'NOMBRE DEL ALUMNO/A';
    ctx.fillText(displayName, w / 2, 290);
    ctx.shadowBlur = 0; // reset shadow

    // Group / Course & Status
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 30px "Fira Code", monospace';
    const displayGroup = (group && group.trim()) ? `CURSO: ${group.trim().toUpperCase()}` : '3º ESO - TECNOLOGÍA';
    ctx.fillText(displayGroup, w / 2, 360);

    ctx.fillStyle = '#eab308';
    ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('✓ CERTIFICACIÓN: NIVELES 2D Y 3D SUPERADOS', w / 2, 425);

    // Corner rivets on canvas
    const drawRivet = (cx: number, cy: number) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#eab308';
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 3;
      ctx.stroke();
    };
    drawRivet(40, 40);
    drawRivet(w - 40, 40);
    drawRivet(40, h - 40);
    drawRivet(w - 40, h - 40);
  }

  public setStudentName(name: string, group: string = '') {
    this.studentName = name;
    this.studentGroup = group;
    this.drawNamePlateTexture(name, group);
    if (this.namePlateTexture) {
      this.namePlateTexture.needsUpdate = true;
    }
  }

  public getScreenshot(): string {
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/png');
  }

  public focusOnStudentPlate() {
    this.targetRadius = 15;
    this.targetTheta = Math.PI / 5;
    this.targetPhi = Math.PI / 3.6;
    this.target.set(4.5, 0.44, 7.0);
  }

  public dispose() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
  }
}
