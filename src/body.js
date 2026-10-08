// Kroppen med träffområden (Bok I s. 24, Bok II s. 18-19). Brukes av spilleren og humanoide fiender.
// Skade trekkes fra kroppsdelen og fra totala KP. Läkning (HELA, drikker, hvile) går til totala KP
// og fordeles på de skadde kroppsdelene, de viktigste først (Bok II s. 18).
import { LOCS, locKP } from './dod.js';

export const ARMS = ['harm', 'varm'];
export const LEGS = ['hben', 'vben'];
export const VITAL = ['huvud', 'brost', 'mage'];

export function makeBody(total) {
  const locMax = locKP(total);
  return { kp: total, max: total, loc: { ...locMax }, locMax, bleeding: new Set(), lame: new Set() };
}

// Ny maks (for eksempel når FYS endrer seg): tapte KP blir med over
export function resizeBody(b, total) {
  const lost = b.max - b.kp;
  const lostLoc = {};
  for (const l of LOCS) lostLoc[l] = b.locMax[l] - b.loc[l];
  b.max = total;
  b.locMax = locKP(total);
  b.kp = total - lost;
  for (const l of LOCS) b.loc[l] = b.locMax[l] - lostLoc[l];
}

// n er skaden etter rustning. Gir tilbake hva som skjedde med kroppsdelen.
export function hurt(b, loc, n) {
  if (!loc) { b.kp -= n; return { loc: null, n }; }
  const before = b.loc[loc];
  b.loc[loc] -= n;
  b.kp -= n;
  const after = b.loc[loc];
  const lim = -b.locMax[loc];
  return { loc, n, before, after, zero: before > 0 && after <= 0, critical: before > lim && after <= lim };
}

// Hvor mange KP kroppsdelene har mistet (høyst maks per kroppsdel). -2 på CL per KP (Bok II s. 19).
export function lostKP(b, locs) {
  let n = 0;
  for (const l of locs) n += Math.min(b.locMax[l], Math.max(0, b.locMax[l] - b.loc[l]));
  return n;
}

export const usable = (b, l) => b.loc[l] > 0 && !b.lame.has(l);
export const legHalf = b => LEGS.some(l => b.loc[l] <= b.locMax[l] / 2);
export const kneeling = b => LEGS.some(l => !usable(b, l));
export const fallen = b => b.loc.brost <= 0 || b.loc.mage <= 0;

const PRIO = { huvud: 0, brost: 1, mage: 2, harm: 3, varm: 3, hben: 4, vben: 4 };
export function healBody(b, n) {
  if (n <= 0) return 0;
  const got = Math.max(0, Math.min(n, b.max - b.kp));
  b.kp += got;
  let left = n;
  const order = LOCS.filter(l => b.loc[l] < b.locMax[l]).sort((x, y) => (b.loc[x] <= 0) === (b.loc[y] <= 0) ? PRIO[x] - PRIO[y] : b.loc[x] <= 0 ? -1 : 1);
  for (const l of order) {
    if (left <= 0) break;
    const g = Math.min(left, b.locMax[l] - b.loc[l]);
    b.loc[l] += g;
    left -= g;
    if (b.loc[l] > 0) b.bleeding.delete(l);
  }
  // når alle kroppsdelene er hele, er totala KP også det
  if (LOCS.every(l => b.loc[l] >= b.locMax[l])) b.kp = b.max;
  return got;
}

export function healFull(b) {
  b.kp = b.max;
  for (const l of LOCS) b.loc[l] = b.locMax[l];
  b.bleeding.clear();
}
