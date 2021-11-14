import { Game, GameObject } from "../game";

class DummyGame extends Game {}
class DummyGameObject extends GameObject {}

describe("GameObject class", () => {
  test("GameObject_Empty", () => {
    const game = new DummyGame();
    const gameObject = new DummyGameObject(game);
    expect(gameObject.game).toBe(game);
  });
});
