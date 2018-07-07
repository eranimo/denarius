# Labor
- Employers have Employees.
- Employees have a _job satisfaction rating_.
  - This is a number from 0 to 10.
  - When this number reaches 0 the employee quits.
  - This number drops by 1 each day that their wage is below market price.

## Wages
- Each Employee has a wage, which can be a different number for each employee.
- Wages are re-calculated first of month.

## Labor Market

*Classes:*
- JobMarket
  - contains a list of JobOpenings
- JobOpening
  - multiple markets
  - contains a list of JobApplication

### Gaining employment
When an employee is unemployed they take the following steps:
1. Look at the LaborMarket for Job Openings, if there aren't any then stop
    - Filter them by those they meet the requirements for, then rank them by:
      - Higher paying first
2. Employee creates JobApplication for every job opening that meets their criteria

### Filling job openings
1. Employer decides it has a job vacancy
2. Employer creates a JobOpening
  - decides job type (e.g. Iron worker)
    - based on vacancy
  - decides skill and attribute weights
    e.g. if we produce iron, we care about Strength and Stmaina attribute as well as Smelting skill level
  - decides pay
2. Employer posts in all JobMarkets their JobOpening


#### Deciding pay
`BasePay = LifeNeedsCost + (LifeNeedsCost * FlexiblePayRate)`
  - LifeNeedsCost = total cost of all life needs at this market
  - FlexiblePayRate = percent over LifeNeedsCost to pay the Employee, for now 10%

`Pay = BasePay * (LaborDemand) / (LaborSupply)`
  - LaborDemand = number of job openings for this job type
  - LaborSupply = number of job applicants for this job type
