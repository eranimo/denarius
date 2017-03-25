// @flow
import Inventory, { ValuedInventory } from '../src/simulation/inventory';
import type { InventorySet } from '../src/simulation/inventory';
import type { Good } from '../src/simulation/goods';
import * as GOODS from '../src/simulation/goods';


describe('inventory', () => {

  let inventory: Inventory;

  beforeEach(() => {
    inventory = new Inventory();
  });

  test('size', () => {
    expect(inventory.size).toBe(0);

    inventory.add(GOODS.bread, 10);
    inventory.add(GOODS.wood, 10);

    expect(inventory.size).toBe(20);
    expect(inventory.get(GOODS.bread)).toBe(10);
    expect(inventory.get(GOODS.wood)).toBe(10);

    expect(inventory.hasAmount(GOODS.wood, 10)).toBe(true);
    expect(inventory.hasAmount(GOODS.bread, 10)).toBe(true);
  });

  test('add and subtract', () => {
    inventory.add(GOODS.bread, 10);
    inventory.subtract(GOODS.bread, 1);

    expect(inventory.get(GOODS.bread)).toBe(9);
    expect(inventory.subtract(GOODS.bread, 100)).toBe(false);
  });

  test('hasAmount', () => {
    inventory.add(GOODS.bread, 10);

    expect(inventory.hasAmount(GOODS.bread, 10)).toBe(true);
    expect(inventory.hasAmount(GOODS.bread, 1)).toBe(true);
    expect(inventory.hasAmount(GOODS.bread, 11)).toBe(false);
  });

  test('giveGoods', () => {
    inventory.giveGoods(new Map([
      [GOODS.bread, 10],
      [GOODS.wood, 10]
    ]));

    expect(inventory.get(GOODS.bread)).toBe(10);
    expect(inventory.get(GOODS.wood)).toBe(10);
  });

  test('takeGoods', () => {
    inventory.add(GOODS.bread, 10);
    inventory.add(GOODS.wood, 10);

    inventory.takeGoods(new Map([
      [GOODS.bread, 10],
      [GOODS.wood, 2]
    ]));

    expect(inventory.get(GOODS.bread)).toBe(0);
    expect(inventory.get(GOODS.wood)).toBe(8);

    // return false when we don't have the goods
    expect(inventory.takeGoods(new Map([
      [GOODS.bread, 20],
      [GOODS.wood, 20]
    ]))).toBe(false);
  });

  test('difference', () => {
    inventory.giveGoods(new Map([
      [GOODS.bread, 10],
      [GOODS.wood, 10]
    ]));

    expect(inventory.difference(new Map([
      [GOODS.bread, 4],
      [GOODS.wood, 8]
    ]))).toEqual(new Map([
      [GOODS.bread, 6],
      [GOODS.wood, 2]
    ]));

    expect(inventory.difference(new Map([
      [GOODS.bread, 0],
      [GOODS.wood, 15]
    ]))).toEqual(new Map([
      [GOODS.bread, 10],
      [GOODS.wood, -5]
    ]));
  });

  test('hasGoods', () => {
    inventory.giveGoods(new Map([
      [GOODS.bread, 10],
      [GOODS.wood, 10]
    ]));

    expect(inventory.size).toBe(20);

    expect(inventory.hasGoods(new Map([
      [GOODS.bread, 5],
      [GOODS.wood, 5]
    ]))).toBe(true);

    expect(inventory.hasAmount(GOODS.bread, 5)).toBe(true);
    expect(inventory.hasAmount(GOODS.wood, 15)).toBe(false);

    expect(inventory.hasGoods(new Map([
      [GOODS.bread, 5],
      [GOODS.wood, 15]
    ]))).toBe(false);
  });

  test('has and take', () => {
    const someGoods: Map<Good, number> = new Map([
      [GOODS.bread, 10],
      [GOODS.wood, 10]
    ]);
    inventory.giveGoods(someGoods);
    expect(inventory.size).toBe(20);

    expect(inventory.hasGoods(someGoods)).toBe(true);
    expect(inventory.takeGoods(someGoods)).toBe(true);
    expect(inventory.size).toBe(0);
  });
});

describe('ValuedInventory', () => {
  let inventory: ValuedInventory;

  beforeEach(() => {
    inventory = new ValuedInventory();
  });

  test('add and has methods', () => {
    expect(inventory.has(GOODS.wood)).toBe(false);
    expect(inventory.totalCost).toBe(0);

    inventory.add(GOODS.wood, 1, 0.75);

    expect(inventory.recordsOf(GOODS.wood)).toBe(1);
    expect(inventory.totalCost).toBe(0.75);
    expect(inventory.has(GOODS.wood)).toBe(true);
    expect(inventory.has(GOODS.bread)).toBe(false);
    expect(inventory.has(GOODS.wood, 1)).toBe(true);
    expect(inventory.has(GOODS.wood, 2)).toBe(false);
    expect(inventory.has(GOODS.bread, 1)).toBe(false);

    inventory.add(GOODS.wood, 5, 0.50);

    expect(inventory.recordsOf(GOODS.wood)).toBe(2);
    expect(inventory.totalCost).toBe((1 * 0.75) + (5 * 0.50));
  });

  test('take', () => {
    inventory.add(GOODS.wood, 10, 0.75);
    expect(inventory.totalCost).toBe(10 * 0.75);
    const wood: InventorySet = inventory.take(GOODS.wood, 5);
    expect(wood.totalCost).toBe(5 * 0.75);
  });

  test('remove one record, delete half', () => {
    inventory.add(GOODS.wood, 10, 0.75);
    expect(inventory.amountOf(GOODS.wood)).toBe(10);
    expect(inventory.has(GOODS.wood, 10)).toBe(true);
    expect(inventory.has(GOODS.wood, 5)).toBe(true);
    expect(inventory.totalCost).toBe(10 * 0.75);
    inventory.remove(GOODS.wood, 5);
    expect(inventory.amountOf(GOODS.wood)).toBe(5);
    expect(inventory.totalCost).toBe(5 * 0.75);
  });

  test('remove two records, delete half of one', () => {
    inventory.add(GOODS.wood, 10, 0.75);
    inventory.add(GOODS.wood, 10, 0.10);
    expect(inventory.amountOf(GOODS.wood)).toBe(20);
    inventory.remove(GOODS.wood, 5);
    expect(inventory.amountOf(GOODS.wood)).toBe(15);
    expect(inventory.recordsOf(GOODS.wood)).toBe(2);
  });

  test('remove two records, delete one and one half', () => {
    inventory.add(GOODS.wood, 10, 0.75);
    inventory.add(GOODS.wood, 10, 0.10);
    expect(inventory.amountOf(GOODS.wood)).toBe(20);
    inventory.remove(GOODS.wood, 15);
    expect(inventory.amountOf(GOODS.wood)).toBe(5);
    expect(inventory.recordsOf(GOODS.wood)).toBe(2);
  });
});
