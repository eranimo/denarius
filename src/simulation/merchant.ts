import { Good } from './goods';
import MarketOrder from './marketOrder';
import Trader, { TraderExport } from './trader';
import Market from './market';
import Product, { ProductExport } from './product';
import Inventory from './inventory';
import Company from './company';
// import { Account } from './bank';


export type MerchantExport = TraderExport & {
  product: ProductExport,
};

/**
 * Merchant is like a Trader but
 * - works for a company
 * - sells a Product
 * - has a separate inventory for company goods
 */
export default class Merchant extends Trader {
  employer: Company | null;
  product: Product | null;
  companyInventory: Inventory;
  sellingGoods: Map<Good, number>;
  buyingGoods: Map<Good, number>;

  constructor(market: Market) {
    super(market);
    this.companyInventory = new Inventory();
    this.employer = null;
    this.product = null;
    this.sellingGoods = new Map();
    this.buyingGoods = new Map();
  }

  assignProduct(product: Product) {
    this.product = product;
  }

  recordProfit(profit: number) {
    this.product.recordProfit(profit);
  }

  trade() {
    super.trade();
    if (!this.product) {
      throw new Error('Merchant has no assigned product to sell');
    }
    if (!this.employer) {
      throw new Error('Merchant has no assigned company');
    }

    // buy orders for company
    for (const [good, amount] of this.buyingGoods) {
      const price: number = this.priceBelief.randomPriceFor(good);
      const order = new MarketOrder('buy', good, amount, price, this, this.employer.account, this.employer.inventory);
      console.log(`Merchant ${this.id} is buying ${amount} ${good.displayName}`);
      this.buyOrders.add(order);
      this.market.buy(order);
    }

    // sell orders for company
    for (const [good, amount] of this.sellingGoods) {
      const price: number = this.priceBelief.randomPriceFor(good);
      const order = new MarketOrder('sell', good, amount, price, this, this.employer.account, this.employer.inventory);
      console.log(`Merchant ${this.id} is selling ${amount} ${good.displayName}`);
      this.sellOrders.add(order);
      this.market.sell(order);
    }
  }

  export(): MerchantExport {
    return {
      ...super.export(),
      kind: 'Merchant',
      product: this.product.export(),
    };
  }
}
