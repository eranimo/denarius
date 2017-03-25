// fuck flow
/* eslint-disable */
import { NewTrader } from '../src/simulation/trader';
import Market from '../src/simulation/market';
import { Bank } from '../src/simulation/bank';
import type { Good } from '../src/simulation/goods';
import * as GOODS from '../src/simulation/goods';
import { GOODS as ALL_GOODS } from '../src/simulation/goods';


describe('PriceBelief', () => {
  const market: Market = new Market();
  const bank: Bank = new Bank(100);

  let t1: NewTrader;
  let t2: NewTrader;
  let t3: NewTrader;

  beforeEach(() => {
    t1 = new NewTrader(market);
    t2 = new NewTrader(market);
    t3 = new NewTrader(market);

    bank.createAccount(t1, 100);
    bank.createAccount(t2, 100);
    bank.createAccount(t3, 100);
  });

  test('starting price for all goods', () => {
    for (const good: Good of ALL_GOODS) {
      expect(t1.priceBelief.meanPriceFor(good)).toBe(1);
    }
  });

  test('trader successful sell below public price', () => {
    t1.setDesire(GOODS.wood, 10);
    t1.inventory.add(GOODS.wood, 5);

    const FAKE_PUBLIC_MEAN = 2.5;
    const SOLD_FOR = 1.20;
    let myMeanPrice = t1.priceBelief.meanPriceFor(GOODS.wood);

    t1.priceBelief.market = {
      meanPrice(good): number {
        if (good == GOODS.wood) {
          return FAKE_PUBLIC_MEAN;
        }
        return 1;
      }
    };

    t1.priceBelief.update(GOODS.wood, 'sell', true, 1.20);

    const woodPriceBelief = t1.priceBelief.prices.get(GOODS.wood);
    let deltaToMean = myMeanPrice - FAKE_PUBLIC_MEAN;
    let currentLow = 0.5;
    let currentHigh = 1.5;
    currentLow -= deltaToMean / 2;
    currentHigh -= deltaToMean / 2;

    currentLow += 0.05 * myMeanPrice;
    currentHigh -= 0.05 * myMeanPrice;
    expect(woodPriceBelief.low).toBe(currentLow);
    expect(woodPriceBelief.high).toBe(currentHigh);
    console.log(woodPriceBelief);
  });

  test('trader failed trade, public price higher than own price', () => {

  });

});
