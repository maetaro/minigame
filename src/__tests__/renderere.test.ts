import { Renderer } from "../renderer";

describe("Renderer class", () => {
  test("Renderer", () => {
    const e = Renderer.instance;
    expect(e).toBe(Renderer.instance);
  });
});
