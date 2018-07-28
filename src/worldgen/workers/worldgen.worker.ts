import ndarray from 'ndarray';
import { IWorldMap, IGenOptions } from '../types';
import Alea from 'alea';
import SimplexNoise from 'simplex-noise';
import fill from 'ndarray-fill';


let terrain: ndarray;

export async function init(options: IGenOptions): Promise<IWorldMap> {
  terrain = ndarray(new Float32Array(options.size.width * options.size.height), [options.size.width, options.size.height]);
  const rng = new Alea(options.seed);
  const simplex = new SimplexNoise(rng);
  const noise = (nx, ny) => simplex.noise2D(nx, ny);
  const centerX = Math.floor(options.size.width / 2);
  const centerY = Math.floor(options.size.height / 2);
  const maxDistanceToCenter = 2 * Math.sqrt(Math.pow(options.size.width, 2) + Math.pow(options.size.width, 2));

  fill(terrain, (x, y) => {
    // use simplex noise to create random terrain
    const nx = x / options.size.width - 0.5;
    const ny = y / options.size.height - 0.5;
    let value = (
      0.70 * noise(3 * nx, 3 * ny) +
      0.20 * noise(5 * nx, 5 * ny) +
      0.10 * noise(7 * nx, 7 * ny)
    );
    value = (value + 1) / 2;

    // decrease the height of cells farther away from the center to create an island
    const d = (2 * Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)) / maxDistanceToCenter) / 0.5;
    const a = 0;
    const b = 1.8;
    const c = 3;
    value = (value + a) * (1 - b * Math.pow(d, c));
    return value;
  });

  return {
    terrain: terrain.data,
  };
}
