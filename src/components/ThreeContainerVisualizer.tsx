import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Loader2 } from "lucide-react";

export default function ThreeContainerVisualizer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene setup with premium clean corporate studio atmosphere (transparent)
    const scene = new THREE.Scene();

    // 2. Camera setup — z calculated so diagonal never clips during rotation
    const aspect = width / height;
    const fov = 42;
    // Container diagonal half = sqrt(4.14²+1.62²)/2 ≈ 2.23 — add 15% safety margin
    const calcZ = (asp: number) => Math.max((2.23 * 1.15) / (Math.tan((fov / 2) * Math.PI / 180) * Math.max(asp, 0.5)), 5.0);
    const camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 100);
    camera.position.set(0, 1.4, calcZ(aspect));

    // 3. Renderer setup - High-fidelity PBR pipeline
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    // Capped at 2x instead of 3x — beyond 2x the extra sharpness is imperceptible on
    // this element's size, but the fragment-shader cost (all those PBR materials +
    // shadows) scales with pixel count, so 3x was a heavy, mostly-wasted multiplier.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // Real-time shadow mapping DISABLED. A dynamic shadow means an entire second render
    // pass every frame — the whole scene redrawn from the light's point of view into a
    // depth texture, on top of the normal camera render — across 15+ shadow-casting
    // meshes, forever, while this is on screen. That was still the single most expensive
    // thing left after every other pass of optimization. The floating container already
    // has its own fake "contact shadow" — a cheap textured plane (contactShadowMesh,
    // below) that dims/scales with float height — carrying the visual "grounded" read on
    // its own, so a real dynamic shadow is no longer necessary here.
    renderer.shadowMap.enabled = false;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;

    // --- PROCEDURAL TEXTURES FOR MAXIMUM RESOLUTION METALLIC WORK ---

    // A. BUMP MAP FOR STEEL CORRUGATION
    const createCorrugationBumpMap = () => {
      const size = 1024; // Doubled resolution for ultra-crisp ridges
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      
      if (ctx) {
        // Base normal height
        ctx.fillStyle = "#808080";
        ctx.fillRect(0, 0, size, size);

        // Sinusoidal container corrugation wave
        for (let x = 0; x < size; x++) {
          const wave = (x / size) * Math.PI * 2 * 14; 
          const val = (Math.sin(wave) + 1) / 2;
          const steepVal = Math.pow(val, 0.7);
          const gray = Math.floor(steepVal * 255);
          ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
          ctx.fillRect(x, 0, 1, size);
        }

        // Add fine steel noise & heavy metal pitting
        for (let i = 0; i < 5000; i++) {
          const x = Math.random() * size;
          const y = Math.random() * size;
          const val = Math.floor(Math.random() * 40 - 20);
          ctx.fillStyle = `rgba(${128 + val}, ${128 + val}, ${128 + val}, 0.09)`;
          ctx.fillRect(x, y, 1, 1);
        }

        // Diagonal scratches and weathering in normal map
        ctx.strokeStyle = "rgba(100, 100, 100, 0.15)";
        ctx.lineWidth = 1;
        for (let i = 0; i < 30; i++) {
          ctx.beginPath();
          const x = Math.random() * size;
          const y = Math.random() * size;
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.random() * 40 - 20, y + Math.random() * 15 - 75);
          ctx.stroke();
        }
      }
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      return texture;
    };

    // B. TEXTURE MAP WITH DECALS & BRAND IDENTITY (8K/4K Industrial Resolution)
    const createDecalTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 2048;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // Base coat: Premium Safety Yellow
        ctx.fillStyle = "#eab308";
        ctx.fillRect(0, 0, 2048, 1024);
        
        // High-contrast, vibrant golden-yellow bands representing heavy structure lines
        ctx.fillStyle = "#f59e0b"; 
        ctx.fillRect(760, 0, 120, 1024); // Thick central vertical band
        
        ctx.fillStyle = "#d97706"; // Deep Amber stripe
        ctx.fillRect(880, 0, 30, 1024);

        // Draw structural vertical lines on the canvas to match panel sections
        ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
        for (let x = 0; x < 2048; x += 146) {
          ctx.fillRect(x, 0, 4, 1024);
        }

        // Add ultra-realistic physical weathering noise & metallic pitting
        for (let i = 0; i < 8000; i++) {
          const x = Math.random() * 2048;
          const y = Math.random() * 1024;
          const size = Math.random() * 1.5 + 0.5;
          const opacity = Math.random() * 0.15;
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.25})`; // Tiny aluminum chips/dust
          ctx.fillRect(x, y, size, size);
        }
        for (let i = 6000; i > 0; i--) {
          const x = Math.random() * 2048;
          const y = Math.random() * 1024;
          const size = Math.random() * 1.5;
          const opacity = Math.random() * 0.15;
          ctx.fillStyle = `rgba(0, 0, 0, ${opacity * 0.6})`; // Mud/dirt/diesel soot stains
          ctx.fillRect(x, y, size, size);
        }

        // Realistic moisture dripping marks from the top roof frame down
        for (let i = 0; i < 40; i++) {
          const x = Math.random() * 2048;
          const h = Math.random() * 150 + 50;
          const grad = ctx.createLinearGradient(x, 0, x, h);
          grad.addColorStop(0, "rgba(5, 7, 10, 0.15)");
          grad.addColorStop(1, "rgba(5, 7, 10, 0)");
          ctx.fillStyle = grad;
          ctx.fillRect(x - 5, 0, 10, h);
        }

        // Subtle industrial metallic scratched edge borders
        ctx.strokeStyle = "rgba(15, 23, 42, 0.18)";
        ctx.lineWidth = 3;
        ctx.strokeRect(6, 6, 2036, 1012);

        // Safety industrial Zebra Warning Stripes at the container base
        ctx.fillStyle = "#eab308"; // Deep vibrant gold base
        ctx.fillRect(0, 950, 2048, 74);

        ctx.fillStyle = "#1e293b"; // Low-sheen dark slate stripes in the warning block
        for (let offset = 0; offset < 2100; offset += 70) {
          ctx.beginPath();
          ctx.moveTo(offset, 950);
          ctx.lineTo(offset + 35, 950);
          ctx.lineTo(offset + 10, 1024);
          ctx.lineTo(offset - 25, 1024);
          ctx.closePath();
          ctx.fill();
        }

        // --- TECHNICAL DECALS - SHARP BLACK FONTS FOR ULTRA REALISM ---
        ctx.shadowColor = "rgba(255, 255, 255, 0.45)";
        ctx.shadowBlur = 1;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        // Container serial identification numbers
        ctx.font = '900 72px "Courier New", monospace';
        ctx.fillStyle = "#0f172a";
        ctx.fillText("DDSU 940185-0", 120, 190);
        
        ctx.font = '700 32px "Space Grotesk", sans-serif';
        ctx.fillStyle = "#0f172a";
        ctx.fillText("CLASS: 20GP HEAVY DUTY", 120, 260);

        ctx.font = '500 28px "Courier New", monospace';
        ctx.fillStyle = "#1e293b";
        ctx.fillText("MAX. PAYLOAD: 32.500 KG / 71.650 LBS", 120, 320);
        ctx.fillText("TARE WEIGHT:   2.180 KG /  4.800 LBS", 120, 370);
        ctx.fillText("NET CAPACITY:  33.2 CBM /  1.172 CBF", 120, 420);
        
        ctx.font = '900 24px "Courier New", monospace';
        ctx.fillStyle = "#0f172a"; // High-contrast black status approval
        ctx.fillText("✓ STRUCTURAL CONTAINER INTEGRITY CERTIFIED & APPROVED", 120, 500);

        // Primary Brand Name: DODISA
        ctx.fillStyle = "#0f172a";
        ctx.font = '900 130px "Space Grotesk", sans-serif';
        ctx.fillText("DODISA", 1200, 210);

        ctx.font = '700 32px "Space Grotesk", sans-serif';
        ctx.fillStyle = "#1e293b";
        ctx.fillText("TECNOLOGIA MODULAR • LOGÍSTICA PREMIUM", 1200, 280);
        ctx.fillText("CORTEN STEEL CORROSION DETECT", 1200, 328);

        // Premium dynamic logo monogram drawing
        ctx.shadowBlur = 0; // Disable shadow for clean layout vectors
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.fillStyle = "#0f172a"; // Premium clean black logo
        ctx.beginPath();
        ctx.moveTo(1200, 380);
        ctx.lineTo(1290, 380);
        ctx.lineTo(1350, 540);
        ctx.lineTo(1290, 700);
        ctx.lineTo(1200, 700);
        ctx.lineTo(1260, 540);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "rgba(15, 23, 42, 0.70)"; // Sleek semi-translucent overlay black
        ctx.beginPath();
        ctx.moveTo(1310, 380);
        ctx.lineTo(1400, 380);
        ctx.lineTo(1460, 540);
        ctx.lineTo(1400, 700);
        ctx.lineTo(1310, 700);
        ctx.lineTo(1370, 540);
        ctx.closePath();
        ctx.fill();

        ctx.font = '900 28px sans-serif';
        ctx.fillStyle = "#0f172a";
        ctx.fillText("PATIO INDUSTRIAL SANTOS • BRASIL", 1200, 800);
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      return texture;
    };

    // C. ROUGHNESS & METALLIC MAP FOR DYNAMIC COATING SHINE
    const createSpecularRoughnessMap = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      
      if (ctx) {
        // Semi-matte base lacquer paint (145 value corresponds to optimal 0.55 roughness)
        ctx.fillStyle = "#959595";
        ctx.fillRect(0, 0, 1024, 512);

        // Highly reflective metal scratches
        ctx.strokeStyle = "#282828";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(3, 3, 1018, 506);

        ctx.strokeStyle = "#353535";
        for (let i = 0; i < 60; i++) {
          ctx.beginPath();
          const x = Math.random() * 1024;
          const y = Math.random() * 512;
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.random() * 40 - 20, y + Math.random() * 15 - 7.5);
          ctx.stroke();
        }

        // Solid warning stripes are matte black rubberized paint (low spec, high roughness)
        ctx.fillStyle = "#dedede";
        for (let offset = 0; offset < 1000; offset += 35) {
          ctx.beginPath();
          ctx.moveTo(10 + offset, 475);
          ctx.lineTo(30 + offset, 475);
          ctx.lineTo(15 + offset, 505);
          ctx.lineTo(5 + offset, 505);
          ctx.closePath();
          ctx.fill();
        }
      }
      return new THREE.CanvasTexture(canvas);
    };

    // D. ROOF WEATHERING TEXTURE
    const createRoofTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ca8a04";
        ctx.fillRect(0, 0, 512, 512);

        // Corrosion rings and weather staining
        for (let i = 0; i < 1500; i++) {
          const x = Math.random() * 512;
          const y = Math.random() * 512;
          const r = Math.random() * 2.0;
          ctx.fillStyle = `rgba(120, 80, 0, ${Math.random() * 0.12})`;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      return new THREE.CanvasTexture(canvas);
    };

    // E. CONTACT SHADOW MAP (Ambient Occlusion Shadow on Floor)
    // Eliminates the "floating artifact" flawlessly!
    const createContactShadowTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 512, 256);

        // Draw a thick blurred black ellipse exactly beneath the container length
        const gradient = ctx.createRadialGradient(256, 128, 20, 256, 128, 220);
        gradient.addColorStop(0, "rgba(0, 0, 0, 0.85)");
        gradient.addColorStop(0.3, "rgba(0, 0, 0, 0.6)");
        gradient.addColorStop(0.6, "rgba(0, 0, 0, 0.25)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 256);
      }
      const texture = new THREE.CanvasTexture(canvas);
      return texture;
    };

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

    const bumpMap = createCorrugationBumpMap();
    bumpMap.anisotropy = maxAnisotropy;

    const decalMap = createDecalTexture();
    decalMap.anisotropy = maxAnisotropy;

    const roughnessMap = createSpecularRoughnessMap();
    roughnessMap.anisotropy = maxAnisotropy;

    const roofMap = createRoofTexture();
    roofMap.anisotropy = maxAnisotropy;

    const contactShadowMap = createContactShadowTexture();

    // 4. Container Group (Main Pivot to host the entire reconstructed 3D assembly!)
    const containerGroup = new THREE.Group();
    scene.add(containerGroup);

    // --- EXPERT PHYSICAL PBR MATERIALS ASSEMBLY ---
    
    // Core side panel corrugated plates material.
    // Previously MeshPhysicalMaterial with a clearcoat layer (an extra BRDF pass evaluated
    // per fragment, per light, every frame, forever). Dropped down to MeshStandardMaterial —
    // still metallic/glossy via metalness+roughness, just without the second glossy coat
    // layer on top. Visual trade-off: the paint reads very slightly less "wet/glossy" up
    // close, but at this element's on-screen size it is very hard to notice, and it removes
    // real continuous per-frame shader cost.
    const sideMaterial = new THREE.MeshStandardMaterial({
      map: decalMap,
      bumpMap: bumpMap,
      bumpScale: 0.08,
      roughnessMap: roughnessMap,
      roughness: 0.40,
      metalness: 0.88,
    });

    // Outer framing structural metal
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0xca8a04, // Painted structural gold/yellow
      roughness: 0.42,
      metalness: 0.85,
    });

    const roofMaterial = new THREE.MeshStandardMaterial({
      map: roofMap,
      bumpMap: bumpMap,
      bumpScale: 0.10,
      roughness: 0.58,
      metalness: 0.70,
    });

    const chassisMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Saturated slate chassis base for beautiful undercarriage contrast
      roughness: 0.65,
      metalness: 0.90,
    });

    const hardwareMaterial = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // High-sheen silver steel for door locks/rods
      roughness: 0.20,
      metalness: 0.95,
    });

    const cornerCastingMaterial = new THREE.MeshStandardMaterial({
      color: 0xca8a04, // Painted yellow corner castings
      roughness: 0.55,
      metalness: 0.80,
    });

    // Material selection array for the inner Box Body (top, bottom, and side panels)
    const bodyMaterials = [
      frameMaterial, // Right face
      frameMaterial, // Left face
      roofMaterial,  // Top face
      chassisMaterial, // Bottom face
      sideMaterial,  // Front face (decals & stripes)
      sideMaterial,  // Back face
    ];

    // --- RECONSTRUCTED GEOMETRIES ASSEMBLY ---

    // 1. RECESSED BOX CORE: Represents the corrugated bulk steel walls of the container
    const widthCore = 4.14;
    const heightCore = 1.62;
    const depthCore = 1.62;
    // Segments dropped from 50x10x10 to 1x1x1: bump/normal detail comes entirely from the
    // texture maps (bumpMap), not vertex displacement, so the extra ~2500 vertices were
    // pure GPU overhead (vertex processing + shadow pass) with zero visual difference.
    const innerBodyGeo = new THREE.BoxGeometry(widthCore, heightCore, depthCore, 1, 1, 1);
    const bodyMesh = new THREE.Mesh(innerBodyGeo, bodyMaterials);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    containerGroup.add(bodyMesh);

    // 2. 3D STRUCTURAL CORNER POSTS (4 vertical posts creating depth recess)
    const postGeo = new THREE.BoxGeometry(0.08, 1.68, 0.08);
    const coordsPosts = [
      [-2.07, 0, 0.81],
      [2.07, 0, 0.81],
      [-2.07, 0, -0.81],
      [2.07, 0, -0.81]
    ];
    coordsPosts.forEach(([x, y, z]) => {
      const postMesh = new THREE.Mesh(postGeo, frameMaterial);
      postMesh.position.set(x, y, z);
      postMesh.castShadow = true;
      postMesh.receiveShadow = true;
      containerGroup.add(postMesh);
    });

    // 3. 3D STRUCTURAL HORIZONTAL TOP RAILS
    const topLongGeo = new THREE.BoxGeometry(4.14, 0.06, 0.08);
    const topShortGeo = new THREE.BoxGeometry(0.08, 0.06, 1.62);
    
    // Front and Back Long Top Rails
    const frontTopRail = new THREE.Mesh(topLongGeo, frameMaterial);
    frontTopRail.position.set(0, 0.81, 0.81);
    frontTopRail.castShadow = true;
    containerGroup.add(frontTopRail);

    const backTopRail = new THREE.Mesh(topLongGeo, frameMaterial);
    backTopRail.position.set(0, 0.81, -0.81);
    backTopRail.castShadow = true;
    containerGroup.add(backTopRail);

    // Left and Right Short Top Rails
    const leftTopRail = new THREE.Mesh(topShortGeo, frameMaterial);
    leftTopRail.position.set(-2.07, 0.81, 0);
    leftTopRail.castShadow = true;
    containerGroup.add(leftTopRail);

    const rightTopRail = new THREE.Mesh(topShortGeo, frameMaterial);
    rightTopRail.position.set(2.07, 0.81, 0);
    rightTopRail.castShadow = true;
    containerGroup.add(rightTopRail);

    // 4. 3D STRUCTURAL BOTTOM INDENTED BASE GIRDERS
    const botLongGeo = new THREE.BoxGeometry(4.14, 0.10, 0.08);
    const botShortGeo = new THREE.BoxGeometry(0.08, 0.10, 1.62);

    const frontBottomRail = new THREE.Mesh(botLongGeo, frameMaterial);
    frontBottomRail.position.set(0, -0.81, 0.81);
    frontBottomRail.castShadow = true;
    containerGroup.add(frontBottomRail);

    const backBottomRail = new THREE.Mesh(botLongGeo, frameMaterial);
    backBottomRail.position.set(0, -0.81, -0.81);
    backBottomRail.castShadow = true;
    containerGroup.add(backBottomRail);

    const leftBottomRail = new THREE.Mesh(botShortGeo, frameMaterial);
    leftBottomRail.position.set(-2.07, -0.81, 0);
    leftBottomRail.castShadow = true;
    containerGroup.add(leftBottomRail);

    const rightBottomRail = new THREE.Mesh(botShortGeo, frameMaterial);
    rightBottomRail.position.set(2.07, -0.81, 0);
    rightBottomRail.castShadow = true;
    containerGroup.add(rightBottomRail);

    // 5. HEAVY INDUSTRIAL FORKLIFT POCKETS OVER BOTTOM RAILS (Elite Realism Component)
    const pocketPlateGeo = new THREE.BoxGeometry(0.24, 0.06, 0.02);
    const innerTunnelGeo = new THREE.BoxGeometry(0.20, 0.04, 0.005);
    const pocketPlateCoords = [
      [-0.8, -0.81, 0.83],
      [0.8, -0.81, 0.83],
      [-0.8, -0.81, -0.83],
      [0.8, -0.81, -0.83]
    ];
    pocketPlateCoords.forEach(([x, y, z]) => {
      const pocketMesh = new THREE.Mesh(pocketPlateGeo, frameMaterial);
      pocketMesh.position.set(x, y, z);
      pocketMesh.castShadow = true;
      containerGroup.add(pocketMesh);

      // Black hollow pocket core representing actual mechanical insert tunnel
      const innerTunnelMesh = new THREE.Mesh(innerTunnelGeo, chassisMaterial);
      innerTunnelMesh.position.set(x, y, z + (z > 0 ? 0.011 : -0.011));
      containerGroup.add(innerTunnelMesh);
    });

    // 6. 3D CORNER CASTINGS (Heavy solid corner blocks on 8 structural intersections)
    const cornerCastingGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
    const coordsCastings = [
      [2.08, 0.83, 0.83], [2.08, 0.83, -0.83], [2.08, -0.83, 0.83], [2.08, -0.83, -0.83],
      [-2.08, 0.83, 0.83], [-2.08, 0.83, -0.83], [-2.08, -0.83, 0.83], [-2.08, -0.83, -0.83],
    ];
    coordsCastings.forEach(([x, y, z]) => {
      const castingMesh = new THREE.Mesh(cornerCastingGeo, cornerCastingMaterial);
      castingMesh.position.set(x, y, z);
      castingMesh.castShadow = true;
      castingMesh.receiveShadow = true;
      containerGroup.add(castingMesh);
    });

    // 7. ULTRA-DETAILED 3D DOOR LOCK RODS & HINGES (Active Rear Face - Left Door Panel at x = -2.08)
    const rodGeo = new THREE.CylinderGeometry(0.015, 0.015, 1.62, 12);
    const plateGeo = new THREE.BoxGeometry(0.05, 0.02, 0.05);
    const handleGeo = new THREE.BoxGeometry(0.02, 0.16, 0.06);

    const doorRodCoords = [0.35, -0.35];
    doorRodCoords.forEach((zPos) => {
      // Locking pipe rod
      const lockRod = new THREE.Mesh(rodGeo, hardwareMaterial);
      lockRod.position.set(-2.079, 0, zPos);
      lockRod.castShadow = true;
      containerGroup.add(lockRod);

      // Rod brackets (Top, mid-high, mid-low, bottom clamping brackets)
      const bracketHeights = [0.65, 0.25, -0.25, -0.65];
      bracketHeights.forEach((by) => {
        const bracket = new THREE.Mesh(plateGeo, hardwareMaterial);
        bracket.position.set(-2.079, by, zPos);
        containerGroup.add(bracket);
      });

      // Locking rod lever handle
      const rodHandle = new THREE.Mesh(handleGeo, hardwareMaterial);
      rodHandle.position.set(-2.095, -0.15, zPos + (zPos > 0 ? 0.04 : -0.04));
      rodHandle.rotation.z = zPos > 0 ? -0.15 : 0.15;
      containerGroup.add(rodHandle);
    });

    // 8. 3D STRUCTURAL DOOR HINGES (Left & Right margins of door face)
    const hingeGeo = new THREE.BoxGeometry(0.04, 0.06, 0.05);
    const doorHingesCoords = [
      [-2.071, 0.60, 0.79], [-2.071, 0, 0.79], [-2.071, -0.60, 0.79],
      [-2.071, 0.60, -0.79], [-2.071, 0, -0.79], [-2.071, -0.60, -0.79]
    ];
    doorHingesCoords.forEach(([hx, hy, hz]) => {
      const hinge = new THREE.Mesh(hingeGeo, cornerCastingMaterial);
      hinge.position.set(hx, hy, hz);
      hinge.castShadow = true;
      containerGroup.add(hinge);
    });

    // 9. HIGH IMPORTANCE CARGO SAFETY PLACARD (A physical, gorgeous warning diamond plate on panel)
    const diamondGeo = new THREE.PlaneGeometry(0.12, 0.12);
    const diamondCanvas = document.createElement("canvas");
    diamondCanvas.width = 128;
    diamondCanvas.height = 128;
    const dctx = diamondCanvas.getContext("2d");
    if (dctx) {
      dctx.fillStyle = "#FF5500"; // Saturated hazard orange
      dctx.fillRect(0, 0, 128, 128);
      dctx.fillStyle = "#FFFFFF";
      dctx.font = '900 48px sans-serif';
      dctx.textAlign = "center";
      dctx.textBaseline = "middle";
      dctx.fillText("1", 64, 64);
      dctx.strokeStyle = "#FFFFFF";
      dctx.lineWidth = 4;
      dctx.strokeRect(6, 6, 116, 116);
    }
    const diamondTex = new THREE.CanvasTexture(diamondCanvas);
    const diamondMat = new THREE.MeshStandardMaterial({
      map: diamondTex,
      roughness: 0.3,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    const placardMesh = new THREE.Mesh(diamondGeo, diamondMat);
    placardMesh.position.set(1.9, 0.15, 0.816);
    placardMesh.rotation.z = Math.PI / 4; // Rotate to form the classic cargo safety diamond
    containerGroup.add(placardMesh);

    // --- CINEMATIC AMBIENT STAGE & REFLECTIVE INDUSTRIAL FLOOR ---
    // (The concrete floor, grid markings, and runway guideline meshes that used to live
    // here were built every mount but never added to the scene — scene.add() was
    // commented out to keep the transparent floating-container look. Removed entirely;
    // they cost real CPU/geometry work for zero visual effect.)

    // AMBIENT CONTACT SHADOW (AO) PLANE
    // Directly caught below the container for zero floating-glitch, blending perfectly with MultiplyBlending!
    const shadowPlaneGeo = new THREE.PlaneGeometry(5.0, 2.5);
    const shadowPlaneMat = new THREE.MeshBasicMaterial({
      map: contactShadowMap,
      transparent: true,
      blending: THREE.MultiplyBlending, // Perfect multiplication shadow regardless of background tone
      premultipliedAlpha: true,
      opacity: 0.85
    });
    const contactShadowMesh = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    contactShadowMesh.rotation.x = -Math.PI / 2;
    contactShadowMesh.position.set(0, -0.875, 0); // Positioned directly over the concrete floor
    scene.add(contactShadowMesh);

    // --- IMMERSIVE LIGHTING SYSTEM ---
    // (A whole background warehouse-yard group — pillars, steel trusses, 4 background
    // containers, volumetric light cones, plus 4 extra point lights — used to be built
    // here on every mount. Like the floor above, it was never added to the scene
    // (scene.add(bgGroup) was commented out), so it was pure dead work: dozens of
    // meshes/geometries/materials constructed and instantly discarded. Removed.)

    // A. Sunny Golden Studio Spotlight (shadow casting disabled above — see renderer setup)
    const sunLight = new THREE.DirectionalLight(0xfff6e5, 5.8);
    sunLight.position.set(6, 10, 4);
    scene.add(sunLight);

    // B. Dramatic Blue Accent Outline Rimlight (Highlighting metal gloss corners)
    const rimBlueLight = new THREE.DirectionalLight(0x3b82f6, 4.2);
    rimBlueLight.position.set(-6, 4, -4);
    scene.add(rimBlueLight);

    // C. Crisp Front Ambient Fill for high-resolution graphics and corporate legibility
    const frontFillLight = new THREE.DirectionalLight(0xffffff, 2.8);
    frontFillLight.position.set(0, 2, 6.0);
    scene.add(frontFillLight);

    // D. Soft Environment Skylight for overall PBR brightness
    const skyLight = new THREE.AmbientLight(0xffffff, 2.2);
    scene.add(skyLight);

    // E. Glowing Highlight Spot on the Floor — REMOVED.
    // Every active light in the scene is evaluated per-fragment, every frame, across every
    // PBR material (7 materials on this model). A PointLight is pricier than a directional
    // one because it also needs a per-fragment distance/attenuation calc. This one only ever
    // added a subtle warm glow on the floor contact-shadow plane — the ambient + sun light
    // already carry the visible read of "grounded", so cutting it trims real per-frame cost
    // across the whole model for a change that's essentially invisible.

    // --- RENDER LOOP WITH CINEMATIC AUTOMATIONS ---

    const clock = new THREE.Clock();
    let animationFrameId: number;
    // Gate the render loop by visibility — without this it kept rendering forever,
    // even scrolled far off-screen, burning CPU/GPU continuously in the background.
    let isRunning = false;

    // Cap the actual GPU render to ~30fps. The rAF callback itself still fires at the
    // display's native rate (needed so cancel/visibility toggling stays responsive), but the
    // expensive part — renderer.render(), which re-runs the fragment shaders, the shadow
    // pass, everything — only happens on roughly every other tick on a 60Hz screen, and
    // roughly every 4th tick on a 120Hz/144Hz one. For a slow, ambient drift/rotation like
    // this, 30fps is visually indistinguishable from 60+ fps, but it is a direct ~2-4x cut
    // in the ongoing, continuous per-frame cost — the actual bottleneck once mount-time
    // costs were already trimmed in earlier passes.
    const minFrameInterval = 1000 / 30;
    let lastRenderTime = 0;

    const animate = (now: number) => {
      if (!isRunning) return;
      animationFrameId = requestAnimationFrame(animate);

      if (now - lastRenderTime < minFrameInterval) return;
      lastRenderTime = now;

      const elapsed = clock.getElapsedTime();

      // slow, majestic continuous 360° presentation rotation
      containerGroup.rotation.y = elapsed * 0.12; 

      // GENTLE PHYSICAL FLOATING EFFECT
      const floatHeight = Math.sin(elapsed * 1.0) * 0.14 + 0.22; // Elevate above ground
      containerGroup.position.y = floatHeight;

      // Realtime shadow scale and opacity physical compensation based on current elevation
      const shadowScale = Math.max(0.6, 1.05 - floatHeight * 0.35);
      contactShadowMesh.scale.set(shadowScale, shadowScale, 1);
      shadowPlaneMat.opacity = Math.max(0.2, 0.88 - floatHeight * 0.7);

      // Subtle camera breathing float
      camera.position.y = 0.6 + Math.sin(elapsed * 0.35) * 0.05;
      camera.position.x = Math.sin(elapsed * 0.18) * 0.05;
      camera.lookAt(0, floatHeight - 0.4, 0);

      renderer.render(scene, camera);
    };

    // --- RESPONSIVE SCALING HANDLER ---
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      const asp = w / h;
      camera.aspect = asp;
      camera.position.z = calcZ(asp);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    isRunning = true;
    animate(0);
    handleResize();
    setLoading(false);

    window.addEventListener("resize", handleResize);

    // Pause the render loop while scrolled off-screen, resume when back in view
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!isRunning) {
            isRunning = true;
            lastRenderTime = 0;
            animate(0);
          }
        } else {
          isRunning = false;
          cancelAnimationFrame(animationFrameId);
        }
      },
      { threshold: 0 }
    );
    visibilityObserver.observe(containerRef.current);

    // clean memory on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
      visibilityObserver.disconnect();
      isRunning = false;
      cancelAnimationFrame(animationFrameId);

      // Deep clean THREE geometries and textures to prevent hardware memory leaks
      bumpMap.dispose();
      decalMap.dispose();
      roughnessMap.dispose();
      roofMap.dispose();
      contactShadowMap.dispose();
      innerBodyGeo.dispose();
      postGeo.dispose();
      topLongGeo.dispose();
      topShortGeo.dispose();
      botLongGeo.dispose();
      botShortGeo.dispose();
      pocketPlateGeo.dispose();
      innerTunnelGeo.dispose();
      cornerCastingGeo.dispose();
      rodGeo.dispose();
      plateGeo.dispose();
      handleGeo.dispose();
      hingeGeo.dispose();
      diamondGeo.dispose();
      diamondTex.dispose();
      shadowPlaneGeo.dispose();
      shadowPlaneMat.dispose();

      // Body/structural materials (previously leaked — never disposed on unmount)
      sideMaterial.dispose();
      frameMaterial.dispose();
      roofMaterial.dispose();
      chassisMaterial.dispose();
      hardwareMaterial.dispose();
      cornerCastingMaterial.dispose();
      diamondMat.dispose();

      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative flex items-center justify-center bg-transparent"
    >
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/10 backdrop-blur-sm z-30 space-y-3 rounded-xl">
          <Loader2 className="w-8 h-8 text-[#eab308] animate-spin" />
          <span className="text-[10px] font-mono tracking-widest text-[#eab308] uppercase font-bold">
            MONTANDO CONTEINER DODISA 3D EM ALTA FIDELIDADE...
          </span>
        </div>
      )}
      <canvas ref={canvasRef} className="w-full h-full block relative z-10 cursor-default outline-none" />
    </div>
  );
}
