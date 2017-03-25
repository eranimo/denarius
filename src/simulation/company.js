// @flow
import { HasID } from './mixins';
import type Worker from './worker';
import type Product from './products';
import type Market from './market';
import Inventory from './inventory';


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

class Office {
  market: Market;
  company: Company;
}

export default class Company extends HasID() {
  workers: Set<Worker>;
  products: Set<Product>;
  inventory: Inventory;


  constructor(origin: Market) {
    super();
    this.inventory = new Inventory();
    this.workers = new Set();
    this.traders = new Set();
    this.products = new Set();
    this.offices = new Set();

    this.addOffice(origin);
  }

  addOffice(market: Market) {
    const office: Office = new Office(market, this);
    this.offices.add(office);
  }

  evaluateProducts() {
    if (this.products.size > 0) {
      for (const product: Product of this.products) {

      }
    }
  }

  produce() {

  }

  trade() {

  }

  simulate() {
    this.evaluateProducts();
  }


}
