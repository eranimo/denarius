// @flow
import { AccountHolder, Bank } from '../src/simulation/bank';
import type { Loan, Account } from '../src/simulation/bank';
import Trader from '../src/simulation/trader';
import * as JOBS from '../src/simulation/jobs';


/*
classes:
Bank - an AccountHolder that lends to another AccountHolder
Account - a record of money owned by an AccountHolder
AccountHolder - an entity that holds an account, can request Loans
Loan - a credit for an amount of money deposited in an Account, must be repayed in interest

Bank *lends to* Bank (central bank -> commercial bank relationship)
Bank *has a* Account
AccountHolder *has a* Account
*/

describe('Bank', () => {
  const INITIAL_FUNDS: number = 100;


  test('savings account get interest', () => {
    const bank: Bank = new Bank(INITIAL_FUNDS);
    const person1: AccountHolder = new AccountHolder();
    bank.createAccount(person1, 10);

    expect(person1.availableFunds).toBe(10);

    expect(bank.totalDeposits).toBe(10);
    expect(bank.reserves).toBe(1);

    bank.calculateInterest();

    expect(person1.availableFunds).toBeGreaterThan(10);
    expect(bank.totalDeposits).toBeGreaterThan(10);
    expect(bank.reserves).toBeGreaterThan(1);
  });

  test('account holders can transfer funds between accounts', () => {
    const bank: Bank = new Bank(INITIAL_FUNDS);
    const person1: AccountHolder = new AccountHolder();
    const person2: AccountHolder = new AccountHolder();
    bank.createAccount(person1, 10);
    bank.createAccount(person2, 10);

    expect(person1.availableFunds).toBe(10);
    expect(person2.availableFunds).toBe(10);
    person1.account.transferTo(person2.account, 5);
    expect(person1.availableFunds).toBe(5);
    expect(person2.availableFunds).toBe(15);

    expect(bank.totalDeposits).toBe(20);
    expect(bank.reserves).toBe(2);
  });

  test('loaning', () => {
    const bank: Bank = new Bank(INITIAL_FUNDS);
    const person: AccountHolder = new AccountHolder();
    bank.createAccount(person, 10);

    expect(person.availableFunds).toBe(10);
    expect(bank.totalDeposits).toBe(10);
    expect(bank.loanableFunds).toBe(9);
    expect(bank.reserves).toBe(1);

    const loan: ?Loan = bank.lend(person, 10, 0.05);

    if (loan) {
      expect(bank.totalDeposits).toBe(20);
      expect(person.availableFunds).toBe(20);
      expect(bank.loans.size).toBe(1);
      expect(loan.balance).toBe(10);
      expect(loan.interestRate).toBe(0.05);

      bank.calculateInterest();

      expect(loan.balance).toBe(10 + 10 * 0.05);
      loan.repay();
      const payment: number = loan.calculatePayment();
      expect(payment).toBeGreaterThan(0);
      expect(loan.repayments).toBe(1);
      expect(loan.missedRepayments).toBe(0);
      expect(loan.balance).toBeLessThan(10 + 10 * 0.05);
      expect(person.availableFunds).toBeLessThan(20);
    }
  });
});
