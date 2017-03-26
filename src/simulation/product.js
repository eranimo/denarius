// @flow
import type { Good } from './goods';
import type Trader from './trader';
import type Market from './market';
import type Company from './company';
import { blueprintFor } from './production';
import { takeRight, mean } from 'lodash';


/*

A Product is a record of a Good being sold by a Company at multiple Markets


METHODS:

costOfProduction
  for all goods of this product this company products,
    return the sum of the inventory value for that good

*/

export default class Product {
  good: Good;
  company: Company;
  price: number;
  assignedTrader: Trader;
  marketsTraded: Set<Market>;
  profitHistory: Array<number>;

  constructor(good: Good, market: Market, company: Company, trader: Trader) {
    this.good = good;
    this.marketsTraded = new Set();
    this.marketsTraded.add(market);
    this.price = this.valueAt(market);
    this.company = company;
    this.assignedTrader = trader;
    this.profitHistory = [];
  }

  // value of a good at a market
  valueAt(market: Market): number {
    return market.meanPrice(this.good);
  }

  get requiredGoods(): Map<Good, number> {
    return blueprintFor(this.good);
  }

  // the cost of all the required goods at a market
  costAt(market: Market): number {
    const reqs: Map<Good, number> = this.requiredGoods;
    let cost: number = 0;
    for (const [good, amount]: [Good, number] of reqs) {
      cost += market.meanPrice(good) * amount;
    }
    return cost;
  }

  recordProfit(profit: number) {
    this.profitHistory.push(profit);
    this.profitHistory = takeRight(this.profitHistory, 30);
  }

  meanProfit(roundsBack: number = 5): number {
    return mean(takeRight(this.profitHistory, roundsBack));
  }

}
