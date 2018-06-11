// @flow
import Trader from '../src/simulation/trader';
import Market from '../src/simulation/market';
import { Bank } from '../src/simulation/bank';
import * as GOODS from '../src/simulation/goods';


describe('Trader', () => {
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

  test('amountRequired', () => {
    t1.setDesire(GOODS.wood, 10);
    expect(t1.amountRequired(GOODS.wood)).toBe(10);
  });

  test('amountToBuy', () => {
    t1.inventory.add(GOODS.wood, 5, 0.1);
    t1.setDesire(GOODS.wood, 10);
    expect(t1.amountRequired(GOODS.wood)).toBe(10);
    expect(t1.amountToBuy(GOODS.wood)).toBe(5);
  });

  test('amountToSell', () => {
    t1.inventory.add(GOODS.wood, 15, 0.1);
    t1.setDesire(GOODS.wood, 10);
    expect(t1.amountToSell(GOODS.wood)).toBe(5);
  });

  test('trading', () => {
    t1.inventory.add(GOODS.wood, 10);
    t1.setDesire(GOODS.grain, 5);
    t1.setDesire(GOODS.bread, 1);

    t2.inventory.add(GOODS.grain, 10);
    t2.setDesire(GOODS.wood, 5);
    t2.setDesire(GOODS.bread, 1);

    t3.inventory.add(GOODS.bread, 5);
    t3.setDesire(GOODS.grain, 8);

    t1.trade();
    t2.trade();
    t3.trade();

    // console.log(require('util').inspect(market.sellOrders, { colors: true, depth: 4 }));
    // $FlowFixMe
    expect(market.buyOrders.get(GOODS.grain).size).toBe(2);
    // $FlowFixMe
    expect(market.buyOrders.get(GOODS.wood).size).toBe(1);
    // $FlowFixMe
    expect(market.buyOrders.get(GOODS.bread).size).toBe(2);
    // $FlowFixMe
    expect(market.sellOrders.get(GOODS.wood).size).toBe(1);
    // $FlowFixMe
    expect(market.sellOrders.get(GOODS.grain).size).toBe(1);
    // $FlowFixMe
    expect(market.sellOrders.get(GOODS.bread).size).toBe(1);


    market.resolveOrders();
  });
});
