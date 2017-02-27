// @flow
import Trader from '../src/simulation/trader';
import Market from '../src/simulation/market';
import type { Job } from '../src/simulation/jobs';
import * as GOODS from '../src/simulation/goods';
import * as JOBS from '../src/simulation/jobs';


let trader: Trader;
let market: Market;

market = new Market();
trader = new Trader(JOBS.farmer);

const INITIAL_FOOD: number = 0;
const INITIAL_WOOD: number = 5;

test('trader initial state', () => {
  expect(trader.money).toBe(10);
  expect(trader.failedTrades).toBe(0);
  expect(trader.successfulTrades).toBe(0);

  expect(trader.inventory.size).toBe(0);
});

describe('trader goes to market', () => {

  test('adding inventory to trader', () => {
    market.addTrader(trader);
    expect(trader.market).toBe(market);
    trader.inventory.add(GOODS.food, INITIAL_FOOD);
    trader.inventory.add(GOODS.wood, INITIAL_WOOD);

    expect(trader.inventory.size).toBe(INITIAL_FOOD + INITIAL_WOOD);
  });

  test('trader does work', () => {
    expect(trader.lastRound.hasWorked).toBe(null);
    expect(trader.inventory.get(GOODS.wood)).toBe(INITIAL_WOOD);
    expect(trader.inventory.hasAmount(GOODS.wood, 1)).toBe(true);
    trader.work();
    expect(trader.lastRound.hasWorked).toBe(true);

    // expect work to have taken required goods
    expect(trader.inventory.get(GOODS.wood)).toBe(INITIAL_WOOD - 1);

    // expect work to added the inventory
    expect(trader.inventory.get(GOODS.food)).toBe(INITIAL_FOOD + 1);
  });

  describe('trader does trading', () => {

    test('trader ', () => {
      // a farmer requires 5 wood, so we expect a buy order for 2 wood
      const expectedWoodToBuy: number = Math.abs(INITIAL_WOOD - 1 - 5);
      expect(trader.goodsToTrade().get(GOODS.wood)).toBe(-expectedWoodToBuy);
      // $FlowFixMe
      expect(market.buyOrders.get(GOODS.wood).size).toBe(0);
      expect(trader.shortageOfGood(GOODS.wood)).toBe(1);
    });

    test('trader buys 1 wood and sells 1 food', () => {
      const tradeResult: boolean = trader.trade();
      expect(tradeResult).toBe(true);

      // $FlowFixMe
      expect(market.buyOrders.get(GOODS.wood).size).toBe(1);
      // $FlowFixMe
      expect(market.sellOrders.get(GOODS.food).size).toBe(1);

      // $FlowFixMe
      expect(Array.from(market.sellOrders.get(GOODS.food).keys())[0].amount).toBe(1);
      // $FlowFixMe
      expect(Array.from(market.buyOrders.get(GOODS.wood).keys())[0].amount).toBe(1);

      expect(trader.goodsToTrade().get(GOODS.food)).toBe(1);
    });
  });
});
