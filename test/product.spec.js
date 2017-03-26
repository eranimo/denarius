// @flow
import { simpleStart } from '../src/simulation/init';
import type Company from '../src/simulation/company';
import type Market from '../src/simulation/market';


describe('Product', () => {
  let companies: Array<Company>;
  let market: Market;

  beforeEach(() => {
    const data: Object = simpleStart();
    companies = data.companies;
    market = data.market;
  });

  test('cost', () => {
    const company: Company = companies.shift();
    console.log(company);

    expect(company).toBe();
  });
});
