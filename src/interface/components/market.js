// @flow
import React, { Component, PropTypes } from 'react';
import { Statistic, Table } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { historySelector } from '../selectors';


function currencyFormat(currency: ?number): string {
  if (currency === null || typeof currency === 'undefined') {
    return '';
  }
  return currency.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}


class Market extends Component {

  static propTypes = {
    history: PropTypes.object
  }

  render(): ?Object {
    const history: Object = this.props.history;

    if (!history) return <div>Loading...</div>;

    console.log(history);

    return (
      <div>
        <Statistic.Group>
          <Statistic>
            <Statistic.Value>
              {history.traders.length}
            </Statistic.Value>
            <Statistic.Label>Traders</Statistic.Label>
          </Statistic>
        </Statistic.Group>

        <h1>Traders</h1>
        <Table celled sortable compact>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Trader ID</Table.HeaderCell>
              <Table.HeaderCell>Trader Job</Table.HeaderCell>
              <Table.HeaderCell>Trader Money</Table.HeaderCell>
              <Table.HeaderCell>Trader Profit</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {history.traders.map((trader: Object): Object => {
              return (
                <Table.Row key={trader.id}>
                  <Table.Cell>{trader.id}</Table.Cell>
                  <Table.Cell>{trader.job}</Table.Cell>
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
            {history.goods.map((item: Object): Object => {
              return (
                <Table.Row key={item.good.key}>
                  <Table.Cell>{item.good.displayName}</Table.Cell>
                  <Table.Cell>{currencyFormat(item.meanPrice)}</Table.Cell>
                  <Table.Cell>{currencyFormat(item.demand)}</Table.Cell>
                  <Table.Cell>{currencyFormat(item.supply)}</Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </div>
    );
  }
}
const mapStateToProps: Function = historySelector;
const MarketConnect: Object = connect(mapStateToProps)(Market);

export default MarketConnect;
