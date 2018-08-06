import React, { Component } from 'react';
import MapViewer from './MapViewer';
import { Tabs, Tab } from '@blueprintjs/core';
import { ISimRuntime } from '../../worldgen/types';


document.body.classList.add('pt-dark');

export default class App extends Component<{
  runtime: ISimRuntime,
}> {
  state = {
    currentTick: 0,
    maxTick: 0,
  };

  render() {
    return (
      <div>
        <div>
          Current Tick: {this.state.currentTick} / {this.state.maxTick}
        </div>
        <button
          onClick={() => {
            this.props.runtime.processTick()
              .then((() => {
                this.setState({
                  maxTick: (window as any).worldmap.maxTick,
                  currentTick: this.state.currentTick + 1
                });
              }));
          }}
        >
          +
        </button>
        <Tabs id="mapViewerTabs">
          <Tab
            id="terrain"
            title="Terrain"
            panel={(
              <MapViewer
                mapName="terrain"
                currentTick={this.state.currentTick}
                drawFunc={(value: number) => {
                  const TERRACE_COUNT = 40;
                  const newValue = Math.round(value * TERRACE_COUNT) / TERRACE_COUNT;
                  if (newValue < 0.4) {
                    return [0, 0, (newValue + 0.4) * 255];
                  } else {
                    return [newValue * 255, newValue * 255, newValue * 255];
                  }
                }}
              />
            )}
          />
          <Tab
            id="waterFill"
            title="Water Fill"
            panel={(
              <MapViewer
                mapName="waterFill"
                currentTick={this.state.currentTick}
                isTick
                drawFunc={(value: number) => {
                  return [0, 0, (value) * 255];
                }}
              />
            )}
          />
          <Tab
            id="waterFlow"
            title="Water Flow"
            panel={(
              <MapViewer
                mapName="waterFlow"
                currentTick={this.state.currentTick}
                isTick
                drawFunc={(value: number) => {
                  if (value === 0) {
                    return [255, 255, 255];
                  }
                  return [0, 0, value * 255];
                  // if (value > 0.99) {
                  //   return [255, 0, 0];
                  // }
                  // return [0, 0, 255];
                }}
              />
            )}
          />
        </Tabs>
      </div>
    )
  }
}
