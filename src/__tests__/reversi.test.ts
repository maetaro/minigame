import { sum, GameObject } from "../reversi";

describe("sum function", () => {
  test("basic", () => {
    expect(sum()).toBe(0);
  });

  test("basic again", () => {
    expect(sum(1, 2)).toBe(3);
  });
});

describe("GameObject class", () => {
  test("", () => {});
});
