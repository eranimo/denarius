# Design
Trading happens each tick.
Payroll happens every 10 ticks.

## Models
- Person
- Organization
- Resource

## Types
- Good
- Job

## Components
Can be applied to any model

- AccountHolder: allows holding money
- InventoryHolder: allows storing inventory
- Producer: can produce goods
  - has an assigned product
- Employee: allows becoming an employee
  - can receive wages
  - can be unemployeed
  - has a job
- Employer: allows having employees
  - can hire employees
  - sends wages to employees
- Trader: allows buying and selling goods
  - has a buy and sell list
  - maintains a mapping between markets and their last known price of each good


## Economy

### Labor
Employers have Employees.

Employees have a _job satisfaction rating_. This is a number from 0 to 10. When this number reaches 0 the employee quits. This number drops by 1 each round that their wage is below market price.

Jobs:
- Merchant (BaseWage: $10)
- Producer (BaseWage: $5)

#### Wages
Each Employee has a wage, which can be a different number for each employee. Wages are calculated every 10 rounds.

#### Labor Market


### Production

### Trading
- models with the _Trader_ component can trade

### Goods
A good has:

- type
- quality

#### Types
Each type has a BaseValue and an optional list of production requirements

- Gold
- Coin (Gold + Iron)
- Wood
- Lumber (Wood)
- Iron Ore
- Iron (Iron)
- Wheat
- Bread (Wheat)
- Tools (Iron + Lumber)

#### Quality
Good quality changes the price and use of the good. Lower quality goods are cheaper but make lower quality products.

Quality with QualityModifier
- Poor (0.9)
- Good (1)
- Excellent (1.1)

### Prices
Prices are different at each market.

#### Base Price

`BasePrice = BaseValue * QualityModifier`

QualityModifier = quality multiplier for good

#### P Function
The P function is the building block of prices, taking into account local supply and demand.

`P = BasePrice * (LocalDemand + DemandFactor * UnitsDemanded) / (LocalSupply + SupplyFactor * UnitsSupplied)`

values per good:
BasePrice = a constant number for each good

values per market:
LocalDemand = sum quantity of goods traders want to buy at this market
LocalSupply = sum quantity of goods traders want to sell at this market
UnitsDemanded = the quantity of goods wanting to be bought by this agent, 0 if none
UnitsSupplied = the quantity of goods wanting to be sold by this agent, 0 if none
DemandFactor = when an agent sells X units of this good this goes up by X, defaults to 1
SupplyFactor = when an agent buys X units of this good this goes up by X, defaults to 1


#### Total Price
The total price of buying x units:
`TotalPrice(x) = LocalSupply * P(UnitsDemanded=LocalSupply) - (LocalSupply - x) * P(UnitsDemanded=LocalSupply - x)`


#### Supply and Demand Factor
SupplyFactor: when a player sells x units of a good in a market, this increases by x
DemandFactor: when a player purchases x units of a good in a market, this increases by x

#### Example
A trader tries to buy 5 units

Initial:
LocalSupply = 10
LocalDemand = 10
BasePrice = 100
DemandFactor = 1
SupplyFactor = 1

Buying 10 unis

P(x) => (x * 100 * (10 + 1 * x) / (10 + 1 * 0))
TotalPrice(x) = P(10) - P(10 - x)
TotalPrice(1) = 290
TotalPrice(5) = $1250

1250 / 5 = $250 unit price
1450 - 1250 = $200 bulk price savings
