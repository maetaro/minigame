import { Vector2 } from "../game";

describe("Vector2 class", () => {
  test("Vector2_Empty", () => {
    const vec2 = Vector2.Zero;
    expect(vec2.x).toBe(0);
    expect(vec2.y).toBe(0);
  });
  test("Vector2_Span_0", () => {
    const vec2 = new Vector2(0, 0);
    expect(vec2.x).toBe(0);
    expect(vec2.y).toBe(0);
  });
  test("Vector2_Span_0", () => {
    const vec2 = new Vector2(1, 2);
    expect(vec2.x).toBe(1);
    expect(vec2.y).toBe(2);
  });
});
