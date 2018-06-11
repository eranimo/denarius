// @flow
import _ from 'lodash';



export default class PriceRange {
  low: number;
  high: number;

  constructor(low: number, high: number) {
    this.low = low;
    this.high = high;
  }

  random(): number {
    return _.round(_.random(this.low, this.high), 2);
  }

  mean(): number {
    return _.mean([this.low, this.high]);
  }
}
