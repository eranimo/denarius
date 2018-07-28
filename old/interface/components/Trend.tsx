import React, { Component } from 'react';
import {
  Icon,
  Colors,
} from '@blueprintjs/core';


export default class Trend extends Component<{
  value: number;
  delta: number;
  format?: (value: number) => string;
}> {
  render() {
    const { value, delta, format } = this.props;

    let trendIcon;
    let trendColor;
    if (delta > 0) {
      trendIcon = 'trending-up';
      trendColor = Colors.FOREST5;
    } else if (delta < 0) {
      trendIcon = 'trending-down';
      trendColor = Colors.RED5;
    } else {
      trendIcon = 'minus';
      trendColor = Colors.GRAY5;
    }

    let numberColor;
    if (value < 0) {
      numberColor = Colors.RED5;
    } else {
      numberColor = 'inherit';
    }

    return (
      <span>
        <span style={{ color: numberColor }}>
          {format ? format(value) : value}
        </span>
        <Icon
          icon={trendIcon}
          color={trendColor}
          style={{ margin: '0 0.5rem' }}
        />
        <span style={{ color: trendColor }}>
          {delta >= 0 ? '+' : ''}{format ? format(delta) : delta}
        </span>
      </span>
    );
  }
}
