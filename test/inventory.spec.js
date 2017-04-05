// @flow
import Inventory from '../src/simulation/inventory';
import type { InventorySet } from '../src/simulation/inventory';
import * as GOODS from '../src/simulation/goods';


describe('Inventory', () => {
  let inventory: Inventory;

  beforeEach(() => {
    inventory = new Inventory();
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
    const wood: InventorySet = inventory.take(GOODS.wood, 6);
    expect(inventory.hasAmount(GOODS.wood, 10)).toBe(false);
    expect(inventory.hasAmount(GOODS.wood, 4)).toBe(true);
    expect(wood.totalAmount).toBe(6);
    expect(wood.totalCost).toBe(6 * 0.75);
  });

  test('remove with one record, delete half', () => {
    inventory.add(GOODS.wood, 10, 0.75);
    expect(inventory.amountOf(GOODS.wood)).toBe(10);
    expect(inventory.has(GOODS.wood, 10)).toBe(true);
    expect(inventory.has(GOODS.wood, 5)).toBe(true);
    expect(inventory.totalCost).toBe(10 * 0.75);
    inventory.remove(GOODS.wood, 5);
    expect(inventory.amountOf(GOODS.wood)).toBe(5);
    expect(inventory.totalCost).toBe(5 * 0.75);
  });

  test('remove with two records, delete half of one', () => {
    inventory.add(GOODS.wood, 10, 0.75);
    inventory.add(GOODS.wood, 10, 0.10);
    expect(inventory.amountOf(GOODS.wood)).toBe(20);
    inventory.remove(GOODS.wood, 5);
    expect(inventory.amountOf(GOODS.wood)).toBe(15);
    expect(inventory.recordsOf(GOODS.wood)).toBe(2);
  });

  test('remove with two records, delete one and one half', () => {
    inventory.add(GOODS.wood, 10, 0.75);
    inventory.add(GOODS.wood, 10, 0.10);
    expect(inventory.amountOf(GOODS.wood)).toBe(20);
    inventory.remove(GOODS.wood, 15);
    expect(inventory.amountOf(GOODS.wood)).toBe(5);
    expect(inventory.recordsOf(GOODS.wood)).toBe(1);
  });

  test('remove with three records, delete two and one half', () => {
    inventory.add(GOODS.wood, 10, 0.75);
    inventory.add(GOODS.wood, 10, 0.15);
    inventory.add(GOODS.wood, 10, 0.10);
    expect(inventory.amountOf(GOODS.wood)).toBe(30);
    inventory.remove(GOODS.wood, 25);
    expect(inventory.amountOf(GOODS.wood)).toBe(5);
    expect(inventory.recordsOf(GOODS.wood)).toBe(1);
  });

  test('moveTo', () => {
    inventory.add(GOODS.wood, 10, 0.75);
    const two: Inventory = new Inventory();
    expect(inventory.amountOf(GOODS.wood)).toBe(10);
    inventory.moveTo(two, GOODS.wood, 1);
    expect(inventory.amountOf(GOODS.wood)).toBe(9);
    expect(two.amountOf(GOODS.wood)).toBe(1);
  });

  test('moveToMulti', () => {
    inventory.add(GOODS.wood, 10, 0.75);
    inventory.add(GOODS.bread, 10, 0.75);
    const two: Inventory = new Inventory();
    inventory.moveToMulti(two, new Map([
      [GOODS.wood, 1],
      [GOODS.bread, 1]
    ]));

    expect(inventory.amountOf(GOODS.wood)).toBe(9);
    expect(inventory.amountOf(GOODS.bread)).toBe(9);
    expect(two.amountOf(GOODS.wood)).toBe(1);
    expect(two.amountOf(GOODS.bread)).toBe(1);
  });

  test('hasAmounts', () => {
    inventory.add(GOODS.wood, 10, 0.75);

    expect(inventory.hasAmounts(new Map([
      [GOODS.wood, 2]
    ]))).toBe(true);
    expect(inventory.hasAmounts(new Map([
      [GOODS.wood, 20]
    ]))).toBe(false);

    expect(inventory.hasAmounts(new Map())).toBe(true);
  });
});
