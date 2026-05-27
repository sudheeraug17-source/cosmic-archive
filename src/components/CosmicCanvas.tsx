import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { CELESTIAL_PINS } from "../data/sceneManifest";
import {
  createSunTexture,
  createMercuryTexture,
  createVenusTexture,
  createEarthTexture,
  createMarsTexture,
  createJupiterTexture,
  createSaturnTexture,
  createSaturnRingsTexture,
  createUranusTexture,
  createNeptuneTexture
} from "../utils/proceduralTextures";

interface CosmicCanvasProps {
  activePlanetId: string;
  isPlayingAudio: boolean;
  onPinsUpdate: (coords: Record<string, { x: number; y: number; visible: boolean }>) => void;
  onPlanetSelect: (id: string) => void;
  orbitSpeedFactor: number;
  resetTrigger?: number;
}

export const CosmicCanvas: React.FC<CosmicCanvasProps> = ({
  activePlanetId,
  isPlayingAudio,
  onPinsUpdate,
  onPlanetSelect,
  orbitSpeedFactor,
  resetTrigger = 0
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // References for camera, scene, renderer, and simulation objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const orbitControlsRef = useRef<OrbitControls | null>(null);

  // Transition tracking for cinematic fly-through
  const transitionRef = useRef({ progress: 1 });
  const startCamPosRef = useRef(new THREE.Vector3());
  const startTargetPosRef = useRef(new THREE.Vector3());
  const transitionOffsetRef = useRef(new THREE.Vector3());
  const arcHeightRef = useRef(0);

  // Stable refs for values used inside the frame loops to prevent Canvas re-initialization
  const activePlanetIdRef = useRef(activePlanetId);
  const isPlayingAudioRef = useRef(isPlayingAudio);
  const onPinsUpdateRef = useRef(onPinsUpdate);
  const lastTargetPosRef = useRef<THREE.Vector3>(new THREE.Vector3());

  // Volumetric tracking refs
  const sunGlowSpriteRef = useRef<THREE.Sprite | null>(null);

  useEffect(() => {
    activePlanetIdRef.current = activePlanetId;
  }, [activePlanetId]);

  useEffect(() => {
    isPlayingAudioRef.current = isPlayingAudio;
  }, [isPlayingAudio]);

  useEffect(() => {
    onPinsUpdateRef.current = onPinsUpdate;
  }, [onPinsUpdate]);

  // Map of 3D meshes to animate/rotate on each frame
  const planetMeshes = useRef<Array<{
    id: string;
    mesh: THREE.Mesh;
    group: THREE.Group;
    satellites: THREE.Mesh[];
    radX: number;
    radZ: number;
    startTheta: number;
    orbitSpeed: number;
    rotSpeed: number;
  }>>([]);

  const sunMeshRef = useRef<THREE.Mesh | null>(null);
  const sunLightRef = useRef<THREE.PointLight | null>(null);
  const coronaMeshRef = useRef<THREE.Mesh | null>(null);
  const outerCoronaMeshRef = useRef<THREE.Mesh | null>(null);
  const solarFlaresRef = useRef<THREE.Points | null>(null);
  const meteorGroupRef = useRef<THREE.Group | null>(null);
  const blackHoleMeshRef = useRef<THREE.Mesh | null>(null);
  const asteroidBeltRef = useRef<THREE.Group | null>(null);
  const accretionDiskRef = useRef<THREE.Mesh | null>(null);
  const starFieldRef = useRef<THREE.Points | null>(null);

  // Keep track of delta time and accumulated orbit time
  const orbitTimeRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const orbitSpeedFactorRef = useRef<number>(orbitSpeedFactor);

  useEffect(() => {
    orbitSpeedFactorRef.current = orbitSpeedFactor;
  }, [orbitSpeedFactor]);

  useEffect(() => {
    if (resetTrigger > 0) {
      orbitTimeRef.current = 0;
    }
  }, [resetTrigger]);

  // Initialize Scene, Camera, Renderer, Objects, Lights, Particles
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // --- 1. Scene Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2("#030308", 0.012);
    sceneRef.current = scene;

    // --- 2. Camera Setup ---
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(-8, 5, 25);
    cameraRef.current = camera;

    // --- 3. Renderer Setup ---
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25; // slightly lifted exposure for crisp shadows
    rendererRef.current = renderer;

    // --- Post-Processing Setup ---
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.2, // strength
      0.5, // radius
      0.35 // threshold
    );
    // adjust bloom to look cinematic
    bloomPass.threshold = 0.2;
    bloomPass.strength = 1.2; 
    bloomPass.radius = 0.8;

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    composerRef.current = composer;

    // --- 3.1 Always-Enabled OrbitControls Setup ---
    const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !prefersReducedMotion;
    controls.dampingFactor = 0.06;
    controls.rotateSpeed = 0.45;
    controls.zoomSpeed = 0.6;
    controls.enablePan = false; // Keep camera centered on current planet
    controls.enabled = true;
    orbitControlsRef.current = controls;

    // --- 4. Lights (High-Visibility Refined Setup) ---
    // Ambient Universe space glow - lowered to 0.15 for cinematic shadow contrast
    const ambientLight = new THREE.AmbientLight("#0a0c16", 0.15); 
    scene.add(ambientLight);

    // Primary Solar Pointlight centered inside the Sun (highly boosted key light for bright crescent sunlit side)
    const sunLight = new THREE.PointLight("#fff0d4", 42.0, 300, 0.85);
    sunLight.position.set(-18, 0, -5);
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // Dynamic galaxy fill light representing spatial nebulae - calibrated softer
    const galaxylight = new THREE.DirectionalLight("#4a69bd", 0.55);
    galaxylight.position.set(20, 15, -15);
    scene.add(galaxylight);

    // Soft Hemisphere light to add natural color bouncing / detail highlight - calibrated lower
    const fillLight = new THREE.HemisphereLight("#8eacf0", "#060810", 0.22);
    scene.add(fillLight);

    // --- 5. Generate Textures and Build Planets ---
    const planetGroup = new THREE.Group();
    scene.add(planetGroup);

    planetMeshes.current = [];
    const sunX = -18;
    const sunZ = -5;

    CELESTIAL_PINS.forEach((pin) => {
      // Create a master coordinate container for each celestial body group
      const localGroup = new THREE.Group();
      localGroup.position.set(pin.position[0], pin.position[1], pin.position[2]);
      planetGroup.add(localGroup);

      let pbrMaterial: THREE.Material;
      let geometry: THREE.BufferGeometry = new THREE.SphereGeometry(1, 48, 48);

      if (pin.id === "sun") {
        // Double-sphere glowing solar rig
        const sunTexture = createSunTexture();
        geometry = new THREE.SphereGeometry(1.0, 48, 48);
        pbrMaterial = new THREE.MeshBasicMaterial({
          map: sunTexture,
          color: new THREE.Color("#ffffff")
        });

        const sunMesh = new THREE.Mesh(geometry, pbrMaterial);
        sunMesh.scale.setScalar(pin.scale);
        localGroup.add(sunMesh);
        sunMeshRef.current = sunMesh;

        // 1. Hot Core Corona Glow Mesh (pulsating, backward rotating)
        const coronaGeo = new THREE.SphereGeometry(1.10, 48, 48);
        const coronaMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color("#ff6600"),
          transparent: true,
          opacity: 0.45,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending
        });
        const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
        coronaMesh.scale.setScalar(pin.scale);
        localGroup.add(coronaMesh);
        coronaMeshRef.current = coronaMesh;

        // 2. Beautiful Solar Outer Aura glow
        const outerGlowGeo = new THREE.SphereGeometry(1.24, 48, 48);
        const outerGlowMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color("#ffaa00"),
          transparent: true,
          opacity: 0.22,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending
        });
        const outerGlowMesh = new THREE.Mesh(outerGlowGeo, outerGlowMat);
        outerGlowMesh.scale.setScalar(pin.scale);
        localGroup.add(outerGlowMesh);
        outerCoronaMeshRef.current = outerGlowMesh;

        // 3. Volumetric Solar Glare Billboard Sprite
        const sunGlowCanvas = document.createElement("canvas");
        sunGlowCanvas.width = 128;
        sunGlowCanvas.height = 128;
        const sgCtx = sunGlowCanvas.getContext("2d")!;
        const sgGrad = sgCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
        sgGrad.addColorStop(0, "rgba(255, 120, 0, 0.45)");
        sgGrad.addColorStop(0.2, "rgba(255, 90, 0, 0.2)");
        sgGrad.addColorStop(0.5, "rgba(255, 60, 0, 0.08)");
        sgGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        sgCtx.fillStyle = sgGrad;
        sgCtx.fillRect(0, 0, 128, 128);
        const sunGlowTex = new THREE.CanvasTexture(sunGlowCanvas);
        const sunGlowMat = new THREE.SpriteMaterial({
          map: sunGlowTex,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        const sunGlowSprite = new THREE.Sprite(sunGlowMat);
        sunGlowSprite.scale.set(42, 42, 1);
        localGroup.add(sunGlowSprite);
        sunGlowSpriteRef.current = sunGlowSprite;

        // Save reference for interaction mapping
        planetMeshes.current.push({
          id: pin.id,
          mesh: sunMesh,
          group: localGroup,
          satellites: [],
          radX: 0,
          radZ: 0,
          startTheta: 0,
          orbitSpeed: 0,
          rotSpeed: pin.rotationSpeed
        });
        return;
      }

      if (pin.id === "black-hole") {
        // Singular black core
        geometry = new THREE.SphereGeometry(1.0, 36, 36);
        pbrMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const blackHoleMesh = new THREE.Mesh(geometry, pbrMaterial);
        blackHoleMesh.scale.setScalar(pin.scale);
        localGroup.add(blackHoleMesh);
        blackHoleMeshRef.current = blackHoleMesh;

        // Light bending Accretion Disk mapping
        const diskGeo = new THREE.RingGeometry(1.2, 3.2, 64);
        const diskMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color("#ffaa00"),
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.65,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        const diskMesh = new THREE.Mesh(diskGeo, diskMat);
        diskMesh.rotation.x = Math.PI / 2.3;
        diskMesh.rotation.y = 0.2;
        diskMesh.scale.setScalar(pin.scale);
        localGroup.add(diskMesh);
        accretionDiskRef.current = diskMesh;

        planetMeshes.current.push({
          id: pin.id,
          mesh: blackHoleMesh,
          group: localGroup,
          satellites: [],
          radX: 0,
          radZ: 0,
          startTheta: 0,
          orbitSpeed: 0,
          rotSpeed: pin.rotationSpeed
        });
        return;
      }

      // Procedural PBR planetary textures assignment
      let mapTexture: THREE.Texture | undefined;
      let roughness = 0.85;
      let metalness = 0.1;

      switch (pin.id) {
        case "mercury":
          mapTexture = createMercuryTexture();
          metalness = 0.55;
          roughness = 0.4;
          break;
        case "venus":
          mapTexture = createVenusTexture();
          roughness = 0.85;
          break;
        case "earth":
          mapTexture = createEarthTexture();
          roughness = 0.45;
          break;
        case "mars":
          mapTexture = createMarsTexture();
          roughness = 0.72;
          break;
        case "jupiter":
          mapTexture = createJupiterTexture();
          roughness = 0.75;
          break;
        case "saturn":
          mapTexture = createSaturnTexture();
          roughness = 0.78;
          break;
        case "uranus":
          mapTexture = createUranusTexture();
          roughness = 0.85;
          break;
        case "neptune":
          mapTexture = createNeptuneTexture();
          roughness = 0.82;
          break;
        default:
          mapTexture = createMercuryTexture();
          break;
      }

      // PBR Planetary material with very subtle dark-side atmosphere illumination
      pbrMaterial = new THREE.MeshStandardMaterial({
        map: mapTexture,
        roughness: roughness * 0.9,
        metalness: metalness * 1.25,
        emissive: new THREE.Color(pin.color).clone().multiplyScalar(0.012)
      });

      const bodyMesh = new THREE.Mesh(geometry, pbrMaterial);
      bodyMesh.scale.setScalar(pin.scale);
      localGroup.add(bodyMesh);

      // Add a celestial atmospheric scattering aura shell to provide elegant rim separation outline!
      if (pin.id !== "asteroid-belt" && pin.id !== "kuiper-belt") {
        const glowFactor = pin.scale < 1.0 ? 1.28 : 1.08; // wider atmospheric envelope for smaller planets!
        const atmGeo = new THREE.SphereGeometry(glowFactor, 36, 36);
        const atmMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(pin.color),
          transparent: true,
          opacity: pin.scale < 1.0 ? 0.62 : 0.38, // elevated opacity to prevent them disappearing in dark background
          blending: THREE.AdditiveBlending,
          side: THREE.BackSide
        });
        const atmMesh = new THREE.Mesh(atmGeo, atmMat);
        atmMesh.scale.setScalar(pin.scale);
        localGroup.add(atmMesh);
      }

      // Separate Saturn's Ring mesh mapping
      if (pin.id === "saturn") {
        const ringGeo = new THREE.RingGeometry(1.35, 2.7, 64);
        const ringTexture = createSaturnRingsTexture();
        const ringMat = new THREE.MeshBasicMaterial({
          map: ringTexture,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.90,
          color: "#ffe0bc",
          blending: THREE.NormalBlending
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2.3;
        ringMesh.scale.setScalar(pin.scale);
        localGroup.add(ringMesh);
      }

      // Add satellite Moons orbiting their host planets (Earth, Mars, Jupiter, Uranus, Neptune)
      const satellitesList: THREE.Mesh[] = [];
      pin.satellites.forEach((sat) => {
        const moonGeo = new THREE.SphereGeometry(sat.scale * 1.5, 12, 12);
        // Moon material catches ambient fill and Sun light nicely
        const moonMat = new THREE.MeshStandardMaterial({
          color: sat.color,
          roughness: 0.9,
          emissive: new THREE.Color(sat.color).clone().multiplyScalar(0.08)
        });
        const moonMesh = new THREE.Mesh(moonGeo, moonMat);
        moonMesh.position.set(sat.orbitRadius, 0, 0);
        localGroup.add(moonMesh);
        satellitesList.push(moonMesh);
      });

      // Compute circular radius of orbit relative to Sun central anchor [-18, 0, -5]
      const dxCheck = pin.position[0] - sunX;
      const dzCheck = pin.position[2] - sunZ;
      const radius = Math.sqrt(dxCheck * dxCheck + dzCheck * dzCheck);
      const radX = radius;
      const radZ = radius;

      // Math angle starts coordinate to align with manifest initial values
      const startTheta = (radius === 0) ? 0 : Math.atan2(dzCheck, dxCheck);

      // Relative astronomical orbital speeds
      let baseOrbitSpeed = 0.5;
      if (pin.id === "mercury") baseOrbitSpeed = 1.3;
      else if (pin.id === "venus") baseOrbitSpeed = 0.8;
      else if (pin.id === "earth") baseOrbitSpeed = 0.55;
      else if (pin.id === "mars") baseOrbitSpeed = 0.35;
      else if (pin.id === "jupiter") baseOrbitSpeed = 0.14;
      else if (pin.id === "saturn") baseOrbitSpeed = 0.08;
      else if (pin.id === "uranus") baseOrbitSpeed = 0.04;
      else if (pin.id === "neptune") baseOrbitSpeed = 0.02;
      else baseOrbitSpeed = 0; // Sun / Black hole / asteroid belt etc have custom loops or center focus

      planetMeshes.current.push({
        id: pin.id,
        mesh: bodyMesh,
        group: localGroup,
        satellites: satellitesList,
        radX: radX,
        radZ: radZ,
        startTheta: startTheta,
        orbitSpeed: baseOrbitSpeed * 0.14, // speed coefficient
        rotSpeed: pin.rotationSpeed
      });
    });

    // --- 6. Infinite Starfield (Deep multi-layered spherical distribution) ---
    const starCount = 12000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      let x = 0, y = 0, z = 0;
      let r = 1.0, g = 1.0, b = 1.0;
      let size = 1.0;

      // Uniform background stars wrapping around a huge sphere for realistic multi-layered depth
      const radius = 150 + Math.random() * 800; // Deep multi-layered distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1); // True spherical distribution
      
      x = radius * Math.sin(phi) * Math.cos(theta);
      y = radius * Math.sin(phi) * Math.sin(theta);
      z = radius * Math.cos(phi);

      // Realistic star temperature colors (mostly cold blue/white, some orange/red dwarfs)
      const rChance = Math.random();
      if (rChance < 0.3) {
        r = 0.65; g = 0.8; b = 1.0; // Hot Blue O/B type
      } else if (rChance < 0.6) {
        r = 0.95; g = 0.95; b = 1.0; // White A/F type
      } else if (rChance < 0.8) {
        r = 1.0; g = 0.9; b = 0.7; // Yellow G type (Sun-like)
      } else if (rChance < 0.95) {
        r = 1.0; g = 0.7; b = 0.5; // Orange K type
      } else {
        r = 1.0; g = 0.4; b = 0.3; // Red M type
      }
      
      // Sizes vary significantly for magnitude realism
      size = rChance < 0.05 ? 3.0 + Math.random() * 2.5 : 0.4 + Math.random() * 1.8;

      // Avoid placing stars directly inside the active viewport core center
      if (Math.abs(x) < 40 && Math.abs(y) < 40 && Math.abs(z) < 40) {
        x *= 2.8; y *= 2.8; z *= 2.8;
      }

      starPositions[i * 3] = x;
      starPositions[i * 3 + 1] = y;
      starPositions[i * 3 + 2] = z;

      starColors[i * 3] = r;
      starColors[i * 3 + 1] = g;
      starColors[i * 3 + 2] = b;
      
      starSizes[i] = size;
    }

    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute("color", new THREE.BufferAttribute(starColors, 3));
    starGeometry.setAttribute("size", new THREE.BufferAttribute(starSizes, 1)); 

    const starCanvas = document.createElement("canvas");
    starCanvas.width = 16;
    starCanvas.height = 16;
    const sCtx = starCanvas.getContext("2d")!;
    const sGrad = sCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
    sGrad.addColorStop(0, "rgba(255, 255, 255, 1)");
    sGrad.addColorStop(0.2, "rgba(255, 255, 255, 0.8)");
    sGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.2)");
    sGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 16, 16);
    const starTexture = new THREE.CanvasTexture(starCanvas);

    // Provide a simple ShaderMaterial to allow variable star sizes alongside colors without lag
    const starMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        starTexture: { value: starTexture },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vDepth;
        uniform float time;
        void main() {
          vColor = color;
          // Simple twinkling effect using position modulo
          float twinkle = 1.0 + 0.3 * sin(time * 2.0 + position.x * 10.0 + position.z * 10.0);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * twinkle * (200.0 / -mvPosition.z) * 1.5;
          vDepth = -mvPosition.z;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D starTexture;
        varying vec3 vColor;
        varying float vDepth;
        void main() {
          vec4 texColor = texture2D(starTexture, gl_PointCoord);
          // distance fog fading for far stars
          float depthFade = clamp(1500.0 / vDepth, 0.0, 1.0);
          gl_FragColor = vec4(vColor * texColor.rgb, texColor.a * depthFade);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);
    starFieldRef.current = starField;

    // --- 7. Volumetric Ambient Gas clouds (Nebulae) ---
    const nebulaCount = 11;
    const nebulaGroup = new THREE.Group();
    scene.add(nebulaGroup);

    const galaxyDir = new THREE.Vector3(1.2, 0.6, -0.8).normalize();

    // Prepare singular canvas textures OUTSIDE the loop to prevent initialization lag!
    const createNebulaMaterial = (colStr: string, maxOpac: number) => {
      const cCanvas = document.createElement("canvas");
      cCanvas.width = 64; // Reduce res for faster load
      cCanvas.height = 64;
      const c = cCanvas.getContext("2d")!;
      const grad = c.createRadialGradient(32, 32, 2, 32, 32, 30);
      grad.addColorStop(0, `rgba(${colStr}, ${maxOpac})`);
      grad.addColorStop(0.5, `rgba(${colStr}, ${maxOpac * 0.4})`);
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      c.fillStyle = grad;
      c.fillRect(0, 0, 64, 64);
      return new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(cCanvas),
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide
      });
    };
    
    const matSolar = createNebulaMaterial("225, 85, 15", 0.08);     // Solar orange-red dust
    const matMagen = createNebulaMaterial("115, 45, 195", 0.055);   // Cosmic magenta-purple
    const matBlue = createNebulaMaterial("20, 105, 210", 0.055);    // Cosmic deep blue
    const cloudMaterials = [matSolar, matMagen, matBlue];

    const cloudGeo = new THREE.PlaneGeometry(200, 200);

    for (let i = 0; i < nebulaCount; i++) {
      const cloudMat = cloudMaterials[i % 3];
      const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
      
      // Layout cloud centers along the diagonal axis of our Milky Way
      const distAlongAxis = ((i / (nebulaCount - 1)) - 0.5) * 350;
      const diagonalPos = galaxyDir.clone().multiplyScalar(distAlongAxis);

      cloudMesh.position.set(
        diagonalPos.x + (Math.random() - 0.5) * 50,
        diagonalPos.y + (Math.random() - 0.5) * 20,
        diagonalPos.z - 80 + (Math.random() - 0.5) * 40
      );
      cloudMesh.rotation.set(Math.random() * 0.1, Math.random() * 0.1, Math.random() * Math.PI * 2);
      nebulaGroup.add(cloudMesh);
    }

    // --- 7.1 Dynamic Meteoroids System (Shooting Stars / Meteorites) ---
    const meteorCount = 65;
    const meteorGroup = new THREE.Group();
    scene.add(meteorGroup);
    meteorGroupRef.current = meteorGroup;

    const meteorsList: Array<{
      line: THREE.Line;
      velocity: THREE.Vector3;
      speed: number;
      life: number;
      maxLife: number;
      reset: () => void;
    }> = [];

    const meteorColors = [
      "#ffffff", // Core sparkling white
      "#6be6ff", // Electric neon cyan
      "#ff9df1", // Quantum magenta
      "#ffdb70", // Bright solar amber
      "#80ffbe", // Radiant cosmos green
      "#ffd0b3"  // Hot core star fire
    ];

    for (let i = 0; i < meteorCount; i++) {
      const lineGeo = new THREE.BufferGeometry();
      const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)];
      lineGeo.setFromPoints(points);

      const chosenColor = meteorColors[Math.floor(Math.random() * meteorColors.length)];
      const lineMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(chosenColor),
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
      });

      const line = new THREE.Line(lineGeo, lineMat);
      meteorGroup.add(line);

      const meteorNode = {
        line,
        velocity: new THREE.Vector3(),
        speed: 0,
        life: 0,
        maxLife: 0,
        reset: () => {
          // Restart far away from central solar system to avoid intersecting planets
          const radius = 120 + Math.random() * 180;
          const theta = Math.random() * Math.PI * 2;
          
          // Ecliptic plane avoidance: stay high above or far below the planets
          const yOffset = Math.random() > 0.5 ? 45 + Math.random() * 60 : -45 - Math.random() * 60;

          const startX = -18 + radius * Math.cos(theta);
          const startY = yOffset;
          const startZ = -5 + radius * Math.sin(theta);
          line.position.set(startX, startY, startZ);

          // Fully 3D randomized direction vector, but prefer more horizontal sweeping motion
          const dirX = (Math.random() - 0.5) * 2;
          const dirY = (Math.random() - 0.5) * 0.4;
          const dirZ = (Math.random() - 0.5) * 2;
          meteorNode.velocity.set(dirX, dirY, dirZ).normalize();

          // Varied speeds for hyper-velocity realistic motion
          meteorNode.speed = 1.8 + Math.random() * 6.0;
          meteorNode.life = 0;
          meteorNode.maxLife = 20 + Math.floor(Math.random() * 55);
          lineMat.opacity = 0;
        }
      };

      meteorNode.reset();
      // Extensive staggered launch delay starting with negative life
      meteorNode.life = -Math.floor(Math.random() * 1100); 
      meteorsList.push(meteorNode);
    }
    (meteorGroup as any).userData = { meteorsList };

    // --- 8. Asteroid Belt Instancing ---
    const asteroidCount = 450;
    const asteroidGroup = new THREE.Group();
    scene.add(asteroidGroup);
    asteroidBeltRef.current = asteroidGroup;

    const astMaterial = new THREE.MeshStandardMaterial({
      color: "#5b5550",
      roughness: 0.9,
      metalness: 0.2
    });

    // Create a single base geometry for instancing to prevent initialization lag
    const baseRockGeo = new THREE.DodecahedronGeometry(0.1, 0);
    const posAttr = baseRockGeo.attributes.position;
    for (let j = 0; j < posAttr.count; j++) {
      posAttr.setX(j, posAttr.getX(j) + (Math.random() - 0.5) * 0.03);
      posAttr.setY(j, posAttr.getY(j) + (Math.random() - 0.5) * 0.03);
      posAttr.setZ(j, posAttr.getZ(j) + (Math.random() - 0.5) * 0.03);
    }
    baseRockGeo.computeVertexNormals();

    const instancedAsteroids = new THREE.InstancedMesh(baseRockGeo, astMaterial, asteroidCount);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < asteroidCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 7.5 + (Math.random() - 0.5) * 1.5;
      const heightOffset = (Math.random() - 0.5) * 0.4;
      const sizeScale = (Math.random() * 0.12 + 0.03) / 0.1;

      dummy.position.set(
        -18 + Math.cos(angle) * radius * 2.8,
        heightOffset,
        -5 + Math.sin(angle) * radius * 2.8
      );
      dummy.rotation.set(Math.random() * 5, Math.random() * 5, Math.random() * 5);
      dummy.scale.setScalar(sizeScale);
      dummy.updateMatrix();
      
      instancedAsteroids.setMatrixAt(i, dummy.matrix);
    }
    instancedAsteroids.instanceMatrix.needsUpdate = true;
    asteroidGroup.add(instancedAsteroids);

    // --- 9. Orbit Path Visual Lines (Drawn relative to perfect circles around Solaris [-18, 0, -5]) ---
    CELESTIAL_PINS.forEach((pin) => {
      if (pin.id === "sun" || pin.id === "asteroid-belt" || pin.id === "kuiper-belt" || pin.id === "black-hole") return;
      
      const orbitLineGeo = new THREE.BufferGeometry();
      const numSegs = 100;
      const pts: THREE.Vector3[] = [];

      const dxCheck = pin.position[0] - (-18);
      const dzCheck = pin.position[2] - (-5);
      const radius = Math.sqrt(dxCheck * dxCheck + dzCheck * dzCheck);

      for (let i = 0; i <= numSegs; i++) {
        const theta = (i / numSegs) * Math.PI * 2;
        pts.push(
          new THREE.Vector3(
            -18 + Math.cos(theta) * radius,
            pin.position[1],
            -5 + Math.sin(theta) * radius
          )
        );
      }

      orbitLineGeo.setFromPoints(pts);
      const orbitLineMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(pin.glowColor),
        transparent: true,
        opacity: 0.42 // significantly increased to resolve low contrast in dark settings
      });
      const orbitLine = new THREE.Line(orbitLineGeo, orbitLineMat);
      scene.add(orbitLine);
    });

    // --- 10. Frame Tick Animation Loop ---
    const tick = () => {
      // Delta-time calculations to prevent jumping when editing orbital speeds
      const now = performance.now();
      const delta = (now - lastTimeRef.current) * 0.001; // in seconds
      lastTimeRef.current = now;

      // Accumulate simulation time using the active orbit speed factor
      orbitTimeRef.current += delta * orbitSpeedFactorRef.current;

      // Keep sun light at a stable, natural intensity
      if (sunLightRef.current) {
        sunLightRef.current.intensity = 26.0;
      }

      // Rotate and breathe dual solar coronas resembling active coronal loops
      if (coronaMeshRef.current) {
        coronaMeshRef.current.rotation.y -= 0.0008;
        const scaleBreathe = 1.0 + Math.sin(now * 0.002) * 0.015;
        coronaMeshRef.current.scale.setScalar(3.5 * scaleBreathe);
      }
      if (outerCoronaMeshRef.current) {
        outerCoronaMeshRef.current.rotation.y += 0.0005;
        const scaleBreathe2 = 1.0 + Math.cos(now * 0.0015) * 0.025;
        outerCoronaMeshRef.current.scale.setScalar(3.5 * scaleBreathe2);
      }
      if (sunGlowSpriteRef.current) {
        const glowBreathe = 1.0 + Math.sin(now * 0.0012) * 0.05;
        sunGlowSpriteRef.current.scale.set(42 * glowBreathe, 42 * glowBreathe, 1);
      }

      // Update flying meteoroids (shooting stars)
      if (meteorGroupRef.current) {
        const mList = meteorGroupRef.current.userData.meteorsList as Array<{
          line: THREE.Line;
          velocity: THREE.Vector3;
          speed: number;
          life: number;
          maxLife: number;
          reset: () => void;
        }>;

        mList.forEach((m) => {
          m.life += 1; // tick life count
          
          if (m.life < 0) {
            const mat = m.line.material as THREE.LineBasicMaterial;
            mat.opacity = 0;
            return;
          }

          if (m.life >= m.maxLife) {
            m.reset();
            return;
          }

          // Move head coordinates along speed travel
          const amt = m.speed * 1.25;
          m.line.position.addScaledVector(m.velocity, amt);

          // Breathe alpha transparency over time for realistic fade-in and high-speed burn-out trails
          const ratio = m.life / m.maxLife;
          const opacity = ratio < 0.15 ? ratio / 0.15 : 1.0 - (ratio - 0.15) / 0.85;
          const mat = m.line.material as THREE.LineBasicMaterial;
          mat.opacity = opacity * 1.45;

          // Align the streak tail backwards relative to the normalized velocity vector for extreme speed realism
          const head = new THREE.Vector3(0, 0, 0);
          const tail = m.velocity.clone().multiplyScalar(-m.speed * 3.8);
          m.line.geometry.setFromPoints([head, tail]);
        });
      }

      // Rotation updates for Sun, black hole accretion disk
      if (sunMeshRef.current) {
        sunMeshRef.current.rotation.y += 0.0006;
      }
      if (blackHoleMeshRef.current) {
        blackHoleMeshRef.current.rotation.y += 0.005;
      }
      if (accretionDiskRef.current) {
        accretionDiskRef.current.rotation.z += 0.009;
      }

      // Dynamic planetary revolution moves in coordinate orbits around Sun [-18, 0, -5]
      planetMeshes.current.forEach((item) => {
        // Rotate globe on axis
        item.mesh.rotation.y += item.rotSpeed;

        if (item.id !== "sun" && item.id !== "black-hole" && item.id !== "asteroid-belt" && item.id !== "kuiper-belt") {
          // Revolve around Solaris center using ellipse specs
          const angle = item.startTheta + (orbitTimeRef.current * item.orbitSpeed);
          const x = -18 + Math.cos(angle) * item.radX;
          const z = -5 + Math.sin(angle) * item.radZ;
          item.group.position.set(x, item.group.position.y, z);
        }

        // Circular orbit equations for moons around host planets
        if (item.satellites.length > 0) {
          const satTime = performance.now() * 0.001;
          item.satellites.forEach((moon, idx) => {
            const spec = CELESTIAL_PINS.find((p) => p.id === item.id)?.satellites[idx];
            if (spec) {
              const mAngle = satTime * spec.orbitSpeed * 15;
              moon.position.set(
                Math.cos(mAngle) * spec.orbitRadius,
                0,
                Math.sin(mAngle) * spec.orbitRadius
              );
              moon.rotation.y += 0.02;
            }
          });
        }
      });

      // Slowly rotate Asteroid Belt ring
      if (asteroidBeltRef.current) {
        asteroidBeltRef.current.rotation.y += 0.00015;
      }

      // Micropulsing twinkling stars
      if (starFieldRef.current) {
        const starTime = performance.now() * 0.0012;
        const shaderMat = starFieldRef.current.material as THREE.ShaderMaterial;
        if (shaderMat.uniforms) {
          shaderMat.uniforms.time.value = starTime;
        }
      }

      // Update controls target and position tracker
      if (orbitControlsRef.current && cameraRef.current) {
        const selectedPlanetItem = planetMeshes.current.find((p) => p.id === activePlanetIdRef.current);
        if (selectedPlanetItem) {
          const targetPos = new THREE.Vector3();
          selectedPlanetItem.group.getWorldPosition(targetPos);

          // If we are currently transitioning to a new planet
          if (transitionRef.current.progress < 1) {
            const t = transitionRef.current.progress;
            
            // 1. Smoothly interpolate the orbitControls target towards the animated target pos
            orbitControlsRef.current.target.lerpVectors(startTargetPosRef.current, targetPos, t);
            
            // 2. Smoothly interpolate the camera towards the planet's moving offset position
            const currentDestCamPos = targetPos.clone().add(transitionOffsetRef.current);
            const newCamPos = new THREE.Vector3().lerpVectors(startCamPosRef.current, currentDestCamPos, t);
            
            // Apply the cinematic 'up and over' arc using a simple parabola based on progress
            if (arcHeightRef.current > 0) {
              const parabola = 1 - Math.pow(2 * t - 1, 2);
              newCamPos.y += arcHeightRef.current * parabola;
            }
            
            cameraRef.current.position.copy(newCamPos);
            lastTargetPosRef.current.copy(targetPos);
          } else {
            // Apply orbit displacement delta to camera position to keep relative offset locked
            const delta = new THREE.Vector3().subVectors(targetPos, lastTargetPosRef.current);
            cameraRef.current.position.add(delta);
            orbitControlsRef.current.target.copy(targetPos);
            lastTargetPosRef.current.copy(targetPos);
          }
        }
        orbitControlsRef.current.update();
      }

      // --- Project 3D Coordinates of moving celestial bodies to 2D for pins HUD ---
      const pinsScreen: Record<string, { x: number; y: number; visible: boolean }> = {};

      CELESTIAL_PINS.forEach((pin) => {
        const item = planetMeshes.current.find((p) => p.id === pin.id);
        const pos = item ? item.group.position : new THREE.Vector3(pin.position[0], pin.position[1], pin.position[2]);

        const pinV = pos.clone();
        pinV.project(camera);

        const scrX = (pinV.x * 0.5 + 0.5) * 100;
        const scrY = (-(pinV.y * 0.5) + 0.5) * 100;

        // Ensure the planet lies in front of the camera, preventing pins of planets behind the camera from rendering
        const toTarget = pos.clone().sub(camera.position);
        const camDir = new THREE.Vector3();
        camera.getWorldDirection(camDir);
        const inFront = toTarget.dot(camDir) > 0;
        const visible = pinV.z < 1 && inFront;

        pinsScreen[pin.id] = {
          x: scrX,
          y: scrY,
          visible: visible
        };
      });
      onPinsUpdateRef.current(pinsScreen);

      // --- 10.1 WebGL Render Trigger ---
      if (composerRef.current) {
        composerRef.current.render();
      } else if (renderer) {
        renderer.render(scene, camera);
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    tick();

    // --- 11. Handle Resizing (ResizeObserver) ---
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === containerRef.current) {
          const w = entry.contentRect.width;
          const h = entry.contentRect.height;
          
          if (cameraRef.current && rendererRef.current) {
            cameraRef.current.aspect = w / h;
            cameraRef.current.updateProjectionMatrix();

            rendererRef.current.setSize(w, h);
            rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            if (composerRef.current) {
              composerRef.current.setSize(w, h);
            }
          }
        }
      }
    });
    resizeObserver.observe(containerRef.current);

    // Cleanup functions
    return () => {
      resizeObserver.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (orbitControlsRef.current) {
        orbitControlsRef.current.dispose();
        orbitControlsRef.current = null;
      }
      if (meteorGroupRef.current) {
        scene.remove(meteorGroupRef.current);
      }
      renderer.dispose();
    };
  }, []);

  // --- Cinematic Fly-to Planet Transitions on Selection ---
  useEffect(() => {
    if (!cameraRef.current || !orbitControlsRef.current) return;

    // Retrieve active planet mesh item
    const selectedPlanetItem = planetMeshes.current.find((p) => p.id === activePlanetId);
    if (!selectedPlanetItem) return;

    const targetPos = new THREE.Vector3();
    selectedPlanetItem.group.getWorldPosition(targetPos);

    // Retrieve selected pin data
    const selectedPin = CELESTIAL_PINS.find((p) => p.id === activePlanetId);
    if (!selectedPin) return;

    // Compute relative framing offset based on predefined hero positions for a comfortable distance
    const initialPos = selectedPin.position;
    const inspectPose = selectedPin.cameraPoses.hero || selectedPin.cameraPoses.inspect;
    const offset = new THREE.Vector3(
      inspectPose.position[0] - initialPos[0],
      inspectPose.position[1] - initialPos[1],
      inspectPose.position[2] - initialPos[2]
    );

    const destCamPos = targetPos.clone().add(offset);

    // Stop existing transition tweens
    gsap.killTweensOf(transitionRef.current);

    // Capture starting state for interpolation
    startCamPosRef.current.copy(cameraRef.current.position);
    startTargetPosRef.current.copy(orbitControlsRef.current.target);
    transitionOffsetRef.current.copy(offset);

    const dist = cameraRef.current.position.distanceTo(destCamPos);
    arcHeightRef.current = dist > 15 ? (dist * 0.25) + 5 : 0; 
    
    transitionRef.current.progress = 0;

    const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = prefersReducedMotion ? 0 : 2.4; // Slower cinematic duration

    // Drive the interpolation via a single GSAP tween on the progress value
    gsap.to(transitionRef.current, {
      progress: 1,
      duration: duration,
      ease: "power3.inOut"
    });
  }, [activePlanetId]);

  return (
    <div id="cosmic-canvas-container" ref={containerRef} className="absolute inset-0 w-full h-full bg-[#030308] z-0 overflow-hidden">
      <canvas id="cosmic-stage-canvas" ref={canvasRef} className="block w-full h-full pointer-events-auto cursor-grab active:cursor-grabbing" />
    </div>
  );
};
