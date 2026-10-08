window.goto = (tx, ty, sec = 1.5) => { const P = G.player; P.pos.set(tx * 2, 0, ty * 2); P.vel.set(0,0,0); const e = window.sim(sec); G.game.camTarget.set(P.pos.x, 0.6, P.pos.z); return e || [P.pos.x / 2, P.pos.z / 2].map(v => v.toFixed(2)).join(','); };
window.setHour = h => { G.run.clock = Math.floor(G.run.clock / 24) * 24 + h; G.dungeon.life.snapAll(); return window.sim(0.5); };
window.npc = id => G.dungeon.life.npcs.find(n => n.id === id);
window.talk = id => { const n = window.npc(id); const P = G.player; P.pos.set(n.pos.x + 1.2, 0, n.pos.z + 1.2); G.game.camTarget.set(P.pos.x, 0.6, P.pos.z); G.dungeon.life.talkTo(n); return [G.state, document.querySelector('#dlg-who').textContent, document.querySelector('#dlg-text').textContent.slice(0, 120)]; };
window.ask = w => { G.talk.ask(w, true); return document.querySelector('#dlg-text').textContent.slice(0, 160); };
window.kws = () => [...document.querySelectorAll('#dlg-kw .kw')].map(b => b.textContent).join(' ');
