import * as THREE from 'three';
import { G, T } from './state.js';
import { rollDice, skillRoll, d } from './rules.js';
import { SKILL } from './dod.js';
import { buildBarrel, buildCrate, buildChest } from './assets.js';
import { buildWeaponMesh } from './kinmodels.js';
import { makeItem, RARITY } from './loot.js';
import { Enemy } from './enemies.js';
import { WALL, PILLAR } from './dungeon.js';
import { decorate } from './decor.js';

const tmp = new THREE.Vector3();
const LIGHTS = 7;

export class World {
  constructor() {
    this.lights = [];
    for (let i = 0; i < LIGHTS; i++) {
      const l = new THREE.PointLight(0xffaa66, 0, 15, 2);
      G.scene.add(l);
      this.lights.push(l);
    }
    this.sources = [];
    this.flames = [];
    this.anim = [];
    this.shaftMats = [];
    this.shaftMotes = [];
    this.drips = [];
    this.levelObjs = [];
    this.bolts = [];
    this.trail = null;
    this.labelRoot = document.getElementById('labels');
    this.nearItem = null;
    this.nearInteract = null;
    const metal = new THREE.MeshStandardMaterial({ color: 0xb8bcc4, roughness: 0.25, metalness: 1 });
    const wood = new THREE.MeshStandardMaterial({ color: 0x4a2e1a, roughness: 0.8 });
    this.mats = { metal, wood };
    this.arrowGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.9, 5).rotateX(Math.PI / 2);
    this.coinGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.035, 12);
    this.coinMat = new THREE.MeshStandardMaterial({ color: 0xd8dce4, roughness: 0.2, metalness: 1, emissive: 0x303030 });
    this.breadGeo = new THREE.CapsuleGeometry(0.11, 0.24, 3, 8).rotateZ(Math.PI / 2);
    this.breadMat = new THREE.MeshStandardMaterial({ color: 0xc08a4a, roughness: 0.9 });
    this.potionGeo = new THREE.SphereGeometry(0.15, 12, 10);
    this.potionMat = new THREE.MeshStandardMaterial({ color: 0xc0101a, roughness: 0.1, metalness: 0.2, emissive: 0x500004 });
    this.beamGeo = new THREE.CylinderGeometry(0.06, 0.2, 3.6, 10, 1, true).translate(0, 1.8, 0);
  }

  clear() {
    for (const o of this.levelObjs) G.scene.remove(o);
    this.levelObjs = [];
    for (const e of G.enemies) e.dispose();
    G.enemies.length = 0;
    for (const p of G.pickups) this.removePickup(p, true);
    G.pickups.length = 0;
    for (const p of G.projectiles) G.scene.remove(p.mesh);
    G.projectiles.length = 0;
    for (const b of this.bolts) { G.scene.remove(b.mesh); b.mesh.geometry.dispose(); }
    this.bolts = [];
    G.props.length = 0;
    G.interactables.length = 0;
    this.sources = [];
    this.flames = [];
    this.anim = [];
    this.shaftMats = [];
    this.shaftMotes = [];
    this.drips = [];
    this.caches = [];
    this.trail = null;
    this.stairsRing = null;
    this.stairsPos = null;
    this.dad = null;
    this.labelRoot.innerHTML = '';
  }

  addObj(o) {
    G.scene.add(o);
    this.levelObjs.push(o);
    return o;
  }

  flame(x, y, z, color, scale = 1) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: G.assets.flameTex, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    sp.position.set(x, y + 0.25 * scale, z);
    sp.scale.set(0.42 * scale, 0.75 * scale, 1);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: G.assets.glowTex, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.45 }));
    glow.position.set(x, y + 0.2 * scale, z);
    glow.scale.set(1.8 * scale, 1.8 * scale, 1);
    this.addObj(sp);
    this.addObj(glow);
    this.flames.push({ sp, glow, base: scale, phase: Math.random() * 10, pos: new THREE.Vector3(x, y, z) });
  }

  buildLevel(dg) {
    this.clear();
    const info = dg.info;
    for (const t of dg.torches) {
      const br = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5, 0.12), this.mats.wood);
      const ox = t.x + t.nx * 0.18, oz = t.z + t.nz * 0.18;
      br.position.set(ox, 2.0, oz);
      br.rotation.set(t.nz * 0.4, 0, -t.nx * 0.4);
      this.addObj(br);
      const fx = t.x + t.nx * 0.32, fz = t.z + t.nz * 0.32;
      this.flame(fx, 2.25, fz, t.color, 0.9);
      this.sources.push({ pos: new THREE.Vector3(fx + t.nx * 0.5, 2.4, fz + t.nz * 0.5), color: new THREE.Color(t.color), intensity: 24, phase: Math.random() * 10 });
    }
    const bowlMat = new THREE.MeshStandardMaterial({ color: 0x2a2420, roughness: 0.5, metalness: 0.8 });
    for (const b of dg.braziers) {
      const g = new THREE.Group();
      const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.25, 0.9, 8), bowlMat);
      stand.position.y = 0.45;
      const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.3, 0.35, 12), bowlMat);
      bowl.position.y = 1.05;
      stand.castShadow = bowl.castShadow = true;
      g.add(stand, bowl);
      g.position.set(b.x, 0, b.z);
      this.addObj(g);
      this.flame(b.x, 1.15, b.z, info.alt, 1.5);
      this.sources.push({ pos: new THREE.Vector3(b.x, 2.0, b.z), color: new THREE.Color(info.alt), intensity: 36, phase: Math.random() * 10, ember: true });
      G.props.push({ type: 'brazier', mesh: g, pos: g.position, radius: 0.6, breakable: false });
    }
    for (const p of dg.propList) {
      const m = p.type === 'barrel' ? buildBarrel() : buildCrate();
      m.position.set(p.x, 0, p.z);
      m.rotation.y = Math.random() * 6.28;
      m.traverse(o => { if (o.isMesh) o.castShadow = true; });
      this.addObj(m);
      G.props.push({ type: p.type, mesh: m, pos: m.position, radius: 0.5, breakable: true });
    }
    for (const c of dg.chestList) {
      const m = buildChest();
      m.position.set(c.x, 0, c.z);
      m.rotation.y = Math.random() < 0.5 ? 0 : Math.PI / 2;
      m.traverse(o => { if (o.isMesh) o.castShadow = true; });
      if (c.locked) {
        const lock = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.18, 0.06), new THREE.MeshStandardMaterial({ color: 0x3a3a40, roughness: 0.4, metalness: 0.9 }));
        lock.position.set(0, 0.45, 0.37);
        m.add(lock);
        m.userData.lock = lock;
      }
      this.addObj(m);
      G.interactables.push({ kind: 'chest', mesh: m, pos: m.position, radius: 0.7, solid: true, locked: c.locked, label: c.locked ? 'Dyrk opp den låste kisten' : 'Åpne kisten' });
    }
    // gjemmesteder: usynlige til du finner dem
    this.caches = dg.cacheList.map(c => ({ ...c, searched: false, found: false, taken: false }));
    if (dg.runeStone) this.buildRuneStone(dg.runeStone);
    if (dg.stairs) this.buildStairs(dg.stairs);
    if (dg.shop) this.buildShop(dg.shop);
    decorate(dg, this);
    if (dg.populate) dg.populate(this);
    // Tobolt fortalte hvor ting er gjemt
    if (!dg.isTown && G.run.cacheHint > 0 && this.caches.length) {
      const n = Math.min(this.caches.length, G.run.cacheHint);
      for (let i = 0; i < n; i++) this.caches[i].known = true;
      G.run.cacheHint = 0;
      G.ui.log(`Tobolt hadde rett. Du vet om ${n === 1 ? 'et gjemmested' : n + ' gjemmesteder'} på dette nivået. Se på kartet.`);
    }
    for (const s of dg.spawnList) G.enemies.push(new Enemy(s.type, s.x, s.z, dg.depth));
    if (dg.bossSpawn) G.enemies.push(new Enemy('boss', dg.bossSpawn.x, dg.bossSpawn.z, dg.depth));
  }

  buildRuneStone(s) {
    const g = new THREE.Group();
    const stone = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.6, 0.35), new THREE.MeshStandardMaterial({ color: 0x6a6460, roughness: 0.9 }));
    stone.position.y = 0.8;
    stone.rotation.z = 0.04;
    stone.castShadow = stone.receiveShadow = true;
    g.add(stone);
    const runes = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 1.3), new THREE.MeshBasicMaterial({ map: G.gfx.runeStrips[1], color: 0xffa040, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    runes.position.set(0, 0.85, 0.18);
    g.add(runes);
    g.position.set(s.x, 0, s.z);
    g.rotation.y = Math.PI / 4;
    this.addObj(g);
    this.runeMat = runes.material;
    this.sources.push({ pos: new THREE.Vector3(s.x, 1.4, s.z), color: new THREE.Color(0xffa040), intensity: 10, phase: 1, steady: true });
    G.interactables.push({ kind: 'rune', mesh: g, pos: g.position, radius: 0.6, solid: true, label: 'Les runene' });
  }

  buildStairs(s) {
    const g = new THREE.Group();
    const dark = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const hole = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6).rotateX(-Math.PI / 2), dark);
    hole.position.y = 0.02;
    g.add(hole);
    for (let i = 0; i < 5; i++) {
      const c = 0.32 - i * 0.06;
      const step = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.42).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: new THREE.Color(c, c * 0.95, c * 0.9), roughness: 1 }));
      step.position.set(0, 0.03, -1.0 + i * 0.44);
      g.add(step);
    }
    const rim = new THREE.MeshStandardMaterial({ color: 0x5a5048, roughness: 0.9 });
    for (const [x, z, w, dd] of [[0, -1.45, 3.1, 0.3], [0, 1.45, 3.1, 0.3], [-1.45, 0, 0.3, 3.1], [1.45, 0, 0.3, 3.1]]) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, 0.18, dd), rim);
      b.position.set(x, 0.09, z);
      b.castShadow = b.receiveShadow = true;
      g.add(b);
    }
    const ring = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 4.6).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: G.gfx.runeRing, color: 0x6ab4ff, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }));
    ring.position.y = 0.05;
    g.add(ring);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: G.assets.glowTex, color: 0x3a7aff, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.position.y = 0.06;
    g.add(glow);
    this.stairsPos = new THREE.Vector3(s.x, 0, s.z);
    g.position.set(s.x, 0, s.z);
    this.addObj(g);
    this.stairsRing = ring;
    this.sources.push({ pos: new THREE.Vector3(s.x, 1.6, s.z), color: new THREE.Color(0x6ab4ff), intensity: 20, phase: 0, steady: true });
    G.interactables.push({ kind: 'stairs', mesh: g, pos: g.position, radius: 1.3, solid: false, label: 'Gå ned trappa' });
  }

  buildShop(s) {
    const g = new THREE.Group();
    let dad;
    if (G.assets.duckGeo) {
      const m = new THREE.MeshStandardMaterial({ map: G.assets.duckTex, color: 0xb9c3d6, roughness: 0.8 });
      dad = new THREE.Mesh(G.assets.duckGeo, m);
      dad.rotation.y = -Math.PI / 2;
      dad.scale.setScalar(1.02);
      dad.castShadow = true;
    } else dad = new THREE.Group();
    const dadRoot = new THREE.Group();
    dadRoot.add(dad);
    const apron = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.62, 0.04), new THREE.MeshStandardMaterial({ color: 0xe8dcc0, roughness: 0.9 }));
    apron.position.set(0, 0.55, 0.36);
    dadRoot.add(apron);
    dadRoot.position.set(0, 0, -0.9);
    dadRoot.rotation.y = 0.6;
    g.add(dadRoot);
    const wood = new THREE.MeshStandardMaterial({ color: 0x6a4a2c, roughness: 0.85 });
    const table = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 0.9), wood);
    table.position.set(0, 0.85, 0.2);
    table.castShadow = table.receiveShadow = true;
    g.add(table);
    for (const [x, z] of [[-1, -0.15], [1, -0.15], [-1, 0.55], [1, 0.55]]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.85, 0.1), wood);
      leg.position.set(x, 0.42, z);
      g.add(leg);
    }
    for (let i = 0; i < 3; i++) {
      const b = new THREE.Mesh(this.breadGeo, this.breadMat);
      b.position.set(-0.7 + i * 0.25, 1.0, 0.25 + (i % 2) * 0.1);
      g.add(b);
    }
    for (let i = 0; i < 3; i++) {
      const p = new THREE.Mesh(this.potionGeo, this.potionMat);
      p.position.set(0.4 + i * 0.25, 1.06, 0.2);
      g.add(p);
    }
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.4), new THREE.MeshBasicMaterial({ map: G.assets.labelTexture('BUTIKK'), transparent: false }));
    sign.position.set(-1.35, 2.35, 0.1);
    sign.rotation.y = Math.PI / 4;
    g.add(sign);
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.6, 0.08), wood);
    post.position.set(-1.35, 1.3, 0.05);
    g.add(post);
    const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.25, 0.18), new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffc070, emissiveIntensity: 1.1 }));
    lantern.position.set(0.95, 1.08, 0.1);
    g.add(lantern);
    g.position.set(s.x, 0, s.z);
    this.addObj(g);
    this.dad = dadRoot;
    this.sources.push({ pos: new THREE.Vector3(s.x + 0.9, 2.0, s.z + 0.6), color: new THREE.Color(0xffc488), intensity: 26, phase: 3, steady: true });
    G.interactables.push({ kind: 'shop', mesh: g, pos: new THREE.Vector3(s.x, 0, s.z + 0.2), radius: 1.2, solid: true, label: G.player.isNebb ? 'Snakk med far' : 'Snakk med herr Nansen' });
  }

  // --- prosjektiler -------------------------------------------------------

  spawnPlayerProjectile(kind, from, dir, opts) {
    let mesh;
    if (kind === 'thrown') {
      mesh = new THREE.Group();
      const w = buildWeaponMesh(opts.item);
      w.rotation.x = Math.PI / 2;
      mesh.add(w);
    } else if (kind === 'fireball') {
      mesh = new THREE.Group();
      const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: G.assets.glowTex, color: 0xffa040, blending: THREE.AdditiveBlending, depthWrite: false }));
      core.scale.set(1.3, 1.3, 1);
      const inner = new THREE.Sprite(new THREE.SpriteMaterial({ map: G.assets.glowTex, color: 0xfff0c0, blending: THREE.AdditiveBlending, depthWrite: false }));
      inner.scale.set(0.55, 0.55, 1);
      mesh.add(core, inner);
    } else if (kind === 'stone') {
      mesh = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 5), new THREE.MeshStandardMaterial({ color: 0x8a8478, roughness: 0.9 }));
    } else {
      mesh = new THREE.Group();
      const shaft = new THREE.Mesh(this.arrowGeo, this.mats.wood);
      if (kind === 'bolt') shaft.scale.set(1.3, 1.3, 0.55);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.14, 5).rotateX(Math.PI / 2), this.mats.metal);
      tip.position.z = kind === 'bolt' ? 0.28 : 0.5;
      mesh.add(shaft, tip);
    }
    mesh.position.set(from.x + dir.x * 0.6, 1.0, from.z + dir.z * 0.6);
    mesh.rotation.order = 'YXZ';
    mesh.rotation.y = Math.atan2(dir.x, dir.z);
    G.scene.add(mesh);
    G.projectiles.push({ kind, mesh, pos: mesh.position, dir: dir.clone(), speed: opts.speed || 24, life: opts.life || 0.8, owner: 'player', o: opts.o, item: opts.item, spell: opts.spell });
  }

  spawnArrow(enemy, yaw) {
    const g = new THREE.Group();
    const shaft = new THREE.Mesh(this.arrowGeo, this.mats.wood);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.16, 5).rotateX(Math.PI / 2), this.mats.metal);
    tip.position.z = 0.5;
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: G.assets.glowTex, color: 0xff6030, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.7 }));
    glow.scale.set(0.8, 0.8, 1);
    g.add(shaft, tip, glow);
    const dir = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
    g.position.set(enemy.pos.x + dir.x * 0.6, 1.0, enemy.pos.z + dir.z * 0.6);
    g.rotation.y = yaw;
    G.scene.add(g);
    G.projectiles.push({ kind: 'arrow', mesh: g, pos: g.position, dir, speed: 17, life: 1.1, owner: 'enemy', src: enemy, skill: enemy.skill, dmg: enemy.def.dmg });
  }

  updateProjectiles(dt) {
    const P = G.player;
    for (let i = G.projectiles.length - 1; i >= 0; i--) {
      const p = G.projectiles[i];
      const prev = { x: p.pos.x, z: p.pos.z };
      p.pos.addScaledVector(p.dir, p.speed * dt);
      p.life -= dt;
      if (p.kind === 'thrown') p.mesh.rotation.x += dt * 22;
      if (p.kind === 'fireball' && Math.random() < dt * 40) G.fx.burst('fire', { x: p.pos.x, y: 1, z: p.pos.z }, 1);
      let gone = p.life <= 0;
      let hitAt = null;
      const tv = G.dungeon.get(Math.floor(p.pos.x / T), Math.floor(p.pos.z / T));
      if (tv === WALL || tv === PILLAR) {
        gone = true;
        hitAt = prev;
        G.fx.burst('spark', p.pos, 6);
      }
      if (!gone && p.owner === 'player') {
        for (const e of G.enemies) {
          if (e.dead) continue;
          if (Math.hypot(e.pos.x - p.pos.x, e.pos.z - p.pos.z) < e.radius + 0.35) {
            if (p.spell) this.spellHit(p, e);
            else P.attackRoll(p.o, e);
            G.fx.burst('spark', p.pos, 4);
            gone = true;
            hitAt = { x: e.pos.x - p.dir.x * 0.6, z: e.pos.z - p.dir.z * 0.6 };
            break;
          }
        }
        if (!gone) for (const pr of G.props) {
          if (pr.breakable && Math.hypot(pr.pos.x - p.pos.x, pr.pos.z - p.pos.z) < pr.radius + 0.2) { this.breakProp(pr); gone = true; hitAt = prev; break; }
        }
      } else if (!gone && p.owner === 'enemy' && !P.downed) {
        if (Math.hypot(P.pos.x - p.pos.x, P.pos.z - p.pos.z) < P.radius + 0.3) {
          this.arrowHit(p);
          gone = true;
        }
      }
      if (gone) {
        if (p.kind === 'fireball') { G.fx.burst('fire', { x: p.pos.x, y: 1, z: p.pos.z }, 18); G.fx.ring(p.pos, 1.5, 0xff8a30, 0.25, 0.6); }
        if (p.kind === 'thrown' && p.item) {
          const at = hitAt || p.pos;
          tmp.set(at.x, 0, at.z);
          G.dungeon.collide(tmp, 0.3);
          this.spawnPickup('thrown', tmp.x, tmp.z, { item: p.item, noFly: true });
        }
        G.scene.remove(p.mesh);
        G.projectiles.splice(i, 1);
      }
    }
  }

  spellHit(p, e) {
    const s = p.spell;
    const r = { drake: false, success: true };
    if (e.tryDefend?.(r, { ranged: true, dice: '0' })) return;
    tmp.set(p.dir.x, 0, p.dir.z);
    e.takeHit(s.dmg, tmp, 3, { type: s.type, src: 'player' });
    if (s.burn && !e.dead) e.addDot('burn');
  }

  arrowHit(p) {
    const P = G.player;
    const src = p.src && !p.src.dead ? p.src : null;
    let bane = 0;
    if (src && P.fx.tonkonst > 0 && Math.hypot(P.pos.x - src.pos.x, P.pos.z - src.pos.z) <= (P.fx.tonkonstR || 10)) bane++;
    const r = skillRoll(p.skill, { bane });
    r.skill = 'kortbåge';
    if (!r.success || r.demon) {
      G.fx.float('Bom', P.pos, 'miss');
      G.ui.logRoll(r, 'Pila suser forbi.', true);
      return;
    }
    const value = r.drake ? rollDice(p.dmg) + rollDice(p.dmg) : rollDice(p.dmg);
    P.receiveAttack({ src, value, dmg: p.dmg, type: 'p', ranged: true, drake: r.drake, roll: r, who: 'En pil', verb: `treffer${r.drake ? ' midt i' : ''}`, ignoreInvuln: false });
  }

  lightning(a, b, color = 0xbfd8ff) {
    const pts = [];
    const n = 9;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const j = i === 0 || i === n ? 0 : 0.35;
      pts.push(new THREE.Vector3(a.x + (b.x - a.x) * t + (Math.random() - 0.5) * j, (a.y ?? 1.1) + ((b.y ?? 1.0) - (a.y ?? 1.1)) * t + (Math.random() - 0.5) * j, a.z + (b.z - a.z) * t + (Math.random() - 0.5) * j));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mesh = new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    mesh.renderOrder = 8;
    G.scene.add(mesh);
    this.bolts.push({ mesh, t: 0 });
    G.fx.impact(b, color, 2.2, 1.0);
    G.post?.flash(color, 0.08);
  }

  // --- loot -----------------------------------------------------------------

  spawnPickup(kind, x, z, o = {}) {
    let mesh;
    if (kind === 'silver') mesh = new THREE.Mesh(this.coinGeo, this.coinMat);
    else if (kind === 'bread') mesh = new THREE.Mesh(this.breadGeo, this.breadMat);
    else if (kind === 'potion') mesh = new THREE.Mesh(this.potionGeo, this.potionMat);
    else if (kind === 'thrown') { mesh = new THREE.Group(); const w = buildWeaponMesh(o.item); w.rotation.z = Math.PI / 2; mesh.add(w); }
    else mesh = this.itemMesh(o.item);
    mesh.position.set(x, 0.9, z);
    mesh.castShadow = kind !== 'item';
    G.scene.add(mesh);
    const a = Math.random() * Math.PI * 2, sp = 1 + Math.random() * 2.5;
    const p = { kind, mesh, pos: mesh.position, vel: o.noFly ? null : new THREE.Vector3(Math.cos(a) * sp, 4 + Math.random() * 2, Math.sin(a) * sp), t: o.noFly ? 0.5 : 0, value: o.value || 1, item: o.item, base: kind === 'item' ? 0.22 : kind === 'thrown' ? 0.08 : 0.12 };
    if (o.noFly) mesh.position.y = p.base;
    if (kind === 'item') {
      const el = document.createElement('div');
      el.className = 'itemlabel';
      el.style.color = RARITY[o.item.rarity].color;
      el.textContent = o.item.name;
      this.labelRoot.appendChild(el);
      p.label = el;
    }
    G.pickups.push(p);
    return p;
  }

  itemMesh(item) {
    const col = RARITY[item.rarity].hex;
    const g = new THREE.Group();
    if (item.slot === 'vapen' || item.slot === 'vapen2') {
      const w = buildWeaponMesh(item);
      w.rotation.z = Math.PI / 2;
      w.rotation.y = 0.4;
      w.position.x = item.kind === 'staff' || item.kind === 'spear' ? 0 : 0.25;
      g.add(w);
    } else if (item.slot === 'rustning') {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.4), new THREE.MeshStandardMaterial({ color: item.metal ? 0x9a9ca2 : 0x5a3e28, roughness: item.metal ? 0.4 : 0.8, metalness: item.metal ? 0.9 : 0, emissive: col, emissiveIntensity: 0.25 }));
      g.add(b);
    } else if (item.slot === 'hjalm') {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x9a9ca2, roughness: 0.35, metalness: 1, emissive: col, emissiveIntensity: 0.2 }));
      g.add(b);
    } else {
      const m = new THREE.MeshStandardMaterial({ color: 0xc8c8c8, roughness: 0.3, metalness: 0.9, emissive: col, emissiveIntensity: 0.5 });
      const t = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.04, 8, 18), m);
      t.rotation.x = Math.PI / 2;
      const gem = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 1.5 }));
      gem.position.z = 0.17;
      g.add(t, gem);
    }
    const beam = new THREE.Mesh(this.beamGeo, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: item.rarity === 'vanlig' ? 0.12 : 0.3, blending: THREE.AdditiveBlending, depthWrite: false }));
    beam.userData.beam = true;
    g.add(beam);
    g.userData.beam = beam;
    return g;
  }

  removePickup(p, quiet = false) {
    G.scene.remove(p.mesh);
    if (p.label) p.label.remove();
    if (!quiet) {
      const i = G.pickups.indexOf(p);
      if (i >= 0) G.pickups.splice(i, 1);
    }
  }

  dropSilver(x, z, total) {
    if (total <= 0) return;
    const piles = Math.min(5, Math.max(1, Math.ceil(total / 3)));
    let left = total;
    for (let i = 0; i < piles; i++) {
      const v = i === piles - 1 ? left : Math.max(1, Math.round(total / piles));
      left -= v;
      if (v > 0) this.spawnPickup('silver', x, z, { value: v });
    }
  }

  lootOpts(extra = {}) {
    const P = G.player;
    const prefer = (P.sheet.trained || []).filter(s => SKILL[s]?.type === 'vap');
    if (prefer.some(s => ['Svärd', 'Yxa', 'Hammare'].includes(s))) prefer.push('sköld');
    return { prefer, school: P.sheet.school, ...extra };
  }

  dropLoot(e) {
    const P = G.player;
    const greed = P.flags.has('greed');
    const [a, b] = e.def.silver;
    const s = Math.round((a + Math.floor(Math.random() * (b - a + 1))) * (greed ? 1.5 : 1));
    this.dropSilver(e.pos.x, e.pos.z, s);
    if (Math.random() < 0.1) this.spawnPickup('bread', e.pos.x, e.pos.z);
    if (Math.random() < 0.05) this.spawnPickup('potion', e.pos.x, e.pos.z);
    const chance = 0.07 + G.depth * 0.02 + (greed ? 0.08 : 0) + (e.type === 'orc' ? 0.12 : 0) + (e.type === 'demon' ? 0.6 : 0);
    if (e.def.boss) {
      this.spawnPickup('item', e.pos.x, e.pos.z, { item: makeItem(5, this.lootOpts({ unique: true })) });
      this.spawnPickup('item', e.pos.x, e.pos.z, { item: makeItem(5, this.lootOpts({ rarity: 'sjelden' })) });
      this.spawnPickup('potion', e.pos.x, e.pos.z);
    } else if (Math.random() < chance) {
      this.spawnPickup('item', e.pos.x, e.pos.z, { item: makeItem(G.depth, this.lootOpts({ luck: greed ? 0.2 : 0 })) });
    }
  }

  breakProp(p) {
    if (!p.breakable) return;
    const i = G.props.indexOf(p);
    if (i < 0) return;
    G.props.splice(i, 1);
    G.scene.remove(p.mesh);
    G.fx.burst('wood', { x: p.pos.x, y: 0.6, z: p.pos.z }, 18);
    G.fx.burst('dust', p.pos, 6);
    G.audio.crunch();
    if (Math.random() < 0.5) this.dropSilver(p.pos.x, p.pos.z, 1 + Math.floor(Math.random() * 3) * (G.player.flags.has('greed') ? 2 : 1));
    if (Math.random() < 0.15) this.spawnPickup('bread', p.pos.x, p.pos.z);
    if (Math.random() < 0.04) this.spawnPickup('potion', p.pos.x, p.pos.z);
    if (Math.random() < 0.04) this.spawnPickup('item', p.pos.x, p.pos.z, { item: makeItem(G.depth, this.lootOpts()) });
    if (p.type === 'barrel' && Math.random() < 0.12) {
      const e = new Enemy('rat', p.pos.x, p.pos.z, G.depth);
      e.alerted = true;
      e.state = 'chase';
      G.enemies.push(e);
      G.ui.log('Det var en rotte i tønna.');
    }
  }

  fireBlast(pos, r, dice) {
    G.fx.ring(pos, r, 0xff8a30, 0.35, 0.4);
    G.fx.burst('fire', { x: pos.x, y: 0.5, z: pos.z }, 24);
    G.audio.hit(true);
    for (const e of G.enemies) {
      if (e.dead) continue;
      const dd = Math.hypot(e.pos.x - pos.x, e.pos.z - pos.z);
      if (dd < r + e.radius) {
        tmp.set(e.pos.x - pos.x, 0, e.pos.z - pos.z).normalize();
        e.takeHit(rollDice(dice), tmp, 4, { ignoreArmor: true, type: 'fire', src: 'player' });
      }
    }
  }

  alertAround(pos, r) {
    for (const e of G.enemies) {
      if (!e.dead && e.pos.distanceTo(pos) < r) {
        e.lastSeen.copy(pos);
        e.alert('noise');
      }
    }
  }

  // --- evner som bruker verden -----------------------------------------------

  // Skattjägare: gyllent spor til den rikeste skatten
  showTreasureTrail() {
    const P = G.player;
    const targets = [];
    for (const c of this.caches) if (!c.taken) targets.push({ x: c.x, z: c.z, v: 3 });
    for (const it of G.interactables) if (it.kind === 'chest' && !it.opened) targets.push({ x: it.pos.x, z: it.pos.z, v: it.locked ? 2.5 : 2 });
    for (const p of G.pickups) if (p.kind === 'item') targets.push({ x: p.pos.x, z: p.pos.z, v: p.item.rarity === 'sjelden' || p.item.rarity === 'unik' ? 3.5 : 1 });
    if (!targets.length) return false;
    targets.sort((a, b) => b.v - a.v || Math.hypot(a.x - P.pos.x, a.z - P.pos.z) - Math.hypot(b.x - P.pos.x, b.z - P.pos.z));
    const t = targets[0];
    const path = G.dungeon.path(P.pos.x, P.pos.z, t.x, t.z);
    path.push({ x: t.x, z: t.z });
    this.trail = { pts: path, t: 0, dur: 12, target: t };
    return true;
  }

  // Intuition: kartet åpner seg og SL gir et hint
  intuition() {
    const D = G.dungeon;
    D.explored.fill(1);
    for (const c of this.caches) c.known = true;
    const counts = {};
    for (const e of G.enemies) if (!e.dead) counts[e.def.name] = (counts[e.def.name] || 0) + 1;
    const worst = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    const hint = G.depth === 5
      ? 'Rødpels venter i midten av hiet. Han handler to ganger for hver gang du blinker, og han hater ild.'
      : worst ? `Det er flest av ${worst[0].toLowerCase()} her nede (${worst[1]}). Trappa ned er merket på kartet.` : 'Nivået er stille.';
    G.ui.log(`<b class="c-mark">Intuition:</b> ${hint}`);
  }

  // Splittra: knus låste kister og kasser i nærheten
  shatterNear(pos, r) {
    let did = false;
    for (const it of G.interactables) {
      if (it.kind === 'chest' && !it.opened && Math.hypot(it.pos.x - pos.x, it.pos.z - pos.z) < r + it.radius) {
        this.openChest(it, 'Kisten splintres.');
        did = true;
      }
    }
    for (const p of [...G.props]) if (p.breakable && Math.hypot(p.pos.x - pos.x, p.pos.z - pos.z) < r + p.radius) { this.breakProp(p); did = true; }
    return did;
  }

  // --- samhandling --------------------------------------------------------

  equipItem(item) {
    const P = G.player;
    let slot = item.slot;
    let old = null;
    if (slot === 'vapen') {
      if (!P.equip.vapen) { P.equip.vapen = item; }
      else {
        old = P.equip.vapen;
        P.equip.vapen = item;
        if (!P.equip.vapen2 && !old.shield) { P.equip.vapen2 = old; old = null; }
      }
    } else {
      old = P.equip[slot];
      P.equip[slot] = item;
    }
    P.recalc();
    if (slot === 'rustning' || slot === 'hjalm') P.buildModel();
    else P.refreshWeaponMeshes();
    if (old) this.spawnPickup('item', P.pos.x, P.pos.z, { item: old });
    G.ui.log(`${P.name} tar <b style="color:${RARITY[item.rarity].color}">${item.name}</b>.`);
    if (item.str && P.attrs.STY < item.str) G.ui.log(`${item.name} krever STY ${item.str}. Du får nackdel med det.`);
  }

  interact() {
    const P = G.player;
    if (P.downed) return;
    if (this.nearItem) {
      const p = this.nearItem;
      this.removePickup(p);
      this.equipItem(p.item);
      G.audio.coin();
      this.nearItem = null;
      return;
    }
    const it = this.nearInteract;
    if (!it) return;
    if (it.onUse) { it.onUse(it); return; }
    if (it.kind === 'chest' && !it.opened) this.tryChest(it);
    else if (it.kind === 'stairs') G.game.descend();
    else if (it.kind === 'shop') G.game.openShop();
    else if (it.kind === 'cache') this.takeCache(it);
    else if (it.kind === 'rune') this.readRunes(it);
  }

  tryChest(it) {
    const P = G.player;
    if (!it.locked) return this.openChest(it, 'Kisten knirker opp.');
    if (it.busy && G.time < it.busy) return;
    it.busy = G.time + 1.2;
    // trolleritrick og hjälteförmåga først
    if (P.tricks.has('lasaupp') && P.vp >= 1) { P.vp -= 1; return this.openChest(it, 'Låsa upp: låsen klikker opp av seg selv.'); }
    if (P.has('mastersnickare') && P.vp >= 1) { P.vp -= 1; G.fx.burst('wood', { x: it.pos.x, y: 0.6, z: it.pos.z }, 16); return this.openChest(it, 'Mästersnickare: lokket løsner med ett presist slag.'); }
    if (it.forced) {
      // bryt opp: STY-slag, men det bråker
      const r = P.roll('STY', { noArmed: true });
      G.audio.crunch();
      this.alertAround(it.pos, 12);
      if (r.success) this.openChest(it, 'Du bryter opp kisten. Det hørtes nok.');
      else G.ui.logRoll(r, 'Kisten står imot. Det bråker.');
      return;
    }
    const lockpicks = P.kit.has('dyrkar');
    P.rollPush('Fingerfärdighet', { important: true, bane: lockpicks ? 0 : 1, label: 'Dyrka' }, r => {
      if (r.success) { this.openChest(it, `${lockpicks ? 'Dyrkene' : 'En hårnål'} gjør jobben.`); G.ui.logRoll(r, 'Låset gir etter.'); }
      else if (r.demon) { G.ui.logRoll(r, '<b class="c-demon">Demon!</b> Noe brekker inne i låsen. Nå må den brytes opp.'); it.forced = true; it.label = 'Bryt opp kisten (STY, bråker)'; }
      else { G.ui.logRoll(r, `Låsen holder.${lockpicks ? '' : ' Uten dyrkar er det nackdel.'}`); it.forced = true; it.label = 'Bryt opp kisten (STY, bråker)'; }
    });
  }

  openChest(it, msg) {
    const P = G.player;
    it.opened = true;
    it.label = null;
    it.mesh.userData.lid.rotation.x = -1.9;
    if (it.mesh.userData.lock) it.mesh.userData.lock.visible = false;
    G.audio.crunch();
    G.audio.coin();
    P.floorStats.chests = (P.floorStats.chests || 0) + 1;
    if (it.locked) P.floorStats.locks = (P.floorStats.locks || 0) + 1;
    this.dropSilver(it.pos.x, it.pos.z, (6 + Math.floor(Math.random() * 10) + (it.locked ? 6 : 0)) * (P.flags.has('greed') ? 2 : 1));
    this.spawnPickup('item', it.pos.x, it.pos.z, { item: makeItem(G.depth, this.lootOpts({ luck: it.locked ? 0.55 : 0.3 })) });
    if (Math.random() < (it.locked ? 0.6 : 0.35)) this.spawnPickup('potion', it.pos.x, it.pos.z);
    G.fx.burst('gold', { x: it.pos.x, y: 0.8, z: it.pos.z }, 20);
    G.ui.log(msg);
  }

  searchCaches() {
    const P = G.player;
    for (const c of this.caches) {
      if (c.searched || c.found) continue;
      const dd = Math.hypot(c.x - P.pos.x, c.z - P.pos.z);
      if (dd > 3.6) continue;
      if (c.known && dd < 2.2) { c.searched = true; G.ui.log('Her er det. Akkurat der Tobolt sa.'); this.revealCache(c); continue; }
      if (c.known) continue;
      c.searched = true;
      P.rollPush('Finna dolda ting', { important: true, label: 'Finna dolda ting' }, r => {
        if (r.success) {
          c.found = true;
          G.ui.logRoll(r, 'En løs stein i veggen. Noen har gjemt noe her.');
          this.revealCache(c);
        } else G.ui.logRoll(r, 'Noe her virker rart, men du finner ingenting.');
      });
    }
  }

  revealCache(c) {
    const g = new THREE.Group();
    const stone = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.3), new THREE.MeshStandardMaterial({ color: 0x5a524a, roughness: 0.9, emissive: 0x3a2a08, emissiveIntensity: 0.6 }));
    stone.position.y = 0.5;
    g.add(stone);
    const glint = new THREE.Sprite(new THREE.SpriteMaterial({ map: G.assets.glowTex, color: 0xffd060, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.8 }));
    glint.position.y = 0.6;
    glint.scale.set(1.2, 1.2, 1);
    g.add(glint);
    g.position.set(c.x, 0, c.z);
    this.addObj(g);
    c.mesh = g;
    c.glint = glint;
    c.found = true;
    G.interactables.push({ kind: 'cache', cache: c, mesh: g, pos: g.position, radius: 0.5, solid: false, label: 'Ta det som er gjemt' });
    G.fx.burst('gold', { x: c.x, y: 0.6, z: c.z }, 14);
    G.audio.coin();
  }

  takeCache(it) {
    const c = it.cache;
    c.taken = true;
    it.label = null;
    G.scene.remove(c.mesh);
    this.dropSilver(c.x, c.z, rollDice('2D6') + G.depth * 2);
    if (Math.random() < 0.5) this.spawnPickup('potion', c.x, c.z);
    if (Math.random() < 0.35) this.spawnPickup('item', c.x, c.z, { item: makeItem(G.depth + 1, this.lootOpts({ rarity: 'magisk' })) });
    G.ui.log('Gjemmestedet var verdt det.');
  }

  readRunes(it) {
    const P = G.player;
    if (it.read) return;
    it.read = true;
    it.label = null;
    const sk = (P.skills['Främmande språk'] || 0) >= (P.skills['Myter & legender'] || 0) ? 'Främmande språk' : 'Myter & legender';
    P.floorStats.runes = (P.floorStats.runes || 0) + 1;
    G.run.runesRead = (G.run.runesRead || 0) + 1;
    P.rollPush(sk, { important: true, label: 'Runer' }, r => {
      if (r.success) {
        G.ui.logRoll(r, 'Runene er et kart over hallene, skrevet av dvergene i Karad Batur. Gjemmesteder og trapper står merket.');
        G.dungeon.explored.fill(1);
        for (const c of this.caches) c.known = true;
        if (this.runeMat) this.runeMat.color.setHex(0x7affc0);
      } else if (r.demon) {
        G.ui.logRoll(r, '<b class="c-demon">Demon!</b> Runene er en forbannelse mot tyver.');
        P.addCond('RAD');
      } else G.ui.logRoll(r, 'Runene gir ingen mening.');
    });
  }

  // --- per bilde ---------------------------------------------------------

  update(dt, cam) {
    const P = G.player;
    const t = G.time;
    this.updateProjectiles(dt);
    for (let i = this.bolts.length - 1; i >= 0; i--) {
      const b = this.bolts[i];
      b.t += dt;
      b.mesh.material.opacity = Math.max(0, 1 - b.t / 0.22);
      if (b.t > 0.22) { G.scene.remove(b.mesh); b.mesh.geometry.dispose(); this.bolts.splice(i, 1); }
    }
    if (dt > 0 && !P.downed) this.searchCaches();
    if (this.trail) {
      const tr = this.trail;
      tr.t += dt;
      if (tr.t > tr.dur) this.trail = null;
      else for (let k = 0; k < tr.pts.length; k += 2) {
        const pt = tr.pts[k];
        if (Math.random() < dt * 3) G.fx.burst('gold', { x: pt.x + (Math.random() - 0.5), y: 0.25, z: pt.z + (Math.random() - 0.5) }, 1);
      }
    }
    let bestItem = null, bestD = 1.7;
    const magnet = P.tricks?.has('hamta') ? 10 : 3.5;
    for (let i = G.pickups.length - 1; i >= 0; i--) {
      const p = G.pickups[i];
      p.t += dt;
      if (p.vel) {
        p.vel.y -= 18 * dt;
        p.pos.addScaledVector(p.vel, dt);
        if (p.pos.y < p.base) {
          p.pos.y = p.base;
          p.vel.y *= -0.35;
          p.vel.x *= 0.55;
          p.vel.z *= 0.55;
          if (Math.abs(p.vel.y) < 0.8) p.vel = null;
        }
        tmp.set(p.pos.x, 0, p.pos.z);
        G.dungeon.collide(tmp, 0.2);
        p.pos.x = tmp.x;
        p.pos.z = tmp.z;
      } else if (p.kind !== 'thrown') {
        p.pos.y = p.base + Math.sin(t * 3 + i) * 0.04 + (p.kind === 'item' ? 0.05 : 0);
      }
      if (G.dungeon.isWater(p.pos.x, p.pos.z) && !p.vel) p.pos.y = Math.max(p.pos.y, -0.15);
      if (p.kind !== 'thrown') p.mesh.rotation.y += dt * (p.kind === 'silver' ? 3 : 1.2);
      if (p.kind === 'silver') p.mesh.rotation.z = 1.2;
      const dd = Math.hypot(P.pos.x - p.pos.x, P.pos.z - p.pos.z);
      if (P.downed) continue;
      if (p.kind === 'silver' || (magnet > 4 && (p.kind === 'bread' || p.kind === 'potion'))) {
        if (dd < magnet && p.t > 0.35) {
          const k = Math.min(1, dt * (magnet > 4 ? 6 : 12));
          p.pos.x += (P.pos.x - p.pos.x) * k;
          p.pos.z += (P.pos.z - p.pos.z) * k;
        }
      }
      if (p.kind === 'silver') {
        if (dd < 0.7 && p.t > 0.35) {
          if (P.curse.gold) {
            G.fx.float('Støv', P.pos, 'miss');
            G.fx.burst('dust', P.pos, 6);
          } else {
            P.silver += p.value;
            G.run.silver += p.value;
            P.floorStats.silver = (P.floorStats.silver || 0) + p.value;
            G.fx.float(`+${p.value} silver`, P.pos, 'silver', 1.6);
            G.audio.coin();
          }
          this.removePickup(p);
        }
      } else if (p.kind === 'bread' && dd < 1.0 && p.t > 0.3) {
        if (P.kp < P.maxKP) {
          const got = P.heal(2 + (P.mods.breadHeal || 0) + (P.tricks.has('lagamat') ? 2 : 0));
          P.floorStats.bread = (P.floorStats.bread || 0) + 1;
          G.ui.log(`Brød! +${got} KP.${P.isDuck ? ' Mester Flansen hadde ristet på hodet.' : ''}`);
          this.removePickup(p);
        }
      } else if (p.kind === 'potion' && dd < 1.0 && p.t > 0.3) {
        if (P.potions < 4) {
          P.potions++;
          G.fx.float('Legedrikk', P.pos, 'heal');
          G.audio.coin();
          this.removePickup(p);
        }
      } else if (p.kind === 'thrown' && dd < 1.0 && p.t > 0.25) {
        // kastvåpen plukkes opp av seg selv hvis du har en ledig hånd
        if (!P.equip.vapen || !P.equip.vapen2) {
          if (!P.equip.vapen) P.equip.vapen = p.item; else P.equip.vapen2 = p.item;
          P.recalc();
          P.refreshWeaponMeshes();
          G.audio.swing(2, 0.12);
          this.removePickup(p);
        }
      } else if (p.kind === 'item') {
        if (dd < bestD && !p.vel) { bestD = dd; bestItem = p; }
        if (p.label) {
          tmp.set(p.pos.x, 0.65, p.pos.z).project(cam);
          const vis = tmp.z < 1 && Math.abs(tmp.x) < 1.1 && Math.abs(tmp.y) < 1.1 && dd < 16;
          p.label.style.display = vis ? 'block' : 'none';
          if (vis) p.label.style.transform = `translate(${(tmp.x * 0.5 + 0.5) * innerWidth}px, ${(-tmp.y * 0.5 + 0.5) * innerHeight}px) translate(-50%, -100%)`;
          p.label.classList.toggle('near', p === this.nearItem);
        }
        if (p.mesh.userData.beam) p.mesh.userData.beam.material.opacity = (p.item.rarity === 'vanlig' ? 0.1 : 0.26) + Math.sin(t * 3) * 0.05;
      }
    }
    this.nearItem = bestItem;
    let bi = null, bd = 99;
    for (const it of G.interactables) {
      if (!it.label) continue;
      const dd = Math.hypot(P.pos.x - it.pos.x, P.pos.z - it.pos.z) - (it.reach ?? it.radius);
      if (dd < 1.3 && dd < bd) { bd = dd; bi = it; }
    }
    this.nearInteract = bi;
    for (const c of this.caches) if (c.glint && !c.taken) c.glint.material.opacity = 0.5 + Math.sin(t * 4) * 0.3;
    const srcs = this.sources;
    for (const s of srcs) s.d = s.enabled === false || s.intensity <= 0 ? 1e9 : (s.pos.x - P.pos.x) ** 2 + (s.pos.z - P.pos.z) ** 2;
    srcs.sort((a, b) => a.d - b.d);
    for (let i = 0; i < LIGHTS; i++) {
      const l = this.lights[i], s = srcs[i];
      if (!s || s.d > 30 * 30) { l.intensity = 0; continue; }
      l.position.copy(s.pos);
      l.color.copy(s.color);
      const fl = s.steady ? 1 : 0.82 + 0.1 * Math.sin(t * 11 + s.phase) + 0.08 * Math.sin(t * 23.7 + s.phase * 3);
      const dist = Math.sqrt(s.d);
      const fade = 1 - THREE.MathUtils.smoothstep(dist, 18, 28);
      l.intensity = s.intensity * fl * fade * (P.tricks?.has('tanda') && !s.steady ? 1.2 : 1);
      l.distance = s.dist || 15;
      if (s.ember && Math.random() < dt * 8) G.fx.ember({ x: s.pos.x, y: 1.4, z: s.pos.z });
    }
    for (const f of this.flames) {
      const k = 0.9 + 0.12 * Math.sin(t * 13 + f.phase) + 0.06 * Math.sin(t * 29 + f.phase * 2);
      f.sp.scale.set(0.42 * f.base * (2 - k), 0.75 * f.base * k, 1);
      f.glow.material.opacity = 0.35 + 0.1 * k;
    }
    if (this.stairsRing) {
      this.stairsRing.material.opacity = 0.55 + Math.sin(t * 2.5) * 0.2;
      this.stairsRing.rotation.y += dt * 0.25;
      const sp = this.stairsPos;
      if (Math.abs(sp.x - P.pos.x) + Math.abs(sp.z - P.pos.z) < 30 && Math.random() < dt * 22) G.fx.burst('portal', sp, 1);
    }
    if (this.runeMat) this.runeMat.opacity = 0.65 + Math.sin(t * 1.7) * 0.25;
    for (const f of this.anim) f(t);
    for (const m of this.shaftMats) m.uniforms.uTime.value = t;
    const sc = G.fx.add.uniforms.uScale.value;
    for (const m of this.shaftMotes) { m.material.uniforms.uTime.value = t; m.material.uniforms.uScale.value = sc; }
    for (const d0 of this.drips) if (Math.random() < dt * 1.2 && Math.abs(d0.x - P.pos.x) + Math.abs(d0.z - P.pos.z) < 24) G.fx.burst('drip', d0, 1);
    for (const f of this.flames) {
      if (f.base < 0.5) continue;
      if (Math.abs(f.pos.x - P.pos.x) + Math.abs(f.pos.z - P.pos.z) > 18) continue;
      if (Math.random() < dt * 1.4) G.fx.burst('torchsmoke', { x: f.pos.x, y: f.pos.y + 0.7 * f.base, z: f.pos.z }, 1);
      if (Math.random() < dt * 2.2) G.fx.ember({ x: f.pos.x, y: f.pos.y + 0.4, z: f.pos.z });
    }
    if (this.dad) {
      const dx = P.pos.x - (this.dad.parent.position.x), dz = P.pos.z - (this.dad.parent.position.z);
      if (dx * dx + dz * dz < 64) {
        let da = Math.atan2(dx, dz) - this.dad.rotation.y;
        while (da > Math.PI) da -= Math.PI * 2;
        while (da < -Math.PI) da += Math.PI * 2;
        this.dad.rotation.y += da * Math.min(1, dt * 3);
      }
      this.dad.position.y = Math.sin(t * 2) * 0.01;
    }
  }
}
void d;
