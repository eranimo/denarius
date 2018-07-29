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
  const waterLevels = ndarray(new Uint8ClampedArray(width * height), [width, height]);
  fill(waterLevels, (x, y) => {
    if (waterTypes.get(x, y) === WaterTypes.OCEAN) {
      return 0;
    }
    // const rain = Math.round(5 * ((noise(x / width - 0.5, y / height - 0.5) + 1) / 2));;
    return (heights.get(x, y) - (sealevel * 255));
  });

  // amount of water moved by each cell
  // NOTE: not implemented
  const waterFlow = ndarray(new Uint8ClampedArray(width * height), [width, height]);
  fill(waterFlow, (x, y) => 0);

  // boolean 2D array of cells which are known to drain to the ocean
  // initially only ocean cells drain are marked true
  const drains = ndarray([], [width, height]);
  fill(drains, (x, y) => waterLevels.get(x, y) === 0);

  log('stats: heights', ndarrayStats(heights));
  log('stats: waterLevels (before)', ndarrayStats(waterLevels));

  // calculate a 2D array of neighbor arrays
  const neighborMap = ndarray([], [width, height]);
  fill(neighborMap, (x, y) => getNeighbors(x, y)
    .filter(([x, y]) => x >= 0 && y >= 0 && x < width && y < height))

  function step() {
    let didWork = false;
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (waterTypes.get(x, y) === WaterTypes.OCEAN) continue;
        const neighbors = neighborMap.get(x, y);
        const neighborLevels = neighbors
          .map(([nx, ny]) => {
            // do not consider neighbors that do not drain to ocean
            if (drains.get(nx, ny) === 0) {
              return -Infinity;
            }
            return waterLevels.get(nx, ny);
          });
        if (neighborLevels.length > 0) {
          const maxLevel = Math.max(...neighborLevels)
          const thisLevel = waterLevels.get(x, y);

          // if we have a neighbor higher than us
          if (maxLevel > thisLevel) {
            waterLevels.set(x, y, maxLevel);
            drains.set(x, y, 1);
            didWork = true;
          }
        }
      }
    }
    return didWork;
  }

  // run river generation step until nothing happens
  let stepCount = 0;
  while (step()) {
    stepCount++;
  }
  log(`River generation took '${stepCount}' steps`);

  for (let i = 0; i < 1; i++) step();

  // fill(waterLevels, (x, y) => {
  //   if (waterTypes.get(x, y) === WaterTypes.OCEAN) return 0;
  //   return waterLevels.get(x, y) - heights.get(x, y);
  // });
  const maxWaterLevel = ops.sup(waterLevels);
  const minWaterLevel = ops.inf(waterLevels);
  log('stats: waterLevels (after)', ndarrayStats(waterLevels));

  // normalize waterLevels as waterFill for the MapViewer
  const waterFill = ndarray(new Float32Array(width * height), [width, height]);
  fill(waterFill, (x, y) => (waterLevels.get(x, y) - minWaterLevel) / maxWaterLevel);

  log('stats: waterFill', ndarrayStats(waterFill));

  // normalize waterFlow for the MapViewer
  const maxWaterFlow = ops.sup(waterFlow);
  const minWaterFlow = ops.inf(waterFlow);
  log('stats: waterFlow', ndarrayStats(waterFlow));
  fill(waterFlow, (x, y) => (waterFlow.get(x, y) - minWaterFlow) / maxWaterFlow);


  return {
    terrain: terrain.data,
    waterTypes: waterTypes.data,
    waterFill: waterFill.data,
    waterFlow: waterFlow.data,
    sealevel,
  };
}
