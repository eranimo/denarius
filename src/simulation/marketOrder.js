// @flow
import type { Good } from './goods';
import type Trader from './trader';


export type OrderType = 'buy' | 'sell';

export default class MarketOrder {
  orderType: OrderType;
  good: Good;
  amount: number; // how much of a good we are selling or buying
  originalAmount: number;
  price: number; // total value of this order (good unit price * amount)
  trader: Trader;

  constructor(orderType: OrderType, good: Good, amount: number, price: number, trader: Trader) {
    this.orderType = orderType;
    this.good = good;
    this.originalAmount = amount;
    this.amount = amount;
    this.price = price;
    this.trader = trader;

    if (amount === 0) {
      throw Error(`Cannot create a order of quantity zero`);
    }
    if (price === 0) {
      console.trace();
      throw Error(`Cannot create a order of price zero`);
    }
  }


  export(): Object {
    return {
      orderType: this.orderType,
      good: this.good,
      amount: this.originalAmount,
      price: this.price,
      trader: this.trader.id
    };
  }
}
