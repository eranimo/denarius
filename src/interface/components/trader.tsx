
import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { historySelector, historicalTraderMoneySelector } from '../selectors';
import { MoneyRecord } from '../selectors';
import { currencyFormat } from '../formatters';
import { TraderMoneyChart } from './charts';
import { Link } from 'react-router-dom';


class Trader extends Component<{
  history,
  match,
  historicalMoney: Array<MoneyRecord>
}> {
  renderOrderTable(orders: Array<any>) {
    const sortedOrders: Array<any> = _.sortBy(orders, (i) => i.good.displayName);
    return (
      <table className="pt-html-table pt-small pt-html-table-striped">
        <thead>
          <tr>
            <th>Order #</th>
            <th>Good</th>
            <th>My Unit Price</th>
            <th>∑ Price</th>
            <th>Final Unit Price</th>
            <th>∑ Final Price</th>
            <th>Order Quantity</th>
            <th>Quantity Transfered</th>
          </tr>
        </thead>
        <tbody>
          {sortedOrders.map((order, index: number) => {
            return (
              <tr key={index}>
                <td>
                  {index + 1}
                </td>
                <td>
                  {order.good.displayName}
                </td>
                <td>
                  {currencyFormat(order.price, 3)}
                </td>
                <td>
                  {currencyFormat(order.price * order.amount, 3)}
                </td>
                <td>
                  {currencyFormat(order.finalPrice, 3)}
                </td>
                <td>
                  {order.finalPrice
                    ? currencyFormat(order.finalPrice * order.amount, 3)
                    : ''}
                </td>
                <td>
                  {order.amount}
                </td>
                <td>
                  {order.amountReceived}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  render() {
    const history = this.props.history;


    if (!history) return <div>Loading...</div>;
    const id: number = parseInt(this.props.match.params.id, 10);
    const trader = _.find(history.traders, ['id', id]);

    console.log(trader);
    console.log(this.props.historicalMoney);

    if (!trader) {
      return (
        <div>
          <h1>Trader Not Found</h1>
        </div>
      );
    }

    return (
      <div>
        <ul className="pt-breadcrumbs">
          <li className="pt-breadcrumb">
            <Link to={'/'}>
              Market
            </Link>
          </li>
          <li className="pt-breadcrumb pt-breadcrumb-current">
            <span>Trader #{trader.id}</span>
          </li>
        </ul>
        <h1>Trader #{trader.id}</h1>
        <table className="pt-html-table pt-small pt-html-table-striped">
          <tbody>
            <tr>
              <td>Job</td>
              <td>{trader.job}</td>
            </tr>
            <tr>
              <td>Money</td>
              <td>{currencyFormat(trader.money)} ({currencyFormat(trader.profitLastRound)})</td>
            </tr>
            <tr>
              <td>Idle Rounds</td>
              <td>{trader.idleRounds}</td>
            </tr>
            <tr>
              <td>Liabilities (loans)</td>
              <td>{currencyFormat(trader.liabilities)}</td>
            </tr>
            <tr>
              <td>Inventory</td>
              <td>
                <table className="pt-html-table pt-html-table-bordered">
                  {trader.inventory.map((inventory, index: number) => {
                    return (
                      <tr key={index}>
                        <td>{inventory.good.displayName}</td>
                        <td>{inventory.amount}</td>
                      </tr>
                    );
                  })}
                </table>
              </td>
            </tr>
            <tr>
              <td>Last Round</td>
              <td>
                Worked: <b>{trader.justWorked ? 'Yes' : 'No'}</b><br />
                Traded: <b>{trader.justTraded ? 'Yes' : 'No'}</b>
              </td>
            </tr>
            <tr>
              <td># Trades</td>
              <td>
                Total: <b>{trader.failedTrades + trader.successfulTrades}</b><br />
                Failed: <b>{trader.failedTrades}</b><br />
                Success: <b>{trader.successfulTrades}</b>
              </td>
            </tr>
          </tbody>
        </table>


        <TraderMoneyChart data={this.props.historicalMoney} />

        <h2>Price Belief</h2>
        <table className="pt-html-table pt-small pt-html-table-striped">
          <thead>
            <tr>
              <th>Good</th>
              <th>My Price</th>
              <th>Low Range</th>
              <th>High Range</th>
              <th>Market Price</th>
            </tr>
          </thead>
          <tbody>
            {trader.priceBelief.map((belief, index: number) => {
              return (
                <tr key={index}>
                  <td>{belief.good.displayName}</td>
                  <td>{currencyFormat(belief.price)}</td>
                  <td>{currencyFormat(belief.low, 3)}</td>
                  <td>{currencyFormat(belief.high, 3)}</td>
                  <td>{currencyFormat(history.goodPrices.get(belief.good).meanPrice)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <h2>Orders</h2>
        <h3>Buy</h3>
        {this.renderOrderTable(trader.thisRoundOrders.buy)}
        <h3>Sell</h3>
        {this.renderOrderTable(trader.thisRoundOrders.sell)}
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    ...historySelector(state),
    historicalMoney: historicalTraderMoneySelector(props.match.params.id, 30)(state)
  };
};
const TraderConnect = connect(mapStateToProps)(Trader);

export default TraderConnect;
