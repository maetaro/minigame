/**
 * Renderer class.
 *
 * ```typescript
 * const game = new Game();
 * const instance = new Shape(game);
 * ```
 */
export class Renderer {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  private static _instance: Renderer;
  public static get instance(): Renderer {
    return this._instance;
  }
  private constructor(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D
  ) {
    this.canvas = canvas;
    this.context = context;
  }
  public static init(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw ReferenceError;
    this._instance = new Renderer(canvas, ctx);
  }
  public clear(width: number, height: number) {
    this.context.clearRect(0, 0, width, height);
  }
  public drawText(
    x: number,
    y: number,
    text: string,
    font: string,
    fillStyle: string | CanvasGradient | CanvasPattern
  ) {
    this.context.font = font;
    this.context.fillStyle = fillStyle;
    this.context.fillText(text, x, y);
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
    this.context.drawImage(
      image,
      f[0],
      f[1],
      f[2],
      f[3],
      f[4],
      f[5],
      f[6],
      f[7]
    );
  }
}
