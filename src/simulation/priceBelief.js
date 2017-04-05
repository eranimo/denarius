// @flow
import type Market from './market';
import type { Good } from './goods';
import { GOODS } from './goods';
import PriceRange from './priceRange';
import { min, max } from 'lodash';
import type { OrderType } from './marketOrder';
import type Trader from './trader';


export default class PriceBelief {
  prices: Map<Good, PriceRange>;
  market: Market;
  observedTradingRange: Map<Good, Array<number>>;
  trader: Trader;

  constructor(market: Market, trader: Trader) {
    this.market = market;
    this.prices = new Map();
    this.trader = trader;
    this.observedTradingRange = new Map();

    for (const good: Good of GOODS) {
      const averageGoodPrice: number = this.market.avgHistoricalPrice(good, 15);
      const low: number = averageGoodPrice * 0.5;
      const high: number = averageGoodPrice * 1.5;
      this.observedTradingRange.set(good, [low, high]);
      this.prices.set(good, new PriceRange(low, high));
    }
  }

  randomPriceFor(good: Good): number {
    const priceBelief: ?PriceRange = this.prices.get(good);
    if (priceBelief) {
      return priceBelief.random();
    }
    throw new Error('Price belief not set');
  }

  meanPriceFor(good: Good): number {
    const priceBelief: ?PriceRange = this.prices.get(good);
    if (priceBelief) {
      return priceBelief.mean();
    }
    throw new Error('Price belief not set');
  }

  tradingRangeExtremes(good: Good): PriceRange {
    const tradingRange: ?Array<number> = this.observedTradingRange.get(good);
    if (!tradingRange) {
      throw new Error('Trader has no trade data');
    }
    return new PriceRange(min(tradingRange), max(tradingRange));
  }

  update(good: Good, orderType: OrderType, isSuccessful: boolean, clearingPrice: ?number) {
    if (!this.observedTradingRange || !this.market || !this.prices) {
      return;
    }

    const SIGNIFICANT: number = 0.25; // 25% more or less is "significant"
    const SIG_IMBALANCE: number = 0.33;
    const LOW_INVENTORY: number = 0.1; // 10% of ideal inventory = "LOW"
    const HIGH_INVENTORY: number = 2.0; // 200% of ideal inventory = "HIGH"
    const MIN_PRICE: number = 0.01; // lowest allowed price of a Good

    if (isSuccessful && clearingPrice) {
      const tradingRange: ?Array<number> = this.observedTradingRange.get(good);
      if (tradingRange){
        tradingRange.push(clearingPrice);
      }
    }

    const publicMeanPrice: number = this.market.meanPrice(good);
    // $FlowFixMe
    const priceBelief: PriceRange = this.prices.get(good);
    const meanPrice: number = priceBelief.mean();
    let wobble: number = 0.05; // the degree which the Trader should bid outside the belief

    // how different the public mean price is from the price belief
    const deltaToMeanPrice: number = meanPrice - publicMeanPrice;
    // console.log(
    //   'publicMeanPrice', publicMeanPrice,
    //   '\nmeanPrice', meanPrice,
    //   '\ndeltaToMeanPrice', deltaToMeanPrice
    // );

    if (isSuccessful) {
      if (orderType === 'buy' && deltaToMeanPrice > SIGNIFICANT) {
        priceBelief.low -= deltaToMeanPrice / 2;
        priceBelief.high -= deltaToMeanPrice / 2;
      } else if (orderType === 'sell' && deltaToMeanPrice < -SIGNIFICANT) {
        priceBelief.low -= deltaToMeanPrice / 2;
        priceBelief.high -= deltaToMeanPrice / 2;
      }

      // increase the belief's certainty
      const newLow: number = priceBelief.low + (wobble * meanPrice);
      const newHigh: number = priceBelief.high - (wobble * meanPrice);
      if (newHigh > newLow) {
        priceBelief.low = newLow;
        priceBelief.high = newHigh;
      }
    } else { // failed order

      // shift towards mean price
      priceBelief.low -= deltaToMeanPrice / 2;
      priceBelief.high -= deltaToMeanPrice / 2;

      // check for inventory special cases
      const stock: number = this.trader.inventory.amountOf(good);
      const ideal: number = this.trader.amountRequired(good);

      if (orderType === 'buy' && stock < LOW_INVENTORY * ideal) {
        // if we're buying and inventory is too low: we're desperate to buy
        wobble *= 2;
      } else if (orderType === 'sell' && stock > HIGH_INVENTORY * ideal) {
        // if we're selling and inventory is too high: we're desperate to sell
        wobble *= 2;
      } else {
        // all other failure cases

        // sum of buy and sell order quantity for a good
        const buys: number = this.market.history.buyOrderAmount.average(good, 1);
        const sells: number = this.market.history.sellOrderAmount.average(good, 1);

        if (buys + sells > 0) {
          const supplyVsDemand: number = (sells - buys) / (sells + buys);

          if (supplyVsDemand > SIG_IMBALANCE || supplyVsDemand < -SIG_IMBALANCE) {
            // too much supply? lower bid lower to sell faster
            // too much demand? raise price to buy faster

            const newMeanPrice: number = publicMeanPrice * (1 - supplyVsDemand);
            const deltaToMean: number = meanPrice - newMeanPrice;

            // TODO: should we set meanPrice = newMeanPrice here?

            // shift the price belief to the new price mean
            priceBelief.low -= deltaToMean / 2;
            priceBelief.high -= deltaToMean / 2;
          }
        } else {
          throw new Error('Weird case where no buy or sell orders happened');
        }
      }

      // decrease belief's certainty since we've just changed it (we could be wrong)
      priceBelief.low -= wobble * meanPrice;
      priceBelief.high += wobble * meanPrice;

      // make sure the price belief doesn't decrease below the minimum
      if (priceBelief.low < MIN_PRICE) {
        priceBelief.low = MIN_PRICE;
      } else if (priceBelief.high < MIN_PRICE) {
        priceBelief.high = MIN_PRICE;
      }

      if (priceBelief.high < priceBelief.low) {
        throw new Error('Price belief high must be higher than low');
      }
    }
  }
}
