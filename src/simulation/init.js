// @flow
import { Bank } from './bank';
import Market from './market';
import { GOODS } from './goods';
import { goodsForJobs } from './jobsGoodsMap';
import { blueprintFor } from './production';
import Product from './product';
import Company from './company';
import Producer from './producer';
import Agent from './trader';
import type { Good } from './goods';
import type { Job } from './jobs';


/*
1 Market
1 Bank
1 Company for each good
  1 Product
  1 Producer for each required Good at a company
  1 Trader to trade the Product
*/

export function companyProducing(good: Good, market: Market, bank: Bank): Company {
  const company: Company = new Company(market);
  const agent: Agent = new Agent(market);
  market.addTrader(Agent);
  bank.createAccount(agent);
  const product: Product = new Product(good, company, agent);
  agent.assign(product);
  const requirements: Map<Good, number> = blueprintFor(good);

  company.products.add(product);

  for (const [req, amount]: [Good, number] of requirements.entries()) {
    const job: Job = goodsForJobs.get(req);
    for (let c = 0; c < amount; c++) { // eslint-disable-line
      const producer: Producer = new Producer(market, job);
      product.assignWorker(producer);
      company.workers.add(producer);
    }
  }
  return company;
}
export function simpleStart(): Object {
  const market: Market = new Market();
  const bank: Bank = new Bank(100);
  const companies: Array<Company> = [];

  for (const good: Good of GOODS) {
    companies.push(companyProducing(good, market, bank));
  }

  return { market, bank, companies };
}
