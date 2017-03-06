// @flow
import React, { Component } from 'react';
import type { Good } from '../../simulation/goods';
import type { GoodPriceRecord } from '../selectors';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { currencyFormat } from '../formatters';


type Props = {
  good: Good,
  data: Array<GoodPriceRecord>
};

export default class GoodPriceChart extends Component {

  props: Props;

  render(): Object {
    const { good, data }: { good: Object, data: Array<GoodPriceRecord> } = this.props;

    console.log(data);

    return (
      <div>
        <h2>{good.displayName}</h2>
        <LineChart
          width={500}
          height={300}
          data={data}
          margin={{top: 20, right: 60, left: 20, bottom: 5}}>
          <XAxis label="Round" dataKey="round" />
          <YAxis label="Mean Price" tickFormatter={currencyFormat} />
          <CartesianGrid strokeDasharray="3 3"/>
          <Tooltip
            formatter={currencyFormat}
            labelFormatter={(label: string): string => `Round #${label}`}
          />
          <Legend />
          <Line name="Mean Price" type="monotone" dataKey="meanPrice" stroke={good.color} activeDot={{r: 5}}/>
        </LineChart>
      </div>
    );
  }
}
