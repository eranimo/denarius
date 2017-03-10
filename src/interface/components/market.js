// @flow
import React, { Component } from 'react';
import { Statistic, Table } from 'semantic-ui-react';
import { connect } from 'react-redux';
import type { Good } from '../simulation/goods';
import { historySelector, historicalGoodPriceSelector } from '../selectors';
import type { GoodPriceRecord } from '../selectors';
import { GoodPriceChart } from './charts';
import { currencyFormat } from '../formatters';
import _ from 'lodash';
import { Link } from 'react-router-dom';


type props = {
  history: Object,
  historicalGoodPrices: Map<Good, Array<GoodPriceRecord>>
}

class Market extends Component {

  props: props;

  render(): ?Object {
    const history: Object = this.props.history;
    const historicalGoodPrices: Map<Good, Array<GoodPriceRecord>> = this.props.historicalGoodPrices;

    if (!history) return <div>Loading...</div>;

    console.log(history);

    return (
      <div>
        <Statistic.Group size="small">
          <Statistic>
            <Statistic.Value>
              {history.traders.length}
            </Statistic.Value>
            <Statistic.Label>Traders</Statistic.Label>
          </Statistic>
          {history.mostProfitableJob && <Statistic>
            <Statistic.Value>
              {history.mostProfitableJob.displayName}
            </Statistic.Value>
            <Statistic.Label>Most Profitable Job</Statistic.Label>
          </Statistic>}
          {history.mostDemandedGood && <Statistic>
            <Statistic.Value>
              {history.mostDemandedGood.displayName}
            </Statistic.Value>
            <Statistic.Label>Most Demanded Good</Statistic.Label>
          </Statistic>}
        </Statistic.Group>

        <Statistic.Group size="small">
          {<Statistic>
            <Statistic.Value>
              {currencyFormat(history.bank.capital)}
            </Statistic.Value>
            <Statistic.Label>Bank Capital</Statistic.Label>
          </Statistic>}
          {<Statistic>
            <Statistic.Value>
              {currencyFormat(history.bank.totalDeposits)}
            </Statistic.Value>
            <Statistic.Label>Bank Total Deposits</Statistic.Label>
          </Statistic>}
          {<Statistic>
            <Statistic.Value>
              {currencyFormat(history.bank.liabilities)}
            </Statistic.Value>
            <Statistic.Label>Bank Liabilities</Statistic.Label>
          </Statistic>}
        </Statistic.Group>


        <h1>Traders</h1>
        <Table celled sortable compact>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>ID</Table.HeaderCell>
              <Table.HeaderCell>Job</Table.HeaderCell>
              <Table.HeaderCell># Bankrupt</Table.HeaderCell>
              <Table.HeaderCell>Account Ratio</Table.HeaderCell>
              <Table.HeaderCell># Loans</Table.HeaderCell>
              <Table.HeaderCell>Money</Table.HeaderCell>
              <Table.HeaderCell>Profit</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {history.traders.map((trader: Object): Object => {
              return (
                <Table.Row key={trader.id}>
                  <Table.Cell>
                    <Link to={`/trader/${trader.id}`}>
                      {trader.id}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>{trader.job}</Table.Cell>
                  <Table.Cell>{trader.bankruptTimes}</Table.Cell>
                  <Table.Cell>{_.round(trader.accountRatio, 2)}</Table.Cell>
                  <Table.Cell>
                    {trader.loans.length > 0
                      ? <div>
                          {trader.loans.map((loan: Object, index: number): Object => {
                            return (
                              <div key={index}>
                                {currencyFormat(loan.balance)} @ {loan.interestRate} ({loan.repayments} payments)
                              </div>
                            );
                          })}
                        </div>
                      : 'None'}
                  </Table.Cell>
                  <Table.Cell content={currencyFormat(trader.money)} />
                  <Table.Cell content={currencyFormat(trader.profitLastRound)} />
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>

        <h1>Goods</h1>

        <Table celled sortable compact>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Good</Table.HeaderCell>
              <Table.HeaderCell>Mean Price</Table.HeaderCell>
              <Table.HeaderCell>Demand (buy orders)</Table.HeaderCell>
              <Table.HeaderCell>Supply (sell orders)</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {Array.from(history.goodPrices.entries()).map(([good, item]: [Good, Object]): Object => {
              return (
                <Table.Row key={good.key}>
                  <Table.Cell>{good.displayName}</Table.Cell>
                  <Table.Cell>{currencyFormat(item.meanPrice)}</Table.Cell>
                  <Table.Cell>{item.demand}</Table.Cell>
                  <Table.Cell>{item.supply}</Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>

        {Array.from(history.goodPrices.entries()).map(([good]: [Good]): Object => {
          return (
            <GoodPriceChart
              key={good.key}
              good={good}
              data={historicalGoodPrices ? historicalGoodPrices.get(good) : []}
            />
          );
        })}
      </div>
    );
  }
}
const mapStateToProps: Function = (state: Object): Object => {
  return {
    ...historySelector(state),
    historicalGoodPrices: historicalGoodPriceSelector(30)(state)
  };
};
const MarketConnect: Object = connect(mapStateToProps)(Market);

export default MarketConnect;
