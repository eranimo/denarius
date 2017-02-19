# Denarius

A JavaScript agent-based economic simulation.

## Simulation

- A Market has a fixed number of Traders
- Traders have Jobs
- Traders have money (and start with an initial amount)
- Traders have Goods (called Inventory)
- Jobs are functions over Inventory: they add and subtract Goods
- A Market has buy and sell Orders created by agents
- A Order can be accepted or denied (which means it didn't go through)
- Agents have a price belief reinforced by the their accepted Orders
  - price belief is a range of two prices where the price can be anywhere between

Each round the following happens:

```
For each Market:
  For each Trader:
    Work: perform job to get new resources (and consume existing resources)
    Trade: create new buy orders to get required goods
           create new sell orders to get rid of produced goods
  For each trade:
    sort buy orders from highest to lowest price
    sort sell orders from lowest to highest price
    match buy_orders[0] with sell_orders[0] until one list is empty
    throw out (deny) all other orders

  For each Trader that traded this round:
    update price belief for all goods traded
      - if trader successfully traded this good: narrow price belief around that price
      - if trader failed to trade this good: expand price belief towards average price

  For all agents without funds:
    check for new jobs
    reset money

```

## Running

1. Run `yarn install` to install dependencies
2. Run `npm build` to build or `npm start` to run the development server.
3. Visit `localhost:8080` to see the simulation
