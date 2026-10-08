// Lagrede spill: en autolagring og tre plasser i localStorage (svartnebb.saves.v1).
// Nivået bygges på nytt fra frøet, så bare det som har endret seg lagres (World.serializeLevel).
import { G } from './state.js';
import { FLOORS } from './dungeon.js';

const KEY = 'svartnebb.saves.v1';
export const SAVE_VERSION = 1;
export const SAVE_RULES = 'dod2023';
export const SLOTS = ['auto', '1', '2', '3'];
export const SLOT_NAME = { auto: 'Autolagring', 1: 'Plass 1', 2: 'Plass 2', 3: 'Plass 3' };

function readAll() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; }
}
function writeAll(all) {
  try { localStorage.setItem(KEY, JSON.stringify(all)); return true; } catch (e) {
    // for lite plass: dropp bildene og prøv igjen
    try { for (const k in all) if (all[k]) delete all[k].thumb; localStorage.setItem(KEY, JSON.stringify(all)); return true; } catch (e2) { return false; }
  }
}

export function listSaves() {
  const all = readAll();
  return SLOTS.map(slot => ({ slot, data: all[slot] || null }));
}
export function latestSave() {
  const s = listSaves().filter(x => x.data && x.data.v === SAVE_VERSION && x.data.rules === SAVE_RULES);
  s.sort((a, b) => b.data.at - a.data.at);
  return s[0] || null;
}
export function deleteSave(slot) {
  const all = readAll();
  delete all[slot];
  writeAll(all);
}

// Kan du lagre nå? Ikke midt i en kamp, ikke når du ligger nede.
export function canSave() {
  const P = G.player;
  if (!G.dungeon || !P || P.dead) return { ok: false, why: 'Det er ikke noe løp å lagre.' };
  if (P.downed || P.dying) return { ok: false, why: 'Ikke mens du ligger nede.' };
  if (G.state === 'deathroll') return { ok: false, why: 'Ikke nå.' };
  const fight = G.enemies.some(e => !e.dead && e.alerted && Math.hypot(e.pos.x - P.pos.x, e.pos.z - P.pos.z) < 16);
  if (fight) return { ok: false, why: 'Ikke midt i en kamp. Kom deg unna først.' };
  return { ok: true };
}

function thumb() {
  try {
    G.composer.render();
    const src = G.renderer.domElement;
    const c = document.createElement('canvas');
    c.width = 224; c.height = 126;
    const ctx = c.getContext('2d');
    const sw = src.width, sh = src.height, r = Math.max(c.width / sw, c.height / sh);
    const w = sw * r, h = sh * r;
    ctx.drawImage(src, (c.width - w) / 2, (c.height - h) / 2, w, h);
    return c.toDataURL('image/jpeg', 0.62);
  } catch (e) { return null; }
}

export function buildSave() {
  const P = G.player, run = G.run;
  const town = !!G.dungeon.isTown;
  return {
    v: SAVE_VERSION,
    rules: SAVE_RULES,
    at: Date.now(),
    meta: {
      name: P.name, kin: P.sheet.kin, prof: P.sheet.profession, nebb: P.isNebb,
      depth: G.depth, place: town ? 'Fristaden' : FLOORS[G.depth]?.name || '', clock: run.clock,
      kp: P.kp, maxKP: P.maxKP, silver: P.silver, time: Math.round((performance.now() - (run.t0 || 0)) / 1000) + (run.elapsedBefore || 0),
    },
    run: { ...run, known: [...(run.known || [])], t0: undefined, elapsedBefore: Math.round((performance.now() - (run.t0 || 0)) / 1000) + (run.elapsedBefore || 0) },
    depth: G.depth,
    seed: G.dungeon.seed ?? 1,
    player: P.serialize(),
    level: town ? null : G.world.serializeLevel(),
    pos: { x: +P.pos.x.toFixed(2), z: +P.pos.z.toFixed(2), yaw: +P.yaw.toFixed(3) },
    companion: !!G.companion,
  };
}

export function saveGame(slot, quiet = false) {
  const chk = canSave();
  if (!chk.ok && slot !== 'auto') return { ok: false, why: chk.why };
  const data = buildSave();
  data.thumb = thumb();
  const all = readAll();
  all[slot] = data;
  const ok = writeAll(all);
  if (!quiet) G.ui.log(ok ? `Spillet er lagret (${SLOT_NAME[slot]}).` : 'Klarte ikke å lagre. Nettleseren har ikke plass.');
  return { ok, why: ok ? '' : 'Nettleseren har ikke plass.' };
}

export function readSave(slot) {
  const d = readAll()[slot];
  if (!d) return { ok: false, why: 'Plassen er tom.' };
  if (d.v !== SAVE_VERSION || d.rules !== SAVE_RULES) return { ok: false, why: 'Lagret med en eldre versjon av spillet, og kan ikke lastes.' };
  return { ok: true, data: d };
}

// Tekst for lista
export function describe(d) {
  if (!d) return { title: 'Tom plass', sub: '' };
  const m = d.meta || {};
  const h = ((m.clock % 24) + 24) % 24, day = Math.floor(m.clock / 24) + 1;
  const time = `dag ${day}, kl. ${String(Math.floor(h)).padStart(2, '0')}.${String(Math.floor((h % 1) * 60)).padStart(2, '0')}`;
  const play = m.time ? `${Math.floor(m.time / 3600) ? Math.floor(m.time / 3600) + ' t ' : ''}${Math.floor((m.time % 3600) / 60)} min spilt` : '';
  const when = new Date(d.at).toLocaleString('nb-NO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const old = d.v !== SAVE_VERSION || d.rules !== SAVE_RULES;
  return {
    title: `${m.name || 'Ukjent'}${m.depth ? `, nivå ${m.depth}` : ''}`,
    place: m.place || '',
    sub: [time, `${m.kp}/${m.maxKP} KP`, `${m.silver} silver`, play].filter(Boolean).join(' · '),
    when,
    old,
  };
}
