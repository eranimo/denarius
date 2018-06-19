
import { Good } from './goods';
import Trader from './trader';
import { Account } from './bank';
import Inventory from './inventory';


export type OrderType = 'buy' | 'sell';

export type MarketOrderExport = {
  orderType: OrderType;
  good: Good;
  amount: number;
  amountReceived: number;
  price: number;
  trader: number;
  finalPrice: number;
}

export default class MarketOrder {
  orderType: OrderType;
  good: Good;
  amount: number; // how much of a good we are selling or buying
  originalAmount: number;
  price: number; // total value of this order (good unit price * amount)
  trader: Trader;
  finalPrice?: number;
  account: Account;
  inventory: Inventory;

  constructor(
    orderType: OrderType,
    good: Good,
    amount: number,
    price: number,
    trader: Trader,
    account: Account = null,
    inventory: Inventory = null,
  ) {
    this.orderType = orderType;
    this.good = good;
    this.originalAmount = amount;
    this.amount = amount;
    this.price = price;
    this.trader = trader;
    this.finalPrice = null;
    this.account = account || trader.account;
    this.inventory = inventory || trader.inventory;

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
