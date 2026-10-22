// Markedet følger verden, mens last og silver følger samme løp og lagringsøyeblikk.
import { GOODS, LOCAL_TRADE, makeTradeItem } from './tradedata.js';
import { HANDEL } from './dod.js';
import { PLACES } from './regionalmaps.js';
import { campaignArea } from './campaign.js';
import { addToBag, removeFromBag, canCarry } from './inventory.js';

const ids = Object.keys(GOODS);
const hash = s => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 17);
export function tradeFactor(place, id) {
  if (LOCAL_TRADE[place]?.[id]) return LOCAL_TRADE[place][id];
  const region = PLACES[place]?.map || 'aidne', h = hash(region);
  const i = ids.indexOf(id), variation = (hash(place + id) % 11 - 5) / 100;
  return (i === h % ids.length ? 0.65 : i === (h + 2) % ids.length ? 1.6 : 1) + variation;
}
export function tradePrices(c, run, place, id) {
  const base = GOODS[id].value * tradeFactor(place, id);
  const trust = c.factions[place + '_havn'] || 0, ry = run.rykte || 0;
  const mod = (trust > 0 ? 0.95 : trust < 0 ? 1.1 : 1) * (run.guild ? 0.95 : 1) * (ry >= 3 ? 0.97 : ry <= -2 ? 1.15 : 1);
  const buy = Math.max(2, Math.ceil(base * HANDEL.buyMarkup * mod));
  const sell = Math.max(1, Math.min(buy - 1, Math.floor(base * HANDEL.sellMargin * (trust > 0 ? 1.03 : trust < 0 ? 0.95 : 1))));
  return { buy, sell };
}
export function tradeMarket(c, place, clock) {
  if (!PLACES[place] || !['by', 'fristaden'].includes(PLACES[place].kind) || !Number.isFinite(clock) || clock < 0) return null;
  const a = campaignArea(c, place), week = Math.floor(clock / HANDEL.weekHours);
  let m = a.market;
  if (m && m.v !== 1) return null;
  if (!m || week > m.week) {
    m = a.market = { v: 1, week, stock: {}, demand: {}, observed: m?.observed || null };
    for (const id of ids) {
      m.stock[id] = tradeFactor(place, id) < 0.85 ? HANDEL.stock * 2 : HANDEL.stock;
      m.demand[id] = HANDEL.demand;
    }
  }
  return m;
}
export function observeMarket(c, run, place) {
  const m = tradeMarket(c, place, run.clock);
  if (m) m.observed = { clock: run.clock, prices: Object.fromEntries(ids.map(id => [id, tradePrices(c, run, place, id)])) };
  return m;
}
export function tradeQuote(c, P, run, place, id, side, qty) {
  const fail = why => ({ ok: false, why });
  if (!Object.hasOwn(GOODS, id) || !['buy', 'sell'].includes(side) || !Number.isSafeInteger(qty) || qty < 1 || qty > 100) return fail('Velg et helt antall mellom 1 og 100.');
  const m = tradeMarket(c, place, run.clock);
  if (!m) return fail('Dette markedet er ikke tilgjengelig.');
  const item = P.bag.find(e => e.type === 'trade' && e.tid === id), prices = tradePrices(c, run, place, id);
  const total = prices[side] * qty;
  if (side === 'buy') {
    if (m.stock[id] < qty) return fail('Kjøpmannen har ikke så mange igjen.');
    if (P.silver < total) return fail('Du har ikke nok silver.');
    if (!canCarry(P, makeTradeItem(id, qty))) return fail('Lasten blir for tung. Frigjør plass i sekken.');
  } else {
    if (!item || item.qty < qty) return fail('Du har ikke så mange å selge.');
    if (m.demand[id] < qty) return fail('Kjøpmannen trenger ikke så mange nå.');
  }
  return { ok: true, total, item, prices, market: m };
}
export function trade(c, P, run, place, id, side, qty) {
  const q = tradeQuote(c, P, run, place, id, side, qty);
  if (!q.ok) return q;
  let basis = 0;
  if (side === 'buy') {
    if (!addToBag(P, makeTradeItem(id, qty, q.total), true)) return { ok: false, why: 'Lasten blir for tung.' };
    P.silver -= q.total;
    q.market.stock[id] -= qty;
  } else {
    basis = Math.round((q.item.basis || 0) * qty / q.item.qty);
    removeFromBag(P, q.item, qty);
    P.silver += q.total;
    q.market.stock[id] += qty;
    q.market.demand[id] -= qty;
  }
  observeMarket(c, run, place);
  return { ok: true, total: q.total, profit: side === 'sell' ? q.total - basis : null };
}
