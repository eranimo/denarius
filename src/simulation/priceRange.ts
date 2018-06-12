
import { mean, round, random } from 'lodash';


export default class PriceRange {
  low: number;
  high: number;

  constructor(low: number, high: number) {
    this.low = low;
    this.high = high;
  }

  random(): number {
    return round(random(this.low, this.high), 2);
  }

  mean(): number {
    return mean([this.low, this.high]);
  }
}
