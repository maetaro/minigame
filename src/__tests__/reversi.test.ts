import { sum } from "../reversi";
import { Grid } from "../grid";

describe("sum function", () => {
  test("basic", () => {
    expect(sum()).toBe(0);
  });

  test("basic again", () => {
    expect(sum(1, 2)).toBe(3);
  });
});

describe("Grid class", () => {
  test("Grid_Span_0", () => {
    const grid = new Grid(750);
    expect(grid.span(0)).toBe(0);
  });
  test("Grid_Span_1", () => {
    const grid = new Grid(750, 16.0);
    expect(grid.span(1)).toBe((750.0 / 16.0) * 1.0);
  });
  test("Grid_Span_8", () => {
    const grid = new Grid(750, 16);
    expect(grid.span(8)).toBe(750.0 / 2.0);
  });
  test("Grid_Span_16", () => {
    const grid = new Grid(750, 16);
    expect(grid.span(16)).toBe(750.0);
  });
  test("Grid_Center_none", () => {
    const grid = new Grid(750, 16);
    expect(grid.center()).toBe(750.0 / 2.0);
  });
  test("Grid_Center_0", () => {
    const grid = new Grid(750, 16);
    expect(grid.center(0)).toBe(750.0 / 2.0);
  });
  test("Grid_Center_1", () => {
    const grid = new Grid(750, 16);
    expect(grid.center(1)).toBe((750.0 / 16.0) * 9.0);
  });
  test("Grid_Center_minus_1", () => {
    const grid = new Grid(750, 16);
    expect(grid.center(-1)).toBe((750.0 / 16.0) * 7.0);
  });
});
