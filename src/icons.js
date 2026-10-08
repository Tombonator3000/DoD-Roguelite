// 3D-ikoner for inventaret. Egen liten WebGL-renderer (egen canvas), så tonemapping og sRGB
// blir riktig uten ekstra arbeid. Hvert ikon rendres én gang og lagres som bilde.
// Den samme rendereren tegner gjenstanden som snurrer i detaljfeltet.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildItemModel, iconKey } from './itemmodels.js';
import { RARITY } from './loot.js';

const SIZE = 160;
const box = new THREE.Box3();
const ctr = new THREE.Vector3();
const sz = new THREE.Vector3();

export class Icons {
  constructor() {
    this.cache = new Map();
    this.ok = true;
    try {
      this.canvas = document.createElement('canvas');
      this.canvas.width = this.canvas.height = SIZE;
      this.r = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'low-power' });
      this.r.setPixelRatio(1);
      this.r.setSize(SIZE, SIZE, false);
      this.r.toneMapping = THREE.ACESFilmicToneMapping;
      this.r.toneMappingExposure = 1.15;
      this.r.outputColorSpace = THREE.SRGBColorSpace;
      this.r.setClearColor(0x000000, 0);
    } catch (e) {
      this.ok = false;
      return;
    }
    const s = (this.scene = new THREE.Scene());
    const pm = new THREE.PMREMGenerator(this.r);
    this.env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    pm.dispose();
    s.environment = this.env;
    s.environmentIntensity = 0.75;
    const key = new THREE.DirectionalLight(0xffe2b8, 2.6);
    key.position.set(-1.5, 2.4, 2.2);
    const rim = new THREE.DirectionalLight(0x8ab0ff, 2.2);
    rim.position.set(2, 0.6, -2.2);
    const fill = new THREE.HemisphereLight(0xffeedd, 0x201410, 0.6);
    s.add(key, rim, fill);
    this.cam = new THREE.PerspectiveCamera(26, 1, 0.05, 20);
    this.cam.position.set(0, 0, 3);
    this.holder = new THREE.Group();
    s.add(this.holder);
    // detaljvisning (snurrer)
    this.spin = null;
    this.spinCanvas = null;
  }

  // Legger modellen i holderen, sentrert og skalert så den fyller ruta
  stage(e, spin = 0, tall = false) {
    this.holder.clear();
    this.holder.rotation.set(0, 0, 0);
    this.holder.position.set(0, 0, 0);
    this.holder.scale.setScalar(1);
    const m = buildItemModel(e);
    const pose = new THREE.Group();
    pose.add(m);
    if (m.userData.weapon) {
      const k = e.kind;
      if (k === 'bow') { m.rotation.y = Math.PI / 2; pose.rotation.z = -Math.PI / 4; }
      else if (k === 'shield') { pose.rotation.set(0.25, -0.35, 0); }
      else if (k === 'xbow') { pose.rotation.set(0.5, 0, Math.PI * 0.82); }
      else if (tall) { pose.rotation.z = Math.PI; pose.rotation.y = 0.5; }
      else { pose.rotation.z = Math.PI * 0.75; pose.rotation.y = 0.25; }
    } else if (e.slot === 'rustning') pose.rotation.set(0.12, -0.42, 0);
    else if (e.slot === 'hjalm') pose.rotation.set(0.32, -0.55, 0);
    else if (e.slot === 'amulett') pose.rotation.set(0.2, -0.3, 0);
    else pose.rotation.set(0.5, -0.5, 0);
    const spinG = new THREE.Group();
    spinG.add(pose);
    this.holder.add(spinG);
    spinG.updateMatrixWorld(true);
    box.setFromObject(spinG);
    box.getCenter(ctr);
    box.getSize(sz);
    pose.position.sub(ctr);
    const r = Math.max(sz.x, sz.y, sz.z * 0.7) || 0.4;
    const fit = (tall ? 1.3 : 1.12) / r;
    spinG.scale.setScalar(fit);
    spinG.rotation.y = spin;
    this.spinG = spinG;
    return spinG;
  }

  render() {
    this.r.render(this.scene, this.cam);
  }

  url(e, tall = false) {
    if (!this.ok || !e) return null;
    tall = tall && !!e.slot && (e.slot === 'vapen' || e.slot === 'vapen2') && !['shield', 'bow', 'xbow'].includes(e.kind);
    const k = iconKey(e) + (tall ? ':t' : '');
    if (this.cache.has(k)) return this.cache.get(k);
    this.stage(e, 0, tall);
    this.render();
    let u = null;
    try { u = this.canvas.toDataURL('image/png'); } catch (err) { u = null; }
    this.cache.set(k, u);
    if (this.spinItem) this.stage(this.spinItem, -0.6);
    else this.holder.clear();
    return u;
  }

  // Setter ikonet som bakgrunn i et element
  fill(el, e, tall = false) {
    if (!el) return;
    const u = this.url(e, tall);
    if (u) {
      el.style.backgroundImage = `url(${u})`;
      el.classList.add('has');
    }
    const col = RARITY[e?.rarity || 'vanlig']?.color;
    if (col) el.style.setProperty('--rc', col);
  }

  // Detaljvisning: tegner gjenstanden som snurrer sakte på en egen canvas
  setSpin(canvas, e) {
    this.spinCanvas = canvas;
    this.spinItem = e;
    this.spinT = 0;
    if (!e || !this.ok) { if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height); return; }
    this.stage(e, -0.6);
  }

  tick(dt) {
    if (!this.ok || !this.spinCanvas || !this.spinItem || !this.spinG) return;
    this.spinT += dt;
    this.spinG.rotation.y = -0.6 + Math.sin(this.spinT * 0.7) * 0.9;
    this.spinG.position.y = Math.sin(this.spinT * 1.6) * 0.02;
    this.render();
    const c = this.spinCanvas.getContext('2d');
    c.clearRect(0, 0, this.spinCanvas.width, this.spinCanvas.height);
    c.drawImage(this.canvas, 0, 0, this.spinCanvas.width, this.spinCanvas.height);
  }
}
