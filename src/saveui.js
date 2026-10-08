// Lagre og laste: lista med plasser, brukt både fra pausemenyen og fra tittelskjermen.
import { G } from './state.js';
import { listSaves, saveGame, deleteSave, describe, canSave, SLOT_NAME } from './save.js';

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export class SaveUI {
  // el: beholderen lista tegnes i. mode: 'save' eller 'load'. onLoad(slot) laster.
  render(el, mode, o = {}) {
    this.el = el;
    this.mode = mode;
    this.o = o;
    const chk = mode === 'save' ? canSave() : { ok: true };
    const rows = listSaves().map(({ slot, data }) => {
      const d = describe(data);
      const canWrite = mode === 'save' && slot !== 'auto' && chk.ok;
      const canRead = mode === 'load' && data && !d.old;
      const thumb = data?.thumb ? `style="background-image:url(${data.thumb})"` : '';
      return `<div class="srow ${data ? '' : 'empty'} ${d.old ? 'old' : ''}" data-slot="${slot}">
        <div class="sthumb ${data?.thumb ? 'has' : ''}" ${thumb}><span>${slot === 'auto' ? 'A' : slot}</span></div>
        <div class="stxt"><div class="sname">${esc(SLOT_NAME[slot])}${data ? ` <em>${esc(d.when)}</em>` : ''}</div>
          ${data ? `<div class="stitle">${esc(d.title)}${d.place ? ` <span>${esc(d.place)}</span>` : ''}</div><div class="ssub">${esc(d.sub)}</div>` : `<div class="ssub">${slot === 'auto' ? 'Lagres av seg selv når du går ned luka eller til et nytt nivå.' : 'Tom plass'}</div>`}
          ${d.old ? '<div class="ssub bad">Lagret med en eldre versjon. Kan ikke lastes.</div>' : ''}</div>
        <div class="sacts">
          ${canWrite ? `<button class="btn small ${data ? '' : 'primary'}" data-do="save">${data ? 'Skriv over' : 'Lagre her'}</button>` : ''}
          ${canRead ? '<button class="btn small primary" data-do="load">Last</button>' : ''}
          ${data && slot !== 'auto' ? '<button class="btn small ghost" data-do="del">Slett</button>' : ''}
        </div></div>`;
    }).join('');
    el.innerHTML = `${mode === 'save' && !chk.ok ? `<div class="snote bad">${esc(chk.why)}</div>` : ''}<div class="slist">${rows}</div><div class="snote" id="save-msg"></div>`;
    el.querySelectorAll('[data-do]').forEach(b => {
      b.onclick = () => {
        const slot = b.closest('[data-slot]').dataset.slot;
        const act = b.dataset.do;
        G.audio.menuSelect?.();
        if (act === 'save') {
          if (b.dataset.sure !== '1' && listSaves().find(s => s.slot === slot)?.data) { b.dataset.sure = '1'; b.textContent = 'Sikker?'; return; }
          const r = saveGame(slot);
          this.render(el, mode, o);
          this.msg(r.ok ? `Lagret på ${SLOT_NAME[slot].toLowerCase()}.` : r.why);
        } else if (act === 'load') {
          o.onLoad?.(slot);
        } else if (act === 'del') {
          if (b.dataset.sure !== '1') { b.dataset.sure = '1'; b.textContent = 'Sikker?'; return; }
          deleteSave(slot);
          this.render(el, mode, o);
          this.msg('Slettet.');
        }
      };
    });
  }

  msg(t) {
    const m = this.el?.querySelector('#save-msg');
    if (m) m.textContent = t;
  }
}
