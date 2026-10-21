// En fast oppdragsgjenstand med varig objekt-ID, uavhengig av besøk og kloakkløp.
import { G, T } from './state.js';
import { buildChest } from './assets.js';
import { campaignArea } from './campaign.js';
import { performQuest } from './campaign-runtime.js';

export function setupHarbor(life) {
  if (life.L.place !== 'arno' || !G.campaign) return;
  const mesh = buildChest(), x = 23.0 * T, z = 21.2 * T;
  mesh.position.set(x, 0, z);
  life.area.group.add(mesh);
  life.area.addBlock(x - 0.5, z - 0.4, x + 0.5, z + 0.4);
  const it = life.add(x, z, 0.6, 'Hent havnelisten fra Ragnas kiste', () => {
    if (campaignArea(G.campaign, 'arno').objects.havnekiste === 'tom') { G.ui.log('Kisten er tom. Listen er allerede hentet. Se journalen.'); return; }
    const result = performQuest('havnelisten', 'hent', null, 'havnekiste');
    if (!result.ok) G.ui.log(result.why);
    update();
  }, { kind: 'quest', reach: 1.6 });
  function update() {
    const empty = campaignArea(G.campaign, 'arno').objects.havnekiste === 'tom';
    if (mesh.userData.lid) mesh.userData.lid.rotation.x = empty ? -1.9 : 0;
    if (mesh.userData.lock) mesh.userData.lock.visible = !empty;
    it.label = empty ? 'Ragnas havnekiste (tom)' : 'Hent havnelisten fra Ragnas kiste';
  }
  update();
}
