import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Good } from '../../simulation/goods';
import History from '../../simulation/history';
import { historySelector, historicalGoodPriceSelector } from '../selectors';
import { GoodPriceRecord } from '../selectors';
import { GoodPriceChart } from './charts';
import { currencyFormat, numberFormat } from '../formatters';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { RootState } from '../types';
import {
  Tabs,
  Tab,
} from '@blueprintjs/core';
import Trend from './trend';


class Market extends Component<{
  history: History,
  historicalGoodPrices: Map<Good, Array<GoodPriceRecord>>
}> {

  renderTraders() {
    const history = this.props.history;
    return (
      <table className="bp3-html-table bp3-small bp3-html-table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Kind</th>
            <th>Account Ratio</th>
            <th># Loans</th>
            <th>Money</th>
            <th>Profit</th>
          </tr>
        </thead>

        <tbody>
          {history.traders.map((trader) => {
            return (
              <tr key={`${trader.kind}-${trader.id}`}>
                <td>
                  <Link to={`/trader/${trader.id}`}>
                    {trader.id}
                  </Link>
                </td>
                <td>{trader.kind}</td>
                <td>{_.round(trader.accountRatio || 0, 2)}</td>
                <td>
                  {trader.loans.length > 0
                    ? <div>
                      {trader.loans.map((loan, index: number) => {
                        return (
                          <div key={index}>
                            {currencyFormat(loan.balance)} @ {loan.interestRate} ({loan.repayments} payments)
                              </div>
                        );
                      })}
                    </div>
                    : 'None'}
                </td>
                <td>{currencyFormat(trader.money)}</td>
                <td>
                  <Trend
                    value={trader.money}
                    delta={trader.profitLastRound}
                    format={currencyFormat}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  renderPrices() {
    const history = this.props.history;
    const historicalGoodPrices: Map<Good, Array<GoodPriceRecord>> = this.props.historicalGoodPrices;

    return (
      <div>
        <table className="bp3-html-table bp3-small bp3-html-table-striped">
          <thead>
            <tr>
              <th>Good</th>
              <th>Mean Price</th>
              <th>Demand</th>
              <th>Supply</th>
            </tr>
          </thead>

          <tbody>
            {Array.from(history.market.goodPrices.entries()).map(([good, item]: [Good, any]) => {
              return (
                <tr key={good.key}>
                  <td>{good.displayName}</td>
                  <td>
                    <Trend
                      value={item.meanPrice}
                      delta={item.priceChange}
                      format={currencyFormat}
                    />
                  </td>
                  <td>
                    <Trend
                      value={item.demand}
                      delta={item.demandChange}
                      format={numberFormat}
                    />
                  </td>
                  <td>
                    <Trend
                      value={item.supply}
                      delta={item.supplyChange}
                      format={numberFormat}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {Array.from(history.market.goodPrices.entries()).map(([good]) => {
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

  render() {
    const history = this.props.history;

    if (!history) return <div>Loading...</div>;

    console.log(history);

    return (
      <div>
        <table className="bp3-html-table stats-table">
          <thead>
            <tr>
              <th>Number of Traders</th>
              <th>Most Profitable Good</th>
              <th>Most Demanded Good</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{history.market.numTraders}</td>
              <td>
                {history.market.mostProfitableGood
                  ? history.market.mostProfitableGood.displayName
                  : 'None'}
              </td>
              <td>{history.market.mostDemandedGood
                  ? history.market.mostDemandedGood.displayName
                  : 'None'}
              </td>
            </tr>
          </tbody>
        </table>
        {/*
        <h2>Bank</h2>
        <Statistic.Group>
          {<Statistic.Item>
            <Statistic.Value>
              {currencyFormat(history.bank.capital)}
            </Statistic.Value>
            <Statistic.Label>Bank Capital</Statistic.Label>
          </Statistic.Item>}
          {<Statistic.Item>
            <Statistic.Value>
              {currencyFormat(history.bank.totalDeposits)}
            </Statistic.Value>
            <Statistic.Label>Bank Total Deposits</Statistic.Label>
          </Statistic.Item>}
          {<Statistic.Item>
            <Statistic.Value>
              {currencyFormat(history.bank.liabilities)}
            </Statistic.Value>
            <Statistic.Label>Bank Liabilities</Statistic.Label>
          </Statistic.Item>}
        </Statistic.Group> */}

        <Tabs id="market-tabs" large>
          <Tab id="traders" title="Traders" panel={this.renderTraders()} />
          <Tab id="prices" title="Prices" panel={this.renderPrices()} />
        </Tabs>
      </div>
    );
  }
}
const mapStateToProps = (state: RootState) => {
  return {
    ...historySelector(state),
    historicalGoodPrices: historicalGoodPriceSelector(30)(state)
  };
};
const MarketConnect = connect(mapStateToProps)(Market);

export default MarketConnect;
