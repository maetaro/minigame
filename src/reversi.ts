export const sum = (...a: number[]) => a.reduce((acc, val) => acc + val, 0);

export class Game {
  parent: HTMLElement;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D | null;
  frameCount: number = 0;
  fps: HTMLElement | null;
  prevTime: number;
  children: GameObject[];
  size: number;
  constructor(parent: HTMLElement) {
    this.parent = parent;
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
    parent.appendChild(this.canvas);
    this.fps = document.getElementById("fps");
    this.prevTime = performance.now();
    this.children = [];
    this.size =
      Math.min(
        document.documentElement.clientWidth,
        document.documentElement.clientHeight
      ) - 50;
    requestAnimationFrame((timestamp) => this.mainloop(timestamp));
  }
  mainloop(timestamp: number) {
    if (this.context == null) {
      return;
    }
    this.frameCount++;
    this.resizeCanvas();
    this.update(timestamp);
    this.draw(this.context);
    const now = performance.now();
    const elapsed = now - this.prevTime;
    if (elapsed > 1000) {
      this.fps!.innerText = `${this.frameCount}fps`;
      this.prevTime = performance.now();
      this.frameCount = 0;
    }
    requestAnimationFrame((timestamp) => this.mainloop(timestamp));
  }
  update(timestamp: number) {
    for (const iterator of this.children) {
      iterator.update(timestamp);
    }
  }
  draw(context: CanvasRenderingContext2D) {
    context.clearRect(0, 0, this.size, this.size);
    for (const iterator of this.children) {
      iterator.draw(context);
    }
  }
  resizeCanvas() {
    this.size =
      Math.min(
        document.documentElement.clientWidth,
        document.documentElement.clientHeight
      ) - 50;
    this.canvas.width = this.size;
    this.canvas.height = this.size;
  }
}

export class GameObject {
  game;
  constructor(game: Game) {
    this.game = game;
  }
  update(timestamp: number) {}
  draw(context: CanvasRenderingContext2D) {}
  // onclick(self, e) {}
  // onmousemove(self, e) {}
  // onmouseout(self, e) {}
}

export class Reversi extends Game {
  static borderWeight = 2;
  static cellWidth: number = 0;
  constructor(parent: HTMLElement) {
    super(parent);
    Reversi.cellWidth = (this.size - Reversi.borderWeight * 9) / 8;
    this.children.push(new Board(this));
  }
  resizeCanvas() {
    super.resizeCanvas();
    Reversi.cellWidth = (this.size - Reversi.borderWeight * 9) / 8;
  }
}
export class Board extends GameObject {
  hoverCellIndex: number | null = null;
  draw(context: CanvasRenderingContext2D) {
    context.fillStyle = "green";
    context.fillRect(0, 0, this.game.size, this.game.size);
    const borderWeight = Reversi.borderWeight;
    const cellWidth = Reversi.cellWidth;
    context.fillStyle = "black";
    for (let i = 0; i < 9; i++) {
      const pos = (borderWeight + cellWidth) * i;
      context.fillRect(pos, 0, borderWeight, this.game.size);
      context.fillRect(0, pos, this.game.size, borderWeight);
    }
    if (this.hoverCellIndex != null) {
      const i = this.hoverCellIndex;
      const x = i % 8;
      const y = Math.floor(i / 8);
      const left = (borderWeight + cellWidth) * x + 1;
      const top = (borderWeight + cellWidth) * y + 1;
      const width = borderWeight + cellWidth;
      const height = borderWeight + cellWidth;
      context.beginPath();
      context.rect(left, top, width, height);
      context.strokeStyle = "white";
      context.lineWidth = 1;
      context.stroke();
    }
  }
}

window.onload = () => {
  const div: HTMLElement | null = document.getElementById("board");
  if (div == null) {
    return;
  }
  new Reversi(div);
};
