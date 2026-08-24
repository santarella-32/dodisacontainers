import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { Loader2, RotateCcw } from "lucide-react";

export interface ContainerVisualizer3DProps {
  acabamento?: string;
  piso?: string;
  janelas?: number;
  temAC?: boolean;
  temEletrica?: boolean;
  step?: number; // auto-switches to interior on steps 2 (Piso) and 3 (Pintura)
}

function getExteriorHex(acabamento?: string): number {
  switch (acabamento) {
    case "Amarelo Dodisa":    return 0xC89A00;
    case "Verde Militar":     return 0x2d5a1e;
    case "Branco Pérola":     return 0xC8CDD4;
    case "Cor Personalizada": return 0x6D28D9;
    default:                  return 0x374151;
  }
}

function getFloorHex(piso?: string): number {
  switch (piso) {
    case "Madeira Compensada": return 0x7c3a10;
    case "Epóxi Industrial":   return 0x1e3a8a;
    case "Porcelanato":        return 0x9ca3b0;
    case "Cimento Queimado":   return 0x52525b;
    default:                   return 0x1c1c1e;
  }
}

export default function ContainerVisualizer3D({
  acabamento, piso, janelas = 0, temAC = false, temEletrica = false, step,
}: ContainerVisualizer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"exterior" | "interior">("exterior");

  // Imperative refs for live updates without re-mounting
  const sideMat       = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const frameMat      = useRef<THREE.MeshStandardMaterial | null>(null);
  const roofMat       = useRef<THREE.MeshStandardMaterial | null>(null);
  const floorMat      = useRef<THREE.MeshStandardMaterial | null>(null);
  const intWallMat    = useRef<THREE.MeshStandardMaterial | null>(null);
  const bodyMeshRef   = useRef<THREE.Mesh | null>(null);
  const transpMatRef  = useRef<THREE.MeshBasicMaterial | null>(null);
  const intFillRef    = useRef<THREE.PointLight | null>(null);
  const acGroupRef    = useRef<THREE.Group | null>(null);
  const ledRef        = useRef<THREE.Mesh | null>(null);
  const ledLightRef   = useRef<THREE.PointLight | null>(null);
  const windowsGroupRef = useRef<THREE.Group | null>(null);

  // Interaction refs (no re-render on change)
  const rotY        = useRef(0.4);
  const rotX        = useRef(0.08);
  const groupRef    = useRef<THREE.Group | null>(null);
  const camRef      = useRef<THREE.PerspectiveCamera | null>(null);
  const rendRef     = useRef<THREE.WebGLRenderer | null>(null);
  const rafRef      = useRef(0);
  const autoRotate  = useRef(true);
  const autoTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ptrDown     = useRef(false);
  const lastPtr     = useRef({ x: 0, y: 0 });
  const viewRef     = useRef<"exterior" | "interior">("exterior");
  const tgtCam      = useRef(new THREE.Vector3(0, 1.3, 6.2));
  const tgtLook     = useRef(new THREE.Vector3(0, 0.15, 0));
  const curLook     = useRef(new THREE.Vector3(0, 0.15, 0));

  // ── Scene (built once) ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const W = containerRef.current.clientWidth || 480;
    const H = containerRef.current.clientHeight || 340;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 80);
    camera.position.copy(tgtCam.current);
    camera.lookAt(tgtLook.current);
    camRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    rendRef.current = renderer;

    // ── Corrugation bump map ──────────────────────────────────────────────
    const bumpC = document.createElement("canvas");
    bumpC.width = 512; bumpC.height = 512;
    const bctx = bumpC.getContext("2d")!;
    bctx.fillStyle = "#808080"; bctx.fillRect(0, 0, 512, 512);
    for (let x = 0; x < 512; x++) {
      const v = Math.floor(((Math.sin((x / 512) * Math.PI * 2 * 14) + 1) / 2) * 255);
      bctx.fillStyle = `rgb(${v},${v},${v})`;
      bctx.fillRect(x, 0, 1, 512);
    }
    const bumpMap = new THREE.CanvasTexture(bumpC);
    bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;
    bumpMap.anisotropy = renderer.capabilities.getMaxAnisotropy();

    // ── Materials ──────────────────────────────────────────────────────────
    const extHex = getExteriorHex(acabamento);

    const side = new THREE.MeshPhysicalMaterial({
      color: extHex, bumpMap, bumpScale: 0.07,
      roughness: 0.40, metalness: 0.88, clearcoat: 0.35, clearcoatRoughness: 0.15,
    });
    sideMat.current = side;

    const frame = new THREE.MeshStandardMaterial({
      color: extHex, roughness: 0.44, metalness: 0.85,
    });
    frameMat.current = frame;

    const roof = new THREE.MeshStandardMaterial({
      color: extHex, bumpMap, bumpScale: 0.10, roughness: 0.55, metalness: 0.70,
    });
    roofMat.current = roof;

    const chassis = new THREE.MeshStandardMaterial({
      color: 0x1e293b, roughness: 0.65, metalness: 0.90,
    });

    // Invisible "cut-away" material — replaces the front face in interior view
    const transpMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
    transpMatRef.current = transpMat;

    const hw = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, roughness: 0.20, metalness: 0.95,
    });

    const castMat = new THREE.MeshStandardMaterial({
      color: 0x1a2030, roughness: 0.50, metalness: 0.90,
    });

    const interiorWallMat = new THREE.MeshStandardMaterial({
      color: extHex, roughness: 0.65, metalness: 0.25,
      side: THREE.BackSide,
    });
    intWallMat.current = interiorWallMat;

    const floorHex = getFloorHex(piso);
    const floor = new THREE.MeshStandardMaterial({
      color: floorHex, roughness: 0.78, metalness: 0.08,
    });
    floorMat.current = floor;

    // ── Container dimensions ──────────────────────────────────────────────
    const CW = 4.14, CH = 1.62, CD = 1.62;

    // ── Group ──────────────────────────────────────────────────────────────
    const group = new THREE.Group();
    groupRef.current = group;
    group.rotation.y = rotY.current;
    group.rotation.x = rotX.current;
    scene.add(group);

    // Body mesh (exterior) — face indices: 0=+X 1=-X 2=+Y(roof) 3=-Y 4=+Z(front) 5=-Z(back)
    const bodyGeo = new THREE.BoxGeometry(CW, CH, CD, 40, 8, 8);
    const body = new THREE.Mesh(bodyGeo, [
      side, side, roof, chassis, side, side,
    ]);
    body.castShadow = true;
    body.receiveShadow = true;
    bodyMeshRef.current = body;
    group.add(body);

    // Interior walls (BackSide) — multi-material: transparent bottom so floor plane shows through
    const intGeo = new THREE.BoxGeometry(CW - 0.03, CH - 0.03, CD - 0.03);
    const intMesh = new THREE.Mesh(intGeo, [
      interiorWallMat, // 0 +X side
      interiorWallMat, // 1 -X side
      interiorWallMat, // 2 +Y ceiling
      transpMat,       // 3 -Y bottom → transparent so ifloorMesh shows
      interiorWallMat, // 4 +Z front (BackSide auto-culls from outside camera)
      interiorWallMat, // 5 -Z back wall
    ]);
    intMesh.name = "interiorWalls";
    group.add(intMesh);

    // Interior floor — sits above the transparent intMesh bottom face
    const ifloorGeo = new THREE.PlaneGeometry(CW - 0.04, CD - 0.04);
    const ifloorMesh = new THREE.Mesh(ifloorGeo, floor);
    ifloorMesh.rotation.x = -Math.PI / 2;
    ifloorMesh.position.y = -(CH / 2) + 0.022; // above intMesh bottom (at -(CH/2)+0.015)
    ifloorMesh.name = "interiorFloor";
    group.add(ifloorMesh);

    // ── Corner posts ──────────────────────────────────────────────────────
    const postGeo = new THREE.BoxGeometry(0.08, CH + 0.04, 0.08);
    [[-2.07,0,0.81],[2.07,0,0.81],[-2.07,0,-0.81],[2.07,0,-0.81]].forEach(([x,y,z]) => {
      const m = new THREE.Mesh(postGeo, frame); m.position.set(x,y,z); m.castShadow = true; group.add(m);
    });

    // ── Top / bottom rails ────────────────────────────────────────────────
    const tlG = new THREE.BoxGeometry(CW, 0.055, 0.07);
    const tsG = new THREE.BoxGeometry(0.07, 0.055, CD);
    [[0,0.81,0.81],[0,0.81,-0.81],[0,-0.81,0.81],[0,-0.81,-0.81]].forEach(([x,y,z]) => {
      const m = new THREE.Mesh(tlG, frame); m.position.set(x,y,z); group.add(m);
    });
    [[-2.07,0.81,0],[2.07,0.81,0],[-2.07,-0.81,0],[2.07,-0.81,0]].forEach(([x,y,z]) => {
      const m = new THREE.Mesh(tsG, frame); m.position.set(x,y,z); group.add(m);
    });

    // ── Corner castings ───────────────────────────────────────────────────
    const ccG = new THREE.BoxGeometry(0.12, 0.12, 0.12);
    [
      [2.08,0.83,0.83],[2.08,0.83,-0.83],[2.08,-0.83,0.83],[2.08,-0.83,-0.83],
      [-2.08,0.83,0.83],[-2.08,0.83,-0.83],[-2.08,-0.83,0.83],[-2.08,-0.83,-0.83],
    ].forEach(([x,y,z]) => {
      const m = new THREE.Mesh(ccG, castMat); m.position.set(x,y,z); m.castShadow = true; group.add(m);
    });

    // ── Door lock rods ────────────────────────────────────────────────────
    const rodG  = new THREE.CylinderGeometry(0.015, 0.015, CH, 10);
    const diskG = new THREE.CylinderGeometry(0.04, 0.04, 0.025, 12);
    const barG  = new THREE.BoxGeometry(0.025, 0.14, 0.055);
    [0.35, -0.35].forEach(z => {
      const rod = new THREE.Mesh(rodG, hw); rod.position.set(-2.08, 0, z); group.add(rod);
      [CH/2 - 0.18, -CH/2 + 0.18].forEach(y => {
        const d = new THREE.Mesh(diskG, hw); d.position.set(-2.082, y, z); d.rotation.x = Math.PI/2; group.add(d);
      });
      const b = new THREE.Mesh(barG, hw); b.position.set(-2.095, -0.1, z + (z>0 ? 0.06 : -0.06)); group.add(b);
    });
    const splitG = new THREE.BoxGeometry(0.018, CH, 0.018);
    const split  = new THREE.Mesh(splitG, castMat); split.position.set(-2.08, 0, 0); group.add(split);

    // ── Hinges ────────────────────────────────────────────────────────────
    const hingeG = new THREE.BoxGeometry(0.04, 0.06, 0.05);
    [
      [-2.071,0.60,0.79],[-2.071,0,-0.79],[-2.071,-0.60,0.79],
      [-2.071,0.60,-0.79],[-2.071,0,0.79],[-2.071,-0.60,-0.79],
    ].forEach(([x,y,z]) => {
      const m = new THREE.Mesh(hingeG, castMat); m.position.set(x,y,z); group.add(m);
    });

    // ── AC unit ───────────────────────────────────────────────────────────
    const acGrp = new THREE.Group();
    acGroupRef.current = acGrp;
    acGrp.visible = temAC;
    const acMat  = new THREE.MeshStandardMaterial({ color: 0xecf0f4, roughness: 0.30, metalness: 0.40 });
    const ventMat= new THREE.MeshStandardMaterial({ color: 0x2d3a4a, roughness: 0.70, metalness: 0.20 });
    const acBox  = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.22, 0.13), acMat);
    acBox.position.set(0.5, CH/2 - 0.08, CD/2 + 0.05); acGrp.add(acBox);
    for (let i = 0; i < 4; i++) {
      const v = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.02, 0.02), ventMat);
      v.position.set(0.5, CH/2 - 0.10 + i * 0.04, CD/2 + 0.12); acGrp.add(v);
    }
    // Interior AC unit
    const acBoxIn = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.18, 0.08), acMat);
    acBoxIn.position.set(0.5, CH/2 - 0.07, -(CD/2) + 0.04); acGrp.add(acBoxIn);
    group.add(acGrp);

    // ── LED strip (interior) ──────────────────────────────────────────────
    const ledMat = new THREE.MeshBasicMaterial({ color: 0xfffce0 });
    const ledMesh= new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.04, 0.05), ledMat);
    ledMesh.position.set(0, CH/2 - 0.03, 0);
    ledMesh.name = "led";
    group.add(ledMesh);
    ledRef.current = ledMesh;

    const ledLight = new THREE.PointLight(0xfffce0, 0, 3.5);
    ledLight.position.set(0, CH/2 - 0.12, 0);
    group.add(ledLight);
    ledLightRef.current = ledLight;

    // ── Windows group (populated reactively via janelas effect) ────────────
    const winGroup = new THREE.Group();
    winGroup.name = "windows";
    windowsGroupRef.current = winGroup;
    group.add(winGroup);

    // (no floor plane — transparent canvas, dark page background)

    // ── Lighting ───────────────────────────────────────────────────────────
    const ambient = new THREE.AmbientLight(0xffffff, 2.1);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfff6e5, 5.5);
    sun.position.set(6, 10, 4); sun.castShadow = true;
    sun.shadow.mapSize.width = sun.shadow.mapSize.height = 1024;
    sun.shadow.bias = -0.00015;
    sun.shadow.camera.left = -4; sun.shadow.camera.right = 4;
    sun.shadow.camera.top  =  3; sun.shadow.camera.bottom = -3;
    sun.shadow.camera.far  = 20;
    scene.add(sun);

    const rim  = new THREE.DirectionalLight(0x3b82f6, 4.0); rim.position.set(-6, 4, -4); scene.add(rim);
    const fill = new THREE.DirectionalLight(0xffffff, 2.6); fill.position.set(0, 2, 6.0); scene.add(fill);
    const fp   = new THREE.PointLight(0xffae00, 2.2, 8); fp.position.set(0, -0.8, 1.5); scene.add(fp);

    // Interior fill lights — illuminate the cut-away view from outside
    const intFill = new THREE.PointLight(0xfff4e0, 0, 7);
    intFill.position.set(0, 0.5, 2.5); // outside front, shines in
    scene.add(intFill);
    intFillRef.current = intFill;

    const intTop = new THREE.PointLight(0xffffff, 0, 4);
    intTop.position.set(0, 2.0, 0.5);  // above center
    scene.add(intTop);

    // ── Pointer interaction ───────────────────────────────────────────────
    const canvas = canvasRef.current!;
    canvas.style.cursor = "grab";

    const onDown = (e: PointerEvent) => {
      if (viewRef.current === "interior") return;
      ptrDown.current = true;
      lastPtr.current = { x: e.clientX, y: e.clientY };
      if (autoTimer.current) clearTimeout(autoTimer.current);
      autoRotate.current = false;
      canvas.style.cursor = "grabbing";
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!ptrDown.current) return;
      const dx = e.clientX - lastPtr.current.x;
      const dy = e.clientY - lastPtr.current.y;
      rotY.current += dx * 0.008;
      rotX.current = Math.max(-0.40, Math.min(0.40, rotX.current + dy * 0.005));
      lastPtr.current = { x: e.clientX, y: e.clientY };
    };
    const onUp = () => {
      ptrDown.current = false;
      canvas.style.cursor = "grab";
      autoTimer.current = setTimeout(() => { autoRotate.current = true; }, 2800);
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    // ── Animation loop ────────────────────────────────────────────────────
    const clock = new THREE.Clock();

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      const isExt = viewRef.current === "exterior";

      if (isExt && autoRotate.current) rotY.current += 0.004;

      if (isExt) {
        group.rotation.y = rotY.current;
        group.rotation.x = rotX.current;
        group.position.y = Math.sin(elapsed * 0.85) * 0.06;
      } else {
        group.rotation.y = 0;
        group.rotation.x = 0;
        group.position.y = 0;
      }

      // Camera lerp
      camera.position.lerp(tgtCam.current, 0.07);
      curLook.current.lerp(tgtLook.current, 0.07);
      camera.lookAt(curLook.current);

      renderer.render(scene, camera);
    };
    animate();
    setLoading(false);

    // ── Resize ────────────────────────────────────────────────────────────
    const onResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      bumpMap.dispose();
    };
  }, []); // build once

  // ── Reactive: exterior + interior color ─────────────────────────────────
  useEffect(() => {
    const hex = getExteriorHex(acabamento);
    sideMat.current?.color.setHex(hex);
    frameMat.current?.color.setHex(hex);
    roofMat.current?.color.setHex(hex);
    intWallMat.current?.color.setHex(hex); // interior walls mirror the paint
  }, [acabamento]);

  // ── Reactive: floor color ────────────────────────────────────────────────
  useEffect(() => {
    floorMat.current?.color.setHex(getFloorHex(piso));
  }, [piso]);

  // ── Reactive: AC ────────────────────────────────────────────────────────
  useEffect(() => {
    if (acGroupRef.current) acGroupRef.current.visible = !!temAC;
  }, [temAC]);

  // ── Reactive: LED lighting ───────────────────────────────────────────────
  useEffect(() => {
    if (ledRef.current) ledRef.current.visible = !!temEletrica;
    if (ledLightRef.current) ledLightRef.current.intensity = temEletrica ? 1.8 : 0;
  }, [temEletrica]);

  // ── Reactive: windows ────────────────────────────────────────────────────
  useEffect(() => {
    const winGroup = windowsGroupRef.current;
    if (!winGroup) return;
    // Clear existing windows
    while (winGroup.children.length > 0) {
      const child = winGroup.children[0] as THREE.Mesh;
      winGroup.remove(child);
      child.geometry?.dispose();
    }
    if (!janelas || janelas <= 0) return;
    const CD = 1.62;
    const wFrameG = new THREE.BoxGeometry(0.40, 0.30, 0.04);
    const wGlassG = new THREE.BoxGeometry(0.32, 0.22, 0.02);
    const wFrameM = new THREE.MeshStandardMaterial({ color: 0x8898aa, roughness: 0.3, metalness: 0.7 });
    const wGlassM = new THREE.MeshStandardMaterial({ color: 0x88ccff, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.45 });
    const xPositions = [0.8, 0.0, -0.8, 1.6].slice(0, janelas);
    xPositions.forEach(xp => {
      const wf = new THREE.Mesh(wFrameG, wFrameM);
      wf.position.set(xp, 0.2, CD / 2 + 0.015);
      winGroup.add(wf);
      const wg = new THREE.Mesh(wGlassG.clone(), wGlassM);
      wg.position.set(xp, 0.2, CD / 2 + 0.026);
      winGroup.add(wg);
    });
  }, [janelas]);

  // ── Reactive: auto-switch view per wizard step ───────────────────────────
  useEffect(() => {
    if (step === 2 || step === 3) {
      setView("interior"); // Piso or Pintura → show cut-away so user sees changes
    } else if (step !== undefined && step < 2) {
      setView("exterior");
    }
  }, [step]);

  // ── Reactive: view switch ────────────────────────────────────────────────
  useEffect(() => {
    viewRef.current = view;
    const body = bodyMeshRef.current;
    const mats = body && Array.isArray(body.material) ? (body.material as THREE.Material[]) : null;

    if (view === "exterior") {
      // Restore cut-away face
      if (mats && sideMat.current) mats[4] = sideMat.current;
      // Dim interior lights
      if (intFillRef.current) intFillRef.current.intensity = 0;
      tgtCam.current.set(0, 1.3, 6.2);
      tgtLook.current.set(0, 0.15, 0);
      if (canvasRef.current) canvasRef.current.style.cursor = "grab";
    } else {
      // Freeze rotation and face the container straight-on (+Z face toward camera)
      rotY.current = 0;
      rotX.current = 0;
      autoRotate.current = false;
      if (autoTimer.current) clearTimeout(autoTimer.current);
      if (groupRef.current) {
        groupRef.current.rotation.y = 0;
        groupRef.current.rotation.x = 0;
      }
      // Remove front wall (+Z face, index 4) → cut-away
      if (mats && transpMatRef.current) mats[4] = transpMatRef.current;
      // Boost interior fill lights
      if (intFillRef.current) intFillRef.current.intensity = 3.8;
      // Camera: slightly above, just outside the open wall, looking slightly down into interior
      tgtCam.current.set(0, 0.9, 3.6);
      tgtLook.current.set(0, -0.25, 0);
      if (canvasRef.current) canvasRef.current.style.cursor = "default";
    }
  }, [view]);

  const reset = useCallback(() => {
    rotY.current = 0.4;
    rotX.current = 0.08;
    autoRotate.current = true;
    setView("exterior");
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full" style={{ minHeight: 300 }}>
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <Loader2 className="w-5 h-5 text-brand-yellow animate-spin mb-2" />
          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
            Carregando 3D...
          </span>
        </div>
      )}

      <canvas ref={canvasRef} className="w-full h-full block" />

      {!loading && (
        <>
          {/* View toggle */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {(["exterior", "interior"] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest font-mono transition-all ${
                  view === v
                    ? "bg-brand-yellow text-zinc-950"
                    : "bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-700"
                }`}
              >
                {v === "exterior" ? "Exterior" : "Interior"}
              </button>
            ))}
            <button
              onClick={reset}
              title="Resetar câmera"
              className="p-1.5 rounded-lg bg-zinc-900/80 text-zinc-500 hover:text-white border border-zinc-700 transition-all"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Drag hint */}
          {view === "exterior" && (
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 pointer-events-none">
              <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">
                Arraste para girar
              </span>
            </div>
          )}

          {/* Interior label */}
          {view === "interior" && (
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 pointer-events-none">
              <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">
                Corte interior — pintura + piso em tempo real
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
