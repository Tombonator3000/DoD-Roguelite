// Handelsvarer og økonomi er spillets egne, ikke bokas varepriser eller kanoniske eksportlister.
export const GOODS = {
  jern: { name: 'Jernbarrer', kg: 2, value: 90, icon: 'coin', desc: 'Små barrer til smeder og verksteder.' },
  salt: { name: 'Salt', kg: 1, value: 60, icon: 'ration', desc: 'Tørt salt i en forseglet pose.' },
  ull: { name: 'Ull', kg: 1.5, value: 70, icon: 'ration', desc: 'Vasket ull, presset og bundet med hyssing.' },
  lerret: { name: 'Lerret', kg: 0.8, value: 110, icon: 'ration', desc: 'En rull vevd lerret til klær og seil.' },
  vin: { name: 'Vin', kg: 1.2, value: 100, icon: 'cup', desc: 'En liten, forseglet krukke. Drikkevarene selges som last.' },
  krydder: { name: 'Krydder', kg: 0.2, value: 160, icon: 'saffron', desc: 'Ekte krydder i en tett boks. Dette er en handelsvare.' },
};
// Valgte startmarkeder gjør en kort handelsreise mulig uten å krysse hele verden.
export const LOCAL_TRADE = {
  fristaden: { jern: 0.65, ull: 1.2, krydder: 1.6 },
  pendon: { jern: 1.55, ull: 0.6 },
  arno: { lerret: 0.6, salt: 1.55 },
  gringul: { lerret: 1.65, salt: 0.6 },
};
export function makeTradeItem(id, qty = 1, basis = 0) {
  return { ...GOODS[id], type: 'trade', tid: id, qty, basis, rarity: 'vanlig' };
}
