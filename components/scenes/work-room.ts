import * as THREE from 'three';

/*
  The work room: project screenshots on curved panels standing on an arc around
  a point just in front of the viewer, over a grid floor that fades into the
  dark. Scroll turns the wall past the viewer, one project at a time.
*/

const PANEL_W = 7.6;
const PANEL_H = PANEL_W / 1.7; // every card is the same size (a little taller than the ~2:1 screenshots)
const RADIUS = 11.5;
const GAP = 0.1; // radians between panels
const STEP = PANEL_W / RADIUS + GAP;
const VIEW_Z = 7; // the viewer stands behind the arc's centre, so the wall reads as concave

const PANEL_VERT = /* glsl */ `
  uniform float uIndexAngle;
  uniform float uYaw;
  uniform float uHScale;
  varying vec2 vUv;
  varying float vAng;
  void main() {
    vUv = uv;
    // Bend the flat panel onto the cylinder, with a slow wave along the wall's top and bottom.
    float a = uIndexAngle - uYaw + position.x / ${RADIUS.toFixed(1)};
    float wave = 0.22 * sin(a * 2.6 + 0.8) * (uv.y - 0.5) * 2.0 + 0.12 * sin(a * 4.1);
    vec3 p = vec3(${RADIUS.toFixed(1)} * sin(a), position.y * uHScale + wave, -${RADIUS.toFixed(1)} * cos(a));
    vAng = a;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const PANEL_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uReady;
  uniform float uImgAspect;
  uniform float uYaw;
  uniform float uHover;
  uniform float uPanelH;
  varying vec2 vUv;
  varying float vAng;

  float roundedBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    vec2 size = vec2(${PANEL_W.toFixed(2)}, uPanelH);
    float d = roundedBox((vUv - 0.5) * size, size * 0.5, 0.26);
    float alpha = 1.0 - smoothstep(-fwidth(d), fwidth(d), d);
    // Panels that have turned past the side of the room aren't drawn.
    alpha *= 1.0 - smoothstep(1.45, 1.75, abs(vAng));
    if (alpha < 0.01) discard;

    // Fill the whole card with the whole screenshot. If the screenshot is close to the card's shape it is
    // stretched a touch to fit exactly; if it is very different it is cover-fitted (cropped) instead.
    float panelAspect = size.x / size.y;
    vec2 uv = vUv;
    if (abs(uImgAspect / panelAspect - 1.0) > 0.25) {
      if (uImgAspect > panelAspect) uv.x = 0.5 + (uv.x - 0.5) * panelAspect / uImgAspect;
      else uv.y = 1.0 - (1.0 - uv.y) * uImgAspect / panelAspect;
    }
    vec3 col = mix(vec3(0.07, 0.06, 0.08), texture2D(uMap, uv).rgb, uReady);

    // Lit where you're looking, falling off along the wall; a soft sheen across the curve.
    float off = vAng;
    float light = 0.28 + 0.72 * exp(-off * off * 2.4);
    light *= 0.88 + 0.12 * vUv.y;
    float sheen = 0.07 * exp(-pow((off + 0.12) * 5.0, 2.0)) * (0.6 + 0.4 * vUv.y);
    gl_FragColor = vec4(col * light * (1.0 + 0.08 * uHover) + sheen, alpha);
    #include <colorspace_fragment>
  }
`;

const FLOOR_FRAG = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec2 g = vWorld.xz / 1.4;
    vec2 grid = abs(fract(g - 0.5) - 0.5) / fwidth(g);
    float line = 1.0 - min(min(grid.x, grid.y), 1.0);
    float fade = exp(-length(vWorld.xz) * 0.07);
    gl_FragColor = vec4(vec3(0.95, 0.94, 0.93), line * 0.14 * fade);
  }
`;

const FLOOR_VERT = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

export type WorkRoom = {
  setProgress(p: number): void;
  pick(clientX: number, clientY: number): number | null;
  setHover(index: number | null): void;
  resize(): void;
  start(): void;
  stop(): void;
  dispose(): void;
};

export function createWorkRoom(canvas: HTMLCanvasElement, covers: string[], opts: { lowPower: boolean }): WorkRoom {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, opts.lowPower ? 1.5 : 2));
  renderer.setClearColor(0x0a0a0a, 1); // matches the site's --bg dark

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
  camera.position.set(0, 1.4, VIEW_Z);
  camera.lookAt(0, 0.2, -RADIUS);

  const loader = new THREE.TextureLoader();
  const geometry = new THREE.PlaneGeometry(PANEL_W, PANEL_H, 48, 6);
  const panels = covers.map((src, i) => {
    const uniforms = {
      uMap: { value: null as THREE.Texture | null },
      uReady: { value: 0 },
      uImgAspect: { value: 1.6 },
      uIndexAngle: { value: i * STEP },
      uYaw: { value: 0 },
      uHover: { value: 0 },
      uHScale: { value: 1 }, // card height relative to the default card
      uPanelH: { value: PANEL_H },
    };
    loader.load(src, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      uniforms.uMap.value = tex;
      uniforms.uImgAspect.value = tex.image.width / tex.image.height;
      uniforms.uReady.value = 1;
    });
    const material = new THREE.ShaderMaterial({
      vertexShader: PANEL_VERT,
      fragmentShader: PANEL_FRAG,
      uniforms,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
    // The vertex shader places the panel, so the mesh's own bounds are wrong: never frustum-cull it.
    mesh.frustumCulled = false;
    scene.add(mesh);
    return { mesh, uniforms };
  });

  let target = 0;
  let yaw = 0;
  let raf = 0;
  let running = false;
  let hovered: number | null = null;
  const maxYaw = (covers.length - 1) * STEP;
  const clock = new THREE.Clock();

  // Hit-testing uses invisible flat stand-ins placed where each bent panel currently is.
  const hitGeo = new THREE.PlaneGeometry(PANEL_W, PANEL_H);
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });
  const hitTargets = covers.map((_, i) => {
    const m = new THREE.Mesh(hitGeo, hitMat);
    m.userData.index = i;
    scene.add(m);
    return m;
  });
  const placeHitTargets = () =>
    hitTargets.forEach((m, i) => {
      const a = i * STEP - yaw;
      m.position.set(RADIUS * Math.sin(a), 0, -RADIUS * Math.cos(a));
      m.lookAt(0, 0, 0);
      m.scale.y = panels[i].uniforms.uHScale.value;
    });

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(240, 240),
    new THREE.ShaderMaterial({ vertexShader: FLOOR_VERT, fragmentShader: FLOOR_FRAG, transparent: true, depthWrite: false }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -PANEL_H / 2 - 0.9;
  scene.add(floor);

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Portrait screens see about one panel; wide screens see the neighbours on the curve.
    camera.fov = camera.aspect < 1 ? 64 : 40;
    camera.updateProjectionMatrix();
  };

  const frame = () => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    yaw += (target - yaw) * Math.min(1, dt * 5); // eased, so the wall has weight
    panels.forEach(({ uniforms }, i) => {
      uniforms.uYaw.value = yaw;
      uniforms.uHover.value += ((hovered === i ? 1 : 0) - uniforms.uHover.value) * Math.min(1, dt * 8);
    });
    renderer.render(scene, camera);
  };

  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();

  return {
    setProgress(p) {
      target = Math.min(1, Math.max(0, p)) * maxYaw;
    },
    pick(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
      placeHitTargets();
      scene.updateMatrixWorld();
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObjects(hitTargets, false)[0];
      return hit ? (hit.object.userData.index as number) : null;
    },
    setHover(index) {
      hovered = index;
    },
    resize,
    start() {
      if (running) return;
      running = true;
      clock.getDelta();
      raf = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    dispose() {
      cancelAnimationFrame(raf);
      running = false;
      panels.forEach(({ mesh, uniforms }) => {
        uniforms.uMap.value?.dispose();
        (mesh.material as THREE.Material).dispose();
      });
      geometry.dispose();
      hitGeo.dispose();
      hitMat.dispose();
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
      renderer.dispose();
    },
  };
}
