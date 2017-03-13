// @flow
import React, { Component } from 'react';
import { Breadcrumb, Table, List } from 'semantic-ui-react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { historySelector, historicalTraderMoneySelector } from '../selectors';
import type { MoneyRecord } from '../selectors';
import { currencyFormat } from '../formatters';
import { TraderMoneyChart } from './charts';
import { Link } from 'react-router-dom';


type props = {
  history: Object,
  match: Object,
  historicalMoney: Array<MoneyRecord>
}

class Trader extends Component {

  props: props;

  render(): ?Object {
    const history: Object = this.props.history;


    if (!history) return <div>Loading...</div>;
    const id: number = parseInt(this.props.match.params.id, 10);
    const trader: Object = _.find(history.traders, ['id', id]);

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
              <Table.Cell>Liabilities (loans)</Table.Cell>
              <Table.Cell>{currencyFormat(trader.liabilities)}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Inventory</Table.Cell>
              <Table.Cell>
                <List>
                  {trader.inventory.map((inventory: Object, index: number): Object => {
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
                Worked: {trader.justWorked ? 'Yes' : 'No'} Traded: {trader.justTraded ? 'Yes' : 'No'}
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>


        <TraderMoneyChart data={this.props.historicalMoney} />
      </div>
    );
  }
}

const mapStateToProps: Function = (state: Object, props: Object): Object => {
  return {
    ...historySelector(state),
    historicalMoney: historicalTraderMoneySelector(props.match.params.id, 30)(state)
  };
};
const TraderConnect: Object = connect(mapStateToProps)(Trader);

export default TraderConnect;
