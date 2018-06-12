
import { Good } from './goods';
// import Trader from './trader';


export type OrderType = 'buy' | 'sell';

export default class MarketOrder {
  orderType: OrderType;
  good: Good;
  amount: number; // how much of a good we are selling or buying
  originalAmount: number;
  price: number; // total value of this order (good unit price * amount)
  trader: any;
  finalPrice?: number;

  constructor(orderType: OrderType, good: Good, amount: number, price: number, trader: any) {
    this.orderType = orderType;
    this.good = good;
    this.originalAmount = amount;
    this.amount = amount;
    this.price = price;
    this.trader = trader;
    this.finalPrice = null;

    if (amount === 0) {
      throw Error(`Cannot create a order of quantity zero`);
    }
    if (price === 0) {
      console.trace();
      throw Error(`Cannot create a order of price zero`);
    }
  }


  export() {
    return {
      orderType: this.orderType,
      good: this.good,
      amount: this.originalAmount,
      amountReceived: this.originalAmount - this.amount,
      price: this.price,
      trader: this.trader.id,
      finalPrice: this.finalPrice,
    };
  }
}
