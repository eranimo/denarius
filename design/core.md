# Time System
1 tick = 1 day
30 days = 1 month
12 months = 1 year

# Architecture

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
  - has a set of attributes
- Employer: allows having employees
  - can hire employees
  - sends wages to employees
- Trader: allows buying and selling goods
  - has a buy and sell list
  - maintains a mapping between markets and their last known price of each good
- PropertyOwner: can own property
