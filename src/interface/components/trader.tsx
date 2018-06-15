
import React, { Component } from 'react';
import { Breadcrumb, Table, List } from '@blueprintjs/core';
import { connect } from 'react-redux';
import _ from 'lodash';
import { historySelector, historicalTraderMoneySelector } from '../selectors';
import { MoneyRecord } from '../selectors';
import { currencyFormat } from '../formatters';
import { TraderMoneyChart } from './charts';
import { Link } from 'react-router-dom';


class Trader extends Component < {
    history,
    match,
    historicalMoney: Array<MoneyRecord>
}> {
  renderOrderTable(orders: Array<any>) {
    const sortedOrders: Array<any> = _.sortBy(orders, (i) => i.good.displayName);
    return (
      <Table celled compact>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Order #</Table.HeaderCell>
            <Table.HeaderCell>Good</Table.HeaderCell>
            <Table.HeaderCell>My Unit Price</Table.HeaderCell>
            <Table.HeaderCell>∑ Price</Table.HeaderCell>
            <Table.HeaderCell>Final Unit Price</Table.HeaderCell>
            <Table.HeaderCell>∑ Final Price</Table.HeaderCell>
            <Table.HeaderCell>Order Quantity</Table.HeaderCell>
            <Table.HeaderCell>Quantity Transfered</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sortedOrders.map((order, index: number) => {
            return (
              <Table.Row key={index}>
                <Table.Cell>
                  {index + 1}
                </Table.Cell>
                <Table.Cell>
                  {order.good.displayName}
                </Table.Cell>
                <Table.Cell>
                  {currencyFormat(order.price, 3)}
                </Table.Cell>
                <Table.Cell>
                  {currencyFormat(order.price * order.amount, 3)}
                </Table.Cell>
                <Table.Cell>
                  {currencyFormat(order.finalPrice, 3)}
                </Table.Cell>
                <Table.Cell>
                  {order.finalPrice
                    ? currencyFormat(order.finalPrice * order.amount, 3)
                    : ''}
                </Table.Cell>
                <Table.Cell>
                  {order.amount}
                </Table.Cell>
                <Table.Cell>
                  {order.amountReceived}
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
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
        <Breadcrumb>
          <Link to={'/'}>
            <Breadcrumb.Section link>
              Market
            </Breadcrumb.Section>
          </Link>
          <Breadcrumb.Divider />
          <Breadcrumb.Section active>Trader #{trader.id}</Breadcrumb.Section>
        </Breadcrumb>
        <h1>Trader #{trader.id}</h1>
        <Table definition>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Job</Table.Cell>
              <Table.Cell>{trader.job}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Money</Table.Cell>
              <Table.Cell>{currencyFormat(trader.money)} ({currencyFormat(trader.profitLastRound)})</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Idle Rounds</Table.Cell>
              <Table.Cell>{trader.idleRounds}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Liabilities (loans)</Table.Cell>
              <Table.Cell>{currencyFormat(trader.liabilities)}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Inventory</Table.Cell>
              <Table.Cell>
                <List>
                  {trader.inventory.map((inventory, index: number) => {
                    return (
                      <List.Item key={index}>
                        {inventory.good.displayName} - <b>{inventory.amount}</b>
                      </List.Item>
                    );
                  })}
                </List>
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Last Round</Table.Cell>
              <Table.Cell>
                <List>
                  <List.Item>Worked: <b>{trader.justWorked ? 'Yes' : 'No'}</b></List.Item>
                  <List.Item>Traded: <b>{trader.justTraded ? 'Yes' : 'No'}</b></List.Item>
                </List>
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell># Trades</Table.Cell>
              <Table.Cell>
                <List>
                  <List.Item>Total: <b>{trader.failedTrades + trader.successfulTrades}</b></List.Item>
                  <List.Item>Failed: <b>{trader.failedTrades}</b></List.Item>
                  <List.Item>Success: <b>{trader.successfulTrades}</b></List.Item>
                </List>
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>


        <TraderMoneyChart data={this.props.historicalMoney} />

        <h2>Price Belief</h2>
        <Table celled compact>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Good</Table.HeaderCell>
              <Table.HeaderCell>My Price</Table.HeaderCell>
              <Table.HeaderCell>Low Range</Table.HeaderCell>
              <Table.HeaderCell>High Range</Table.HeaderCell>
              <Table.HeaderCell>Market Price</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {trader.priceBelief.map((belief, index: number) => {
              return (
                <Table.Row key={index}>
                  <Table.Cell>{belief.good.displayName}</Table.Cell>
                  <Table.Cell>{currencyFormat(belief.price, 3)}</Table.Cell>
                  <Table.Cell>{currencyFormat(belief.low, 3)}</Table.Cell>
                  <Table.Cell>{currencyFormat(belief.high, 3)}</Table.Cell>
                  <Table.Cell>{currencyFormat(history.goodPrices.get(belief.good).meanPrice)}</Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>

        <h2>Orders</h2>
        <h3>Buy</h3>
        {this.renderOrderTable(trader.thisRoundOrders.buy)}
        <h3>Sell</h3>
        {this.renderOrderTable(trader.thisRoundOrders.sell)}
      </div>
    );
  }
}

const mapStateToProps: Function = (state, props) => {
  return {
    ...historySelector(state),
    historicalMoney: historicalTraderMoneySelector(props.match.params.id, 30)(state)
  };
};
const TraderConnect = connect(mapStateToProps)(Trader);

export default TraderConnect;
