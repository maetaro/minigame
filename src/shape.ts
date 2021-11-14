import { Game, GameObject } from "./game";
import { Renderer } from "./renderer";

/**
 * Shape Template class.
 *
 * ```typescript
 * const game = new Game();
 * const instance = new Shape(game);
 * ```
 */
export class RectangleShape extends GameObject {
  width: number;
  height: number;
  fillStyle: string | CanvasGradient | CanvasPattern = "gray";
  strokeStyle: string | CanvasGradient | CanvasPattern = "black";
  lineWidth: number = 1;
  constructor(game: Game, width: number, height: number) {
    super(game);
    this.width = width;
    this.height = height;
  }
  draw() {
    Renderer.instance().drawRect(
      this.position.x,
      this.position.y,
      this.width,
      this.height,
      this.fillStyle,
      this.strokeStyle,
      this.lineWidth
    );
  }
}

export class CircleShape extends GameObject {
  radius: number;
  fillStyle: string | CanvasGradient | CanvasPattern = "gray";
  strokeStyle: string | CanvasGradient | CanvasPattern = "black";
  lineWidth: number = 1;
  constructor(game: Game, radius: number) {
    super(game);
    this.radius = radius;
  }
  draw() {
    Renderer.instance().drawCircle(
      this.position.x,
      this.position.y,
      this.radius,
      this.fillStyle,
      this.strokeStyle,
      this.lineWidth
    );
  }
}
