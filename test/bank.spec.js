// @flow
import Bank from '../src/simulation/bank';
import type { Loan } from '../src/simulation/bank';
import Trader from '../src/simulation/trader';
import * as JOBS from '../src/simulation/jobs';


describe('Bank', () => {
  const INITIAL_RESERVES: number = 100;
  const bank: Bank = new Bank(INITIAL_RESERVES);
  const borrower: Trader = new Trader(JOBS.farmer);
  borrower.profit = [2.20, 1.30, -1.40, 1.75, 2.19];
  let loan: Loan;

  test('lending works', () => {
    expect(borrower.money).toEqual(10);
    loan = bank.lend(borrower, 10);
    expect(borrower.money).toEqual(20);
    expect(Array.from(bank.loans)).toEqual(expect.arrayContaining([loan]));
    expect(Array.from(borrower.loans)).toEqual(expect.arrayContaining([loan]));
    expect(bank.loans.size).toBe(1);
    expect(bank.totalCredit).toBe(10);
  });

  test('collection works', () => {
    bank.collect();
    expect(loan.payment).toBeLessThan(borrower.money);
    expect(loan.repayments).toBe(1);
    expect(loan.defaultCycles).toBe(0);

    expect(bank.reserves).toBeGreaterThan(INITIAL_RESERVES);
  });
});