import { Game, GameObject } from "../game";
import { Renderer } from "../renderer";

class DummyGame extends Game {}
class DummyGameObject extends GameObject {}

describe("Game class", () => {
  test("Game_Empty", () => {
    const game = new DummyGame();
    expect(game.frameCount).toBe(0);
    expect(game.prevTime).toBe(0);
    expect(game.options.width).toBe(0);
    expect(game.options.height).toBe(0);
    expect(game.children.length).toBe(0);
  });
  test("Game_callUpdate", () => {
    const game = new DummyGame();
    const o1 = new DummyGameObject(game);
    const o2 = new DummyGameObject(game);
    game.children.push(o1);
    game.children.push(o2);
    let called: number = 0;
    o1.update = (timestamp: number) => {
      called += timestamp;
    };
    o2.update = (timestamp: number) => {
      called += timestamp;
    };
    game.callUpdate(1);
    expect(called).toBe(2);
  });
  test("Game_callDraw_foreach", () => {
    const game = new DummyGame();
    let called: number = 0;
    for (let i = 0; i < 2; i++) {
      const obj = new DummyGameObject(game);
      game.children.push(obj);
      obj.draw = () => {
        called += 1;
      };
    }
    const mock_instance = jest.fn();
    Renderer.instance = mock_instance;
    const spy = jest.spyOn(Renderer, "instance");
    const ren = {
      clear: (width: number, height: number) => {},
    } as Renderer;
    spy.mockReturnValueOnce(ren);
    spy.mockReturnValueOnce(ren);
    game.callDraw();
    expect(called).toBe(2);
    spy.mockRestore();
  });
  test("Game_callDraw_invisible", () => {
    const game = new DummyGame();
    let called: number = 0;
    for (let i = 0; i < 3; i++) {
      const obj = new DummyGameObject(game);
      game.children.push(obj);
      obj.draw = () => {
        called += 1;
      };
    }
    // 1つを非表示にする。
    game.children[1].visible = false;
    const mock_instance = jest.fn();
    Renderer.instance = mock_instance;
    const spy = jest.spyOn(Renderer, "instance");
    const ren = {
      clear: (width: number, height: number) => {},
    } as Renderer;
    spy.mockReturnValueOnce(ren);
    spy.mockReturnValueOnce(ren);
    game.callDraw();
    expect(called).toBe(2);
    spy.mockRestore();
  });
  test("Game_callDraw_sort", () => {
    const game = new DummyGame();
    let called: number[] = [];
    for (let i = 2; i > -1; i--) {
      const obj = new DummyGameObject(game);
      obj.zOder = i;
      game.children.push(obj);
      obj.draw = () => {
        called.push(obj.zOder);
      };
    }
    const mock_instance = jest.fn();
    Renderer.instance = mock_instance;
    const spy = jest.spyOn(Renderer, "instance");
    const ren = {
      clear: (width: number, height: number) => {},
    } as Renderer;
    spy.mockReturnValueOnce(ren);
    spy.mockReturnValueOnce(ren);
    game.callDraw();
    expect(called).toStrictEqual([0, 1, 2]);
    spy.mockRestore();
  });
});
