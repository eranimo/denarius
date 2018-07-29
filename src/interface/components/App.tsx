import React, { Component } from 'react';
import MapViewer from './MapViewer';
import { Tabs, Tab } from '@blueprintjs/core';


document.body.classList.add('pt-dark');

export default class App extends Component {
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
                drawFunc={(value: number) => {
                  return [0, 0, (value) * 255];
                }}
              />
            )}
          />
        </Tabs>
      </div>
    )
  }
}
