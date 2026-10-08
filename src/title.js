import * as THREE from 'three';
import { G } from './state.js';
import { addRimFlash, makeOutline } from './assets.js';
import { shaftMaterial } from './gfx.js';
import { makeMotes } from './decor.js';
import { FX } from './fx.js';
import { buildCharacter, buildWeaponMesh, HOLD } from './kinmodels.js';
import { weaponItem, armorItem } from './loot.js';

// Egen scene for tittelskjermen: anda på en steinplattform i mørket.
export class TitleScene {
  constructor() {
    const s = (this.scene = new THREE.Scene());
    s.background = new THREE.Color(0x040306);
    s.fog = new THREE.Fog(0x07060b, 10, 32);
    this.t = 0;
    this.intro = 0;
    this.leave = 0;
    const A = G.assets, gfx = G.gfx;
    const B = A.biome('dverg');
    const W = A.biome('kloakk');

    // gulv
    const fmap = B.floorMat.map.clone();
    fmap.repeat.set(9, 9);
    fmap.needsUpdate = true;
    const fnorm = B.floorMat.normalMap.clone();
    fnorm.repeat.set(9, 9);
    fnorm.needsUpdate = true;
    const floor = new THREE.Mesh(new THREE.CircleGeometry(22, 64).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: fmap, normalMap: fnorm, roughness: 0.55, color: 0x9a948c }));
    floor.receiveShadow = true;
    s.add(floor);

    // plattform med trinn
    const wmap = W.wallMat.map.clone();
    wmap.repeat.set(6, 0.4);
    wmap.needsUpdate = true;
    const stoneM = new THREE.MeshStandardMaterial({ map: wmap, roughness: 0.85, color: 0xb0a898 });
    const step = new THREE.Mesh(new THREE.CylinderGeometry(3.7, 3.9, 0.22, 64), stoneM);
    step.position.y = 0.11;
    const plat = new THREE.Mesh(new THREE.CylinderGeometry(2.9, 3.05, 0.46, 64), stoneM);
    plat.position.y = 0.23;
    for (const m of [step, plat]) { m.receiveShadow = true; m.castShadow = true; s.add(m); }
    const top = new THREE.Mesh(new THREE.CircleGeometry(2.9, 64).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: fmap, normalMap: fnorm, roughness: 0.5, color: 0x8a847c }));
    top.position.y = 0.461;
    top.receiveShadow = true;
    s.add(top);

    // runesirkler
    const ringMat = (c, o) => new THREE.MeshBasicMaterial({ map: gfx.runeRing, color: c, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false });
    this.ring1 = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 5.6).rotateX(-Math.PI / 2), ringMat(0xffb24a, 0.75));
    this.ring1.position.y = 0.47;
    this.ring2 = new THREE.Mesh(new THREE.PlaneGeometry(8.6, 8.6).rotateX(-Math.PI / 2), ringMat(0xff7a2a, 0.22));
    this.ring2.position.y = 0.02;
    s.add(this.ring1, this.ring2);

    // rollpersonen på plattformen (anda som standard)
    this.charPivot = new THREE.Group();
    this.charTilt = new THREE.Group();
    this.charPivot.add(this.charTilt);
    this.charPivot.position.y = 0.46;
    this.charPivot.rotation.y = 0.35;
    s.add(this.charPivot);
    const blob = gfx.blobFor(0.55, 0.7);
    blob.position.y = 0.475;
    s.add(blob);
    this.charKey = null;

    // søyler i en halvsirkel bak
    const pm = new THREE.MeshStandardMaterial({ map: W.wallMat.map, normalMap: W.wallMat.normalMap, roughness: 0.9, color: 0x9a9088 });
    for (let i = 0; i < 9; i++) {
      const a = Math.PI + (i / 8 - 0.5) * Math.PI * 1.35;
      const r = 9 + (i % 2) * 1.5;
      const hh = i % 3 === 1 ? 2.2 + Math.random() : 6 + Math.random() * 2;
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, hh, 14), pm);
      col.position.set(Math.sin(a) * r, hh / 2, Math.cos(a) * r);
      col.castShadow = col.receiveShadow = true;
      s.add(col);
      const cap = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 1.6), pm);
      cap.position.set(col.position.x, 0.17, col.position.z);
      s.add(cap);
      if (hh < 4) {
        for (let k = 0; k < 4; k++) {
          const sz = 0.3 + Math.random() * 0.4;
          const rb = new THREE.Mesh(new THREE.BoxGeometry(sz, sz * 0.7, sz), pm);
          rb.position.set(col.position.x + (Math.random() - 0.5) * 2.4, sz * 0.3, col.position.z + (Math.random() - 0.5) * 2.4);
          rb.rotation.set(Math.random(), Math.random() * 3, Math.random());
          rb.castShadow = true;
          s.add(rb);
        }
      }
    }

    // fyrfat
    this.braziers = [];
    const bm = new THREE.MeshStandardMaterial({ color: 0x2a2420, roughness: 0.45, metalness: 0.85 });
    for (const sx of [-3.6, 3.6]) {
      const g = new THREE.Group();
      const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.3, 1.2, 10), bm);
      stand.position.y = 0.6;
      const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.32, 0.4, 16), bm);
      bowl.position.y = 1.35;
      for (const m of [stand, bowl]) { m.castShadow = true; g.add(m); }
      g.position.set(sx, 0, -1.6);
      s.add(g);
      const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: A.flameTex, color: 0xff9a40, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
      fl.position.set(sx, 1.95, -1.6);
      const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: A.glowTex, color: 0xff7a2a, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.3 }));
      gl.position.set(sx, 1.8, -1.6);
      gl.scale.set(2.2, 2.2, 1);
      s.add(fl, gl);
      const light = new THREE.PointLight(0xff8a3a, 26, 16, 2);
      light.position.set(sx, 2.3, -1.4);
      s.add(light);
      this.braziers.push({ fl, gl, light, x: sx, ph: Math.random() * 10 });
    }

    // lyssjakt ovenfra
    this.shaftMat = shaftMaterial(0xa8c8ff, 0.2);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 2.6, 16, 32, 1, true).translate(0, 8, 0), this.shaftMat);
    shaft.renderOrder = 7;
    s.add(shaft);
    const spot = new THREE.SpotLight(0xc8dcff, 160, 30, 0.32, 0.75, 1.5);
    spot.position.set(0.4, 15, 0.6);
    spot.target.position.set(0, 0.5, 0);
    spot.castShadow = true;
    spot.shadow.mapSize.set(1024, 1024);
    spot.shadow.bias = -0.0004;
    spot.shadow.normalBias = 0.03;
    s.add(spot, spot.target);
    this.spot = spot;
    const back = new THREE.Sprite(new THREE.SpriteMaterial({ map: A.glowTex, color: 0x6a8aff, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.18 }));
    back.position.set(0, 2.6, -4);
    back.scale.set(12, 12, 1);
    s.add(back);
    s.add(new THREE.HemisphereLight(0x6a6a88, 0x0a0806, 0.35));
    const rim = new THREE.DirectionalLight(0xffc890, 1.2);
    rim.position.set(-3, 5, -7);
    s.add(rim);

    // partikler, støv og tåke
    this.fx = new FX(s);
    this.motes = makeMotes(140, new THREE.Vector3(4.5, 12, 4.5), 0xd8e4ff, 0.06, false);
    s.add(this.motes);
    this.embers = makeMotes(90, new THREE.Vector3(16, 9, 16), 0xff9a50, 0.05, false);
    s.add(this.embers);
    this.mist = [];
    for (let i = 0; i < 18; i++) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: gfx.smoke, color: 0x7a7a90, transparent: true, opacity: 0.08, depthWrite: false }));
      const a = Math.random() * Math.PI * 2, r = 4 + Math.random() * 8;
      sp.position.set(Math.cos(a) * r, 0.4 + Math.random() * 0.6, Math.sin(a) * r);
      const sc = 6 + Math.random() * 5;
      sp.scale.set(sc, sc * 0.5, 1);
      sp.userData = { a, r, sp: (Math.random() - 0.5) * 0.04 };
      s.add(sp);
      this.mist.push(sp);
    }
  }

  // Bytter figuren på plattformen. sheet: { id, kin, profession, school, age, gear }
  setCharacter(sheet) {
    const g = sheet.gear || {};
    const arm = [].concat(g.a || []);
    const key = [sheet.id, sheet.kin, sheet.profession, sheet.school, sheet.age, (g.w || []).join(','), arm.join(',')].join('|');
    if (key === this.charKey) return;
    this.charKey = key;
    while (this.charTilt.children.length) this.charTilt.remove(this.charTilt.children[0]);
    this.charRig = null;
    this.charShield = false;
    const A = G.assets;
    const ws = (g.w || []).map(id => weaponItem(id)).filter(Boolean);
    let main = ws.find(w => !w.shield) || null;
    let off = ws.find(w => w.shield) || ws.find(w => w !== main) || null;
    let handR, handL;
    if (sheet.kin === 'anka' && A.duckGeo) {
      const m = new THREE.MeshStandardMaterial({ map: A.duckTex, roughness: 0.75 });
      if (sheet.id !== 'svartnebb') m.color.setHSL(((String(sheet.id).length * 37) % 100) / 100, 0.18, 0.82);
      this.charFx = addRimFlash(m, 0x6a4a20, 2.2);
      const duck = new THREE.Mesh(A.duckGeo, m);
      duck.rotation.y = -Math.PI / 2;
      duck.scale.setScalar(1.1);
      duck.castShadow = true;
      duck.add(makeOutline(A.duckGeo, 0.012));
      this.charTilt.add(duck);
      handR = new THREE.Group(); handR.position.set(-0.38, 0.75, 0.2);
      handL = new THREE.Group(); handL.position.set(0.38, 0.75, 0.2);
      this.charTilt.add(handR, handL);
    } else {
      const pieces = arm.map(id => armorItem(id)).filter(Boolean);
      const of = s2 => pieces.find(p => p.slot === s2) || null;
      const c = buildCharacter(sheet, { armor: of('rustning'), helmet: of('hjalm'), arms: of('armar'), legs: of('ben') });
      this.charFx = c.fxU;
      this.charRig = c.rig;
      this.charTilt.add(c.root);
      handR = c.rig.handR;
      handL = c.rig.handL;
    }
    const mount = (item, hand) => {
      if (!item || item.kind === 'fist') return;
      const w = buildWeaponMesh(item);
      w.rotation.x = HOLD[item.kind] ?? -0.35;
      if (item.kind === 'shield' && this.charRig) w.rotation.x = 1.55;
      hand.add(w);
    };
    if (main?.kind === 'bow') mount(main, handL);
    else mount(main, handR);
    if (off && !main?.twoOnly && main?.kind !== 'bow') { mount(off, handL); this.charShield = !!off.shield; }
    G.fx?.burst && this.fx.burst('portal', { x: 0, y: 0.5, z: 0 }, 24);
  }

  setScale(sc) {
    this.fx.add.uniforms.uScale.value = sc;
    this.fx.norm.uniforms.uScale.value = sc;
    this.motes.material.uniforms.uScale.value = sc;
    this.embers.material.uniforms.uScale.value = sc;
  }

  update(dt, cam) {
    this.t += dt;
    const t = this.t;
    this.intro = Math.min(1, this.intro + dt / 5.5);
    const ease = 1 - Math.pow(1 - this.intro, 3);
    this.ring1.rotation.y += dt * 0.08;
    this.ring2.rotation.y -= dt * 0.03;
    this.ring1.material.opacity = 0.55 + Math.sin(t * 1.3) * 0.18;
    this.shaftMat.uniforms.uTime.value = t;
    for (const m of [this.motes, this.embers]) m.material.uniforms.uTime.value = t;
    for (const b of this.braziers) {
      const k = 0.9 + 0.12 * Math.sin(t * 13 + b.ph) + 0.06 * Math.sin(t * 29 + b.ph * 2);
      b.fl.scale.set(0.7 * (2 - k), 1.25 * k, 1);
      b.light.intensity = 26 * k;
      if (Math.random() < dt * 14) this.fx.ember({ x: b.x, y: 1.7, z: -1.6 });
      if (Math.random() < dt * 2) this.fx.burst('torchsmoke', { x: b.x, y: 2.4, z: -1.6 }, 1);
    }
    for (const m of this.mist) {
      m.userData.a += m.userData.sp * dt;
      m.position.x = Math.cos(m.userData.a) * m.userData.r;
      m.position.z = Math.sin(m.userData.a) * m.userData.r;
    }
    // rollpersonen puster, ser seg rundt og vagger litt på stedet
    if (this.charFx) {
      const look = Math.sin(t * 0.33) * 0.22 + Math.sin(t * 0.13) * 0.12;
      this.charPivot.rotation.y = 0.3 + look;
      this.charTilt.rotation.z = Math.sin(t * 1.1) * 0.025;
      this.charTilt.scale.y = 1 + Math.sin(t * 2.1) * 0.01;
      this.charFx.uRim.value.setRGB(0.42 + Math.sin(t * 1.3) * 0.08, 0.3, 0.12);
      const r = this.charRig;
      if (r) {
        r.shR.rotation.x = -0.3 + Math.sin(t * 1.4) * 0.04;
        r.elR.rotation.x = -0.5;
        r.shL.rotation.x = this.charShield ? -0.5 : -0.15 + Math.sin(t * 1.4 + 1) * 0.04;
        r.elL.rotation.x = this.charShield ? -1.1 : -0.3;
        r.shR.rotation.z = -0.12;
        r.shL.rotation.z = 0.12;
        r.head.rotation.y = Math.sin(t * 0.5) * 0.25;
        r.torso.scale.y = 1 + Math.sin(t * 2.1) * 0.012;
        if (r.tail) r.tail.rotation.y = Math.sin(t * 2.4) * 0.4;
      }
    }
    this.fx.update(dt, cam);
    // kamera: rolig sirkling, kjører inn under introen og løfter seg når vi går
    const a = 0.12 + Math.sin(t * 0.07) * 0.32;
    let r = THREE.MathUtils.lerp(15, 7.4, ease);
    let hgt = THREE.MathUtils.lerp(6.5, 2.3, ease) + Math.sin(t * 0.05) * 0.25;
    let ty = 1.3;
    if (this.leave > 0) {
      const l = this.leave * this.leave;
      r = THREE.MathUtils.lerp(r, 3.2, l);
      hgt = THREE.MathUtils.lerp(hgt, 9, l);
      ty = THREE.MathUtils.lerp(ty, 0.5, l);
    }
    cam.position.set(Math.sin(a) * r, hgt, Math.cos(a) * r);
    cam.lookAt(0, ty, 0);
  }
}
