export const sum = (...a: number[]) => a.reduce((acc, val) => acc + val, 0);

export class Game {
  parent;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D | null;
  frameCount: any;
  fps: any;
  prevTime: number;
  constructor(parent: any) {
    this.parent = parent;
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
    parent.appendChild(this.canvas);
    this.fps = document.getElementById("fps");
    this.prevTime = performance.now();
    requestAnimationFrame((timestamp) => this.mainloop(timestamp));
  }
  mainloop(timestamp: any) {
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
  update(timestamp: any) {}
  draw() {
    if (this.context == null) {
      return;
    }
    // this.size = 560; // Math.min(document.documentElement.clientWidth, document.documentElement.clientHeight) - 50;
    // Game.cellWidth = (this.size - (Game.borderWeight * 9)) / 8;

    const size = 500;
    // const borderWeight = Game.borderWeight;
    // const cellWidth = Game.cellWidth;
    const context = this.context;

    this.canvas.width = size;
    this.canvas.height = size;
    this.context.clearRect(0, 0, size, size);

    this.context.fillStyle = "blue";
    this.context.fillRect(50, 50, 400, 400);

    // for (const iterator of this.children) {
    //   iterator.draw(context);
    // }
  }
}

window.onload = () => {
  const div = document.getElementById("board");
  new Game(div);
};
