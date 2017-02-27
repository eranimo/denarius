// @flow
import Inventory from '../src/simulation/inventory';
import type { Good } from '../src/simulation/goods';
import * as GOODS from '../src/simulation/goods';


let inventory: Inventory;

beforeEach(() => {
  inventory = new Inventory();
});

test('inventory size', () => {
  expect(inventory.size).toBe(0);

  inventory.add(GOODS.food, 10);
  inventory.add(GOODS.wood, 10);

  expect(inventory.size).toBe(20);
  expect(inventory.get(GOODS.food)).toBe(10);
  expect(inventory.get(GOODS.wood)).toBe(10);

  expect(inventory.hasAmount(GOODS.wood, 10)).toBe(true);
  expect(inventory.hasAmount(GOODS.food, 10)).toBe(true);
});

test('inventory add and subtract', () => {
  inventory.add(GOODS.food, 10);
  inventory.subtract(GOODS.food, 1);

  expect(inventory.get(GOODS.food)).toBe(9);
  expect(inventory.subtract(GOODS.food, 100)).toBe(false);
});

test('inventory hasAmount', () => {
  inventory.add(GOODS.food, 10);

  expect(inventory.hasAmount(GOODS.food, 10)).toBe(true);
  expect(inventory.hasAmount(GOODS.food, 1)).toBe(true);
  expect(inventory.hasAmount(GOODS.food, 11)).toBe(false);
});

test('inventory giveGoods', () => {
  inventory.giveGoods(new Map([
    [GOODS.food, 10],
    [GOODS.wood, 10]
  ]));

  expect(inventory.get(GOODS.food)).toBe(10);
  expect(inventory.get(GOODS.wood)).toBe(10);
});

test('inventory takeGoods', () => {
  inventory.add(GOODS.food, 10);
  inventory.add(GOODS.wood, 10);

  inventory.takeGoods(new Map([
    [GOODS.food, 10],
    [GOODS.wood, 2]
  ]));

  expect(inventory.get(GOODS.food)).toBe(0);
  expect(inventory.get(GOODS.wood)).toBe(8);

  // return false when we don't have the goods
  expect(inventory.takeGoods(new Map([
    [GOODS.food, 20],
    [GOODS.wood, 20]
  ]))).toBe(false);
});

test('inventory difference', () => {
  inventory.giveGoods(new Map([
    [GOODS.food, 10],
    [GOODS.wood, 10]
  ]));

  expect(inventory.difference(new Map([
    [GOODS.food, 4],
    [GOODS.wood, 8]
  ]))).toEqual(new Map([
    [GOODS.food, 6],
    [GOODS.wood, 2]
  ]));

  expect(inventory.difference(new Map([
    [GOODS.food, 0],
    [GOODS.wood, 15]
  ]))).toEqual(new Map([
    [GOODS.food, 10],
    [GOODS.wood, -5]
  ]));
});

test('inventory hasGoods', () => {
  inventory.giveGoods(new Map([
    [GOODS.food, 10],
    [GOODS.wood, 10]
  ]));

  expect(inventory.size).toBe(20);

  expect(inventory.hasGoods(new Map([
    [GOODS.food, 5],
    [GOODS.wood, 5]
  ]))).toBe(true);

  expect(inventory.hasAmount(GOODS.food, 5)).toBe(true);
  expect(inventory.hasAmount(GOODS.wood, 15)).toBe(false);

  expect(inventory.hasGoods(new Map([
    [GOODS.food, 5],
    [GOODS.wood, 15]
  ]))).toBe(false);
});

test('inventory has and take', () => {
  const someGoods: Map<Good, number> = new Map([
    [GOODS.food, 10],
    [GOODS.wood, 10]
  ]);
  inventory.giveGoods(someGoods);
  expect(inventory.size).toBe(20);

  expect(inventory.hasGoods(someGoods)).toBe(true);
  expect(inventory.takeGoods(someGoods)).toBe(true);
  expect(inventory.size).toBe(0);
});
