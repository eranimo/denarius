import React, { Component } from 'react';


export default class MapViewer extends Component {
  canvas: HTMLCanvasElement;

  componentDidMount() {
    const worldmap = (window as any).worldmap;
    console.log('worldmap', worldmap);
    if (!this.canvas) return;
    const ctx = this.canvas.getContext('2d');
    for (let x = 0; x < 500; x += 5) {
      for (let y = 0; y < 500; y += 5) {
        let i = worldmap.terrain.get(
          Math.floor(x / 5),
          Math.floor(y / 5)
        );
        i = Math.round(i * 15) / 15;
        if (i < 0.4) {
          ctx.fillStyle = 'blue';
        } else {
          ctx.fillStyle = `rgb(${i * 255}, ${i * 255}, ${i * 255})`;
        }
        ctx.fillRect(x, y, x + 5, y + 5);
      }
    }
  }

  render() {
    return (
      <canvas
        ref={ref => {
          this.canvas = ref;
        }}
        width={100 * 5}
        height={100 * 5}
      >
      </canvas>
    )
  }
}
