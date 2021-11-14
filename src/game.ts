import { Renderer } from "./renderer";

/**
 * (module private class)
 */
class Vector2Empty {
  get x(): number {
    return 0;
  }
  get y(): number {
    return 0;
  }
  constructor() {}
}
export class Vector2 {
  static readonly Zero: Vector2 = new Vector2Empty();
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export abstract class GameObject {
  game: Game;
  zOder: number = 0;
  position: Vector2 = Vector2.Zero;
  visible: boolean = true;
  constructor(game: Game) {
    this.game = game;
  }
  update(timestamp: number) {}
  draw() {}
  onclick(self: Game, e: MouseEvent) {}
  onmousemove(self: Game, e: MouseEvent) {}
  onmouseout(self: Game, e: MouseEvent) {}
}

export class GameOptions {
  width: number = 0;
  height: number = 0;
}

export class Game {
  frameCount: number;
  prevTime: number;
  options: GameOptions;
  children: GameObject[] = [];
  constructor(parent: HTMLElement, options: GameOptions) {
    const self = this;
    this.options = options;
    const fps = document.getElementById("fps");
    if (!fps) throw ReferenceError;
    // TODO: GameOptionsクラスにまとめて、このコンストラクタで受け取るようにする。
    const canvas = document.createElement("canvas");
    const width = options.width;
    const height = options.height;
    // 描画情報
    Renderer.init(canvas);
    canvas.width = width;
    canvas.height = height;
    canvas.onclick = (e: MouseEvent) => self.onclick(self, e);
    canvas.onmousemove = (e: MouseEvent) => self.onmousemove(self, e);
    canvas.onmouseout = (e: MouseEvent) => self.onmouseout(self, e);
    parent.appendChild(canvas);
    // デバッグ用FPS表示
    this.frameCount = 0;
    this.prevTime = performance.now();
    requestAnimationFrame((timestamp) => this.mainloop(timestamp));
  }
  mainloop(timestamp: number) {
    this.frameCount++;
    this.callUpdate(timestamp);
    this.callDraw();
    const now = performance.now();
    const elapsed = now - this.prevTime;
    if (elapsed > 1000) {
      // this.fps.innerText = `${this.frameCount}fps`;
      // Renderer.instance.drawText(x, y, `${this.frameCount}fps`);
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
  callUpdate(timestamp: number) {
    for (const iterator of this.children) {
      iterator.update(timestamp);
    }
  }
  update(timestamp: number) {}
  callDraw() {
    const width = this.options.width;
    const height = this.options.height;
    Renderer.instance.clear(width, height);

    this.children
      .filter((e) => e.visible)
      .sort((a, b) => a.zOder - b.zOder)
      .forEach((e) => e.draw());
  }
  draw(context: CanvasRenderingContext2D) {}
}
