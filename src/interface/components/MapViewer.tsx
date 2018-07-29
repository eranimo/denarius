import React, { Component } from 'react';

const CELL_SIZE = 3;

interface IMapViewerProps {
  mapName: string;
  drawFunc(value: number): [number, number, number]
}

export default class MapViewer extends Component<IMapViewerProps> {
  canvas: HTMLCanvasElement;

  componentDidMount() {
    const worldmap = (window as any).worldmap;
    if (!this.canvas) return;
    const ctx = this.canvas.getContext('2d');
    const width = worldmap[this.props.mapName].shape[0];
    const height = worldmap[this.props.mapName].shape[1];
    this.canvas.width = width * CELL_SIZE;
    this.canvas.height = height * CELL_SIZE;
    for (let x = 0; x < width * CELL_SIZE; x += CELL_SIZE) {
      for (let y = 0; y < height * CELL_SIZE; y += CELL_SIZE) {
        let i = worldmap[this.props.mapName].get(
          Math.floor(x / CELL_SIZE),
          Math.floor(y / CELL_SIZE)
        );

        const color = this.props.drawFunc(i);
        ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
        ctx.fillRect(x, y, x + CELL_SIZE, y + CELL_SIZE);
      }
    }
  }

  render() {
    return (
      <canvas
        ref={ref => {
          this.canvas = ref;
        }}
      >
      </canvas>
    )
  }
}
