import test from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../../src/state.js';
import { newCampaign, normalizeCampaign } from '../../src/campaign.js';
import { GOODS, makeTradeItem } from '../../src/tradedata.js';
import { trade, tradeQuote, tradeMarket, tradePrices, observeMarket } from '../../src/trading.js';
import { carriedKg, removeFromBag, addToBag, sellPrice } from '../../src/inventory.js';
import { PLACES, CONNECTIONS } from '../../src/regionalmaps.js';
import { migrateSave } from '../../src/save.js';

const setup = (silver = 1000, STY = 12) => ({ c: newCampaign(), P: { silver, attrs: { STY }, bag: [], potions: 0 }, run: { clock: 12 } });
G.inv = null;

test('jern gir fortjeneste til Pendon og samme sted gir alltid tap, også med alle rabatter', () => {
  const { c, P, run } = setup();
  const bought = trade(c, P, run, 'fristaden', 'jern', 'buy', 5);
  assert.ok(bought.ok); assert.equal(P.silver, 1000 - bought.total); assert.equal(carriedKg(P), 10);
  const sold = trade(c, P, run, 'pendon', 'jern', 'sell', 5);
  assert.ok(sold.ok); assert.ok(sold.profit > 0); assert.equal(P.silver, 1000 + sold.profit); assert.equal(P.bag.length, 0);
  for (const place of Object.keys(PLACES).filter(id => ['by', 'fristaden'].includes(PLACES[id].kind))) {
    for (const id of Object.keys(GOODS)) {
      for (const trust of [-2, 0, 2]) {
        c.factions[place + '_havn'] = trust;
        const price = tradePrices(c, { rykte: 4, guild: true }, place, id);
        assert.ok(price.buy > price.sell && price.sell > 0, place + ' ' + id);
      }
    }
  }
});

test('lerret tåler fire døgns passasjeutgift, salt kan tas tilbake', () => {
  const { c, P, run } = setup();
  const route = CONNECTIONS.find(r => r.a === 'arno' && r.b === 'gringul');
  assert.equal(route.hours, 96);
  assert.ok(trade(c, P, run, 'arno', 'lerret', 'buy', 5).ok);
  run.clock += route.hours; P.silver -= route.fare;
  const sold = trade(c, P, run, 'gringul', 'lerret', 'sell', 5);
  assert.ok(sold.ok); assert.ok(P.silver > 1000); assert.ok(sold.profit > route.fare);
  assert.ok(tradePrices(c, run, 'arno', 'salt').sell > tradePrices(c, run, 'gringul', 'salt').buy);
});

test('avviste antall, tom pung, full sekk, tomt lager og etterspørsel gir ingen deltransaksjon', () => {
  const { c, P, run } = setup();
  tradeMarket(c, 'arno', run.clock);
  for (const qty of [0, -1, 1.5, NaN, Infinity, '5', 101]) {
    const before = JSON.stringify({ c, P });
    assert.equal(trade(c, P, run, 'arno', 'salt', 'buy', qty).ok, false);
    assert.equal(JSON.stringify({ c, P }), before);
  }
  for (const [money, sty, stock] of [[0, 12, 12], [1000, 0, 12], [1000, 12, 0]]) {
    P.silver = money; P.attrs.STY = sty; c.areas.arno.market.stock.salt = stock;
    const before = JSON.stringify({ c, P });
    assert.equal(trade(c, P, run, 'arno', 'salt', 'buy', 1).ok, false);
    assert.equal(JSON.stringify({ c, P }), before);
  }
  P.silver = 1000; P.attrs.STY = 12; P.bag = [makeTradeItem('salt', 5, 100)];
  c.areas.arno.market.demand.salt = 0;
  const before = JSON.stringify({ c, P });
  assert.equal(trade(c, P, run, 'arno', 'salt', 'sell', 1).ok, false);
  assert.equal(JSON.stringify({ c, P }), before);
  assert.equal(trade(c, P, run, 'arno', 'salt', 'sell', 6).ok, false);
  assert.equal(tradeQuote(c, P, run, 'arno', 'constructor', 'buy', 1).ok, false);
});

test('lager og innkjøpspris følger med gjennom gjenbesøk, normalisering og samme lagringsøyeblikk', () => {
  const { c, P, run } = setup();
  assert.ok(trade(c, P, run, 'arno', 'lerret', 'buy', 5).ok);
  const stock = c.areas.arno.market.stock.lerret, silver = P.silver;
  assert.equal(tradeMarket(c, 'arno', 13).stock.lerret, stock);
  const save = migrateSave({ v: 3, rules: 'dod91', campaign: c, run, player: P, pos: {} });
  assert.equal(save.campaign.areas.arno.market.stock.lerret, stock);
  assert.equal(save.player.bag[0].basis, 1000 - silver);
  assert.equal(save.player.silver, silver);
  trade(c, P, run, 'arno', 'lerret', 'buy', 5);
  assert.equal(save.campaign.areas.arno.market.stock.lerret, stock);
  assert.equal(save.player.silver, silver);
  assert.equal(normalizeCampaign(c).areas.arno.market.stock.lerret, stock - 5);
});

test('ukentlig påfyll krever spilltid og prisboka beholder sist observerte pris', () => {
  const { c, P, run } = setup();
  trade(c, P, run, 'arno', 'salt', 'buy', 1);
  const stock = c.areas.arno.market.stock.salt;
  assert.equal(tradeMarket(c, 'arno', 167.99).stock.salt, stock);
  const seen = JSON.stringify(c.areas.arno.market.observed);
  assert.ok(tradeMarket(c, 'arno', 168).stock.salt > stock);
  assert.equal(JSON.stringify(c.areas.arno.market.observed), seen);
  assert.equal(tradeMarket(c, 'arno', 12).week, 1);
  observeMarket(c, { clock: 180 }, 'arno');
  assert.equal(c.areas.arno.market.observed.clock, 180);
  c.areas.arno.market.v = 99;
  assert.equal(tradeMarket(c, 'arno', 400), null);
  assert.equal(c.areas.arno.market.v, 99);
});

test('delte og sammenslåtte pakker bevarer innkjøp, og andre butikker omgår ikke markedet', () => {
  const { c, P, run } = setup();
  addToBag(P, makeTradeItem('salt', 5, 101), true);
  const part = removeFromBag(P, P.bag[0], 2);
  assert.equal(part.basis, 40); assert.equal(P.bag[0].basis, 61);
  addToBag(P, part, true);
  assert.equal(P.bag[0].qty, 5); assert.equal(P.bag[0].basis, 101);
  const sold = trade(c, P, run, 'arno', 'salt', 'sell', 2);
  assert.equal(sold.profit, sold.total - 40); assert.equal(P.bag[0].basis, 61);
  assert.equal(sellPrice(P.bag[0], 'nansen'), 0);
  const emptyRun = setup();
  assert.equal(emptyRun.P.bag.length, 0);
  assert.equal(trade(emptyRun.c, emptyRun.P, emptyRun.run, 'arno', 'salt', 'sell', 1).ok, false);
});
