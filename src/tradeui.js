// Kjøp og salg i det vanlige samtalevinduet. Hvert klikk sjekker penger, last og lager på nytt.
import { G } from './state.js';
import { GOODS } from './tradedata.js';
import { HANDEL } from './dod.js';
import { PLACES } from './regionalmaps.js';
import { observeMarket, tradeQuote, trade, tradeFactor } from './trading.js';
import { carriedKg, capKg, hardCapKg } from './inventory.js';
import { canSave, saveGame } from './save.js';

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const signed = n => `${n >= 0 ? '+' : ''}${n}`;
export function renderTrading(say, qty = 1, message = '') {
  const place = G.dungeon?.L?.place || (G.dungeon?.isTown ? 'fristaden' : null);
  if (!place || !G.campaign) return;
  const P = G.player, c = G.campaign, run = G.run;
  const m = observeMarket(c, run, place);
  const el = document.querySelector('#dlg-wares');
  el.hidden = false;
  if (!m) { el.textContent = 'Dette markedet er ikke tilgjengelig.'; return; }
  say(message || 'Handelsvarer tar plass i sekken. Kjøp der det er overflod, og selg der det er etterspørsel. Jeg kjøper også last. Prisene her gjelder per pakke.');
  const day = Math.floor(run.clock / 24) + 1, nextDay = (m.week + 1) * HANDEL.weekHours / 24 + 1;
  const book = Object.entries(c.areas).filter(([id, a]) => id !== place && a.market?.observed && PLACES[id]);
  el.innerHTML = `<div class="purse"><b>Handelsvarer · ${esc(PLACES[place].name)}</b><br>Du har <b>${P.silver}</b> sm · Last ${carriedKg(P)} / ${capKg(P)} kg (høyst ${hardCapKg(P)} kg)</div>
    <label class="trade-quantity">Antall pakker <select id="trade-qty" aria-label="Antall pakker"><option value="1">1</option><option value="5">5</option><option value="10">10</option></select></label>
    <p class="trade-note">Over ${capKg(P)} kg blir du överlastad. Nytt varelager og ny etterspørsel fra dag ${nextDay}. Handelens priser og varer er spillets egne.</p>
    <div id="trade-rows"></div>
    <p class="trade-note">Tips: Jern fra Fristaden til Pendon, ull tilbake. Lerret fra Arno til Gringul, salt tilbake. Prisboka gir gamle pristilbud; passasje og proviant kommer i tillegg.</p>
    <details class="trade-book"><summary>Prisbok fra besøkte markeder (${book.length + 1})</summary><p>Dagens priser over gjelder dag ${day}. Prisene under ble sist sett på oppgitt dag, og kan ha endret seg.</p>${book.length ? book.map(([id, a]) => `<p><b>${esc(PLACES[id].name)}, dag ${Math.floor(a.market.observed.clock / 24) + 1}</b><br>${Object.entries(a.market.observed.prices).filter(([g]) => GOODS[g]).map(([g, p]) => `${esc(GOODS[g].name)}: kjøp ${p.buy}, selg ${p.sell} sm`).join(' · ')}</p>`).join('') : '<p>Besøk en annen kjøpmann for å sammenligne priser.</p>'}</details>`;
  const select = el.querySelector('#trade-qty');
  select.value = String(qty);
  select.onchange = () => renderTrading(say, +select.value);
  for (const [id, good] of Object.entries(GOODS)) {
    const prices = m.observed.prices[id], cargo = P.bag.find(e => e.type === 'trade' && e.tid === id);
    const row = document.createElement('div');
    row.className = 'ware trade-row';
    row.dataset.good = id;
    row.innerHTML = `<div class="txt"><div class="nm">${esc(good.name)} · ${good.kg} kg/pakke</div><div class="ds">${tradeFactor(place, id) < 0.85 ? 'Lokal overflod' : tradeFactor(place, id) > 1.3 ? 'Stor etterspørsel' : 'Vanlig pris'} · Lager ${m.stock[id]} · Kjøper inntil ${m.demand[id]}<br>Din last: ${cargo?.qty || 0}${cargo ? ` · Innkjøp ${Math.round((cargo.basis || 0) / cargo.qty)} sm/pakke` : ''}<br>Kjøp ${prices.buy} sm · Selg ${prices.sell} sm per pakke</div></div><div class="trade-buttons"></div>`;
    for (const side of ['buy', 'sell']) {
      const q = tradeQuote(c, P, run, place, id, side, qty), b = document.createElement('button');
      b.className = 'btn small'; b.dataset.side = side;
      b.textContent = `${side === 'buy' ? 'Kjøp' : 'Selg'} ${qty} · ${prices[side] * qty} sm`;
      b.disabled = !q.ok; b.title = q.ok ? b.textContent : q.why;
      b.onclick = () => {
        if (G.state !== 'dialog' || (G.dungeon?.L?.place || 'fristaden') !== place) return;
        const check = canSave();
        if (!check.ok) { say(check.why); return; }
        const result = trade(c, P, run, place, id, side, qty);
        if (!result.ok) { renderTrading(say, qty, result.why); return; }
        G.audio?.coin?.(); G.ui?.update?.(0);
        let text = `${side === 'buy' ? 'Kjøpt' : 'Solgt'} ${qty} pakker ${good.name.toLowerCase()} for ${result.total} sm.${side === 'sell' ? ` Resultat mot innkjøpspris: ${signed(result.profit)} sm, før reiseutgifter.` : ''}`;
        const saved = saveGame('auto', true);
        if (!saved.ok) text += ' Handelen kunne ikke lagres. Lagre spillet før du avslutter.';
        G.ui?.log(esc(text));
        renderTrading(say, qty, text);
      };
      row.querySelector('.trade-buttons').appendChild(b);
    }
    el.querySelector('#trade-rows').appendChild(row);
  }
}
