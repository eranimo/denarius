import ndarray from 'ndarray';
import { IWorldGenProps, IGenOptions, WaterTypes, IWorldGenTick } from '../types';
import Alea from 'alea';
import SimplexNoise from 'simplex-noise';
import fill from 'ndarray-fill';
import ops from 'ndarray-ops';
import { minBy, shuffle } from 'lodash';


let terrain: ndarray;
let waterTypes: ndarray;

const log = (...props) => console.log('[worldgen worker]', ...props);

const allValuesEqual = (array) => !!array.reduce(function (a, b) { return (a === b) ? a : NaN; });
function getLowestValues(
  array: number[][],
  getter: (value: number[]) => number
) {
  const minItem: number[] = minBy(array, getter);
  if (!minItem) {
    return [];
  }
  const minValue: number = getter(minItem);
  return array.filter(value => getter(value) === minValue);
}

function ndarrayStats(ndarray: ndarray) {
  return {
    array: ndarray,
    avg: ops.sum(ndarray) / (ndarray.shape[0] * ndarray.shape[0]),
    max: ops.sup(ndarray),
    min: ops.inf(ndarray),
  };
}


const getNeighbors = (x: number, y: number): number[][] => [
  [x - 1, y],
  [x + 1, y],
  [x, y - 1],
  [x, y + 1],
]

let width: number;
let height: number;
const sealevel = 0.4;
let ticks = 0;
let altitudes: ndarray;
let heights: ndarray;
let waterFlow: ndarray;
let waterFill: ndarray;
let waterLevels: ndarray;
let neighborMap: ndarray;

export async function init(options: IGenOptions): Promise<IWorldGenProps> {
  width = options.size.width;
  height = options.size.height;
  terrain = ndarray(new Float32Array(width * height), [width, height]);
  const rng = new Alea(options.seed);
  const simplex = new SimplexNoise(rng);
  const noise = (nx, ny) => simplex.noise2D(nx, ny);
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);
  const maxDistanceToCenter = 2 * Math.sqrt(Math.pow(width, 2) + Math.pow(width, 2));

  fill(terrain, (x, y) => {
    // use simplex noise to create random terrain
    const nx = x / width - 0.5;
    const ny = y / height - 0.5;
    let value = (
      0.60 * noise(2.50 * nx, 2.50 * ny) +
      0.20 * noise(5.00 * nx, 5.00 * ny) +
      0.10 * noise(10.0 * nx, 10.0 * ny)
    );
    value = (value + 1) / 2;

    // decrease the height of cells farther away from the center to create an island
    const d = (2 * Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)) / maxDistanceToCenter) / 0.5;
    const a = 0;
    const b = 1.8;
    const c = 2.2;
    value = (value + a) * (1 - b * Math.pow(d, c));
    return value;
  });

  // TODO: decide sealevel

  heights = ndarray(new Uint8ClampedArray(width * height), [width, height]);
  fill(heights, (x, y) => terrain.get(x, y) * 255);

  // decide water types
  let oceanCells = 0;
  waterTypes = ndarray([], [width, height]);
  fill(waterTypes, (x, y) => {
    const height = heights.get(x, y);
    if (height < (sealevel * 255)) {
      oceanCells++;
      return WaterTypes.OCEAN;
    } else {
      return WaterTypes.NO_WATER;
    }
  });
  log('percent ocean', oceanCells / (width * height));

  // waterLevels represents the land above sealevel
  // NOTE: should be re-named
  altitudes = ndarray(new Uint8ClampedArray(width * height), [width, height]);
  fill(altitudes, (x, y) => {
    if (waterTypes.get(x, y) === WaterTypes.OCEAN) {
      return 0;
    }
    return heights.get(x, y) - (sealevel * 255);
  });

  console.log('terrain stats', ndarrayStats(terrain));
  console.log('altitudes stats', ndarrayStats(altitudes));

  // waterFill: the amount of water at each cell
  waterFill = ndarray(new Float32Array(width * height), [width, height]);
  // waterFlow: the amount of water that has passed through this cell
  waterFlow = ndarray(new Float32Array(width * height), [width, height]);
  fill(waterFill, (x, y) => 0);
  fill(waterFlow, (x, y) => 0);

  waterLevels = ndarray(new Int8Array(width * height), [width, height]);
  fill(waterLevels, (x, y) => {
    if (waterTypes.get(x, y) === WaterTypes.OCEAN) {
      return 0;
    }
    return Math.round(5 * ((noise(x / width - 0.5, y / height - 0.5) + 1) / 2));;
  });

  neighborMap = ndarray([], [width, height]);
  fill(neighborMap, (x, y) => getNeighbors(x, y)
    .filter(([x, y]) => x >= 0 && y >= 0 && x < width && y < height))

  return {
    terrain: terrain.data,
    sealevel
  };
}
