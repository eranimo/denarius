// @flow
import type { Good } from './goods';
import type Trader from './trader';
import type Market from './market';
import type Company from './company';
import type Producer from './producer';
import { blueprintFor } from './production';
import { takeRight, mean } from 'lodash';


/*

A Product is a record of a Good being sold by a Company at multiple Markets
A Product can be produced in one Market and traded in another Market


METHODS:

costOfProduction
  for all goods of this product this company products,
    return the sum of the inventory value for that good

*/

export default class Product {
  good: Good;
  company: Company;
  workers: Set<Producer>;
  assignedTrader: Trader;
  marketsTraded: Set<Market>;
  marketsProduced: Set<Market>;
  profitHistory: Array<number>;

  constructor(good: Good, company: Company, assignedTrader: Trader) {
    this.good = good;
    this.marketsTraded = new Set();
    this.marketsProduced = new Set();
    this.company = company;
    this.assignedTrader = assignedTrader;
    this.profitHistory = [];
    this.workers = new Set();
  }

  assignWorker(producer: Producer) {
    producer.product = this;
    this.workers.add(producer);
  }

  // value of a good at a market
  valueAt(market: Market): number {
    return market.meanPrice(this.good);
  }

  get requiredGoods(): Map<Good, number> {
    return blueprintFor(this.good);
  }

  // the cost of all the required goods at a market
  priceAt(market: Market): number {
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

  laborCostAt(market: Market): number {
    let cost: number = 0;
    for (const producer: Producer of this.workers) {
      for (const [good, amount]: [Good, number] of producer.lifeNeeds) {
        cost += amount * market.meanPrice(good);
      }
    }
    return cost;
  }



}
