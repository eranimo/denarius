// @flow
import type { Good } from './goods';


export type OrderType = 'buy' | 'sell';

export default class MarketOrder {
  orderType: OrderType;
  good: Good;
  amount: number;
  price: number;

  constructor(orderType: OrderType, good: Good, amount: number, price: number) {
    this.orderType = orderType;
    this.good = good;
    this.amount = amount;
    this.price = price;
  }
}
