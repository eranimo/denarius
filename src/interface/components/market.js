// @flow
import React, { Component } from 'react';
import { Statistic, Table } from 'semantic-ui-react';
import { connect } from 'react-redux';
import type { Good } from '../simulation/goods';
import { historySelector, historicalGoodPriceSelector } from '../selectors';
import type { GoodPriceRecord } from '../selectors';
import GoodPriceChart from './goodPriceChart';
import { currencyFormat } from '../formatters';


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
            {Array.from(history.goodPrices.entries()).map(([good, item]: [Good, Object]): Object => {
              return (
                <Table.Row key={good.key}>
                  <Table.Cell>{good.displayName}</Table.Cell>
                  <Table.Cell>{currencyFormat(item.meanPrice)}</Table.Cell>
                  <Table.Cell>{currencyFormat(item.demand)}</Table.Cell>
                  <Table.Cell>{currencyFormat(item.supply)}</Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>

        {Array.from(history.goodPrices.entries()).map(([good]: [Good]): Object => {
          console.log(historicalGoodPrices);
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
