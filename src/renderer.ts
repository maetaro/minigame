/**
 * Renderer class.
 *
 * ```typescript
 * const game = new Game();
 * const instance = new Shape(game);
 * ```
 */
export class Renderer {
  context: CanvasRenderingContext2D;
  private static _instance: Renderer;
  public static get instance(): Renderer {
    return this._instance;
  }
  private constructor(context: CanvasRenderingContext2D) {
    this.context = context;
  }
  public static init(context: CanvasRenderingContext2D) {
    this._instance = new Renderer(context);
  }
  public drawRect(
    x: number,
    y: number,
    width: number,
    height: number,
    fillStyle: string | CanvasGradient | CanvasPattern,
    strokeStyle: string | CanvasGradient | CanvasPattern,
    lineWidth: number
  ) {
    this.context.fillStyle = fillStyle;
    this.context.fillRect(x, y, width, height);
    this.context.strokeStyle = strokeStyle;
    this.context.lineWidth = lineWidth;
    this.context.strokeRect(x, y, width, height);
    this.context.fill();
    this.context.stroke();
  }
  public drawCircle(
    x: number,
    y: number,
    radius: number,
    fillStyle: string | CanvasGradient | CanvasPattern,
    strokeStyle: string | CanvasGradient | CanvasPattern,
    lineWidth: number
  ): void {
    this.context.beginPath();
    this.context.fillStyle = fillStyle;
    this.context.arc(x, y, radius, 0, 2 * Math.PI);
    this.context.fill();
    this.context.strokeStyle = strokeStyle;
    this.context.lineWidth = lineWidth;
    this.context.stroke();
  }
  public drawImage(image: HTMLImageElement, frames: number[]) {
    const f = frames;
    this.context.drawImage(image, f[0], f[1], f[2], f[3], f[4], f[5], f[6], f[7]);
  }
}
