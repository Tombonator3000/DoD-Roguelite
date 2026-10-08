import * as THREE from 'three';

// To faste instanslag: gl�d og sm�biter. Ingen nye materialer per treff.
const VERT = `
  attribute vec4 fxData;
  attribute vec3 fxColor;
  varying vec2 vUv;
  varying vec4 vData;
  varying vec3 vColor;
  void main() {
    vUv = uv; vData = fxData; vColor = fxColor;
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  }
`;

const FRAG = `
  varying vec2 vUv;
  varying vec4 vData;
  varying vec3 vColor;
  const float TAU = 6.28318530718;
  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float r = length(p), a = 0.0;
    float kind = vData.y;
    if (kind < 0.5) {
      // Lang gnist med en lys kjerne og avsmalnende ende.
      float width = 0.08 + 0.20 * (1.0 - abs(p.y));
      a = (1.0 - smoothstep(width * 0.35, width, abs(p.x))) * (1.0 - abs(p.y));
    } else if (kind < 1.5) {
      // Tynn sjokkb�lge. Sentrum holdes �pent s� kampen er synlig.
      a = 1.0 - smoothstep(0.025, 0.11, abs(r - 0.80));
    } else if (kind < 2.5) {
      float angle = atan(p.y, p.x) + vData.z;
      float outer = 1.0 - smoothstep(0.012, 0.045, abs(r - 0.84));
      float inner = 1.0 - smoothstep(0.01, 0.035, abs(r - 0.64));
      float teeth = pow(max(0.0, cos(angle * 12.0)), 12.0);
      float marks = teeth * smoothstep(0.64, 0.68, r) * (1.0 - smoothstep(0.78, 0.82, r));
      a = max(max(outer, inner * 0.6), marks);
    } else if (kind < 3.5) {
      a = exp(-r * 6.0) * (1.0 - smoothstep(0.7, 1.0, r));
    } else if (kind < 4.5) {
      // Fj�r med buet kant, skaft og skr� faner.
      float width = 0.55 * pow(max(0.0, 1.0 - p.y * p.y), 0.65);
      float body = 1.0 - smoothstep(width - 0.04, width, abs(p.x + p.y * 0.12));
      float ribs = 0.65 + 0.35 * abs(sin((p.y + abs(p.x) * 0.5) * 22.0));
      float stem = 1.0 - smoothstep(0.025, 0.055, abs(p.x + p.y * 0.12));
      a = max(body * ribs, stem) * (1.0 - smoothstep(0.92, 1.0, abs(p.y)));
    } else if (kind < 5.5) {
      // Kantete bein- og trefliser.
      float edge = abs(p.x) * 1.5 + abs(p.y + p.x * 0.25);
      a = 1.0 - smoothstep(0.85, 1.0, edge);
    } else {
      // Hugg med en skarp forkant og to smale spor bak v�penet.
      float arc = max(0.01, abs(vData.z));
      float angle = atan(p.x, -p.y);
      float along = (angle + arc * 0.5) / arc;
      if (vData.z < 0.0) along = 1.0 - along;
      float head = vData.x * 1.65;
      float sweep = smoothstep(head - 0.48, head, along) * step(along, head);
      float edge = 1.0 - smoothstep(0.015, 0.07, abs(r - 0.91));
      float trail = (1.0 - smoothstep(0.04, 0.18, abs(r - 0.77))) * 0.35;
      a = max(edge, trail) * sweep * step(abs(angle), arc * 0.5);
    }
    a *= vData.w;
    if (a < 0.015) discard;
    gl_FragColor = vec4(vColor, a);
  }
`;

class Layer {
  constructor(scene, max, additive) {
    this.max = max;
    this.n = 0;
    this.records = Array.from({ length: max }, () => ({}));
    this.data = new Float32Array(max * 4);
    this.colors = new Float32Array(max * 3);
    const geo = new THREE.PlaneGeometry(1, 1);
    this.aData = new THREE.InstancedBufferAttribute(this.data, 4).setUsage(THREE.DynamicDrawUsage);
    this.aColor = new THREE.InstancedBufferAttribute(this.colors, 3).setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('fxData', this.aData);
    geo.setAttribute('fxColor', this.aColor);
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG,
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    this.mesh = new THREE.InstancedMesh(geo, mat, max);
    this.mesh.name = additive ? 'kampeffekt-glod' : 'kampeffekt-biter';
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    this.mesh.count = 0;
    this.mesh.visible = false;
    this.mesh.renderOrder = additive ? 7 : 6;
    scene.add(this.mesh);
    this.matrix = new THREE.Matrix4();
    this.pos = new THREE.Vector3();
    this.scale = new THREE.Vector3();
    this.quat = new THREE.Quaternion();
    this.spin = new THREE.Quaternion();
    this.axis = new THREE.Vector3(0, 0, 1);
    this.ground = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
    this.color = new THREE.Color();
    this.scene = scene;
  }

  spawn(kind, p, color, o = {}) {
    if (this.n >= this.max || !Number.isFinite(p?.x) || !Number.isFinite(p?.z)) return false;
    const r = this.records[this.n++];
    Object.assign(r, {
      kind, x: p.x, y: p.y ?? 0.06, z: p.z,
      vx: o.vx ?? 0, vy: o.vy ?? 0, vz: o.vz ?? 0,
      gravity: o.gravity ?? 0, drag: o.drag ?? 0,
      life: Math.max(0.06, o.life ?? 0.35), t: 0,
      start: o.start ?? 0.25, end: o.end ?? 0.8,
      aspect: o.aspect ?? 1, angle: o.angle ?? 0, spin: o.spin ?? 0,
      alpha: o.alpha ?? 0.8, seed: o.seed ?? Math.random() * Math.PI * 2,
    });
    this.color.set(color);
    r.red = this.color.r; r.green = this.color.g; r.blue = this.color.b;
    return true;
  }

  update(dt, camera) {
    for (let i = 0; i < this.n; i++) {
      const r = this.records[i];
      r.t += dt;
      if (r.t >= r.life) {
        this.records[i] = this.records[--this.n];
        this.records[this.n] = r;
        i--; continue;
      }
      const drag = Math.exp(-r.drag * dt);
      r.vx *= drag; r.vz *= drag;
      r.vy -= r.gravity * dt;
      r.x += r.vx * dt; r.y += r.vy * dt; r.z += r.vz * dt;
      if (r.kind >= 4 && r.y < 0.045) {
        r.y = 0.045; r.vy = 0; r.vx *= drag; r.vz *= drag;
      }
      const p = r.t / r.life;
      const ease = 1 - Math.pow(1 - p, 3);
      const size = r.start + (r.end - r.start) * ease;
      this.pos.set(r.x, r.y, r.z);
      this.scale.set(size * r.aspect, size, 1);
      this.quat.copy(r.kind === 1 || r.kind === 2 || r.kind === 6 ? this.ground : camera.quaternion);
      this.spin.setFromAxisAngle(this.axis, r.angle + r.spin * r.t);
      this.quat.multiply(this.spin);
      this.matrix.compose(this.pos, this.quat, this.scale);
      this.mesh.setMatrixAt(i, this.matrix);
      const k = i * 4;
      this.data[k] = p; this.data[k + 1] = r.kind; this.data[k + 2] = r.seed;
      this.data[k + 3] = r.alpha * Math.min(1, (1 - p) * 3) * Math.min(1, 0.3 + p * 12);
      const c = i * 3;
      this.colors[c] = r.red; this.colors[c + 1] = r.green; this.colors[c + 2] = r.blue;
    }
    this.mesh.count = this.n;
    this.mesh.visible = this.n > 0;
    if (this.n) {
      this.mesh.instanceMatrix.needsUpdate = true;
      this.aData.needsUpdate = this.aColor.needsUpdate = true;
    }
  }

  clear() {
    this.n = 0;
    this.mesh.count = 0;
    this.mesh.visible = false;
  }

  dispose() {
    this.clear();
    this.scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.mesh.dispose();
  }
}

export class CombatFXPool {
  constructor(scene) {
    this.glow = new Layer(scene, 128, true);
    this.debris = new Layer(scene, 96, false);
  }

  update(dt, camera) {
    this.glow.update(dt, camera);
    this.debris.update(dt, camera);
  }

  clear() { this.glow.clear(); this.debris.clear(); }
  dispose() { this.glow.dispose(); this.debris.dispose(); }
  get count() { return this.glow.n + this.debris.n; }
}
