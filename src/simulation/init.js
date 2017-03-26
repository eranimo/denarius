// @flow
import { Bank } from './bank';
import Market from './market';
import { GOODS } from './goods';
import { goodsForJobs } from './jobsGoodsMap';
import { blueprintFor } from './production';
import Product from './product';
import Company from './company';
import Worker from './worker';
import { NewTrader } from './trader';
import type { Good } from './goods';
import type { Job } from './jobs';


/*
1 Market
1 Bank
1 Company for each good
  1 Product
  1 Worker for each required Good at a company
  1 Trader to trade the Product
*/
export function simpleStart(): Object {
  const market: Market = new Market();
  const bank: Bank = new Bank(100);
  const companies: Array<Company> = [];

  for (const good: Good of GOODS) {
    const company: Company = new Company(market);
    const trader: NewTrader = new NewTrader(market);
    market.addTrader(trader);
    const product: Product = new Product(good, market, company, trader);
    const requirements: Map<Good, number> = blueprintFor(good);

    company.products.add(product);

    for (const [req, amount]: [Good, number] of requirements.entries()) {
      const job: Job = goodsForJobs.get(req);
      for (let c = 0; c < amount; c++) { // eslint-disable-line
        const worker: Worker = new Worker(job);
        company.workers.add(worker);
      }
    }

    companies.push(company);
  }

  return { market, bank, companies };
}
