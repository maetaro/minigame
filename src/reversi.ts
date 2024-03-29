import * as tf from "@tensorflow/tfjs";
import { Game, GameObject, GameOptions, Vector2 } from "./game";
import { Renderer } from "./renderer";
import { RectangleShape } from "./shape";

export const sum = (...a: number[]) => a.reduce((acc, val) => acc + val, 0);

export class Cursor extends RectangleShape {
  constructor(game: Game) {
    super(game, 67, 67);
  }
}

export class Board extends GameObject {
  static borderWeight = 2;
  cellWidth = 0; //(this.size - (Game.borderWeight * 9)) / 8;
  hoverCellIndex: number | null = null;
  cursor: Cursor;
  constructor(game: Game) {
    super(game);
    this.cellWidth = (game.options.width - Board.borderWeight * 9) / 8;
    this.cursor = new Cursor(game);
    this.cursor.fillStyle = "transparent";
    this.cursor.strokeStyle = "white";
    this.cursor.visible = false;
    game.children.push(this.cursor);
  }
  update(timestamp: number) {}
  draw() {
    // 背景
    Renderer.instance().drawRect(
      0,
      0,
      this.game.options.width,
      this.game.options.height,
      "green",
      "green",
      1
    );
    const borderWeight = 1; //Board.borderWeight;
    const cellWidth = 69.5; //this.cellWidth;
    for (let index = 0; index < 64; index++) {
      const x = index % 8;
      const y = Math.floor(index / 8);
      // if (x == 0) continue;
      // if (y == 0) continue;
      const margin = 3;
      // 黒枠
      Renderer.instance().drawRect(
        margin + (x * cellWidth + x * borderWeight) + x * -1,
        margin + (y * cellWidth + y * borderWeight) + y * -1,
        cellWidth,
        cellWidth,
        "transparent",
        "black",
        Board.borderWeight
      );
      Renderer.instance().drawText(
        margin + (x * cellWidth + x * borderWeight) + x * -1 + 5,
        margin + (y * cellWidth + y * borderWeight) + y * -1 + 17,
        `${index}`,
        "14px sans-serif",
        "black"
      );
    }
  }
  async onclick(self: Reversi, e: MouseEvent) {
    try {
      if (this.hoverCellIndex == null) {
        return;
      }
      let index = this.hoverCellIndex;
      if (self.stones.index(index) != null) {
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
    } catch (err) {
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
    const x = Math.floor(mouseX / this.cellWidth);
    const y = Math.floor(mouseY / this.cellWidth);
    const index = x + y * 8;
    this.hoverCellIndex = index;
    const left =
      Board.borderWeight + (Board.borderWeight + this.cellWidth) * x + 1;
    const top =
      Board.borderWeight + (Board.borderWeight + this.cellWidth) * y + 1;
    this.cursor.visible = true;
    this.cursor.position = new Vector2(left, top);
  }
  onmouseout(self: Game, e: MouseEvent) {
    this.cursor.visible = false;
  }
  canPut(self: Reversi, index: number, turnNo: any) {
    return this.put(self, index, turnNo, true);
  }
  put(game: Reversi, index: number, turnNo: string, dryRun = false) {
    try {
      const getIdx = (pos: any, x: number, y: number) => {
        return pos.x + x + (pos.y + y) * 8;
      };
      const x = index % 8;
      const y = Math.floor(index / 8);
      const currPos = { x: x, y: y };
      const getScanIndexes = (f1: any) => {
        const ret = [];
        for (let y = 1; y < 8; y++) {
          const nextPos = f1(currPos, y);
          if (nextPos == null) {
            break;
          }
          const i = getIdx(currPos, nextPos.x, nextPos.y);
          if (i < 0 || 63 < i) {
            break;
          }
          ret.push(i);
        }
        console.log(ret);
        return ret;
      };
      const getFlipTargetIndexes = (scanIndexes: number[]) => {
        const ret = [];
        let canFlip = false;
        for (const i of scanIndexes) {
          const stone = game.stones.index(i);
          if (stone == null) {
            return [];
          }
          if (stone.color == turnNo) {
            canFlip = true;
            break;
          }
          ret.push(i);
        }
        if (!canFlip) {
          return [];
        }
        return ret;
      };
      const flip = (f1: any) => {
        const scanIndexes = getScanIndexes(f1);
        const flipTargets = getFlipTargetIndexes(scanIndexes);
        if (flipTargets.length > 0) {
          for (const j of flipTargets) {
            if (!dryRun) {
              console.log(`置く場所:${index}`);
              console.log(flipTargets);
              const stone2 = game.stones.index(j);
              if (!stone2) throw new Error(`stone2 is null. i:${y} j:${j}`);
              stone2.color = turnNo;
            }
          }
        }
        return flipTargets.length;
      };
      const isOutOfBounds = (
        currPos: { x: number; y: number },
        incremental: { x: number; y: number }
      ) => {
        if (currPos.x + incremental.x < 0 || 7 < currPos.x + incremental.x) {
          return true;
        }
        if (currPos.y + incremental.y < 0 || 7 < currPos.y + incremental.y) {
          return true;
        }
        return false;
      };
      const fs = {
        上: (currPos: { x: number; y: number }, b: number) => {
          const incremental = { x: 0, y: b * -1 };
          if (isOutOfBounds(currPos, incremental)) {
            return null;
          }
          return incremental;
        },
        下: (currPos: { x: number; y: number }, b: number) => {
          const incremental = { x: 0, y: b };
          if (isOutOfBounds(currPos, incremental)) {
            return null;
          }
          return incremental;
        },
        左: (currPos: { x: number; y: number }, b: number) => {
          const incremental = { x: b * -1, y: 0 };
          if (isOutOfBounds(currPos, incremental)) {
            return null;
          }
          return incremental;
        },
        右: (currPos: { x: number; y: number }, b: number) => {
          const incremental = { x: b, y: 0 };
          if (isOutOfBounds(currPos, incremental)) {
            return null;
          }
          return incremental;
        },
        左上: (currPos: { x: number; y: number }, b: number) => {
          const incremental = { x: b * -1, y: b * -1 };
          if (isOutOfBounds(currPos, incremental)) {
            return null;
          }
          return incremental;
        },
        右上: (currPos: { x: number; y: number }, b: number) => {
          const incremental = { x: b, y: b * -1 };
          if (isOutOfBounds(currPos, incremental)) {
            return null;
          }
          return incremental;
        },
        右下: (currPos: { x: number; y: number }, b: number) => {
          const incremental = { x: b, y: b };
          if (isOutOfBounds(currPos, incremental)) {
            return null;
          }
          return incremental;
        },
        左下: (currPos: { x: number; y: number }, b: number) => {
          const incremental = { x: b * -1, y: b };
          if (isOutOfBounds(currPos, incremental)) {
            return null;
          }
          return incremental;
        },
      };
      let flipCount = 0;
      if (!dryRun) console.log("上===============================");
      flipCount += flip(fs.上);
      if (!dryRun) console.log("下===============================");
      flipCount += flip(fs.下);
      if (!dryRun) console.log("左===============================");
      flipCount += flip(fs.左);
      if (!dryRun) console.log("右===============================");
      flipCount += flip(fs.右);
      flipCount += flip(fs.左上);
      flipCount += flip(fs.右上);
      flipCount += flip(fs.右下);
      flipCount += flip(fs.左下);
      if (flipCount == 0) {
        return false;
      }
      if (!dryRun) {
        const stone = new Stone(this.game, x, y, turnNo);
        game.stones.push(stone);
        this.game.children.push(stone);
      }
      return true;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  async putByAI(self: Reversi, turnNo: any) {
    const toPreditionData = () => {
      const get = (no: string): number[] => {
        // console.log(no);
        const ret = new Array(64).fill(0);
        for (const stone of self.stones.toArray()) {
          if (stone.color == no) {
            ret[stone.index] = 1;
          }
        }
        return ret;
        // return self.stones.map((e: Stone) => {
        //   if (e == null) return 0;
        //   if (e.color == no) return 1;
        //   return 0;
        // });
      };
      const to8x8 = (ary: number[]) => {
        var tmp = [];
        for (var i = 0; i < ary.length; i += 8) {
          tmp.push(ary.slice(i, i + 8));
        }
        return tmp;
      };
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

export class Stones {
  private stones: Stone[] = [];
  constructor() {}
  index(index: number): Stone | null {
    const x = index % 8;
    const y = Math.floor(index / 8);
    const s = this.stones.filter((e) => e.x == x && e.y == y);
    return s.length > 0 ? s[0] : null;
  }
  toArray(): Stone[] {
    return this.stones;
  }
  map<T>(callbackfn: (value: Stone) => T) {
    return this.stones.map(callbackfn);
  }
  filter(predicate: (value: Stone) => boolean) {
    return this.stones.filter(predicate);
  }
  push(stone: Stone) {
    this.stones.push(stone);
  }
}

export class Stone extends GameObject {
  static black = "黒";
  static white = "白";
  static image: HTMLImageElement | null = null;
  static margin = 2;
  currentFrame;
  frames: { ms: number; frames: number[] }[];
  prevtime: number;
  x: number;
  y: number;
  color: string;
  get index() {
    return this.x + this.y * 8;
  }
  constructor(game: Game, x: number, y: number, color: string) {
    super(game);
    this.zOder = 1;
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
  draw() {
    if (!Stone.image) return;
    const frameIndex = this.color == Stone.black ? 0 : 3;
    const frame = this.frames[frameIndex];
    const frames = frame.frames.slice(0, 8);
    const cellWidth = 67;
    frames[4] += Board.borderWeight * (this.x + 1) + cellWidth * this.x + 1;
    frames[5] += Board.borderWeight * (this.y + 1) + cellWidth * this.y + 1;
    Renderer.instance().drawImage(Stone.image, frames);
  }
  flip() {
    this.color = this.color == Stone.black ? Stone.white : Stone.black;
  }
}

export class Reversi extends Game {
  static borderWeight = 2;
  static cellWidth = 0; //(this.size - (Game.borderWeight * 9)) / 8;
  stones: Stones;
  board: Board;
  turn: HTMLElement;
  constructor() {
    super();
    // リバーシ情報
    this.stones = new Stones();
    const addStone = (x: number, y: number, color: string) => {
      const item = new Stone(this, x, y, color);
      this.stones.push(item);
      this.children.push(item);
    };
    addStone(3, 3, Stone.white);
    addStone(4, 3, Stone.black);
    addStone(3, 4, Stone.black);
    addStone(4, 4, Stone.white);
    const skipButton = document.getElementById("skipButton");
    if (!skipButton) throw ReferenceError;
    skipButton.onclick = (e: MouseEvent) => {
      this.skip();
    };
    const putByAIButton = document.getElementById("putByAIButton");
    if (!putByAIButton) throw ReferenceError;
    putByAIButton.onclick = (e: MouseEvent) => {
      this.putByAIButton();
    };
    const turn = document.getElementById("turn");
    if (!turn) throw ReferenceError;
    this.turn = turn;
    this.turn.innerText = Stone.black;
    this.board = new Board(this);
    this.children.push(this.board);
    // this.children.push(new RectangleShape(this, 70, 140));
    // this.children.push(new CircleShape(this, 30));
  }
  skip() {
    this.turn.innerText =
      this.turn.innerText == Stone.black ? Stone.white : Stone.black;
    this.showStat();
  }
  async putByAIButton() {
    const turnNo2 =
      this.turn.innerText == Stone.black ? Stone.black : Stone.white;
    const index = await this.board.putByAI(this, turnNo2);
    console.log(index);
    if (!this.board.put(this, index, turnNo2)) {
      return;
    }
    this.turn.innerText =
      this.turn.innerText == Stone.black ? Stone.white : Stone.black;
    this.showStat();
  }
  showStat() {
    const label = document.getElementById("stat");
    if (!label) throw ReferenceError;
    const b = this.stones.filter((e: Stone) => e?.color == Stone.black).length;
    const w = this.stones.filter((e: Stone) => e?.color == Stone.white).length;
    label.innerText = `黒:${b}まい 白:${w}まい`;
  }
  update(timestamp: number) {
    // this.size = 560; // Math.min(document.documentElement.clientWidth, document.documentElement.clientHeight) - 50;
    // Board.cellWidth = (this.size - Board.borderWeight * 9) / 8;
  }
}

window.onload = () => {
  const div: HTMLElement | null = document.getElementById("board");
  if (div == null) {
    return;
  }
  const options = new GameOptions();
  options.width = 562;
  options.height = 562;
  const game = new Reversi();
  game.options = options;
  game.attach(div);
  game.start();
};
