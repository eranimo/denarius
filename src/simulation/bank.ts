import { sumBy } from 'lodash';


export class AccountHolder {
  account: Account | null;
  loans: Set<Loan>;
  bank: Bank;

  constructor() {
    this.loans = new Set();
    this.account = null;
  }

  get availableFunds(): number {
    if (this.account != null) {
      return this.account.amount;
    }
    return 0;
  }

  set availableFunds(num: number) {
    throw new Error('Cannot set available funds directly');
  }

  get assets(): number {
    return this.availableFunds;
  }

  get liabilities(): number {
    let amount: number = 0;
    for (const loan of this.loans) {
      amount += loan.currentPrincipal;
    }
    return amount;
  }

  get netWorth(): number {
    return this.assets - this.liabilities;
  }

  // ratio of the amount of all withdraws compared to amount of total deposits
  get accountRatio(): number {
    if (this.account === null) return 0;
    return this.account.withdraws / this.account.deposits;
  }

  borrowFunds(amount: number): Loan | null {
    if (this.bank) {
      return this.bank.lend(this, amount, this.bank.calculateInterestRateFor(this));
    }
    return null;
  }

  calculatePayment(loan: Loan): number {
    if (this.availableFunds) {
      // percent of their total funds to pay loan with
      let percent: number = 0.25;

      if (loan.balance > this.availableFunds) { // if we can pay it back in full
        percent = 0.25; // then pay a quarter of our funds
      } else if (this.accountRatio < 2) { // if we're poor
        percent = 0.05;
      } else { // we're doing ok, pay more
        percent = 0.15;
      }
      return this.availableFunds * percent;
    }
    return 0;
  }
}

export type LoanExport = {
  balance: number;
  interestRate: number;
  repayments: number;
  missedRepayments: number;
}

export class Loan {
  borrower: AccountHolder;
  principal: number;
  balance: number;
  interestRate: number;
  repayments: number;
  accruedInterest: number;
  payments: number;
  lender: Bank; // the bank lending the loan
  missedRepayments: number;
  isRepayed: boolean;

  constructor(principal: number, borrower: AccountHolder, interestRate: number, lender: Bank) {
    this.principal = principal;
    this.borrower = borrower;
    this.balance = principal;
    this.interestRate = interestRate;
    borrower.loans.add(this);
    this.repayments = 0;
    this.accruedInterest = 0;
    this.payments = 0;
    this.lender = lender;
    this.missedRepayments = 0;
    this.isRepayed = false;
  }

  get currentPrincipal(): number {
    return Math.max(0, this.principal - this.payments);
  }

  accrueInterest() {
    const interest: number = this.balance * this.interestRate;
    this.balance += interest;
    this.accruedInterest += interest;
  }

  // repay part of or the whole of this loan
  // if the payment is more than the loan balance, then just repay the balance in full
  repay() {
    if (this.borrower.availableFunds == null) {
      this.missedRepayments++;
      return;
    }

    const funds: number = this.borrower.availableFunds;
    let payment: number = this.borrower.calculatePayment(this);
    if (payment <= funds) {
      if (payment > this.balance) {
        payment = this.balance;
      }
      this.repayments++;
      this.payments += payment;
      this.balance -= payment;
      this.borrower.account.transferTo(this.lender.account, payment);
    } else {
      this.missedRepayments++;
      return;
    }

    if (this.balance === 0) {
      this.isRepayed = true;
    }
  }

  export(): LoanExport {
    return {
      balance: this.balance,
      interestRate: this.interestRate,
      repayments: this.repayments,
      missedRepayments: this.missedRepayments
    };
  }
}


export class Account {
  owner: AccountHolder;
  amount: number;
  deposits: number;
  withdraws: number;

  constructor(owner: AccountHolder) {
    this.owner = owner;
    this.amount = 0;
    this.deposits = 0;
    this.withdraws = 0;
  }

  // deposit
  deposit(num: number) {
    this.deposits += num;
    this.amount += num;
  }

  // does this account have a certain amount of funds?
  has(num: number): boolean {
    return this.amount >= num;
  }

  // transfer funds to another account
  // returns boolean on success or failure
  // failure occurs when funds are depleted
  transferTo(account: Account, amount: number): boolean {
    this.withdraws += amount;
    if (this.has(amount)) {
      account.amount += amount;
      this.amount -= amount;
      return true;
    }
    return false;
  }

  // withdraw from this Account
  // returns boolean on success or failure
  // failure occurs when funds are depleted
  withdraw(num: number): boolean {
    this.withdraws += num;
    if (this.has(num)) {
      this.amount -= num;
      return true;
    }
    return false;
  }
}

/*
A bank is an institution that lends and holds money
*/
const RESERVE_RATIO: number = 1 / 10;
export class Bank extends AccountHolder {
  account: Account; // the bank's account
  accounts: Set<Account>;

  constructor(startingFunds: number) {
    super();
    this.accounts = new Set();
    this.account = new Account(this);
    this.account.deposit(startingFunds);
  }

  createAccount(owner: AccountHolder, startingFunds: number = 0) {
    const account: Account = new Account(owner);
    owner.account = account;
    account.deposit(startingFunds);
    owner.bank = this;
    this.accounts.add(account);
  }

  get totalDeposits(): number {
    let amount: number = 0;
    for (const account of this.accounts) {
      amount += account.amount;
    }
    return amount;
  }

  // notes:
  // if the bank needs money, it will get a loan from the central bank
  // if the bank can't get money from the central bank, it will get it from other banks
  // if no other banks can
  // http://www.thesimpledollar.com/why-are-savings-account-rates-so-low/
  get savingsInterestRate(): number {
    return 0.01;
  }

  get reserves(): number {
    return this.totalDeposits * RESERVE_RATIO;
  }

  get loanableFunds(): number {
    return this.totalDeposits - this.reserves;
  }

  calculateInterestRateFor(borrower: AccountHolder): number {
    if (borrower.accountRatio > 1) {
      // more deposits than withdraws
      return 0.03;
    }
    return 0.05;
  }

  // lend a loan to a trader
  lend(borrower: AccountHolder, amount: number, interestRate: number): Loan | null {
    if (amount <= this.loanableFunds && borrower.account != null) {
      const loan: Loan = new Loan(amount, borrower, interestRate, this);
      borrower.account.deposit(amount);
      this.loans.add(loan);
      borrower.loans.add(loan);
      return loan;
    }
    throw new Error(`Bank is out of available funds, can not lend to ${borrower.toString()}. Needs ${amount} but has ${this.loanableFunds}`);
  }

  // get the total amount of credit this bank is responsible for
  get totalCredit(): number {
    return sumBy(Array.from(this.loans), (loan: Loan): number => loan.principal);
  }

  // accrue interest on deposits and loans
  accrueAndChargeInterest() {
    // for all accounts, deposit interest
    for (const account of this.accounts) {
      const interest: number = account.amount * this.savingsInterestRate;
      account.deposit(interest);
    }
    // for all loans, collect interest
    for (const loan of this.loans) {
      loan.accrueInterest();
    }
  }

  closeLoans() {
    for (const loan of this.loans) {
      if (loan.balance === 0) {
        this.loans.delete(loan);
        loan.borrower.loans.delete(loan);
      }
    }
  }
}
