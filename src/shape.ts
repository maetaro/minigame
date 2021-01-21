import { Game, GameObject } from "./game";

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
  update(timestamp: number) {
    this.position.x += 1;
    this.position.y += 1;
  }
  draw(context: CanvasRenderingContext2D) {
    context.fillStyle = this.fillStyle;
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
    context.strokeStyle = this.strokeStyle;
    context.lineWidth = this.lineWidth;
    context.strokeRect(
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
    context.fill();
    context.stroke();
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
  update(timestamp: number) {
    this.position.x += 1;
    this.position.y += 1;
  }
  draw(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.fillStyle = this.fillStyle;
    context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
    context.fill();
    context.strokeStyle = this.strokeStyle;
    context.lineWidth = this.lineWidth;
    context.stroke();
  }
}
