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
    this.context.clearRect(0, 0, this.size, this.size);
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
    this.size = 560;
    this.canvas.width = this.size;
    this.canvas.height = this.size;
  }
}

export class GameObject {
  game: Game;
  children: GameObject[];
  constructor(game: Game) {
    this.game = game;
    this.children = [];
  }
  update(timestamp: number) {
    for (const iterator of this.children) {
      iterator.update(timestamp);
    }
  }
  draw(context: CanvasRenderingContext2D) {
    for (const iterator of this.children) {
      iterator.draw(context);
    }
  }
  // onclick(self, e) {}
  // onmousemove(self, e) {}
  // onmouseout(self, e) {}
}

export class Reversi extends Game {
  static borderWeight = 2;
  static cellWidth: number = 0;
  constructor(parent: HTMLElement) {
    super(parent);
    // Reversi.cellWidth = (this.size - Reversi.borderWeight * 9) / 8;
    Reversi.cellWidth = 67;
    this.children.push(new Board(this));
  }
  resizeCanvas() {
    super.resizeCanvas();
    // Reversi.cellWidth = (this.size - Reversi.borderWeight * 9) / 8;
  }
}
export class Board extends GameObject {
  hoverCellIndex: number | null = null;
  constructor(game: Game) {
    super(game);
    this.children.push(new Stone(game, 3, 3, StoneState.White));
    this.children.push(new Stone(game, 4, 3, StoneState.Black));
    this.children.push(new Stone(game, 3, 4, StoneState.Black));
    this.children.push(new Stone(game, 4, 4, StoneState.White));
  }
  get stones(): number[] {
    const stones = new Array(64).fill(0);
    return stones;
  }
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
    super.draw(context);
  }
}

const StoneState = {
  Black: "黒",
  White: "白",
} as const;
type StoneState = typeof StoneState[keyof typeof StoneState];

export class Stone extends GameObject {
  static image: HTMLImageElement | null = null;
  static imageLoaded: boolean = false;
  static margin = 2;
  currentFrame: number;
  frames: {
    ms: number;
    frames: number[];
  }[];
  prevtime: number;
  x: number;
  y: number;
  state: StoneState;
  constructor(game: Game, x: number, y: number, state: StoneState) {
    super(game);
    if (!Stone.imageLoaded) {
      Stone.imageLoaded = true;
      const img = new Image();
      img.src = "image/stone.png";
      img.onload = () => {
        console.log("stone image is loaded.");
        Stone.image = img;
      };
    }
    this.currentFrame = 0;
    const ma = Stone.margin;
    this.frames = [
      {
        ms: 5000,
        frames: [
          0,
          0,
          100,
          100,
          0 + ma,
          0 + ma,
          Reversi.cellWidth,
          Reversi.cellWidth,
        ],
      },
      {
        ms: 300,
        frames: [
          101,
          0,
          50,
          100,
          15 + ma,
          0 + ma,
          Reversi.cellWidth / 2,
          Reversi.cellWidth,
        ],
      },
      {
        ms: 300,
        frames: [
          148,
          0,
          50,
          100,
          20 + ma,
          0 + ma,
          Reversi.cellWidth / 2,
          Reversi.cellWidth,
        ],
      },
      {
        ms: 1000,
        frames: [
          200,
          0,
          100,
          100,
          0 + Stone.margin,
          0 + Stone.margin,
          Reversi.cellWidth,
          Reversi.cellWidth,
        ],
      },
    ];
    this.prevtime = 0;
    this.x = x;
    this.y = y;
    this.state = state;
  }
  update(timestamp: number) {
    // console.log(timestamp);
    const frame = this.frames[this.currentFrame];
    if (timestamp - this.prevtime > frame.ms) {
      this.currentFrame++;
      if (this.currentFrame >= this.frames.length) this.currentFrame = 0;
      this.prevtime = timestamp;
    }
  }
  draw(context: CanvasRenderingContext2D) {
    if (!Stone.image) return;
    const frameIndex = this.state == StoneState.Black ? 0 : 3;
    const frame = this.frames[frameIndex];
    const frames = frame.frames.slice(0, 8);
    frames[4] += (Reversi.borderWeight + Reversi.cellWidth) * this.x + 2;
    frames[5] += (Reversi.borderWeight + Reversi.cellWidth) * this.y + 2;
    context.drawImage(
      Stone.image,
      frames[0],
      frames[1],
      frames[2],
      frames[3],
      frames[4],
      frames[5],
      frames[6],
      frames[7]
    );
  }
  flip() {
    this.state =
      this.state == StoneState.Black ? StoneState.White : StoneState.Black;
  }
}

window.onload = () => {
  const div: HTMLElement | null = document.getElementById("board");
  if (div == null) {
    return;
  }
  new Reversi(div);
};
