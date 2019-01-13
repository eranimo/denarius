import React, { Component } from 'react';
import MapViewer from './MapViewer';
import { Tabs, Tab } from '@blueprintjs/core';
import { ISimRuntime } from '../../worldgen/types';


document.body.classList.add('bp3-dark');

export default class App extends Component<{
  runtime: ISimRuntime,
}> {

  render() {
    return (
      <div>
        <Tabs id="mapViewerTabs">
          <Tab
            id="terrain"
            title="Terrain"
            panel={(
              <MapViewer
                mapName="terrain"
                drawFunc={(value: number) => {
                  const TERRACE_COUNT = 40;
                  const newValue = Math.round(value * TERRACE_COUNT) / TERRACE_COUNT;
                  if (newValue < 0.4) {
                    return [0, 0, (newValue + 0.4) * 255];
                  }
                  return [newValue * 255, newValue * 255, newValue * 255];
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
                drawFunc={(value: number) => {
                  if (value === 0) {
                    return [255, 255, 255];
                  }
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
