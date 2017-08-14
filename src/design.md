# Denarius Simulation Design

## Relationships

links:
```
has
is
contains
contains
```

quantifiers:
```
a
many
```


```
def: Good
def: Job  # Producer roles
def: Person
def: Market
def: Company
def: Product  # a Good being sold by a Company
def: Bank
def: Account
def: Inventory


Market has many Person
Market has a Bank

link: "belongs to" from Person to Bank
Person belongs to a Bank


link: "works at" from Person to Company
Person has a Inventory
Person has a Account

def: Trader is a Person
def: Producer is a Trader
def: Dealer is a Trader

Company has many Product
Trader works at a Company
Producer works at a Company

link: "trades at" from Trader to Market
Trader trades at Market

```

─── Person
    ├── Trader
    │   ├── Producer
    │   ├── Agent
    │   └── Marketer
    └── Slave





# GoodList

in the form Map<String, Map<Good, number>>

e.g.
```javascript
const goodList = new GoodList();

goodList.create('Life Goods', [
  [GOODS.bread, 1],
], {
  onFailure: {

  }
});

goodList.create('work', [
  [GOODS.iron, 1]
]);

```


# JobMarket
a variant of the Market class
trades in jobs
buy orders = job postings
sell orders = job applications

## Pricing Jobs

### Considerations

1. must at least cover cost of living expenses (currently 1 bread every round)
2. must have a small amount of disposable income

### Price belief mechanics

If a job posting is a success, price belief converges on that price
If a job posting is a failure, price belief diverges and moves towards market price












## New Design

```
def: Person
def: Market
def: Company

Company has many Person
Market has many Person

Person has a Job (called job)
Person can work for a Company (called employee / employer)
```
