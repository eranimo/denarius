import { HasID } from './mixins';
import { Good } from './goods';
import Producer from './producer';
import Product from './product';
import Market from './market';
import Trader from './trader';
import Inventory from './inventory';
import { AccountHolder } from './bank';
import { isRawGood, blueprintFor } from './production';

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
  workers: Set<Producer>;
  products: Set<Product>;
  inventory: Inventory;
  market: Market;
  bankrupt: boolean;
  traders: Set<Trader>;
  lastRound: { idleWorkers: number };


  constructor(market: Market) {
    super();
    this.inventory = new Inventory();
    this.workers = new Set();
    this.traders = new Set();
    this.products = new Set();
    // this.offices = new Set();
    this.market = market;
    this.bankrupt = false;
    this.lastRound = {
      idleWorkers: 0,
    };
  }

  evaluateProducts() {
    /*
    if we don't have products, evaluate markets
      for every good in the market, determine the cost to produce that good
        include:
          market price for each requirement
          price for life needs of each worker


    */
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
    this.lastRound = {
      idleWorkers: 0,
    };
    for (const product of this.products) {
      for (const producer of product.workers) {

        // if we have goods for this producer
        if (this.inventory.hasAmounts(product.requiredGoods)) {
          // give goods required to work
          // this.inventory.moveToMulti(producer.inventory, product.requiredGoods);

          // work
          producer.work();

          // transfer output goods to company inventory
          // producer.inventory.moveTo(this.inventory, producer.job.output);
        } else {
          // producer can't work
          this.lastRound.idleWorkers++;
        }
      }
    }
  }

  trade() {
    for (const product of this.products) {
      const trader = product.assignedTrader;

    }
  }

  simulate() {
    this.evaluateProducts();

    if (this.availableFunds === 0) {
      this.bankrupt = true;
    }
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


}
