import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, NgZone, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

@Component({
  selector: 'app-background-3d',
  standalone: true,
  templateUrl: './background-3d.html',
})
export class Background3D implements AfterViewInit, OnDestroy {
  @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef<HTMLDivElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private composer!: EffectComposer;
  private coins!: THREE.InstancedMesh;
  private animationId: number = 0;
  private isBrowser: boolean;
  private resizeHandler = this.onWindowResize.bind(this);

  private coinCount = 60;
  private dummy = new THREE.Object3D();

  // Store unique animation data for each coin
  private coinsData: {
    phase: number; speed: number;
    x: number; y: number; z: number;
    rx: number; ry: number; rz: number;
    scale: number;
    rotX: number; rotY: number; rotZ: number;
  }[] = [];

  constructor(
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit() {
    if (!this.isBrowser) return; // Skip Three.js entirely on the server

    this.initScene();
    this.ngZone.runOutsideAngular(() => this.animate());
    window.addEventListener('resize', this.resizeHandler);
  }

  ngOnDestroy() {
    if (!this.isBrowser) return;

    window.removeEventListener('resize', this.resizeHandler);
    cancelAnimationFrame(this.animationId);

    // Dispose resources to prevent memory leaks
    if (this.coins) {
      this.coins.geometry.dispose();
      (this.coins.material as THREE.Material).dispose();
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.composer) {
      this.composer.dispose();
    }
  }

  private initScene() {
    const container = this.canvasContainer.nativeElement;

    // ── Scene ──────────────────────────────────────────────
    this.scene = new THREE.Scene();
    // Exponential fog matching slate-900 (#0f172a) for depth
    this.scene.fog = new THREE.FogExp2(0x0f172a, 0.015);

    // ── Camera ─────────────────────────────────────────────
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    );
    this.camera.position.z = 20;

    // ── Renderer ───────────────────────────────────────────
    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x0f172a);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.6;
    container.appendChild(this.renderer.domElement);

    // ── Environment map for realistic coin reflections ─────
    const envScene = this.createEnvScene();
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    const envMap = pmremGenerator.fromScene(envScene, 0.04).texture;
    this.scene.environment = envMap;
    pmremGenerator.dispose();
    envScene.clear();

    // ── Lighting (atmospheric, not realistic) ──────────────
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambient);

    const emeraldDir = new THREE.DirectionalLight(0x34d399, 1.5);
    emeraldDir.position.set(10, 20, 10);
    this.scene.add(emeraldDir);

    const blueDir = new THREE.DirectionalLight(0x3b82f6, 1.2);
    blueDir.position.set(-10, -20, 10);
    this.scene.add(blueDir);

    const purplePoint = new THREE.PointLight(0x8b5cf6, 2, 50);
    purplePoint.position.set(0, -10, 5);
    this.scene.add(purplePoint);

    // ── Coins (single draw call via InstancedMesh) ─────────
    // Thin cylinder = coin shape (radius 1, height 0.12, 32 segments)
    const geo = new THREE.CylinderGeometry(1, 1, 0.12, 32);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffd700,       // Gold base
      roughness: 0.2,        // Smooth but not mirror-black
      metalness: 0.85,       // Metallic but lets diffuse through
      envMapIntensity: 2.0,  // Strong reflections
      emissive: 0x3d2800,    // Warm self-glow so coins are never black
      emissiveIntensity: 0.3,
    });

    this.coins = new THREE.InstancedMesh(geo, mat, this.coinCount);

    // Gold & silver color palette for variety
    const coinColors = [
      new THREE.Color(0xffd700), // Gold
      new THREE.Color(0xffb300), // Deep gold
      new THREE.Color(0xffc947), // Light gold
      new THREE.Color(0xc0c0c0), // Silver
      new THREE.Color(0xe8e8e8), // Bright silver
      new THREE.Color(0xcd7f32), // Bronze
    ];

    for (let i = 0; i < this.coinCount; i++) {
      const x = (Math.random() - 0.5) * 60;
      const y = (Math.random() - 0.5) * 60;
      const z = (Math.random() - 0.5) * 50 - 5;

      const rotX = Math.random() * Math.PI;
      const rotY = Math.random() * Math.PI;
      const rotZ = Math.random() * Math.PI;

      const scale = Math.random() * 1.2 + 0.3;

      this.dummy.position.set(x, y, z);
      this.dummy.rotation.set(rotX, rotY, rotZ);
      this.dummy.scale.set(scale, scale, scale);
      this.dummy.updateMatrix();
      this.coins.setMatrixAt(i, this.dummy.matrix);

      // Assign a random color from the palette
      this.coins.setColorAt(i, coinColors[Math.floor(Math.random() * coinColors.length)]);

      this.coinsData.push({
        x, y, z,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.4 + 0.2,
        rx: (Math.random() - 0.5) * 0.005,
        ry: (Math.random() - 0.5) * 0.008, // Faster Y rotation for coin flip feel
        rz: (Math.random() - 0.5) * 0.005,
        scale,
        rotX, rotY, rotZ,
      });
    }

    this.coins.instanceMatrix.needsUpdate = true;
    if (this.coins.instanceColor) this.coins.instanceColor.needsUpdate = true;
    this.scene.add(this.coins);

    // ── Post-processing ────────────────────────────────────
    this.composer = new EffectComposer(this.renderer);

    this.composer.addPass(new RenderPass(this.scene, this.camera));

    // Bloom — golden glow on reflective highlights
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.6,  // strength — slightly higher for metallic sparkle
      0.4,  // radius
      0.5,  // threshold
    );
    this.composer.addPass(bloom);

    // OutputPass — required in Three.js r155+ for correct final color output
    this.composer.addPass(new OutputPass());
  }

  // ── Procedural environment scene for reflections ────────
  private createEnvScene(): THREE.Scene {
    const envScene = new THREE.Scene();

    // Gradient sphere simulating ambient environment
    const envGeo = new THREE.SphereGeometry(50, 16, 16);
    const envMat = new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
    });

    // Create a gradient canvas for the environment
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, '#1a1a3e');    // Deep blue-purple top
    gradient.addColorStop(0.3, '#0f172a');  // Slate-900
    gradient.addColorStop(0.5, '#1e293b');  // Slate-800
    gradient.addColorStop(0.7, '#164e3a');  // Dark emerald
    gradient.addColorStop(1, '#0f172a');    // Slate-900 bottom
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    // Add bright spots to simulate light sources for reflections
    ctx.fillStyle = 'rgba(52, 211, 153, 0.6)'; // Emerald glow
    ctx.beginPath();
    ctx.arc(180, 60, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(59, 130, 246, 0.5)'; // Blue glow
    ctx.beginPath();
    ctx.arc(60, 200, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'; // White highlight
    ctx.beginPath();
    ctx.arc(128, 40, 15, 0, Math.PI * 2);
    ctx.fill();

    envMat.map = new THREE.CanvasTexture(canvas);
    envScene.add(new THREE.Mesh(envGeo, envMat));

    return envScene;
  }

  // ── Animation loop (runs outside Angular zone) ──────────
  private animate() {
    this.animationId = requestAnimationFrame(this.animate.bind(this));

    const t = performance.now() * 0.001; // seconds

    for (let i = 0; i < this.coinCount; i++) {
      const d = this.coinsData[i];

      // Sine-wave float
      const floatY = d.y + Math.sin(t * d.speed + d.phase) * 2.0;

      // Continuous subtle rotation (Y is faster for coin-flip feel)
      d.rotX += d.rx;
      d.rotY += d.ry;
      d.rotZ += d.rz;

      this.dummy.position.set(d.x, floatY, d.z);
      this.dummy.rotation.set(d.rotX, d.rotY, d.rotZ);
      this.dummy.scale.set(d.scale, d.scale, d.scale);
      this.dummy.updateMatrix();
      this.coins.setMatrixAt(i, this.dummy.matrix);
    }

    this.coins.instanceMatrix.needsUpdate = true;
    this.composer.render();
  }

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.composer.setSize(window.innerWidth, window.innerHeight);
  }
}
