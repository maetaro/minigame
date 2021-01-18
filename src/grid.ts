/**
 * Code blocks are great for examples
 * This comment _supports_ [Markdown](https://marked.js.org/)
 *
 * ```
 * <my-custom-element>Highlight JS will auto detect the language</my-custom-element>
 * ```
 *
 * ```typescript
 * // Or you can specify the language explicitly
 * const instance = new MyClass();
 * ```
 */
export class Grid {
  /**
   * Overall width
   */
  width: number;
  /**
   * Number to divide
   */
  columns: number;
  /**
   * Grid class constructor
   * @param width Overall width
   * @param columns Number to divide
   */
  constructor(width: number, columns: number = 16) {
    this.width = width;
    this.columns = columns;
  }
  /**
   * Returns the specified position. width separated by columns.
   * @param index
   */
  span(index: number): number {
    return (this.width / this.columns) * index;
  }
  /**
   * Returns the center position.
   * @param offset distance from center.
   * ```typescript
   * > const instance = new Grid(30, 3);
   * > grid.center()
   * 15
   * ```
   */
  center(offset: number = 0): number {
    return (this.width / this.columns) * (this.columns / 2.0 + offset);
  }
}
