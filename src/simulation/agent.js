// @flow
import Trader from './trader';
import type Market from './market';
import type Product from './product';


export default class Agent extends Trader {
  assignedProducts: Set<Product>;

  constructor(market: Market) {
    super(market);
    this.assignedProducts = new Set();
  }

  assign(product: Product) {
    this.assignedProducts.add(product);
  }
}
