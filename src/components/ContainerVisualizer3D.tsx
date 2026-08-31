import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { Loader2, RotateCcw } from "lucide-react";

export interface MaterialFinish {
  roughness: number;
  metalness: number;
}

export interface ContainerVisualizer3DProps {
  /** Hex colors ("#RRGGBB"), already resolved from the material library / custom picker. */
  exteriorColor?: string;
  interiorColor?: string;
  floorColor?: string;
  /** Optional roughness/metalness hints from the selected floor/internal-wall material. */
  floorFinish?: MaterialFinish;
  wallFinish?: MaterialFinish;
  temAC?: boolean;
  temEletrica?: boolean;
  /** When true, switches to the interior cut-away view (e.g. while picking floor/wall/paint). */
  forceInteriorView?: boolean;
  /** One entry per selected door, positioned on the matching exterior wall. */
  doorPanels?: { color: string; position: "front" | "back" | "left" | "right" }[];
  /** One entry per selected window — typeId drives distinct size/shape (standard/sliding/panoramic/louvered). */
  windowPanels?: { typeId: string; color: string; position: "front" | "back" | "left" | "right" }[];
  /** Selected extra ids (e.g. "bancada", "armarios") — toggles simple interior furniture blocks. */
  extras?: string[];
}

const DEFAULT_EXTERIOR = 0x374151;
const DEFAULT_FLOOR = 0x1c1c1e;

function hexStringToInt(hex: string | undefined, fallback: number): number {
  if (!hex) return fallback;
  const clean = hex.replace("#", "");
  const parsed = parseInt(clean, 16);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function ContainerVisualizer3D({
  exteriorColor, interiorColor, floorColor, floorFinish, wallFinish,
  temAC = false, temEletrica = false, forceInteriorView,
  doorPanels = [], windowPanels = [], extras = [],
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
  const doorsGroupRef = useRef<THREE.Group | null>(null);
  const furnitureGroupRef = useRef<THREE.Group | null>(null);

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
  // Zoom: a radial multiplier applied to the camera's offset from tgtLook (1 = default
  // distance). Wheel (desktop) and two-finger pinch (touch) both drive this; the drag
  // handlers below track a second simultaneous pointer purely to compute pinch distance.
  const zoom        = useRef(1);
  const ZOOM_MIN = 0.5, ZOOM_MAX = 2.2;
  const activePointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchStartDist = useRef(0);
  const pinchStartZoom = useRef(1);
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
    const extHex = hexStringToInt(exteriorColor, DEFAULT_EXTERIOR);
    const intHex = hexStringToInt(interiorColor ?? exteriorColor, extHex);

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
      color: intHex, roughness: wallFinish?.roughness ?? 0.65, metalness: wallFinish?.metalness ?? 0.25,
      side: THREE.BackSide,
    });
    intWallMat.current = interiorWallMat;

    const floorHex = hexStringToInt(floorColor, DEFAULT_FLOOR);
    const floor = new THREE.MeshStandardMaterial({
      color: floorHex, roughness: floorFinish?.roughness ?? 0.78, metalness: floorFinish?.metalness ?? 0.08,
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

    // ── Windows group (populated reactively via windowPanels effect) ───────
    const winGroup = new THREE.Group();
    winGroup.name = "windows";
    windowsGroupRef.current = winGroup;
    group.add(winGroup);

    // ── Doors group (populated reactively via doorPanels effect) ───────────
    const doorsGroup = new THREE.Group();
    doorsGroup.name = "doors";
    doorsGroupRef.current = doorsGroup;
    group.add(doorsGroup);

    // ── Furniture/extras group (populated reactively via extras effect) ────
    const furnitureGroup = new THREE.Group();
    furnitureGroup.name = "furniture";
    furnitureGroupRef.current = furnitureGroup;
    group.add(furnitureGroup);

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

    const pinchDist = () => {
      const pts: { x: number; y: number }[] = Array.from(activePointers.current.values());
      if (pts.length < 2) return 0;
      return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    };

    const onDown = (e: PointerEvent) => {
      activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      canvas.setPointerCapture(e.pointerId);

      if (activePointers.current.size === 2) {
        // Second finger landed — switch to pinch-zoom, stop any in-flight drag.
        ptrDown.current = false;
        pinchStartDist.current = pinchDist();
        pinchStartZoom.current = zoom.current;
        return;
      }

      if (viewRef.current === "interior") return;
      ptrDown.current = true;
      lastPtr.current = { x: e.clientX, y: e.clientY };
      if (autoTimer.current) clearTimeout(autoTimer.current);
      autoRotate.current = false;
      canvas.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (activePointers.current.has(e.pointerId)) {
        activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }

      if (activePointers.current.size === 2) {
        const dist = pinchDist();
        if (pinchStartDist.current > 0 && dist > 0) {
          const ratio = pinchStartDist.current / dist;
          zoom.current = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, pinchStartZoom.current * ratio));
        }
        return;
      }

      if (!ptrDown.current) return;
      const dx = e.clientX - lastPtr.current.x;
      const dy = e.clientY - lastPtr.current.y;
      rotY.current += dx * 0.008;
      rotX.current = Math.max(-0.40, Math.min(0.40, rotX.current + dy * 0.005));
      lastPtr.current = { x: e.clientX, y: e.clientY };
    };
    const onUp = (e: PointerEvent) => {
      activePointers.current.delete(e.pointerId);
      if (activePointers.current.size < 2) pinchStartDist.current = 0;
      ptrDown.current = false;
      canvas.style.cursor = "grab";
      autoTimer.current = setTimeout(() => { autoRotate.current = true; }, 2800);
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const dir = e.deltaY > 0 ? 1 : -1;
      zoom.current = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom.current + dir * 0.09));
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });

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

      // Camera lerp — zoom is applied as a radial scale of the camera's offset
      // from the look-at point, so it composes cleanly with the exterior/interior
      // target positions above without needing its own set of camera presets.
      curLook.current.lerp(tgtLook.current, 0.07);
      const zoomedTarget = tgtCam.current.clone().sub(tgtLook.current).multiplyScalar(zoom.current).add(tgtLook.current);
      camera.position.lerp(zoomedTarget, 0.07);
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
      canvas.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      bumpMap.dispose();
    };
  }, []); // build once

  // ── Reactive: exterior color ─────────────────────────────────────────────
  useEffect(() => {
    const hex = hexStringToInt(exteriorColor, DEFAULT_EXTERIOR);
    sideMat.current?.color.setHex(hex);
    frameMat.current?.color.setHex(hex);
    roofMat.current?.color.setHex(hex);
  }, [exteriorColor]);

  // ── Reactive: interior wall color + finish (internal wall covering) ─────
  useEffect(() => {
    const fallback = hexStringToInt(exteriorColor, DEFAULT_EXTERIOR);
    const hex = hexStringToInt(interiorColor ?? exteriorColor, fallback);
    intWallMat.current?.color.setHex(hex);
    if (intWallMat.current && wallFinish) {
      intWallMat.current.roughness = wallFinish.roughness;
      intWallMat.current.metalness = wallFinish.metalness;
    }
  }, [interiorColor, exteriorColor, wallFinish]);

  // ── Reactive: floor color + finish ───────────────────────────────────────
  useEffect(() => {
    floorMat.current?.color.setHex(hexStringToInt(floorColor, DEFAULT_FLOOR));
    if (floorMat.current && floorFinish) {
      floorMat.current.roughness = floorFinish.roughness;
      floorMat.current.metalness = floorFinish.metalness;
    }
  }, [floorColor, floorFinish]);

  // ── Reactive: AC ────────────────────────────────────────────────────────
  useEffect(() => {
    if (acGroupRef.current) acGroupRef.current.visible = !!temAC;
  }, [temAC]);

  // ── Reactive: LED lighting ───────────────────────────────────────────────
  useEffect(() => {
    if (ledRef.current) ledRef.current.visible = !!temEletrica;
    if (ledLightRef.current) ledLightRef.current.intensity = temEletrica ? 1.8 : 0;
  }, [temEletrica]);

  // ── Reactive: windows — each catalog type gets its own realistic size/shape ──
  // instead of every window rendering as the same generic frame+pane.
  useEffect(() => {
    const winGroup = windowsGroupRef.current;
    if (!winGroup) return;
    // Windows are now built as small Groups (frame + panes + sill), not single
    // Meshes, so disposal has to walk each subtree rather than assume Mesh.
    while (winGroup.children.length > 0) {
      const child = winGroup.children[0];
      winGroup.remove(child);
      child.traverse((node) => {
        const mesh = node as THREE.Mesh;
        mesh.geometry?.dispose();
        if (Array.isArray(mesh.material)) mesh.material.forEach((m) => m.dispose());
        else mesh.material?.dispose();
      });
    }
    if (windowPanels.length === 0) return;

    const CW = 4.14, CD = 1.62;
    const frameM = new THREE.MeshStandardMaterial({ color: 0x8898aa, roughness: 0.3, metalness: 0.7 });
    const sillM = new THREE.MeshStandardMaterial({ color: 0x6b7280, roughness: 0.45, metalness: 0.5 });

    // Per-type footprint (width x height, meters) + divider style — sized to
    // actually read as different window products, not the same box reused.
    const SPECS: Record<string, { w: number; h: number; style: "cross" | "slide" | "panoramic" | "louver" }> = {
      standard:  { w: 0.42, h: 0.32, style: "cross" },
      sliding:   { w: 0.68, h: 0.36, style: "slide" },
      panoramic: { w: 1.05, h: 0.50, style: "panoramic" },
      louvered:  { w: 0.42, h: 0.28, style: "louver" },
    };

    const y = 0.18;

    function buildWindow(color: string, typeId: string): THREE.Group {
      const spec = SPECS[typeId] ?? SPECS.standard;
      const glassM = new THREE.MeshStandardMaterial({
        color: hexStringToInt(color, 0x88ccff), roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.42,
      });
      const g = new THREE.Group();

      // Outer frame (slightly larger than the glass, sits proud of the wall)
      const frame = new THREE.Mesh(new THREE.BoxGeometry(spec.w + 0.05, spec.h + 0.05, 0.045), frameM);
      g.add(frame);

      if (spec.style === "panoramic") {
        // Minimal frame, near-edge-to-edge glass, one thin horizontal transom.
        const glass = new THREE.Mesh(new THREE.BoxGeometry(spec.w, spec.h, 0.02), glassM);
        glass.position.z = 0.014;
        g.add(glass);
        const transom = new THREE.Mesh(new THREE.BoxGeometry(spec.w, 0.02, 0.03), frameM);
        transom.position.set(0, 0, 0.02);
        g.add(transom);
      } else if (spec.style === "slide") {
        // Two panes side by side with a slightly raised center rail (the track).
        const paneW = spec.w / 2 - 0.02;
        [-1, 1].forEach((side) => {
          const glass = new THREE.Mesh(new THREE.BoxGeometry(paneW, spec.h - 0.05, 0.02), glassM);
          glass.position.set((side * (paneW / 2 + 0.02)), 0, 0.014);
          g.add(glass);
        });
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.03, spec.h, 0.05), frameM);
        rail.position.z = 0.02;
        g.add(rail);
      } else if (spec.style === "louver") {
        // Horizontal glass slats (awning-style), matching the "louvered" swatch look.
        const slats = 4;
        const slatH = (spec.h - 0.04) / slats;
        for (let i = 0; i < slats; i++) {
          const slat = new THREE.Mesh(new THREE.BoxGeometry(spec.w - 0.05, slatH - 0.01, 0.02), glassM);
          slat.position.set(0, spec.h / 2 - slatH * (i + 0.5) - 0.02, 0.014 + (i % 2) * 0.006);
          slat.rotation.x = 0.12;
          g.add(slat);
        }
      } else {
        // "standard": single fixed pane with a cross divider.
        const glass = new THREE.Mesh(new THREE.BoxGeometry(spec.w - 0.06, spec.h - 0.06, 0.02), glassM);
        glass.position.z = 0.014;
        g.add(glass);
        const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.02, spec.h - 0.05, 0.03), frameM);
        vBar.position.z = 0.018;
        g.add(vBar);
        const hBar = new THREE.Mesh(new THREE.BoxGeometry(spec.w - 0.05, 0.02, 0.03), frameM);
        hBar.position.z = 0.018;
        g.add(hBar);
      }

      // Sill ledge along the bottom edge.
      const sill = new THREE.Mesh(new THREE.BoxGeometry(spec.w + 0.09, 0.025, 0.09), sillM);
      sill.position.set(0, -spec.h / 2 - 0.02, 0.02);
      g.add(sill);

      return g;
    }

    // Group selections by wall so multiple windows on the same wall spread out
    // along it instead of stacking at the same spot.
    const byWall = new Map<string, typeof windowPanels>();
    windowPanels.forEach((w) => {
      const list = byWall.get(w.position) ?? [];
      list.push(w);
      byWall.set(w.position, list);
    });

    byWall.forEach((items, position) => {
      const isSide = position === "left" || position === "right";
      const wallLen = isSide ? CD : CW;
      const spacing = Math.min(wallLen / (items.length + 1), 1.3);
      items.forEach((item, i) => {
        const offset = (i - (items.length - 1) / 2) * spacing;
        const win = buildWindow(item.color, item.typeId);
        if (position === "front") { win.position.set(offset, y, CD / 2 + 0.02); }
        else if (position === "back") { win.position.set(offset, y, -(CD / 2 + 0.02)); win.rotation.y = Math.PI; }
        else if (position === "left") { win.position.set(-(CW / 2 + 0.02), y, offset); win.rotation.y = -Math.PI / 2; }
        else { win.position.set(CW / 2 + 0.02, y, offset); win.rotation.y = Math.PI / 2; }
        winGroup.add(win);
      });
    });
  }, [windowPanels]);

  // ── Reactive: door panels (one mesh per selected door × wall position) ──
  useEffect(() => {
    const doorsGroup = doorsGroupRef.current;
    if (!doorsGroup) return;
    while (doorsGroup.children.length > 0) {
      const child = doorsGroup.children[0] as THREE.Mesh;
      doorsGroup.remove(child);
      child.geometry?.dispose();
      if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
      else child.material?.dispose();
    }
    const CW = 4.14, CH = 1.62, CD = 1.62;
    const panelW = CW * 0.34, panelH = CH * 0.78, thickness = 0.03;

    doorPanels.forEach(({ color, position }) => {
      const isSide = position === "left" || position === "right";
      const geo = new THREE.BoxGeometry(
        isSide ? thickness : panelW,
        panelH,
        isSide ? panelW : thickness,
      );
      const mat = new THREE.MeshStandardMaterial({ color: hexStringToInt(color, 0x52525b), roughness: 0.45, metalness: 0.55 });
      const mesh = new THREE.Mesh(geo, mat);
      const y = -CH / 2 + panelH / 2 + 0.02;
      if (position === "front") mesh.position.set(0, y, CD / 2 + thickness / 2 + 0.01);
      else if (position === "back") mesh.position.set(0, y, -(CD / 2 + thickness / 2 + 0.01));
      else if (position === "left") mesh.position.set(-(CW / 2 + thickness / 2 + 0.01), y, 0);
      else mesh.position.set(CW / 2 + thickness / 2 + 0.01, y, 0);
      mesh.castShadow = true;
      mesh.userData.doorPosition = position;
      // Respect whatever view is currently active — the view-switch effect only
      // re-applies this when `view` itself changes, not when doors are rebuilt.
      mesh.visible = !(viewRef.current === "interior" && position === "front");
      doorsGroup.add(mesh);
    });
  }, [doorPanels]);

  // ── Reactive: interior furniture blocks (spec section 17 — visual extras) ──
  // Simple, honest low-poly shapes for the handful of extras that read clearly
  // as furniture inside the cut-away view. Not every one of the 18 catalog
  // extras gets unique geometry (e.g. "Adesivação"/"Logotipo" are decals, not
  // physical objects) — the ones below are the interior-furniture subset the
  // owner specifically asked to see.
  useEffect(() => {
    const furnitureGroup = furnitureGroupRef.current;
    if (!furnitureGroup) return;
    while (furnitureGroup.children.length > 0) {
      const child = furnitureGroup.children[0] as THREE.Mesh;
      furnitureGroup.remove(child);
      child.geometry?.dispose();
      if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
      else child.material?.dispose();
    }
    const has = (id: string) => extras.includes(id);
    const CW = 4.14, CH = 1.62, CD = 1.62;
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8a5a34, roughness: 0.7, metalness: 0.05 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xb8bec7, roughness: 0.35, metalness: 0.6 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x2b2f36, roughness: 0.6, metalness: 0.2 });
    const floorY = -CH / 2 + 0.02;

    // Fixed floor-plan zones (X = width -2.07..2.07, Z = depth -0.81 back-wall
    // .. +0.81 door-side). Each item's footprint is reserved with a clear
    // margin from its neighbors so any combination of extras can be selected
    // together without pieces colliding — verified by hand below, not just
    // "looks ok in one combination".
    //
    //  X:  -2.07        -1.9   -1.4          -1.0    -0.1  0.7            2.0   2.07
    //      |  ARMÁRIOS    |     |  PRATELEIRAS  |      | BANCADA           |     |
    //      |  (back wall, z≈-0.62)              |      | (back wall, z≈-0.58)    |
    //
    //  MOBILIÁRIO-GERAL sits mid-room, pulled toward the door (z≈0.25) — clear
    //  of the whole back-wall row by z, regardless of x overlap with it.
    //  DIVISÓRIAS is a short partition near the right wall, door-side (z≈0.35)
    //  — clear of bancada (which stays z≤-0.35) and of the table (x≤-0.25).

    if (has("armarios")) {
      const cab = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.05, 0.35), woodMat);
      cab.position.set(-1.65, floorY + 0.525, -0.62);
      cab.castShadow = true;
      furnitureGroup.add(cab);
      for (let i = 1; i < 3; i++) {
        const line = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.006, 0.02), darkMat);
        line.position.set(-1.65, floorY + i * 0.33, -0.62 + 0.175);
        furnitureGroup.add(line);
      }
    }

    if (has("prateleiras")) {
      const shelfGeo = new THREE.BoxGeometry(0.9, 0.03, 0.25);
      [0.35, 0.65, 0.95].forEach((h) => {
        const shelf = new THREE.Mesh(shelfGeo, woodMat);
        shelf.position.set(-0.55, floorY + h, -0.65);
        shelf.castShadow = true;
        furnitureGroup.add(shelf);
      });
    }

    if (has("bancada")) {
      const top = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.05, 0.45), woodMat);
      top.position.set(1.35, floorY + 0.42, -0.58);
      top.castShadow = true;
      const legGeo = new THREE.BoxGeometry(0.04, 0.40, 0.04);
      [[-0.6, -0.18], [0.6, -0.18], [-0.6, 0.18], [0.6, 0.18]].forEach(([dx, dz]) => {
        const leg = new THREE.Mesh(legGeo, metalMat);
        leg.position.set(1.35 + dx, floorY + 0.20, -0.58 + dz);
        furnitureGroup.add(leg);
      });
      furnitureGroup.add(top);
    }

    if (has("mobiliario-geral")) {
      const table = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.04, 0.7), woodMat);
      table.position.set(-0.6, floorY + 0.36, 0.25);
      table.castShadow = true;
      const tLegGeo = new THREE.BoxGeometry(0.04, 0.34, 0.04);
      [[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]].forEach(([dx, dz]) => {
        const leg = new THREE.Mesh(tLegGeo, metalMat);
        leg.position.set(-0.6 + dx, floorY + 0.17, 0.25 + dz);
        furnitureGroup.add(leg);
      });
      furnitureGroup.add(table);
      [[-0.95, 0.55], [-0.25, 0.55]].forEach(([sx, sz]) => {
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.05, 0.32), darkMat);
        seat.position.set(sx, floorY + 0.24, sz);
        seat.castShadow = true;
        furnitureGroup.add(seat);
      });
    }

    if (has("divisorias")) {
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, CH - 0.06, 0.5),
        new THREE.MeshStandardMaterial({ color: 0xd8dce1, roughness: 0.55, metalness: 0.1 }),
      );
      wall.position.set(1.6, 0, 0.35);
      wall.castShadow = true;
      furnitureGroup.add(wall);
    }
  }, [extras]);

  // ── Reactive: auto-switch view when the caller says the interior is relevant ──
  useEffect(() => {
    if (forceInteriorView === undefined) return;
    setView(forceInteriorView ? "interior" : "exterior");
  }, [forceInteriorView]);

  // ── Reactive: view switch ────────────────────────────────────────────────
  useEffect(() => {
    viewRef.current = view;
    const body = bodyMeshRef.current;
    const mats = body && Array.isArray(body.material) ? (body.material as THREE.Material[]) : null;

    // A solid front door panel would block the see-through cut-away — hide
    // just that one panel while interior view is active, keep back/side doors.
    doorsGroupRef.current?.children.forEach((child) => {
      child.visible = !(view === "interior" && child.userData.doorPosition === "front");
    });

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
    zoom.current = 1;
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

          {/* Drag/zoom hint */}
          {view === "exterior" && (
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 pointer-events-none">
              <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">
                Arraste para girar · Role para zoom
              </span>
            </div>
          )}

          {/* Interior label */}
          {view === "interior" && (
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 pointer-events-none">
              <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">
                Corte interior — pintura, piso e revestimento em tempo real
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
