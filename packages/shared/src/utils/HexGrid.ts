import { type Tile, tileToPoint } from "./Helper";
import { Hex, Layout, OffsetCoord } from "./Hex";
import type { IHaveXY } from "./Vector2";

export class HexGrid {
   layout: Layout;
   maxX: number;
   maxY: number;
   size: number;

   constructor(maxX: number, maxY: number, size: number) {
      this.layout = new Layout(Layout.pointy, { x: size, y: size }, { x: 0, y: 0 });
      this.maxX = maxX;
      this.maxY = maxY;
      this.size = size;
   }

   public center(): IHaveXY {
      return {
         x: Math.floor(this.maxX / 2),
         y: Math.floor(this.maxY / 2),
      };
   }

   public forEach(cb: (grid: IHaveXY) => void) {
      for (let x = 0; x < this.maxX; x++) {
         for (let y = 0; y < this.maxY; y++) {
            cb({ x: x, y: y });
         }
      }
   }

   // private drawGridDebugInfo(x: number, y: number, graphics: SmoothGraphics) {
   //    const pos = this.gridToPosition({ x, y });
   //    const font = new BitmapText(`${x},${y}\n(${Math.round(pos.x)},${Math.round(pos.y)})`, {
   //       fontName: Fonts.Marcellus,
   //       fontSize: 14,
   //       align: "center",
   //       tint: 0xffffff,
   //    });
   //    graphics.addChild(font).position.set(pos.x - font.width / 2, pos.y - font.height / 2);
   // }

   public maxPosition(): IHaveXY {
      const point = this.gridToPosition({ x: this.maxX - 1, y: this.maxY - 1 });
      // This is to give an extra padding on the right
      return point;
   }

   public positionToGrid(position: IHaveXY): IHaveXY {
      const o = OffsetCoord.roffsetFromCube(OffsetCoord.ODD, this.layout.pixelToHex(position).round());
      return { x: o.col, y: o.row };
   }

   public isEdge(grid: IHaveXY, edgeSize: number) {
      if (
         grid.x < edgeSize ||
         grid.y < edgeSize ||
         grid.x > this.maxX - edgeSize - 1 ||
         grid.y > this.maxY - edgeSize - 1
      ) {
         return true;
      }
      return false;
   }

   public isValid(g: IHaveXY): boolean {
      return g.x >= 0 && g.x < this.maxX && g.y >= 0 && g.y < this.maxY;
   }

   public gridToPosition(grid: IHaveXY): IHaveXY {
      return this.layout.hexToPixel(this.gridToHex(grid));
   }

   public xyToPosition(xy: Tile): IHaveXY {
      this.gridToHex(tileToPoint(xy), HexGrid._hex1);
      return this.layout.hexToPixel(HexGrid._hex1);
   }

   public getNeighbor(grid: IHaveXY, direction: number): IHaveXY {
      this.gridToHex(grid, HexGrid._hex1);
      HexGrid._hex1.neighbor(direction, HexGrid._hex1);
      return this.hexToGrid(HexGrid._hex1);
   }

   public getNeighbors(grid: IHaveXY): IHaveXY[] {
      const result: IHaveXY[] = [];
      for (let i = 0; i < 6; i++) {
         this.gridToHex(grid, HexGrid._hex1);
         HexGrid._hex1.neighbor(i, HexGrid._hex1);
         const g = this.hexToGrid(HexGrid._hex1);
         if (this.isValid(g)) {
            result.push(g);
         }
      }
      return result;
   }

   public getRange(grid: IHaveXY, distance: number): IHaveXY[] {
      const result: IHaveXY[] = [];
      this.gridToHex(grid).forEachInRange(
         distance,
         (h: Hex) => {
            const g = this.hexToGrid(h);
            if (this.isValid(g)) {
               result.push(g);
            }
         },
         HexGrid._hex1,
      );
      return result;
   }

   private _distanceCache: Map<number, number> = new Map();

   public distanceTile(xy1: Tile, xy2: Tile): number {
      return this.distance((xy1 >> 16) & 0xffff, xy1 & 0xffff, (xy2 >> 16) & 0xffff, xy2 & 0xffff);
   }

   private static _oc1 = new OffsetCoord(0, 0);
   private static _oc2 = new OffsetCoord(0, 0);
   private static _hex1 = new Hex(0, 0, 0);
   private static _hex2 = new Hex(0, 0, 0);

   public distance(x1: number, y1: number, x2: number, y2: number): number {
      const key1 = y1 * this.maxX + x1;
      const key2 = y2 * this.maxX + x2;
      const key = (Math.max(key1, key2) << 16) | Math.min(key1, key2);
      const cached = this._distanceCache.get(key);

      if (cached) {
         return cached;
      }

      const hex1 = HexGrid._hex1;
      const oc1 = HexGrid._oc1;
      oc1.col = x1;
      oc1.row = y1;
      OffsetCoord.roffsetToCube(OffsetCoord.ODD, oc1, hex1);

      const hex2 = HexGrid._hex2;
      const oc2 = HexGrid._oc2;
      oc2.col = x2;
      oc2.row = y2;
      OffsetCoord.roffsetToCube(OffsetCoord.ODD, oc2, hex2);

      const distance = hex1.distanceSelf(hex2);

      this._distanceCache.set(key, distance);
      return distance;
   }

   public gridToHex(grid: IHaveXY, result?: Hex): Hex {
      HexGrid._oc1.col = grid.x;
      HexGrid._oc1.row = grid.y;
      return OffsetCoord.roffsetToCube(OffsetCoord.ODD, HexGrid._oc1, result);
   }

   public hexToGrid(hex: Hex): IHaveXY {
      OffsetCoord.roffsetFromCube(OffsetCoord.ODD, hex, HexGrid._oc1);
      return { x: HexGrid._oc1.col, y: HexGrid._oc1.row };
   }

   public hexToPosition(hex: Hex): IHaveXY {
      return this.layout.hexToPixel(hex);
   }
}
