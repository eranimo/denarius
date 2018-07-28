
import Trader  from './trader';
import MarketOrder from './marketOrder';
import { GOODS } from './goods';
import { JOBS } from './jobs';
import { Good } from './goods';
// import { Job } from './jobs';
import { sortBy, sumBy, random } from 'lodash';
import { TradeHistory } from './tradeHistory';


type MarketOptions = {
  randomStartPrices: boolean,
}

const defaultMarketOptions: MarketOptions = {
  randomStartPrices: false,
}

export type MarketGoodExport = {
  meanPrice: number,
  priceChange: number,
  supply: number,
  demand: number,
  supplyChange: number,
  demandChange: number,
};

export type MarketExport = {
  goodPrices: Map<Good, MarketGoodExport>;
  mostDemandedGood: Good;
  mostProfitableGood: Good;
  numTraders: number;
}

export default class Market {
  traders: Set<Trader>;
  buyOrders: Map<Good, Set<MarketOrder>>;
  sellOrders: Map<Good, Set<MarketOrder>>;
  history: TradeHistory;

  constructor(options: MarketOptions = defaultMarketOptions) {
    const { randomStartPrices = false } = options;
    this.traders = new Set();
    this.buyOrders = new Map();
    this.sellOrders = new Map();

    this.history = new TradeHistory();

    for (const good of GOODS) {
      this.buyOrders.set(good, new Set());
      this.sellOrders.set(good, new Set());
      this.history.register(good);

      // make some fake historical data
      if (randomStartPrices) {
        this.history.prices.add(good, [random(0.5, 1)]);
      } else {
        this.history.prices.add(good, [1.0]);
      }
      this.history.buyOrderAmount.add(good, [1.0]);
      this.history.sellOrderAmount.add(good, [1.0]);
      this.history.unitsTraded.add(good, [1.0]);
    }
    for (const job of JOBS) {
      this.history.profit.register(job);
    }

  }

  // resolve all orders by matching sell and buy orders
  resolveOrders() {
    for (const good of GOODS) {
      const buyOrders: Set<MarketOrder> | null = this.buyOrders.get(good);
      const sellOrders: Set<MarketOrder> | null = this.sellOrders.get(good);
      console.groupCollapsed(`Orders for ${good.displayName}`);

      console.groupCollapsed(`Buy orders: ${buyOrders.size}`);
      console.table(Array.from(buyOrders).map(order => ({
        'Good': order.good.displayName,
        'Quantity': order.amount,
        'Price': order.price,
        'Trader': order.trader.id,
      })));
      console.groupEnd();

      console.groupCollapsed(`Sell orders: ${sellOrders.size}`);
      console.table(Array.from(sellOrders).map(order => ({
        'Good': order.good.displayName,
        'Quantity': order.amount,
        'Price': order.price,
        'Trader': order.trader.id,
      })));
      console.groupEnd();

      if (!buyOrders || !sellOrders) {
        return;
      }


      // sort buy orders from highest to lowest price
      const sortedBuyOrders: Array<MarketOrder> = sortBy(Array.from(buyOrders), ['price'], ['DESC']);
      // sort sell orders from lowest to highest price
      const sortedSellOrders: Array<MarketOrder> = sortBy(Array.from(sellOrders), ['price'], ['ASC']);

      console.groupCollapsed(`Trade round`);

      const totalBuyAmount: number = sumBy(sortedBuyOrders, 'amount');
      const totalSellAmount: number = sumBy(sortedSellOrders, 'amount');

      let moneyTraded: number = 0;
      let unitsTraded: number = 0;

      // match buy_orders[0] with sell_orders[0] until one list is empty
      while(sortedBuyOrders.length > 0 && sortedSellOrders.length > 0) {
        const buyOrder: MarketOrder = sortedBuyOrders[0];
        const sellOrder: MarketOrder = sortedSellOrders[0];
        const unitPrice: number = (buyOrder.price + sellOrder.price) / 2;
        const goodsTraded: number = Math.min(buyOrder.amount, sellOrder.amount);
        const totalPrice: number = goodsTraded * unitPrice;

        console.table({
          'Buyer ID': buyOrder.trader.id,
          'Seller ID': sellOrder.trader.id,
          'Quantity': goodsTraded,
          'Unit Price': unitPrice,
          'Total Price': totalPrice,
          'Buyer funds': buyOrder.account.amount,
        });

        // if the buyer doesn't have the correct amount of money, borrow it
        if (!buyOrder.trader.account.has(totalPrice)) {
          console.log('Buyer bought goods on credit');
          const difference: number = totalPrice - buyOrder.trader.availableFunds;
          buyOrder.trader.borrowFunds(difference);
        }

        // remove money from buyer and give it to seller
        this.transferGood(sellOrder, buyOrder, goodsTraded);
        this.transferMoney(buyOrder, sellOrder, totalPrice);

        // update metrics
        buyOrder.trader.successfulTrades++;
        sellOrder.trader.successfulTrades++;

        // update price beliefs
        buyOrder.trader.priceBelief.update(buyOrder.good, buyOrder.orderType, true, unitPrice);
        sellOrder.trader.priceBelief.update(sellOrder.good, sellOrder.orderType, true, unitPrice);

        // change amounts
        buyOrder.amount = buyOrder.amount - goodsTraded;
        sellOrder.amount = sellOrder.amount - goodsTraded;

        buyOrder.finalPrice = unitPrice;
        sellOrder.finalPrice = unitPrice;

        // throw out (deny) all other orders
        if (buyOrder.amount === 0) {
          sortedBuyOrders.shift();
          console.log('Buy order is completed');
        } else {
          console.log(`Buy order has ${buyOrder.amount} left to buy`);
        }

        if (sellOrder.amount === 0) {
          sortedSellOrders.shift();
          console.log('Sell order is completed');
        } else {
          console.log(`Sell order has ${sellOrder.amount} left to sell`);
        }

        moneyTraded += totalPrice;
        unitsTraded += goodsTraded;
      }

      console.groupEnd();
      console.log(`Leftover orders - buy: ${sortedBuyOrders.length} sell: ${sortedSellOrders.length}`);

      // record failure
      for (const leftoverSellOrder of sortedSellOrders) {
        leftoverSellOrder.trader.failedTrades++;
        leftoverSellOrder.trader.priceBelief.update(leftoverSellOrder.good, leftoverSellOrder.orderType, false);
      }

      for (const leftoverBuyOrder of sortedBuyOrders) {
        leftoverBuyOrder.trader.failedTrades++;
        leftoverBuyOrder.trader.priceBelief.update(leftoverBuyOrder.good, leftoverBuyOrder.orderType, false);
      }

      // log some stuff for the history books
      this.history.buyOrderAmount.add(good, [totalBuyAmount]);
      this.history.sellOrderAmount.add(good, [totalSellAmount]);
      this.history.unitsTraded.add(good, [unitsTraded]);

      if (unitsTraded > 0) {
        this.history.prices.add(good, [moneyTraded / unitsTraded]);
      } else {
        // no units were traded this round, so use the last round's average price
        this.history.prices.add(good, [this.history.prices.average(good, 1)]);
      }


      // track the most profitable good
      const newProfit: Map<Good, Array<number>> = new Map();

      for (const trader of this.traders) {
        const newArr: Array<number> = newProfit.get(good) || [];
        newArr.push(trader.profitLastRound);
        newProfit.set(good, newArr);
      }

      for (const [job, profit] of newProfit.entries()) {
        this.history.profit.add(job, profit);
      }

      this.buyOrders.set(good, new Set());
      this.sellOrders.set(good, new Set());

      console.groupEnd();
    }
  }

  // transfer a good from one Trader to another
  transferGood(sellOrder: MarketOrder, buyOrder: MarketOrder, amount: number) {
    if (sellOrder.inventory.hasAmount(sellOrder.good, amount)) {
      sellOrder.inventory.moveTo(buyOrder.inventory, sellOrder.good, amount);
    } else {
      throw new Error(`Trader ${sellOrder.trader.toString()} doesn't have ${amount} '${sellOrder.good.displayName}' goods (it has ${sellOrder.inventory.amountOf(sellOrder.good)})`);
    }
  }

  // transfer money from one Trader to another
  transferMoney(buyOrder: MarketOrder, sellOrder: MarketOrder, amount: number) {
    if (buyOrder.account.amount >= amount) {
      buyOrder.account.transferTo(sellOrder.account, amount);
    } else {
      throw new Error(`Trader ${buyOrder.trader.toString()} doesn't have ${amount} money (it has ${buyOrder.account.amount})`);
    }
  }

  avgHistoricalPrice(good: Good, dayRange: number): number {
    return this.history.prices.average(good, dayRange);
  }

  addTrader(trader: Trader) {
    trader.goToMarket(this);
    this.traders.add(trader);
  }

  buy(order: MarketOrder) {
    const buyOrders: Set<MarketOrder> = this.buyOrders.get(order.good);
    if (buyOrders) {
      buyOrders.add(order);
    } else {
      throw new Error(`Unknown good ${order.good.key} in buy order set`);
    }
  }

  sell(order: MarketOrder) {
    const sellOrders: Set<MarketOrder> = this.sellOrders.get(order.good);
    if (sellOrders) {
      sellOrders.add(order);
    } else {
      throw new Error(`Unknown good ${order.good.key} in sell order set`);
    }
  }

  // gets the most good sold at this market
  mostProfitableGood(dayRange: number = 10): Good | null {
    // let best: number = -Infinity;
    let bestGood: Good = null;
    let best;

    for (const good of GOODS) {
      const avgProfit: number = this.history.profit.average(good, dayRange);

      if (avgProfit > best) {
        bestGood = good;
        best = avgProfit;
      }
    }

    return bestGood;
  }

  // Get the good with the highest demand/supply ratio over time at this market
  // minimum: the minimum demand/supply ratio to consider an opportunity
  // dayRange: number of rounds to look back
  mostDemandedGood(minimum: number = 1.5, dayRange: number = 10): Good | null {
    let bestGood: Good | null = null;
    let bestRatio: number = -Infinity;

    for (const good of GOODS) {
      let buys: number = this.history.buyOrderAmount.average(good, dayRange);
      let sells: number = this.history.sellOrderAmount.average(good, dayRange);

      if (buys > 0 || sells > 0) {
        // if this Good is traded in this Market
        if (sells === 0 && buys === 0) {
          // make a fake supply of 0.5 for each unit to avoid
          // an infinite ratio of supply to demand
          sells = 0.5;
        }

        const ratio: number = buys / sells;

        if (ratio > minimum && ratio > bestRatio) {
          bestRatio = ratio;
          bestGood = good;
        }
      }
    }

    return bestGood;
  }

  // get the price of a good at this market last round
  meanPrice(good: Good): number {
    return this.history.prices.average(good, 1);
  }

  demandFor(good: Good): number {
    return this.history.buyOrderAmount.average(good, 1);
  }

  supplyFor(good: Good): number {
    return this.history.sellOrderAmount.average(good, 1);
  }

  simulate() {
    console.log(this);
    console.groupCollapsed('Traders working and trading');
    for (const trader of this.traders) {
      trader.lastRound.money = trader.availableFunds;
      // perform trades
      console.groupCollapsed(`Trader #${trader.id} is trading`);
      console.log(trader);
      trader.trade();
      console.groupEnd();

      trader.recordProfit(trader.profitLastRound);
    }
    console.groupEnd();

    // resolve the orders for this round
    console.groupCollapsed('Resolving orders');
    this.resolveOrders();
    console.groupEnd();

    console.groupCollapsed('Trade history this round');
    this.history.debug();
    console.groupEnd();
  }

  export(): MarketExport {
    const goodPrices: Map<Good, MarketGoodExport> = new Map();
    GOODS.forEach((good: Good) => {
      goodPrices.set(good, {
        meanPrice: this.history.prices.get(good, 0),
        priceChange: this.history.prices.get(good, 0) - this.history.prices.get(good, 1),
        supply: this.supplyFor(good),
        demand: this.demandFor(good),
        supplyChange: this.history.sellOrderAmount.get(good, 0) - this.history.sellOrderAmount.get(good, 1),
        demandChange: this.history.buyOrderAmount.get(good, 0) - this.history.buyOrderAmount.get(good, 1),
      });
    });
    return {
      goodPrices,
      numTraders: this.traders.size,
      mostDemandedGood: this.mostDemandedGood(),
      mostProfitableGood: this.mostProfitableGood(),
    }
  }
}
