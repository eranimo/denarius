
import { GOODS, Good } from './goods';
import MarketOrder from './marketOrder';
import Market from './market';
import PriceBelief from './priceBelief';
import Person from './person';
import { takeRight } from 'lodash';
import { InventoryExport } from './inventory';
import { MarketOrderExport } from './marketOrder';
import { LoanExport } from './bank';
import { PriceBeliefExport } from './priceBelief';


export type TraderExport = {
  id: number;
  kind: string;
  money: number;
  liabilities: number;
  justWorked: boolean;
  justTraded: boolean;
  failedTrades: number;
  successfulTrades: number;
  moneyLastRound: number;
  profitLastRound: number;
  accountRatio: number;
  inventory: InventoryExport;
  thisRoundOrders: {
    buy: MarketOrderExport[];
    sell: MarketOrderExport[];
  };
  loans: LoanExport[];
  priceBelief: PriceBeliefExport
}


export default class Trader extends Person {
  marketPrices: Map<Market, PriceBelief>;
  market: Market;
  desiredInventory: Map<Good, number>;
  buyOrders: Set<MarketOrder>;
  sellOrders: Set<MarketOrder>;
  successfulTrades: number;
  failedTrades: number;
  lastRound: {
    hasWorked: boolean,
    hasTraded: boolean,
    money: number,
  }
  profitHistory: number[];

  constructor(market: Market) {
    super();
    this.marketPrices = new Map();
    this.goToMarket(market);
    this.desiredInventory = new Map();

    this.buyOrders = new Set();
    this.sellOrders = new Set();

    this.successfulTrades = 0;
    this.failedTrades = 0;
    this.lastRound = {
      hasWorked: false,
      hasTraded: false,
      money: 0,
    }
    this.profitHistory = [];
  }

  goToMarket(market: Market) {
    if (!this.marketPrices.has(market)) {
      this.marketPrices.set(market, new PriceBelief(market, this));
    }
    this.market = market;
  }

  get priceBelief(): PriceBelief {
    return this.marketPrices.get(this.market);
  }

  get profitLastRound() {
    return this.availableFunds - this.lastRound.money;
  }

  // set the amount of goods that this trader will try to have every turn
  setDesire(good: Good, amount: number) {
    if (this.desiredInventory.has(good)) {
      this.desiredInventory.set(good, this.desiredInventory.get(good) + amount);
    } else {
      this.desiredInventory.set(good, amount);
    }
  }

  amountRequired(good: Good): number {
    return this.desiredInventory.get(good) || 0;
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

  recordProfit(profit: number) {
    this.profitHistory.push(profit);
    this.profitHistory = takeRight(this.profitHistory, 30);
  }

  trade() {
    this.buyOrders = new Set();
    this.sellOrders = new Set();

    for (const good of GOODS) {
      const buyAmount: number = this.amountToBuy(good);
      const sellAmount: number = this.amountToSell(good);
      const price: number = this.priceBelief.randomPriceFor(good);

      if (buyAmount > 0) {
        const order: MarketOrder = new MarketOrder('buy', good, buyAmount, price, this);
        console.log(`Trader ${this.id} is buying ${buyAmount} ${good.displayName}`);
        this.buyOrders.add(order);
        this.market.buy(order);
      }

      if (sellAmount > 0) {
        const order: MarketOrder = new MarketOrder('buy', good, sellAmount, price, this);
        console.log(`Trader ${this.id} is selling ${buyAmount} ${good.displayName}`);
        this.sellOrders.add(order);
        this.market.sell(order);
      }
    }
  }

  export(): TraderExport {
    return {
      id: this.id,
      kind: 'Trader',
      money: this.availableFunds,
      liabilities: this.liabilities,
      justWorked: this.lastRound.hasWorked,
      justTraded: this.lastRound.hasTraded,
      failedTrades: this.failedTrades,
      successfulTrades: this.successfulTrades,
      moneyLastRound: this.lastRound.money,
      profitLastRound: this.availableFunds - this.lastRound.money,
      accountRatio: this.accountRatio,
      inventory: this.inventory.export(),
      thisRoundOrders: {
        buy: Array.from(this.buyOrders).map(order => order.export()),
        sell: Array.from(this.sellOrders).map(order => order.export())
      },
      loans: Array.from(this.loans).map(load => load.export()),
      priceBelief: this.priceBelief.export(),
    };
  }
}
