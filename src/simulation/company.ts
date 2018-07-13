import { HasID } from './mixins';
import { Good } from './goods';
import Producer from './producer';
import Product from './product';
import Market from './market';
import Merchant from './merchant';
import Inventory from './inventory';
import { AccountHolder, AccountExport } from './bank';
import { isRawGood, blueprintFor } from './production';
import { ProductExport } from './product';
import { TraderExport } from './trader';
import { ProducerExport } from './producer';
import Person from './person';


export type CompanyExport = {
  id: number;
  account: AccountExport;
  profitLastRound: number;
  merchants: TraderExport[];
  producers: ProducerExport[];
  products: ProductExport[];
}

/*
Overview:

A company produces multiple products (goods) at several markets
  produced by many workers
  sold by many Traders

inherits HasID

- [x] A Company has Producer employees
  - [ ] must have at least 1 Producer
  - [ ] workers get payed a wage every round
  - [x] Workers produce Products
  - [ ] a producer is limited to working on one product at a time

- [x] A Company has Trader employees
  - [ ] traders get payed a wage every round
  - [ ] must have at least 1 Trader

- [x] A Company has Inventory

- [x] Products are Goods that are sold at Markets
  - [ ] must have at least 1 Product
  - [ ] a Product is traded at a Market by a Trader
  - [ ] a Product may be sold at multiple Markets by the same Trader
  - [ ] Product price is set by Trader assigned to that Product

METHODS:

// decide what products to make
decideProduct():
  if the company has products:
    re-evaluate worth of existing products
    remove products that can't be sold
    sell remaining inventory
  else:
    decide what goods to produce

// create new product. Ran every round
produce():
  for each producer:
    run work function for producer
    transfer good to company inventory

// trade products at markets with offices
trade():
  for each trader
    decide where to trade
    decide what product to trade
    if goods are traded:
      transfer good from company inventory to trader inventory
      run trade function for trader
*/

export default class Company extends HasID(AccountHolder) {
  producers: Set<Producer>;
  products: Set<Product>;
  inventory: Inventory;
  market: Market;
  bankrupt: boolean;
  merchants: Set<Merchant>;
  lastRound: { idleProducers: number };
  shoppingList: Map<Good, number>;
  moneyLastRound: number;


  constructor(market: Market) {
    super();
    this.inventory = new Inventory();
    this.producers = new Set();
    this.merchants = new Set();
    this.products = new Set();
    // this.offices = new Set();
    this.shoppingList = new Map();
    this.market = market;
    this.bankrupt = false;
    this.lastRound = {
      idleProducers: 0,
    };
    this.moneyLastRound = 0;
  }

  hireProducer(producer: Producer) {
    producer.employer = this;
    this.producers.add(producer);
  }

  hireMerchant(merchant: Merchant) {
    merchant.employer = this;
    this.merchants.add(merchant);
  }

  // give the required goods to produce all products this company has
  giveRequiredGoods() {
    for (const product of this.products) {
      if (!isRawGood(product.good)) {
        const reqs: Map<Good, number> = blueprintFor(product.good);
        for (const [good, amount] of reqs.entries()) {
          this.inventory.add(good, amount);
        }
      }
    }
  }

  produce() {
    console.groupCollapsed(`Production - Products: ${this.products.size}`)
    this.lastRound = {
      idleProducers: 0,
    };
    this.shoppingList = new Map();
    for (const product of this.products) {
      console.log(`Product '${product.good.displayName}' - workers: ${product.workers.size}`);
      for (const producer of product.workers) {
        // transfer required goods to producer if the company has them
        for (const [good, number] of product.requiredGoods) {
          const missingAmount = number - producer.inventory.amountOf(good);
          if (missingAmount > 0) {
            if (this.inventory.hasAmount(good, missingAmount)) {
              console.log(`Give producer ${missingAmount} ${good.displayName} from company inventory`);
              this.inventory.moveTo(producer.companyInventory, good, missingAmount);
            } else {
              console.log(`Company missing ${number - this.inventory.amountOf(good)} ${good.displayName} to give producer`);
            }
          }
        }

        const didWork = producer.work();

        if (didWork) {
          console.log(`Producer #${producer.id} produced ${product.good.displayName}`);
          // produced goods to company inventory
          producer.companyInventory.moveTo(
            this.inventory,
            product.good,
            producer.companyInventory.amountOf(product.good)
          );
        } else {
          // producer can't work
          this.lastRound.idleProducers++;

          console.groupCollapsed(`Producer #${producer.id} could not produce ${product.good.displayName}`);
          for (const [good, number] of product.requiredGoods) {
            const missingAmount = number - this.inventory.amountOf(good);
            console.log(`Missing amount: ${missingAmount} ${good.displayName}`);
            // add missing goods to the shopping list
            this.shoppingList.set(good, (this.shoppingList.get(good) || 0) + missingAmount);
          }
          console.groupEnd();
        }
      }
    }
    console.groupEnd();
  }

  calculateTrades() {
    console.groupCollapsed(`Trade calculation - Merchants: ${this.merchants.size}`);
    for (const product of this.products) {
      const trader = product.assignMerchant;
      // set trade desires for buying goods producers need
      for (const [good, number] of this.shoppingList) {
        console.log(`Merchant #${trader.id} should buy ${number} ${good.displayName}`);
        trader.buyingGoods.set(good, number);
      }

      // sell goods the producers made
      const surplus = this.inventory.amountOf(product.good);
      if (surplus > 0) {
        console.log(`Merchant #${trader.id} should sell ${surplus} ${product.good.displayName}`);
        trader.sellingGoods.set(product.good, surplus);
      } else {
        console.log(`Merchant #${trader.id} had no goods to sell`);
      }
    }
    console.groupEnd();
  }

  handleBankrupt() {
    if (this.availableFunds === 0) {
      this.bankrupt = true;
    }
  }

  /** Returns the cost of all the live need goods of this person */
  calculateCostOfLabor(person: Person): number {
    let cost: number = 0;
    for (const [good, amount] of person.lifeNeeds.entries()) {
      cost += this.market.meanPrice(good) * amount;
    }
    return cost;
  }

  roundStart() {
    for (const producer of this.producers) {
      producer.live();
    }
    for (const merchant of this.merchants) {
      merchant.live();
    }
  }

  roundEnd() {
    this.moneyLastRound = this.account.amount;
  }

  costOfLabor(): number {
    let cost: number = 0;
    for (const product of this.products) {
      for (const market of product.marketsTraded) {
        cost += product.laborCostAt(market);
      }
    }
    return cost;
  }

  export() {
    const companyRecord: CompanyExport = {
      id: this.id,
      account: this.account.export(),
      profitLastRound: this.account.amount - this.moneyLastRound,
      merchants: [],
      producers: [],
      products: [],
    };
    for (const merchant of this.merchants) {
      const merchantExport = merchant.export();
      companyRecord.merchants.push(merchantExport);
    }

    for (const producer of this.producers) {
      const producerExport = producer.export();
      companyRecord.producers.push(producerExport);
    }

    for (const product of this.products) {
      companyRecord.products.push(product.export());
    }
    return companyRecord;
  }
}
