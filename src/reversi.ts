export const sum = (...a: number[]) => a.reduce((acc, val) => acc + val, 0);

import * as tf from "@tensorflow/tfjs";

export class StonePosition {
  _x: number;
  _y: number;
  constructor(x: number, y?: number) {
    if (!y) {
      const i = x;
      this._x = i % 8;
      this._y = Math.floor(i / 8);
      return;
    }
    if (x < 0 || 7 < x) {
      throw new RangeError(`x value allowd in 0 to 7. actual:${x}`);
    }
    if (y < 0 || 7 < y) {
      throw new RangeError(`x value allowd in 0 to 7. actual:${x}`);
    }
    this._x = x;
    this._y = y;
  }
  get x() {
    return this._x;
  }
  get y() {
    return this._y;
  }
  toIdx() {
    return this._x + this._y * 8;
  }
  nextUp(): [boolean, StonePosition | null] {
    if (this._y == 0) return [false, null];
    return [true, new StonePosition(this._x, this._y - 1)];
  }
  nextUpToBorder(): StonePosition[] {
    let result: StonePosition[] = [];
    let next = this.nextUp();
    while (next[0]) {
      if (next[1] == null) break;
      result.push(next[1]);
      next = next[1].nextUp();
    }
    return result;
  }
  nextDown() {
    if (this._y == 7) return [false, null];
    return [true, new StonePosition(this._x, this._y + 1)];
  }
  nextLeft() {
    if (this._x == 0) return [false, null];
    return [true, new StonePosition(this._x - 1, this._y)];
  }
  nextRight() {
    if (this._x == 7) return [false, null];
    return [true, new StonePosition(this._x + 1, this._y)];
  }
}

class GameObject {
  game: Game;
  constructor(game: Game) {
    this.game = game;
  }
  update(timestamp: number) {}
  draw(context: CanvasRenderingContext2D) {}
  onclick(self: Game, e: MouseEvent) {}
  onmousemove(self: Game, e: MouseEvent) {}
  onmouseout(self: Game, e: MouseEvent) {}
}
class Board extends GameObject {
  hoverCellIndex: number | null;
  constructor(game: Game) {
    super(game);
    this.hoverCellIndex = null;
  }
  update(timestamp: number) {}
  draw(context: CanvasRenderingContext2D) {
    context.fillStyle = "green";
    context.fillRect(0, 0, this.game.size, this.game.size);
    const borderWeight = Game.borderWeight;
    const cellWidth = Game.cellWidth;
    context.fillStyle = "black";
    for (let i = 0; i < 9; i++) {
      const pos = (borderWeight + cellWidth) * i;
      context.fillRect(pos, 0, borderWeight, this.game.size);
      context.fillRect(0, pos, this.game.size, borderWeight);
    }
    for (let index = 0; index < 64; index++) {
      context.font = "24px serif";
      const x = index % 8;
      const y = Math.floor(index / 8);
      context.fillText(
        `${index}`,
        x * cellWidth + x * borderWeight,
        (y + 1) * cellWidth + (y + 1) * borderWeight
      );
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
  async onclick(self: Game, e: MouseEvent) {
    try {
      if (this.hoverCellIndex == null) {
        return;
      }
      let index = this.hoverCellIndex;
      if (self.stones[index] != null) {
        return;
      }
      const turnNo =
        self.turn.innerText == Stone.black ? Stone.black : Stone.white;
      if (!this.canPut(self, index, turnNo)) {
        return;
      }
      this.put(self, index, turnNo);
      self.turn.innerText =
        self.turn.innerText == Stone.black ? Stone.white : Stone.black;
      self.showStat();
      // // 白を自動で実行
      // const turnNo2 =
      //   self.turn.innerText == Stone.black ? Stone.black : Stone.white;
      // index = await this.putByAI(self, turnNo2);
      // console.log(index);
      // if (!this.put(self, index, turnNo2)) {
      //   return;
      // }
      // self.turn.innerText =
      //   self.turn.innerText == Stone.black ? Stone.white : Stone.black;
      // self.showStat();
    } catch (err) {
      console.error(`name: ${err.name}`);
      console.error(`message: ${err.message}`);
      console.error(`stack: ${err.stack}`);
      console.error(`${err}`);
    }
  }
  onmousemove(self: Game, e: MouseEvent) {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const mouseX = e.clientX - Math.floor(rect.left) - 2;
    const mouseY = e.clientY - Math.floor(rect.top) - 2;
    if (mouseX < 0 || mouseY < 0) {
      return null;
    }
    const x = Math.floor(mouseX / Game.cellWidth);
    const y = Math.floor(mouseY / Game.cellWidth);
    const index = x + y * 8;
    this.hoverCellIndex = index;
  }
  onmouseout(self: Game, e: MouseEvent) {
    this.hoverCellIndex = null;
  }
  canPut(self: any, index: number, turnNo: any) {
    return this.put(self, index, turnNo, true);
  }
  put(game: Game, index: number, turnNo: string, dryRun = false) {
    try {
      const getIdx = (pos: any, x: number, y: number) => {
        return pos.x + x + (pos.y + y) * 8;
      };
      const x = index % 8;
      const y = Math.floor(index / 8);
      const currPos = { x: x, y: y };
      // 上下左右に走査する。自分または空セルの場合は中断。
      let flipCount = 0;
      const flip = (f1: any, f2: any) => {
        let y = 1;
        for (y = 1; y < 8; y++) {
          const nextPos = f1(y);
          const i = getIdx(currPos, nextPos.x, nextPos.y);
          if (i < 0 || 63 < i) {
            break;
          }
          const stone = game.stones[i];
          if (stone == null) {
            break;
          }
          if (stone.color == turnNo) {
            break;
          }
        }
        if (y > 1) {
          for (const j of f2(y)) {
            flipCount++;
            if (!dryRun) {
              console.log(`置く場所:${index} 端:${y} 間:${j}`);
              const stone2 = game.stones[j];
              if (!stone2) throw new Error(`stone2 is null. i:${y} j:${j}`);
              stone2.color = turnNo;
              const x2 = j % 8;
              const y2 = Math.floor(j / 8);
              const items = game.children.filter(
                (node: any) => node.x == x2 && node.y == y2
              );
              if (items.length > 0) {
                items[0].flip();
              }
            }
          }
        }
      };
      const fs = {
        上: {
          f1: (b: number) => {
            return { x: 0, y: b * -1 };
            // return getIdx(currPos, 0, b * -1);
          },
          f2: function* (y: number) {
            const i = getIdx(currPos, 0, y * -1 + 1);
            for (let j = i; j < index; j += 8) {
              yield j;
            }
          },
        },
        下: {
          f1: (b: number) => {
            return { x: 0, y: b };
            // return getIdx(currPos, 0, b);
          },
          f2: function* (y: number) {
            const i = getIdx(currPos, 0, y - 1);
            for (let j = i; j > index; j -= 8) {
              yield j;
            }
          },
        },
        左: {
          f1: (b: number) => {
            return { x: b * -1, y: 0 };
            // return getIdx(currPos, b * -1, 0);
          },
          f2: function* (x: number) {
            const i = getIdx(currPos, x * -1 + 1, 0);
            for (let j = i; j < index; j += 1) {
              yield j;
            }
          },
        },
        右: {
          f1: (b: number) => {
            return { x: b - 1, y: 0 };
            // return getIdx(currPos, b - 1, 0);
          },
          f2: function* (x: number) {
            const i = getIdx(currPos, x - 1, 0);
            for (let j = i; j > index; j -= 1) {
              yield j;
            }
          },
        },
      };
      if (flipCount == 0) console.log("上===============================");
      flip(fs.上.f1, fs.上.f2);
      if (flipCount == 0) console.log("下===============================");
      flip(fs.下.f1, fs.下.f2);
      if (flipCount == 0) console.log("左===============================");
      flip(fs.左.f1, fs.左.f2);
      if (flipCount == 0) console.log("右===============================");
      flip(fs.右.f1, fs.右.f2);
      if (flipCount == 0) {
        return false;
      }
      if (!dryRun) {
        const stone = new Stone(this.game, x, y, turnNo);
        game.stones[index] = stone;
        this.game.children.push(stone);
      }
      return true;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  async putByAI(self: any, turnNo: any) {
    const toPreditionData = () => {
      const get = (no: any): number[] => {
        // console.log(no);
        return self.stones.map((e: any) => {
          if (e == null) return 0;
          if (e.color == no) return 1;
          return 0;
        });
      };
      const to8x8 = (ary: number[]) => {
        var tmp = [];
        for (var i = 0; i < ary.length; i += 8) {
          tmp.push(ary.slice(i, i + 8));
        }
        return tmp;
      };
      // console.log(get(Stone.black));
      // console.log(get(Stone.white));
      const playerBoard = to8x8(get(turnNo));
      const enemyBoard = to8x8(
        get(turnNo == Stone.white ? Stone.black : Stone.white)
      );
      return tf.tensor([[playerBoard, enemyBoard]]);
    };
    const xs = toPreditionData();
    // console.log(xs);
    // load model
    const path = "model/model.json";
    const model = await tf.loadGraphModel(path);
    // predict
    const y_pred = await model.predict(xs);
    // y_pred.print();

    // console.log(y_pred.toString());
    // convert to array
    const values = await (y_pred as tf.Tensor).data();
    // console.log(values);
    for (let i = 0, len = values.length; i < len; i += 1) {
      if (this.canPut(self, i, turnNo)) {
        continue;
      }
      values[i] = 0;
    }
    const data = await tf.argMax(values).data();
    // console.log(data[0]);
    return data[0];
  }
}
class Stone extends GameObject {
  static black = "黒";
  static white = "白";
  static image: HTMLImageElement | null = null;
  static margin = 2;
  currentFrame;
  frames: any;
  prevtime: number;
  x: number;
  y: number;
  color: string;
  constructor(game: Game, x: number, y: number, color: string) {
    super(game);
    if (!Stone.image) {
      const img = new Image();
      img.src = "image/stone.png";
      img.onload = () => {
        console.log("stone image is loaded.");
        Stone.image = img;
      };
    }
    this.currentFrame = 0;
    this.frames = [
      {
        ms: 5000,
        frames: [0, 0, 100, 100, 0 + Stone.margin, 0 + Stone.margin, 67, 67],
      },
      {
        ms: 300,
        frames: [
          101,
          0,
          50,
          100,
          15 + Stone.margin,
          0 + Stone.margin,
          33.5,
          67,
        ],
      },
      {
        ms: 300,
        frames: [
          148,
          0,
          50,
          100,
          20 + Stone.margin,
          0 + Stone.margin,
          33.5,
          67,
        ],
      },
      {
        ms: 1000,
        frames: [200, 0, 100, 100, 0 + Stone.margin, 0 + Stone.margin, 67, 67],
      },
    ];
    this.prevtime = 0;
    this.x = x;
    this.y = y;
    this.color = color;
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
  draw(context: any) {
    if (!Stone.image) return;
    const frameIndex = this.color == Stone.black ? 0 : 3;
    const frame = this.frames[frameIndex];
    const frames = frame.frames.slice(0, 8);
    frames[4] += (Game.borderWeight + 67) * this.x + 2;
    frames[5] += (Game.borderWeight + 67) * this.y + 2;
    context.drawImage(Stone.image, ...frames);
  }
  flip() {
    this.color = this.color == Stone.black ? Stone.white : Stone.black;
  }
}
class Game {
  static borderWeight = 2;
  static cellWidth = 0; //(this.size - (Game.borderWeight * 9)) / 8;
  fps: HTMLElement;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  frameCount: number;
  prevTime: number;
  size: number;
  stones: (Stone | null)[];
  turn: HTMLElement;
  children: any[];
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
    Game.cellWidth = (this.size - Game.borderWeight * 9) / 8;
    // リバーシ情報
    this.stones = new Array(64).fill(null);
    this.stones[27] = new Stone(this, 3, 3, Stone.white);
    this.stones[28] = new Stone(this, 4, 3, Stone.black);
    this.stones[35] = new Stone(this, 3, 4, Stone.black);
    this.stones[36] = new Stone(this, 4, 4, Stone.white);
    const turn = document.getElementById("turn");
    if (!turn) throw ReferenceError;
    this.turn = turn;
    this.turn.innerText = Stone.black;
    this.children = [];
    this.children.push(new Board(this));
    this.children.push(new Stone(this, 3, 3, Stone.white));
    this.children.push(new Stone(this, 4, 3, Stone.black));
    this.children.push(new Stone(this, 3, 4, Stone.black));
    this.children.push(new Stone(this, 4, 4, Stone.white));
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
  showStat() {
    const label = document.getElementById("stat");
    if (!label) throw ReferenceError;
    const b = this.stones.filter((e: Stone | null) => e?.color == Stone.black)
      .length;
    const w = this.stones.filter((e: Stone | null) => e?.color == Stone.white)
      .length;
    label.innerText = `黒:${b}まい 白:${w}まい`;
  }
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
    this.size = 560; // Math.min(document.documentElement.clientWidth, document.documentElement.clientHeight) - 50;
    Game.cellWidth = (this.size - Game.borderWeight * 9) / 8;

    const size = this.size;
    const borderWeight = Game.borderWeight;
    const cellWidth = Game.cellWidth;
    const context = this.context;

    this.canvas.width = size;
    this.canvas.height = size;
    context.clearRect(0, 0, size, size);

    for (const iterator of this.children) {
      iterator.draw(context);
    }

    // 石
    // for (let i = 0; i < this.stones.length; i++) {
    //   const stone = this.stones[i];
    //   const x = i % 8;
    //   const y = Math.floor(i / 8);
    //   if (stone == Stone.white) {
    //     Stone.drawCircle(x, y, "white", this.context, borderWeight, cellWidth);
    //   }
    //   if (stone == Stone.black) {
    //     Stone.drawCircle(x, y, "black", this.context, borderWeight, cellWidth);
    //   }
    // }
  }
}

window.onload = () => {
  const div: HTMLElement | null = document.getElementById("board");
  if (div == null) {
    return;
  }
  new Game(div);
};
