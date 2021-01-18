export const sum = (...a: number[]) => a.reduce((acc, val) => acc + val, 0);

import * as tf from "@tensorflow/tfjs";
// const tf = require("@tensorflow/tfjs");

class GameObject {
  game: Game;
  constructor(game: Game) {
    this.game = game;
  }
  update(timestamp: number) {}
  draw(context: any) {}
  onclick(self: any, e: any) {}
  onmousemove(self: any, e: any) {}
  onmouseout(self: any, e: any) {}
}
class Board extends GameObject {
  hoverCellIndex: any;
  constructor(game: any) {
    super(game);
    this.hoverCellIndex = null;
  }
  update(timestamp: any) {}
  draw(context: any) {
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
  async onclick(self: any, e: any) {
    if (this.hoverCellIndex == null) {
      return;
    }
    let index = this.hoverCellIndex;
    if (self.stones[index] != 0) {
      return;
    }
    const turnNo =
      self.turn.innerText == Stone.black ? Stone.black : Stone.white;
    if (turnNo == Stone.white) {
      index = await this.putByAI(self, turnNo);
    }
    if (!this.canPut(self, index, turnNo)) {
      return;
    }
    this.put(self, index, turnNo);
    self.turn.innerText =
      self.turn.innerText == Stone.black ? Stone.white : Stone.black;
    self.showStat();
    // 白を自動で実行
    const turnNo2 =
      self.turn.innerText == Stone.black ? Stone.black : Stone.white;
    index = await this.putByAI(self, turnNo2);
    console.log(index);
    if (!this.put(self, index, turnNo2)) {
      return;
    }
    self.turn.innerText =
      self.turn.innerText == Stone.black ? Stone.white : Stone.black;
    self.showStat();
  }
  onmousemove(self: any, e: any) {
    const rect = e.target.getBoundingClientRect();
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
  onmouseout(self: any, e: any) {
    this.hoverCellIndex = null;
  }
  canPut(self: any, index: any, turnNo: any) {
    return this.put(self, index, turnNo, true);
  }
  put(game: any, index: any, turnNo: any, dryRun = false) {
    const getIdx = (pos: any, x: any, y: any) => {
      return pos.x + x + (pos.y + y) * 8;
    };
    const x = index % 8;
    const y = Math.floor(index / 8);
    const currPos = { x: x, y: y };
    // 上下左右に走査する。自分または空セルの場合は中断。
    let flipCount = 0;
    const flip = (f1: any, f2: any) => {
      for (let y = 1; y < 8; y++) {
        const i = f1(currPos, y);
        if (i < 0 || 63 < i) {
          continue;
        }
        if (game.stones[i] != 0 && game.stones[i] != turnNo) {
          continue;
        }
        if (y > 1 && game.stones[i] == turnNo) {
          for (const j of f2(i)) {
            flipCount++;
            if (!dryRun) {
              game.stones[j] = turnNo;
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
        break;
      }
    };
    // 上
    // 右上
    // 右
    // 右下↘︎
    // 下
    // 左下
    // 左
    // 左上
    flip(
      (currPos: any, y: any) => {
        return getIdx(currPos, 0, y * -1);
      },
      function* (i: any) {
        for (let j = i + 1; j < index; j += 8) {
          yield j;
        }
      }
    );
    flip(
      (currPos: any, y: any) => {
        return getIdx(currPos, y, y * -1);
      },
      function* (i: any) {
        for (let j = i + 1; j < index; j += 7) {
          yield j;
        }
      }
    );
    flip(
      (currPos: any, x: any) => {
        return getIdx(currPos, x, 0);
      },
      function* (i: any) {
        for (let j = i - 1; j > index; j -= 1) {
          yield j;
        }
      }
    );
    flip(
      (currPos: any, x: any) => {
        return getIdx(currPos, x, x);
      },
      function* (i: any) {
        for (let j = i - 1; j > index; j -= 9) {
          yield j;
        }
      }
    );
    flip(
      (currPos: any, y: any) => {
        return getIdx(currPos, 0, y);
      },
      function* (i: any) {
        for (let j = i - 1; j > index; j -= 8) {
          yield j;
        }
      }
    );
    flip(
      (currPos: any, y: any) => {
        return getIdx(currPos, y * -1, y);
      },
      function* (i: any) {
        for (let j = i - 1; j > index; j -= 7) {
          yield j;
        }
      }
    );
    flip(
      (currPos: any, x: any) => {
        return getIdx(currPos, x * -1, 0);
      },
      function* (i: any) {
        for (let j = i + 1; j < index; j += 1) {
          yield j;
        }
      }
    );
    flip(
      (currPos: any, y: any) => {
        return getIdx(currPos, y * -1, y * -1);
      },
      function* (i: any) {
        for (let j = i + 1; j < index; j += 9) {
          yield j;
        }
      }
    );
    if (flipCount == 0) {
      return false;
    }
    if (!dryRun) {
      game.stones[index] = turnNo;
      this.game.children.push(new Stone(this, x, y, turnNo));
    }
    return true;
  }
  async putByAI(self: any, turnNo: any) {
    const toPreditionData = () => {
      const get = (no: any) => {
        // console.log(no);
        return self.stones.map((e: any) => {
          if (e == 0) return 0;
          if (e == no) return 1;
          return 0;
        });
      };
      const to8x8 = (ary: any) => {
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
  static image: any = null;
  static margin = 2;
  currentFrame;
  frames: any;
  prevtime: any;
  x;
  y;
  color;
  constructor(game: any, x: any, y: any, color: any) {
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
  update(timestamp: any) {
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
  stones: any[];
  turn: any;
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
    this.stones = new Array(64).fill(0);
    this.stones[27] = Stone.white;
    this.stones[28] = Stone.black;
    this.stones[35] = Stone.black;
    this.stones[36] = Stone.white;
    this.turn = document.getElementById("turn");
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
    const label: any = document.getElementById("stat");
    const b = this.stones.filter((e: any) => e == Stone.black).length;
    const w = this.stones.filter((e: any) => e == Stone.white).length;
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
