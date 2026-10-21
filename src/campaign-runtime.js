// Kobler det rene verdens-/oppdragsformatet til spillet og dagens journal.
import { G } from './state.js';
import { captureCampaign, writeCampaign } from './campaign.js';
import { expireQuests, questAction, questEntries } from './quests.js';
import { QUESTS } from './questdata.js';
import { canSave, saveGame } from './save.js';
import { formatDuration } from './journeytime.js';

let warned = false;
export function checkpointCampaign() {
  if (!G.campaign || !G.run) return true;
  captureCampaign(G.campaign, G.run);
  const ok = writeCampaign(G.campaign);
  if (!ok && !warned) { warned = true; G.ui?.log('Verdensminnet kunne ikke lagres. Lagre spillet på en plass før du avslutter.'); }
  if (ok) warned = false;
  return ok;
}

export function tickCampaign() {
  if (!G.campaign || !G.run) return;
  const failed = expireQuests(G.campaign, G.run.clock);
  if (failed.length) {
    for (const id of failed) G.ui?.log(`<b class="c-demon">Fristen er ute:</b> ${QUESTS[id].title}. Se journalen.`);
    checkpointCampaign();
  }
}

export function performQuest(id, action, actor, object) {
  if (!G.campaign) return { ok: false, why: 'Start et spill først.' };
  tickCampaign();
  const result = questAction(G.campaign, id, action, {
    clock: G.run.clock, place: G.dungeon?.L?.place || 'fristaden', actor, object,
  });
  if (!result.ok) return result;
  if (result.silver) {
    G.player.silver += result.silver;
    G.run.silver = (G.run.silver || 0) + result.silver;
    G.audio?.coin?.();
  } else G.audio?.menuSelect?.();
  const message = (result.message || QUESTS[id].title).replace('{silver}', String(result.silver));
  G.ui?.log(message);
  // Oppdrag og penger går i samme lagrede øyeblikk. Lasting erstatter også verdensminnet.
  if (canSave().ok) {
    const saved = saveGame('auto', true);
    if (!saved.ok) G.ui?.log('Endringen er ikke lagret. Lagre spillet før du avslutter.');
  } else checkpointCampaign();
  return { ...result, message };
}

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export function campaignJournalHTML() {
  if (!G.campaign) return '';
  const rows = questEntries(G.campaign, G.run.clock);
  const memories = Object.entries(G.campaign.factions).filter(([, n]) => n !== 0).map(([id, n]) => `${id === 'arno_havn' ? 'Havna i Arno' : id === 'gringul_havn' ? 'Havna i Gringul' : esc(id)}: ${n > 0 ? '+' : ''}${n}`);
  return `<div id="campaign-journal"><h3>Verden som varer</h3><p class="qrow">Oppdrag, folk, utforsking og klokke huskes for denne rollpersonen når du starter et nytt kloakkløp. Silver og utstyr følger løpet. Lasting henter verden slik den var da spillet ble lagret.</p>${memories.length ? `<p class="qrow">${memories.join(' · ')}</p>` : ''}${rows.map(q => `<div class="qrow ${q.state}"><b>${q.state === 'done' ? 'Fullført: ' : q.state === 'failed' ? 'Fristen ute: ' : ''}${esc(q.title)}</b><p>${esc(q.text)}</p>${q.hours != null ? `<p>Igjen: ${formatDuration(q.hours)}. ${esc(q.note)}</p>` : ''}${q.item ? `<p>Oppdragsgjenstand: ${esc(q.item)}.</p>` : ''}${q.actions.map(a => `<button class="btn small" data-quest="${esc(q.id)}" data-quest-action="${esc(a.id)}">${esc(a.label)}</button>`).join('')}</div>`).join('')}</div>`;
}

export function bindCampaignJournal() {
  document.querySelectorAll('[data-quest-action]').forEach(b => b.addEventListener('click', () => {
    performQuest(b.dataset.quest, b.dataset.questAction);
    const el = document.getElementById('campaign-journal');
    if (el) { el.outerHTML = campaignJournalHTML(); bindCampaignJournal(); }
  }));
}
