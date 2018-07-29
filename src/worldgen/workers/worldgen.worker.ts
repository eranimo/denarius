import ndarray from 'ndarray';
import { IWorldMap, IGenOptions, WaterTypes } from '../types';
import Alea from 'alea';
import SimplexNoise from 'simplex-noise';
import fill from 'ndarray-fill';
import ops from 'ndarray-ops';
import { minBy } from 'lodash';


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


const getNeighbors = (x: number, y: number) => [
  [x - 1, y],
  [x + 1, y],
  [x, y - 1],
  [x, y + 1],
]

export async function init(options: IGenOptions): Promise<IWorldMap> {
  const { width, height } = options.size;
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
  const sealevel = 0.4;

  const heights = ndarray(new Uint8ClampedArray(width * height), [width, height]);
  fill(heights, (x, y) => terrain.get(x, y) * 255);

  // decide water types
  waterTypes = ndarray([], [width, height]);
  fill(waterTypes, (x, y) => {
    const height = heights.get(x, y);
    if (height < sealevel) {
      return WaterTypes.OCEAN;
    } else {
      return WaterTypes.NO_WATER;
    }
  });

  // waterLevels represents the max height of water or land at a given cell
  const waterLevels = ndarray(new Uint8ClampedArray(width * height), [width, height]);
  fill(waterLevels, (x, y) => {
    // water in the ocean
    if (waterTypes.get(x, y) === WaterTypes.OCEAN) {
      return sealevel - heights.get(x, y);
    }
    // rain
    return 5 * Math.random();
  });
  const waterFlow = ndarray(new Float32Array(width * height), [width, height]);
  fill(waterFlow, (x, y) => 0);

  const drains = ndarray([], [width, height]);
  let oceanCells = 0;
  fill(drains, (x, y) => {
    if (waterTypes.get(x, y) == WaterTypes.OCEAN) {
      oceanCells++;
      return 1;
    }
    return 0;
  });
  log('percent ocean', oceanCells / (width * height));

  function step() {
    let didWork = false;
    let maxWaterLevel;
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (waterTypes.get(x, y) != WaterTypes.OCEAN) {
          const neighbors = getNeighbors(x, y);
          const myLevel = heights.get(x, y) + waterLevels.get(x, y);
          const neighborLevels = neighbors
          .map(([nx, ny]) => [nx, ny, heights.get(nx, ny) + waterLevels.get(nx, ny)])
            .filter(([nx, ny, level]) => (
              level !== undefined &&
              level < myLevel
            ));
          const lowestNeighbors = getLowestValues(neighborLevels, i => i[2]);

          for (let [nx, ny, level] of lowestNeighbors) {
            didWork = true;
            const share = waterLevels.get(x, y) / lowestNeighbors.length;
            waterLevels.set(nx, ny, waterLevels.get(nx, ny) + share);
            waterLevels.set(x, y, waterLevels.get(x, y) - share);
            waterFlow.set(x, y, waterFlow.get(x, y) + share);
          }
        }
      }
    }
    return didWork;
  }

  // let stepCount = 0;
  // while (step()) {
  //   stepCount++;
  // }
  // log(`River generation took '${stepCount}' steps`);

  for (let i = 0; i < 50; i++) step();

  log(waterLevels);
  fill(waterLevels, (x, y) => {
    if (waterTypes.get(x, y) === WaterTypes.OCEAN) return 0;
    return waterLevels.get(x, y);
  });
  const maxWaterLevel = ops.sup(waterLevels);
  const minWaterLevel = ops.inf(waterLevels);
  log('maxWaterLevel', maxWaterLevel);
  log('minWaterLevel', minWaterLevel);

  // normalize waterLevels as waterFill
  const waterFill = ndarray(new Float32Array(width * height), [width, height]);
  fill(waterFill, (x, y) => (waterLevels.get(x, y) - minWaterLevel) / maxWaterLevel);

  log('waterFill', ops.sum(waterFill) / (width * height));

  // normalize waterFlow
  const maxWaterFlow = ops.sup(waterFlow);
  const minWaterFlow = ops.inf(waterFlow);
  log('maxWaterFlow', maxWaterFlow);
  log('minWaterFlow', minWaterFlow);
  fill(waterFlow, (x, y) => (waterFlow.get(x, y) - minWaterFlow) / maxWaterFlow);


  return {
    terrain: terrain.data,
    waterTypes: waterTypes.data,
    waterFill: waterFill.data,
    waterFlow: waterFlow.data,
    sealevel,
  };
}
