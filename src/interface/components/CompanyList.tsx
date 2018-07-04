import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Good } from '../../simulation/goods';
import History from '../../simulation/history';
import { historySelector, historicalGoodPriceSelector } from '../selectors';
import { GoodPriceRecord } from '../selectors';
import { RootState } from '../types';
import Trend from './Trend';
import { currencyFormat } from '../formatters';


class CompanyList extends Component<{
  history: History,
  historicalGoodPrices: Map<Good, Array<GoodPriceRecord>>,
}> {
  render() {
    const { history } = this.props;

    if (!history) return <div>Loading...</div>;

    return (
      <table className="pt-html-table pt-html-table-bordered">
        <thead>
          <tr>
            <th>Company ID</th>
            <th>Reserves</th>
            <th>Product</th>
            <th>Producers</th>
            <th>Merchants</th>
          </tr>
        </thead>
        <tbody>
          {history.companies.map(company => (
            <tr key={company.id}>
              <td>{company.id}</td>
              <td>
                <Trend
                  value={company.account.amount}
                  delta={company.profitLastRound}
                  format={currencyFormat}
                />
              </td>
              <td>{company.products.map(product => product.good.displayName).join(', ')}</td>
              <td>{company.producers.length}</td>
              <td>{company.merchants.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  return {
    ...historySelector(state),
    historicalGoodPrices: historicalGoodPriceSelector(30)(state)
  };
};
const CompanyListConnect = connect(mapStateToProps)(CompanyList);

export default CompanyListConnect;
