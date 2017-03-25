// @flow
import Trader from '../src/simulation/trader';
import Market from '../src/simulation/market';
import { Bank } from '../src/simulation/bank';
// import type { Job } from '../src/simulation/jobs';
import * as GOODS from '../src/simulation/goods';
import * as JOBS from '../src/simulation/jobs';





let farmer: Trader;
let bank: Bank;
let woodcutter: Trader;
let market: Market;

market = new Market();
bank = new Bank(100);
farmer = new Trader(JOBS.farmer, 'farmer');
woodcutter = new Trader(JOBS.woodcutter, 'woodcutter');
bank.createAccount(farmer, 10);
bank.createAccount(woodcutter, 10);

test('farmer initial state', () => {
  expect(farmer.availableFunds).toBe(10);
  expect(farmer.failedTrades).toBe(0);
  expect(farmer.successfulTrades).toBe(0);

  expect(farmer.inventory.size).toBe(0);
});

describe('farmer goes to market', () => {

  test('adding inventory to traders', () => {
    market.addTrader(farmer);
    market.addTrader(woodcutter);
    expect(farmer.market).toBe(market);
    expect(woodcutter.market).toBe(market);

    farmer.inventory.add(GOODS.wood, 5);
    expect(farmer.inventory.size).toBe(5);

    woodcutter.inventory.add(GOODS.food, 5);
    expect(woodcutter.inventory.size).toBe(5);

  });

  test('traders does work', () => {
    expect(farmer.lastRound.hasWorked).toBe(null);
    expect(farmer.inventory.get(GOODS.wood)).toBe(5);
    expect(farmer.inventory.hasAmount(GOODS.wood, 1)).toBe(true);
    farmer.work();
    woodcutter.work();
    expect(farmer.lastRound.hasWorked).toBe(true);

    // expect work to have taken required goods
    expect(farmer.inventory.get(GOODS.wood)).toBe(5 - 1);

    // expect work to added the inventory
    expect(farmer.inventory.get(GOODS.food)).toBe(0 + 1);
  });

  describe('farmer does trading', () => {

    test('trader setup', () => {
      // a farmer requires 5 wood, so we expect a buy order for 2 wood
      expect(farmer.goodsToTrade().get(GOODS.wood)).toBe(-1);
      // $FlowFixMe
      expect(market.buyOrders.get(GOODS.wood).size).toBe(0);
      expect(farmer.shortageOfGood(GOODS.wood)).toBe(1);
    });

    test('traders trade stuff', () => {
      // farmer buys 1 wood and sells 1 food
      // woodcutter buys 1 food and sells 1 wood
      expect(farmer.trade()).toBe(true);
      expect(woodcutter.trade()).toBe(true);

      // $FlowFixMe
      expect(market.buyOrders.get(GOODS.wood).size).toBe(1);
      // $FlowFixMe
      expect(market.sellOrders.get(GOODS.food).size).toBe(1);

      // $FlowFixMe
      expect(Array.from(market.sellOrders.get(GOODS.food).keys())[0].amount).toBe(1);
      // $FlowFixMe
      expect(Array.from(market.buyOrders.get(GOODS.wood).keys())[0].amount).toBe(1);

      expect(farmer.goodsToTrade().get(GOODS.food)).toBe(1);
    });

    test('market resolved orders', () => {
      market.resolveOrders();
    });
  });
});
