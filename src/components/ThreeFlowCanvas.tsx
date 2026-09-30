import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

/** Small, self-contained scene. No models, textures or remote requests. */
export default function ThreeFlowCanvas({ nodes, active, onFailure }: { nodes: string[]; active: boolean; onFailure: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  const wakeRef = useRef<() => void>(() => {});
  useEffect(() => { activeRef.current = active; wakeRef.current(); }, [active]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" }); }
    catch { onFailure(); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const group = new THREE.Group(); scene.add(group);
    const camera = new THREE.OrthographicCamera(-4.7, 4.7, 3, -3, 0.1, 40);
    camera.position.set(0, 5.2, 8); camera.lookAt(0, 0.45, 0);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x345474, 2.4));
    const light = new THREE.DirectionalLight(0xffffff, 3); light.position.set(-3, 6, 4); scene.add(light);
    const colors = [0x0070f2, 0x148fcb, 0x00a6a6, 0x20b789];
    const positions = [-3.1, -1.05, 1.05, 3.1].map((x, i) => new THREE.Vector3(x, 0.6, i === 1 || i === 2 ? -0.3 : 0.3));
    const surfaces: THREE.MeshStandardMaterial[] = [];
    const labels: THREE.Texture[] = [];
    const labelCanvases: HTMLCanvasElement[] = [];
    const paintLabel = (text: HTMLCanvasElement, name: string, dark: boolean) => {
      const ctx = text.getContext("2d")!;
      ctx.clearRect(0, 0, 512, 180); ctx.fillStyle = dark ? "#e8f2ff" : "#132940";
      ctx.font = "600 72px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      const words = name.length > 12 && name.includes(" ") ? name.split(" ") : [name];
      words.forEach((word, index) => ctx.fillText(word, 256, words.length > 1 ? 50 + index * 80 : 90, 490));
    };

    positions.forEach((pos, i) => {
      const platform = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.76, 0.16, 6), new THREE.MeshStandardMaterial({ color: 0xe7f0fa, metalness: 0.12, roughness: 0.65 }));
      platform.position.copy(pos).setY(0.1); surfaces.push(platform.material); group.add(platform);
      const cube = new THREE.Mesh(new RoundedBoxGeometry(0.8, 0.7, 0.8, 3, 0.12), new THREE.MeshStandardMaterial({ color: colors[i], metalness: 0.2, roughness: 0.25 }));
      cube.position.copy(pos); group.add(cube);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.025, 8, 48), new THREE.MeshBasicMaterial({ color: colors[i], transparent: true, opacity: 0.5 }));
      ring.rotation.x = Math.PI / 2; ring.position.copy(pos).setY(0.23); group.add(ring);
      const text = document.createElement("canvas"); text.width = 512; text.height = 180;
      labelCanvases.push(text);
      paintLabel(text, nodes[i], document.documentElement.classList.contains("dark"));
      const texture = new THREE.CanvasTexture(text); texture.colorSpace = THREE.SRGBColorSpace; labels.push(texture);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false }));
      sprite.scale.set(1.95, 0.69, 1); sprite.position.copy(pos).setY(1.5); group.add(sprite);
    });

    const curves = positions.slice(0, -1).map((start, i) => {
      const end = positions[i + 1];
      const curve = new THREE.CatmullRomCurve3([start, new THREE.Vector3((start.x + end.x) / 2, 0.95, (start.z + end.z) / 2), end]);
      group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.035, 6, false), new THREE.MeshBasicMaterial({ color: colors[i], transparent: true, opacity: 0.4 })));
      return curve;
    });
    const packets = curves.map((_, i) => {
      const packet = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 8), new THREE.MeshBasicMaterial({ color: colors[i] }));
      group.add(packet); return packet;
    });

    const resize = () => {
      const width = canvas.clientWidth, height = canvas.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      const aspect = width / height;
      camera.top = 4.7 / aspect; camera.bottom = -camera.top; camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
    const theme = () => {
      const dark = document.documentElement.classList.contains("dark");
      surfaces.forEach(material => material.color.set(dark ? 0x22384e : 0xe7f0fa));
      labelCanvases.forEach((text, i) => {
        paintLabel(text, nodes[i], dark); labels[i].needsUpdate = true;
      });
      renderer.render(scene, camera);
    };
    const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(canvas);
    const mutationObserver = new MutationObserver(theme); mutationObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    theme(); resize();
    const lost = (event: Event) => { event.preventDefault(); onFailure(); };
    canvas.addEventListener("webglcontextlost", lost);
    let frame = 0, last = 0, time = 0;
    const draw = (now: number) => {
      frame = 0;
      if (!activeRef.current || document.hidden) return;
      frame = requestAnimationFrame(draw);
      if (now - last < 33) return;
      time += Math.min((now - last) / 1000, 0.1);
      last = now;
      packets.forEach((packet, i) => packet.position.copy(curves[i].getPoint((time * 0.22 + i * 0.3) % 1)));
      renderer.render(scene, camera);
    };
    const wake = () => {
      if (!activeRef.current || document.hidden) { cancelAnimationFrame(frame); frame = 0; }
      else if (!frame) { last = performance.now(); frame = requestAnimationFrame(draw); }
    };
    wakeRef.current = wake;
    document.addEventListener("visibilitychange", wake); wake();
    return () => {
      wakeRef.current = () => {};
      document.removeEventListener("visibilitychange", wake);
      cancelAnimationFrame(frame); resizeObserver.disconnect(); mutationObserver.disconnect();
      canvas.removeEventListener("webglcontextlost", lost);
      scene.traverse(object => {
        if (object instanceof THREE.Mesh) { object.geometry.dispose(); const materials = Array.isArray(object.material) ? object.material : [object.material]; materials.forEach(material => material.dispose()); }
        if (object instanceof THREE.Sprite) object.material.dispose();
      });
      labels.forEach(texture => texture.dispose()); renderer.dispose();
    };
  }, [nodes, onFailure]);
  return <canvas ref={ref} className="three-flow-canvas" aria-hidden="true" />;
}
