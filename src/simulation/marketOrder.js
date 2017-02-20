// @flow
import type { Good } from './goods';
import type Trader from './trader';


export type OrderType = 'buy' | 'sell';

export default class MarketOrder {
  orderType: OrderType;
  good: Good;
  amount: number;
  price: number;
  trader: Trader;

  constructor(orderType: OrderType, good: Good, amount: number, price: number, trader: Trader) {
    this.orderType = orderType;
    this.good = good;
    this.amount = amount;
    this.price = price;
    this.trader = trader;
  }
}
