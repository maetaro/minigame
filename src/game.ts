import "linq";
import Enumerable from "linq";

export class Vector2 {
  static readonly Zero: Vector2 = new Vector2(0, 0);
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export class GameObject {
  game: Game;
  zOder: number = 0;
  position: Vector2 = Vector2.Zero;
  constructor(game: Game) {
    this.game = game;
  }
  update(timestamp: number) {}
  draw(context: CanvasRenderingContext2D) {}
  onclick(self: Game, e: MouseEvent) {}
  onmousemove(self: Game, e: MouseEvent) {}
  onmouseout(self: Game, e: MouseEvent) {}
}

export class Game {
  fps: HTMLElement;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  frameCount: number;
  prevTime: number;
  size: number;
  children: GameObject[];
  constructor(parent: HTMLElement) {
    const self = this;
    // 描画情報
    const fps = document.getElementById("fps");
    if (!fps) throw ReferenceError;
    this.fps = fps;
    this.canvas = document.createElement("canvas");
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw ReferenceError;
    this.context = ctx;
    this.frameCount = 0;
    this.prevTime = performance.now();
    parent.appendChild(this.canvas);
    this.canvas.onclick = (e: MouseEvent) => self.onclick(self, e);
    this.canvas.onmousemove = (e: MouseEvent) => self.onmousemove(self, e);
    this.canvas.onmouseout = (e: MouseEvent) => self.onmouseout(self, e);
    this.size =
      Math.min(
        document.documentElement.clientWidth,
        document.documentElement.clientHeight
      ) - 50;
    this.children = [];
    requestAnimationFrame((timestamp) => this.mainloop(timestamp));
  }
  mainloop(timestamp: number) {
    this.frameCount++;
    this.update(timestamp);
    this.draw();
    const now = performance.now();
    const elapsed = now - this.prevTime;
    if (elapsed > 1000) {
      this.fps.innerText = `${this.frameCount}fps`;
      this.prevTime = performance.now();
      this.frameCount = 0;
    }
    requestAnimationFrame((timestamp) => this.mainloop(timestamp));
  }
  async onclick(self: Game, e: MouseEvent) {
    for (const iterator of this.children) {
      iterator.onclick(self, e);
    }
  }
  showStat() {}
  onmousemove(self: Game, e: MouseEvent) {
    for (const iterator of this.children) {
      iterator.onmousemove(self, e);
    }
  }
  onmouseout(self: Game, e: MouseEvent) {
    for (const iterator of this.children) {
      iterator.onmouseout(self, e);
    }
  }
  update(timestamp: number) {
    for (const iterator of this.children) {
      iterator.update(timestamp);
    }
  }
  draw() {
    const size = this.size;
    const context = this.context;

    this.canvas.width = size;
    this.canvas.height = size;
    context.clearRect(0, 0, size, size);

    Enumerable.from(this.children)
      .orderBy((e) => e.zOder)
      .forEach((e) => e.draw(context));
  }
}
