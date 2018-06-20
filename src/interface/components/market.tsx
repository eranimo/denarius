
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Good } from '../../simulation/goods';
import History from '../../simulation/history';
import { historySelector, historicalGoodPriceSelector } from '../selectors';
import { GoodPriceRecord } from '../selectors';
import { GoodPriceChart } from './charts';
import { currencyFormat } from '../formatters';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { RootState } from '../types';


namespace Statistic {
  export const Item = ({ children }) => <div className="statistic-item">{children}</div>
  export const Group = ({ children }) => <div className="statistic-group">{children}</div>
  export const Value = ({ children }) => <div className="statistic-value">{children}</div>
  export const Label = ({ children }) => <div className="statistic-label">{children}</div>
}

class Market extends Component<{
  history: History,
  historicalGoodPrices: Map<Good, Array<GoodPriceRecord>>
}> {

  render() {
    const history = this.props.history;
    const historicalGoodPrices: Map<Good, Array<GoodPriceRecord>> = this.props.historicalGoodPrices;

    if (!history) return <div>Loading...</div>;

    console.log(history);

    return (
      <div>
        <Statistic.Group>
          <Statistic.Item>
            <Statistic.Value>
              {history.market.numTraders}
            </Statistic.Value>
            <Statistic.Label>Traders</Statistic.Label>
          </Statistic.Item>
          {history.market.mostProfitableGood && <Statistic.Item>
            <Statistic.Value>
              {history.market.mostProfitableGood.displayName}
            </Statistic.Value>
            <Statistic.Label>Most Profitable Good</Statistic.Label>
          </Statistic.Item>}
          {history.market.mostDemandedGood && <Statistic.Item>
            <Statistic.Value>
              {history.market.mostDemandedGood.displayName}
            </Statistic.Value>
            <Statistic.Label>Most Demanded Good</Statistic.Label>
          </Statistic.Item>}
        </Statistic.Group>

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
        </Statistic.Group>


        <h1>Traders</h1>
        <table className="pt-html-table pt-small pt-html-table-striped">
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
                  <td>{currencyFormat(trader.profitLastRound)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <h1>Goods</h1>

        <table className="pt-html-table pt-small pt-html-table-striped">
          <thead>
            <tr>
              <th>Good</th>
              <th>Mean Price</th>
              <th>Demand (buy orders)</th>
              <th>Supply (sell orders)</th>
            </tr>
          </thead>

          <tbody>
            {Array.from(history.market.goodPrices.entries()).map(([good, item]: [Good, any]) => {
              return (
                <tr key={good.key}>
                  <td>{good.displayName}</td>
                  <td>{currencyFormat(item.meanPrice)}</td>
                  <td>{item.demand}</td>
                  <td>{item.supply}</td>
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
}
const mapStateToProps = (state: RootState) => {
  return {
    ...historySelector(state),
    historicalGoodPrices: historicalGoodPriceSelector(30)(state)
  };
};
const MarketConnect = connect(mapStateToProps)(Market);

export default MarketConnect;
