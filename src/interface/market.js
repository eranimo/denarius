// @flow
import React, { Component, PropTypes } from 'react';
import { Statistic, Table } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { historySelector } from './selectors';

class Market extends Component {

  static propTypes = {
    history: PropTypes.object
  }

  render(): ?Object {
    const history: Object = this.props.history;

    if (!history) return <div>Loading...</div>;
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
                  <Table.Cell content={trader.money} />
                  <Table.Cell content={trader.profitLastRound} />
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