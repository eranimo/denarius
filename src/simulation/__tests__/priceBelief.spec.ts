// fuck flow
/* eslint-disable */
import Trader from '../trader';
import Market from '../market';
import { Bank } from '../bank';
import * as GOODS from '../goods';
import { GOODS as ALL_GOODS } from '../goods';


describe('PriceBelief', () => {
  const market: Market = new Market();
  const bank: Bank = new Bank(100);

  let t1: Trader;
  let t2: Trader;
  let t3: Trader;

  beforeEach(() => {
    t1 = new Trader(market);
    t2 = new Trader(market);
    t3 = new Trader(market);

    bank.createAccount(t1, 100);
    bank.createAccount(t2, 100);
    bank.createAccount(t3, 100);
  });

  test('starting price for all goods', () => {
    for (const good of ALL_GOODS) {
      expect(t1.priceBelief.meanPriceFor(good)).toBe(1);
    }
  });

  test('trader successful sell below public price', () => {
    t1.setDesire(GOODS.wood, 10);
    t1.inventory.add(GOODS.wood, 5);

    const FAKE_PUBLIC_MEAN = 2.5;
    // const SOLD_FOR = 1.20;
    let myMeanPrice = t1.priceBelief.meanPriceFor(GOODS.wood);
    t1.priceBelief.market.meanPrice = jest.fn((good): number => {
      if (good == GOODS.wood) {
        return FAKE_PUBLIC_MEAN;
      }
      return 1;
    });

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
  });

});
