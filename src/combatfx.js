import { FX } from './fx.js';
import { G } from './state.js';
import { CombatFXPool } from './combatfx-pool.js';

// Eget lag over Claudes FX. Beholder samme grensesnitt og alle grunneffekter.
export class CombatFX extends FX {
  constructor(scene) {
    super(scene);
    this.combat = new CombatFXPool(scene);
  }

  get detail() {
    const q = G.game?.settings?.quality;
    return q === 'lav' ? 0.45 : q === 'middels' ? 0.7 : 1;
  }

  impact(p, color = 0xffffff, size = 1.2, y = 1.0) {
    super.impact(p, color, size, y);
    const count = Math.ceil((size > 2 ? 9 : 5) * this.detail);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 2.5;
      this.combat.glow.spawn(0, { x: p.x, y, z: p.z }, color, {
        vx: Math.cos(a) * speed, vy: 0.5 + Math.random() * 1.8, vz: Math.sin(a) * speed,
        life: 0.18 + Math.random() * 0.16, start: 0.28, end: 0.10, aspect: 0.45,
        angle: a, gravity: 5, drag: 3,
      });
    }
  }

  burst(kind, p, n = 12, dir = null) {
    super.burst(kind, p, n, dir);
    // Enkeltpartikler fra fakler, gift og trapper skal ikke skape nye ringeffekter.
    if (n < 4) return;
    if (kind === 'feather' || kind === 'bone' || kind === 'wood') {
      const feather = kind === 'feather';
      const count = Math.min(18, Math.ceil(n * 0.65 * this.detail));
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const speed = 1.2 + Math.random() * 2.4;
        const color = feather ? (Math.random() < 0.3 ? 0x39312b : 0xe5ddc7) : kind === 'bone' ? 0xc7b78f : 0x997344;
        this.combat.debris.spawn(feather ? 4 : 5, { x: p.x, y: p.y ?? 0.8, z: p.z }, color, {
          vx: Math.cos(a) * speed + (dir?.x ?? 0) * 2,
          vz: Math.sin(a) * speed + (dir?.z ?? 0) * 2,
          vy: 1.3 + Math.random() * 2, gravity: feather ? 2.8 : 10,
          drag: feather ? 1.6 : 0.8, life: feather ? 1.4 : 0.8,
          start: feather ? 0.28 : 0.18, end: feather ? 0.22 : 0.12,
          aspect: feather ? 0.45 : 0.7, angle: a, spin: (Math.random() - 0.5) * 7,
          alpha: 0.85,
        });
      }
    } else if (kind === 'heal' || kind === 'will' || kind === 'portal') {
      const color = kind === 'heal' ? 0x66d99f : kind === 'will' ? 0x93aaff : 0x7bbff0;
      this.combat.glow.spawn(2, { x: p.x, y: 0.07, z: p.z }, color, {
        life: 0.7, start: 1.2, end: 2.3, alpha: 0.65,
      });
    } else if (kind === 'spark' || kind === 'gold') {
      const color = kind === 'gold' ? 0xf4c36e : 0xffc57b;
      for (let i = 0; i < Math.min(8, Math.ceil(n * 0.4 * this.detail)); i++) {
        const a = Math.random() * Math.PI * 2;
        this.combat.glow.spawn(0, { x: p.x, y: p.y ?? 0.9, z: p.z }, color, {
          vx: Math.cos(a) * 2, vy: 1 + Math.random(), vz: Math.sin(a) * 2,
          life: 0.3, start: 0.32, end: 0.08, aspect: 0.4, angle: a, gravity: 6,
        });
      }
    }
  }

  ring(p, r, color = 0xffd080, dur = 0.35, y = 0.2) {
    this.combat.glow.spawn(1, { x: p.x, y, z: p.z }, color, {
      life: Math.max(0.06, dur), start: r * 0.75, end: r * 2.5, alpha: 0.75,
    });
  }

  slash(origin, yaw, range, arc, dir, color = 0xfff0c0, y = 0.9, dur = 0.16) {
    this.combat.glow.spawn(6, { x: origin.x, y, z: origin.z }, color, {
      life: dur * 1.25, start: range * 2, end: range * 2,
      angle: yaw, seed: arc * (dir < 0 ? -1 : 1), alpha: 0.9,
    });
  }

  update(dt, camera) {
    super.update(dt, camera);
    this.combat.update(dt, camera);
  }

  clearLevel() {
    super.clearLevel();
    this.combat.clear();
    // Grunnlaget lar hugg og ringer leve til neste update. Et niv�bytte skal
    // rydde dem n�, ogs� n�r spillet st�r i meny eller pause.
    for (const s of this.slashes) {
      this.scene.remove(s.grp); s.geom.dispose(); s.mtl.dispose();
    }
    this.slashes.length = 0;
    for (const r of this.rings) {
      this.scene.remove(r.mesh); r.geom.dispose(); r.mtl.dispose();
    }
    this.rings.length = 0;
    this.add.geo.setDrawRange(0, 0);
    this.norm.geo.setDrawRange(0, 0);
    this.shake = 0;
  }
}
