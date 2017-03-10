// @flow
import React, { Component } from 'react';
import type { Good } from '../../simulation/goods';
import type { GoodPriceRecord, MoneyRecord } from '../selectors';
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


type GoodPriceChartProps = {
  good: Good,
  data: Array<GoodPriceRecord>
};

export class GoodPriceChart extends Component {

  props: GoodPriceChartProps;

  render(): Object {
    const { good, data }: { good: Object, data: Array<GoodPriceRecord> } = this.props;

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

type TraderMoneyChartProps = {
  data: Array<MoneyRecord>
};

export class TraderMoneyChart extends Component {
  props: TraderMoneyChartProps;

  render(): Object {
    const { data }: { data: Array<MoneyRecord> } = this.props;

    return (
      <div>
        <LineChart
          width={500}
          height={300}
          data={data}
          margin={{top: 20, right: 60, left: 20, bottom: 5}}>
          <XAxis label="Round" dataKey="round" />
          <YAxis label="Money" tickFormatter={currencyFormat} />
          <CartesianGrid strokeDasharray="3 3"/>
          <Tooltip
            formatter={currencyFormat}
            labelFormatter={(label: string): string => `Round #${label}`}
          />
          <Legend />
          <Line name="Money" type="monotone" dataKey="money" stroke={'#333'} activeDot={{r: 5}}/>
        </LineChart>
      </div>
    );
  }
}
