// @flow
import { Good } from './goods';
import { GOODS } from './goods';
import MarketOrder from './marketOrder';
import Market from './market';
import PriceBelief from './priceBelief';
import Person from './person';


export default class Trader extends Person {
  marketPrices: Map<Market, PriceBelief>;
  market: Market;
  buyingList: Map<Good, number>;
  buyOrders: Set<MarketOrder>;
  sellOrders: Set<MarketOrder>;

  constructor(market: Market) {
    super();
    this.marketPrices = new Map();
    this.goToMarket(market);
    this.buyingList = new Map();

    this.buyOrders = new Set();
    this.sellOrders = new Set();
  }

  goToMarket(market: Market) {
    if (!this.marketPrices.has(market)) {
      this.marketPrices.set(market, new PriceBelief(market, this));
    }
    this.market = market;
  }

  // $FlowFixMe
  get priceBelief(): PriceBelief {
    return this.marketPrices.get(this.market);
  }

  // set the amount of goods that this trader will try to have every turn
  setDesire(good: Good, amount: number) {
    if (this.buyingList.has(good)) {
      this.buyingList.set(good, this.buyingList.get(good) + amount);
    } else {
      this.buyingList.set(good, amount);
    }
  }

  amountRequired(good: Good): number {
    return this.buyingList.get(good) || 0;
  }

  amountToBuy(good: Good): number {
    return Math.max(0, this.amountRequired(good) - this.inventory.amountOf(good));
  }

  amountToSell(good: Good): number {
    const amount: number = this.amountRequired(good) - this.inventory.amountOf(good);
    if (amount < 0) { // surplus
      return Math.abs(amount);
    }
    return 0;
  }

  trade() {
    this.buyOrders = new Set();
    this.sellOrders = new Set();

    for (const good: Good of GOODS) {
      const buyAmount: number = this.amountToBuy(good);
      const sellAmount: number = this.amountToSell(good);
      const price: number = this.priceBelief.randomPriceFor(good);

      if (buyAmount > 0) {
        const order: MarketOrder = new MarketOrder('buy', good, buyAmount, price, this);
        this.buyOrders.add(order);
        this.market.buy(order);
      }

      if (sellAmount > 0) {
        const order: MarketOrder = new MarketOrder('buy', good, sellAmount, price, this);
        this.sellOrders.add(order);
        this.market.sell(order);
      }
    }
  }
}
