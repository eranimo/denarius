
import { Bank } from './bank';
import Market from './market';
import { GOODS } from './goods';
import { goodsForJobs } from './jobsGoodsMap';
// import { blueprintFor } from './production';
import Product from './product';
import Company from './company';
import Producer from './producer';
import Merchant from './merchant';
import { Good } from './goods';
// import { Job } from './jobs';


/*
1 Market
1 Bank
1 Company for each good
  1 Product
  1 Producer for each required Good at a company
  1 Trader to trade the Product
*/

const START_CASH = 20;

export function companyProducing(good: Good, market: Market, bank: Bank): Company {
  const company: Company = new Company(market);
  bank.createAccount(company);
  company.account.deposit(100);

  const merchant: Merchant = new Merchant(market);
  company.hireMerchant(merchant);
  market.addTrader(merchant);
  bank.createAccount(merchant);
  merchant.account.deposit(START_CASH);

  const product: Product = new Product(good, company, merchant);
  merchant.product = product;
  company.products.add(product);

  const producer = new Producer(market, goodsForJobs.get(good));
  product.assignWorker(producer);
  company.hireProducer(producer);
  market.addTrader(producer);
  bank.createAccount(producer);
  producer.account.deposit(START_CASH);
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
