// @flow
import type Trader from './trader';
import _ from 'lodash';

export class Loan {
  borrower: Trader;
  principal: number;
  payment: number; // how much money required from the Trader each cycle to repay the loan
  repayments: number;
  lender: Bank; // the bank lending the loan
  defaultCycles: number; // number of repayments that were missed

  constructor(principal: number, trader: Trader, lender: Bank) {
    this.principal = principal;
    this.borrower = trader;
    trader.loans.add(this);
    this.repayments = 0;
    this.lender = lender;
    this.defaultCycles = 0;
  }

  // how many rounds the loan will take to repay in full
  get term(): number {
    return Math.ceil(this.principal / this.payment);
  }

  // get the payment required from the trader each cycle
  // the payment might change as the trader's income changes
  get payment(): number {
    return this.borrower.avergagePastProfit(30) / 20;
  }

  // repay part of or the whole of this loan
  repay() {
    this.repayments++;
    let payment: number = 0;
    if (this.borrower.money <= this.principal) {
      payment = this.borrower.money;
    } else if (this.payment <= this.borrower.money) {
      payment = this.payment;
    } else {
      this.defaultCycles++;
      return;
    }
    this.principal -= payment;
    this.borrower.money -= payment;
    this.lender.reserves += payment;
  }
}

export default class Bank {
  loans: Set<Loan>;
  reserves: number;

  constructor(reserves: number) {
    this.reserves = reserves;
    this.loans = new Set();
  }

  // lend a loan to a trader
  lend(borrower: Trader, amount: number): Loan {
    const loan: Loan = new Loan(amount, borrower, this);
    borrower.money += amount;
    this.loans.add(loan);
    return loan;
  }

  // get the total amount of credit this bank is responsible for
  get totalCredit(): number {
    return _.sumBy(Array.from(this.loans), (loan: Loan): number => loan.principal);
  }

  // for all loans, collect a repayment
  // this will grow the reserves
  collect() {
    for (const loan: Loan of this.loans) {
      loan.repay();
    }
  }
}