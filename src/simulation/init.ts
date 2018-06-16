
import { Bank } from './bank';
import Market from './market';
import { GOODS } from './goods';
import { goodsForJobs } from './jobsGoodsMap';
import { blueprintFor } from './production';
import Product from './product';
import Company from './company';
import Producer from './producer';
import Trader from './trader';
import { Good } from './goods';
import { Job } from './jobs';


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
  const trader: Trader = new Trader(market);
  company.traders.add(trader);
  market.addTrader(trader);
  bank.createAccount(trader);
  const product: Product = new Product(good, company, trader);
  const requirements: Map<Good, number> = blueprintFor(good);
  trader.product = product;
  company.products.add(product);

  // create producers for each required good
  for (const [req, amount] of requirements.entries()) {
    const job: Job = goodsForJobs.get(req);
    for (let c = 0; c < amount; c++) { // eslint-disable-line
      const producer = new Producer(market, job);
      product.assignWorker(producer);
      company.workers.add(producer);
    }
  }
  // companies producing raw materials
  if (company.workers.size === 0) {
    const producer = new Producer(market, goodsForJobs.get(good));
    product.assignWorker(producer);
    company.workers.add(producer);
  }
  return company;
}

export function simpleStart() {
  const market: Market = new Market();
  const bank: Bank = new Bank(100);
  const companies: Array<Company> = [];

  for (const good of GOODS) {
    companies.push(companyProducing(good, market, bank));
  }

  return { market, bank, companies };
}
