// @flow
import _ from 'lodash';


export class AccountHolder {
  account: Account;
  loans: Set<Loan>;
  bank: Bank;

  constructor() {
    this.loans = new Set();
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

  calculatePayment(): number {
    if (this.borrower.availableFunds) {
      return this.borrower.availableFunds * 0.25;
    }
    return 0;
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
    let payment: number = this.calculatePayment();
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
}


export class Account {
  owner: AccountHolder;
  amount: number;

  constructor(owner: AccountHolder) {
    this.owner = owner;
    this.amount = 0;
  }

  // deposit
  deposit(num: number) {
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
  loans: Set<Loan>;
  account: Account; // the bank's account
  accounts: Set<Account>;

  constructor(startingFunds: number) {
    super();
    this.accounts = new Set();
    this.account = new Account(this);
    this.account.deposit(startingFunds);
    this.loans = new Set();
  }

  createAccount(owner: AccountHolder, startingFunds: number = 0) {
    const account: Account = new Account(owner, this);
    owner.account = account;
    account.deposit(startingFunds);
    this.accounts.add(account);
  }

  get totalDeposits(): number {
    let amount: number = 0;
    for (const account: Account of this.accounts) {
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

  // lend a loan to a trader
  lend(borrower: AccountHolder, amount: number, interestRate: number): ?Loan {
    if (amount >= this.loanableFunds && borrower.account != null) {
      const loan: Loan = new Loan(amount, borrower, interestRate, this);
      borrower.account.deposit(amount);
      this.loans.add(loan);
      return loan;
    }
    return null;
  }

  // get the total amount of credit this bank is responsible for
  get totalCredit(): number {
    return _.sumBy(Array.from(this.loans), (loan: Loan): number => loan.principal);
  }

  // accrue interest on deposits and loans
  calculateInterest() {
    // for all accounts, deposit interest
    for (const account: Account of this.accounts) {
      const interest: number = account.amount * this.savingsInterestRate;
      account.deposit(interest);
    }
    // for all loans, collect interest
    for (const loan: Loan of this.loans) {
      loan.accrueInterest();
    }
  }
}
