// @flow
import { HasID } from './mixins';
import type Worker from './worker';
import type Product from './product';
import type Market from './market';
import { ValuedInventory } from './inventory';
import { AccountHolder } from './bank';

/*
Overview:

inherits HasID

- A Company has Worker employees
  - must have at least 1 Worker
  - workers get payed a wage every round
  - Workers product on Products

- A Company has Trader employees
  - traders get payed a wage every round
  - must have at least 1 Trader

- A Company has Inventory

- Products are Goods that are sold at Markets
  - must have at least 1 Product
  - a Product is traded at a Market by a Trader
  - a Product may be sold at multiple Markets by the same Trader
  - Product price is set by Trader assigned to that Product

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
  for each worker:
    run work function for worker
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
  workers: Set<Worker>;
  products: Set<Product>;
  inventory: ValuedInventory;
  market: Market;
  bankrupt: boolean;


  constructor(market: Market) {
    super();
    this.inventory = new ValuedInventory();
    this.workers = new Set();
    this.traders = new Set();
    this.products = new Set();
    this.offices = new Set();
    this.market = market;
    this.bankrupt = false;
  }

  evaluateProducts() {
    if (this.products.size > 0) {
      // for (const product: Product of this.products) {
      //
      // }
    }
  }

  produce() {
    for (const worker: Worker of this.workers) {
      // give goods required to work
      // work
      // transfer resources to company
      worker.work();

    }
  }

  trade() {

  }

  simulate() {
    this.evaluateProducts();

    if (this.availableFunds === 0) {
      this.bankrupt = true;
    }
  }


}
