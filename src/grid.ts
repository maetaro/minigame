export class Grid {
  width: number;
  columns: number;
  constructor(width: number, columns?: number) {
    if (!columns) {
      columns = 16;
    }
    this.width = width;
    this.columns = columns;
  }
  span(index: number): number {
    return (this.width / this.columns) * index;
  }
  center(offset?: number): number {
    if (!offset) {
      offset = 0;
    }
    return (this.width / this.columns) * (this.columns / 2.0 + offset);
  }
}
