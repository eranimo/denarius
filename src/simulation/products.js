// @flow
import type { Good } from './goods';
import type Trader from './trader';
import type Market from './market';
import type Company from './company';


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

  constructor(good: Good, market: Market, company: Company) {
    this.good = good;
    this.marketsTraded = new Set();
    this.marketsTraded.add(market);
    this.price = this.valueAt(market);
    this.company = company;
  }

  // value of a good at a market
  valueAt(market: Market): number {
    return market.meanPrice(this.good);
  }



}
