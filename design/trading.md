### Prices
https://gamedev.stackexchange.com/questions/52927/simulated-economic-factors-based-on-supply-and-demand-in-mmo-resource-trading-ga

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
