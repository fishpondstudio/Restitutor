import { LINE_SCALE_MODE, SmoothGraphics } from "@pixi/graphics-smooth";
import { hasFlag, pointToTile, type Tile, tileToPoint } from "@project/shared/src/utils/Helper";
import type { IHaveXY } from "@project/shared/src/utils/Vector2";
import {
   type ColorSource,
   Container,
   type FederatedPointerEvent,
   LINE_CAP,
   LINE_JOIN,
   ParticleContainer,
   Rectangle,
   Sprite,
   type Texture,
} from "pixi.js";
import { Fonts } from "../assets";
import Land from "../data/Land.json";
import type { Province } from "../game/definitions/Province";
import { MapForegroundColors, MapTextColors } from "../game/definitions/Tile";
import { Tiles } from "../game/definitions/TileConstants";
import { RefreshTiles } from "../game/Events";
import { getProvinceName } from "../game/logic/ProvinceLogic";
import { getTileWar } from "../game/logic/TileLogic";
import { MapGrid, TileHeight } from "../game/MapGrid";
import { showSidebar } from "../ui/common/Sidebar";
import { SidebarWidth } from "../ui/common/SidebarComp";
import { DiplomacyPage } from "../ui/DiplomacyPage";
import { EditTilePage } from "../ui/EditTilePage";
import { TilePage } from "../ui/TilePage";
import { runFunc, sequence, to } from "../utils/actions/ActionHelper";
import { CustomAction } from "../utils/actions/CustomAction";
import { G, GameFlags } from "../utils/Global";
import { destroyAllChildren, type ISceneContext, Scene } from "../utils/SceneManager";
import { UnicodeText } from "../utils/UnicodeText";
import { TileVisual } from "./TileVisual";

const marginX = 2000;
const textureHeight = 256;
let time = 0;

export class WorldScene extends Scene {
   private _tileMap = new Map<Tile, TileVisual>();
   private _indicatorMap = new Map<Tile, Sprite>();
   private _tileContainer: Container;
   private _indicatorContainer: Container;
   private _emptyTileContainer: ParticleContainer;
   private _labelContainer: Container;
   private _selectors: Container<Sprite>;
   private _selectedTiles = new Set<Tile>();
   private _selectedProvince: Province;
   private _staticOutline: SmoothGraphics;
   private _dynamicOutline: SmoothGraphics;
   private _landTiles: Set<number>;
   private _clickTileHandler: ((tile: Tile, e: FederatedPointerEvent) => void) | undefined;
   private readonly _isEditor: boolean;

   backgroundColor(): ColorSource {
      return 0xabd3de;
   }

   constructor(context: ISceneContext) {
      super(context);
      const { app } = context;

      const max = MapGrid.maxPosition();
      this.viewport.setWorldSize(max.x + marginX * 2, max.y);

      this._emptyTileContainer = this.viewport.addChild(new ParticleContainer(MapGrid.maxX * MapGrid.maxY, {}));
      this._emptyTileContainer.position.set(marginX, 0);

      this._tileContainer = this.viewport.addChild(new Container());
      this._tileContainer.position.set(marginX, 0);

      this._staticOutline = this.viewport.addChild(new SmoothGraphics());
      this._staticOutline.position.set(marginX, 0);

      this._indicatorContainer = this.viewport.addChild(new Container());
      this._indicatorContainer.position.set(marginX, 0);

      this._selectors = this.viewport.addChild(new Container<Sprite>());

      this._dynamicOutline = this.viewport.addChild(new SmoothGraphics());
      this._dynamicOutline.position.set(marginX, 0);

      this._labelContainer = this.viewport.addChild(new Container());
      this._labelContainer.position.set(marginX, 0);

      const minZoom = Math.max(
         app.screen.width / this.viewport.worldWidth,
         app.screen.height / this.viewport.worldHeight,
      );
      this.viewport.zoom = (minZoom + 1) / 4;
      this.viewport.setZoomRange(minZoom, 1);

      this._landTiles = new Set<Tile>(Land);

      MapGrid.forEach((g) => {
         const tile = pointToTile(g);
         if (this._landTiles.has(tile)) {
            const position = MapGrid.gridToPosition(g);
            if (G.save.state.tiles.has(tile)) {
               const visual = this._tileContainer.addChild(new TileVisual(tile));
               visual.position.set(position.x, position.y);
               this._tileMap.set(tile, visual);
               this._drawIndicator(tile, position);
            } else {
               const textureHeight = 256;
               const sprite = this._emptyTileContainer.addChild(new Sprite(G.textures.get("Tile/Background")));
               sprite.scale.set(TileHeight / textureHeight);
               sprite.position.set(position.x, position.y);
               sprite.anchor.set(0.5, 0.5);
               sprite.alpha = 0.75;
            }
         } else {
            G.save.state.tiles.delete(tile);
         }
      });

      this._drawProvinceStaticOutlineAndLabel();

      RefreshTiles.on(({ tiles, options }) => {
         for (const tile of tiles) {
            const visual = this._tileMap.get(tile);
            if (visual) {
               if (options.indicator) {
                  this._drawIndicator(tile, visual.position);
               }
               if (options.visual) {
                  const newVisual = this._tileContainer.addChild(new TileVisual(tile));
                  newVisual.position = visual.position;
                  this._tileMap.set(tile, newVisual);
                  visual.destroy({ children: true });
               }
            }
         }
         if (options.visual) {
            this._drawProvinceStaticOutlineAndLabel();
            this.drawProvinceOutline(this._selectedProvince);
         }
      });

      const state = G.save.state.provinces[G.save.state.playerProvince];
      if (state) {
         this.lookAt(state.capital, { time: 0 });
      } else {
         this.lookAt(Tiles.Rome, { time: 0 });
      }
      this._selectedProvince = G.save.state.playerProvince;
      this.drawProvinceOutline(G.save.state.playerProvince);

      const params = new URLSearchParams(location.href.split("?")[1]);
      this._isEditor = params.has("editor");
      if (this._isEditor) {
         this._enableTileEditor();
      }
   }

   override scrollSensitivity(): number {
      return 1.5;
   }

   override onClicked(e: FederatedPointerEvent): void {
      const pos = this.viewport.screenToWorld(e);
      pos.x -= marginX;

      const point = MapGrid.positionToGrid(pos);
      const tile = pointToTile(point);

      if (!this._tileMap.has(tile)) {
         return;
      }

      if (this._clickTileHandler) {
         this._clickTileHandler(tile, e);
         return;
      }

      const tileData = G.save.state.tiles.get(tile);
      if (tileData) {
         this.drawProvinceOutline(tileData.province);
      }

      if (this._isEditor) {
         if (e.ctrlKey) {
            if (this._selectedTiles.has(tile)) {
               this._selectedTiles.delete(tile);
            } else {
               this._selectedTiles.add(tile);
            }
         } else {
            this._selectedTiles.clear();
            this._selectedTiles.add(tile);
         }
         this.drawSelectors(this._selectedTiles);
         showSidebar(<EditTilePage tiles={this._selectedTiles} />);
      } else {
         this._selectedTiles.clear();
         if (e.button === 0) {
            if (import.meta.env.DEV) {
               console.log(tile, tileToPoint(tile), G.save.state.tiles.get(tile));
            }
            this._selectedTiles.add(tile);
            showSidebar(<TilePage tile={tile} />);
         }
         if (e.button === 2) {
            const tileData = G.save.state.tiles.get(tile);
            if (tileData) {
               showSidebar(<DiplomacyPage province={tileData.province} />);
            }
         }
         this.drawSelectors(this._selectedTiles);
         // if (e.button === 1) {
         //    this._highlightedTiles.add(tile);
         //    this._drawHighlighters(this._highlightedTiles);
         // }
      }
   }

   public lookAt(tile: Tile, { time }: { time: number }): Promise<WorldScene> {
      return new Promise((resolve) => {
         const position = MapGrid.gridToPosition(tileToPoint(tile));
         position.x += marginX + SidebarWidth / 2 / this.viewport.zoom;
         if (time > 0) {
            sequence(
               CustomAction.createPoint(
                  () => this.viewport.center,
                  (value) => {
                     this.viewport.center = value;
                  },
                  position,
                  time,
               ),
               runFunc(() => resolve(this)),
            ).start();
         } else {
            this.viewport.center = position;
            resolve(this);
         }
      });
   }

   override onZoomed(zoom: number): void {
      this._cullTiles();
   }

   override onMoved(point: IHaveXY): void {
      this._cullTiles();
   }

   override onResize(width: number, height: number): void {
      super.onResize(width, height);
      this._cullTiles();
   }

   public update(dt: number, unscaled: number): void {
      if (this._indicatorContainer.children.length > 0) {
         this._indicatorContainer.alpha = Math.sin(Math.PI * 2 * time) * 0.5 + 0.5;
         time += unscaled;
      }
   }

   public setClickTileHandler(callback: (tile: Tile, e: FederatedPointerEvent) => void): void {
      this._clickTileHandler = callback;
   }

   public clearClickTileHandler(): void {
      this._clickTileHandler = undefined;
   }

   public drawSelectors(tiles: Set<Tile>): void {
      this._selectedTiles = tiles;
      destroyAllChildren(this._selectors);
      this._selectedTiles.forEach((tile) => {
         this._addSelector(tile);
      });
   }

   private _removeIndicator(tile: Tile): void {
      const indicator = this._indicatorMap.get(tile);
      if (indicator) {
         indicator.destroy();
         this._indicatorMap.delete(tile);
      }
   }

   private _drawIndicator(tile: Tile, position: IHaveXY): void {
      const tileData = G.save.state.tiles.get(tile);
      this._removeIndicator(tile);
      if (!tileData) {
         return;
      }

      let texture: Texture | undefined;
      const war = getTileWar(tile, G.save);
      if (tileData.rebellion >= 10 || war) {
         texture = G.textures.get("Tile/BackgroundStripe");
      }
      if (!texture) {
         return;
      }
      const indicator = this._indicatorContainer.addChild(new Sprite(texture));
      this._indicatorMap.set(tile, indicator);
      indicator.anchor.set(0.5, 0.5);
      if (war) {
         indicator.tint = MapForegroundColors[war.attacker];
      } else {
         indicator.tint = MapForegroundColors[tileData.province];
      }
      indicator.alpha = 0.5;
      indicator.scale.set(TileHeight / textureHeight);
      indicator.position.set(position.x, position.y);
   }

   private _rect: Rectangle = new Rectangle();
   private _cullTiles(): void {
      const visibleRect = this.viewport.visibleWorldRect();
      for (const [tile, visual] of this._tileMap) {
         this._rect.x = visual.position.x + marginX - TileHeight / 2;
         this._rect.y = visual.position.y - TileHeight / 2;
         this._rect.width = TileHeight;
         this._rect.height = TileHeight;
         if (visibleRect.intersects(this._rect)) {
            visual.visible = true;
         } else {
            visual.visible = false;
         }
      }
   }

   public drawProvinceOutline(province: Province): Promise<WorldScene> {
      this._selectedProvince = province;
      if (hasFlag(G.flags, GameFlags.Sandbox)) {
         this._dynamicOutline.clear();
         return Promise.resolve(this);
      }
      this._dynamicOutline.clear();
      this._dynamicOutline.lineStyle({
         width: 3,
         color: 0xffffff,
         alpha: 1,
         alignment: 0.5,
         scaleMode: LINE_SCALE_MODE.NONE,
         cap: LINE_CAP.ROUND,
         join: LINE_JOIN.ROUND,
      });
      for (const [tile, tileData] of G.save.state.tiles) {
         if (tileData.province !== province) {
            continue;
         }
         const p = tileToPoint(tile);
         for (let dir = 0; dir < 6; dir++) {
            const neighborPoint = MapGrid.getNeighbor(p, dir);
            if (!neighborPoint) continue;
            const neighborTile = pointToTile(neighborPoint);
            if (G.save.state.tiles.get(neighborTile)?.province !== province) {
               const center = MapGrid.layout.hexToPixel(MapGrid.gridToHex(p));
               const offset1 = MapGrid.layout.hexCornerOffset(dir);
               const offset2 = MapGrid.layout.hexCornerOffset((dir + 1) % 6);
               const c1 = { x: center.x + offset1.x, y: center.y + offset1.y };
               const c2 = { x: center.x + offset2.x, y: center.y + offset2.y };
               this._dynamicOutline.moveTo(c1.x, c1.y);
               this._dynamicOutline.lineTo(c2.x, c2.y);
            }
         }
      }
      this._dynamicOutline.alpha = 0;
      return new Promise((resolve) => {
         sequence(
            to(this._dynamicOutline, { alpha: 1 }, 0.1),
            runFunc(() => resolve(this)),
         ).start();
      });
   }

   private _drawProvinceStaticOutlineAndLabel(): void {
      this._staticOutline.clear();
      this._staticOutline.lineStyle({
         width: 2,
         color: 0x888888,
         alpha: 1,
         alignment: 0.5,
         scaleMode: LINE_SCALE_MODE.NONE,
         cap: LINE_CAP.ROUND,
         join: LINE_JOIN.ROUND,
      });
      const drawnBorders = new Set<bigint>();
      for (const [tile, tileData] of G.save.state.tiles) {
         const p = tileToPoint(tile);
         for (let dir = 0; dir < 6; dir++) {
            const neighborPoint = MapGrid.getNeighbor(p, dir);
            if (!neighborPoint) continue;
            const neighborTile = pointToTile(neighborPoint);
            if (tileData.province !== G.save.state.tiles.get(neighborTile)?.province) {
               const hash =
                  tile < neighborTile
                     ? (BigInt(tile) << 32n) | BigInt(neighborTile)
                     : (BigInt(neighborTile) << 32n) | BigInt(tile);
               if (!drawnBorders.has(hash)) {
                  drawnBorders.add(hash);
                  const center = MapGrid.layout.hexToPixel(MapGrid.gridToHex(p));
                  const offset1 = MapGrid.layout.hexCornerOffset(dir);
                  const offset2 = MapGrid.layout.hexCornerOffset((dir + 1) % 6);
                  const c1 = { x: center.x + offset1.x, y: center.y + offset1.y };
                  const c2 = { x: center.x + offset2.x, y: center.y + offset2.y };
                  this._staticOutline.moveTo(c1.x, c1.y);
                  this._staticOutline.lineTo(c2.x, c2.y);
               }
            }
         }
      }
      destroyAllChildren(this._labelContainer);
      const provinceToEmptyTiles = new Map<Province, Tile[]>();
      G.save.state.tiles.forEach((data, tile) => {
         if (data.province) {
            if (!data.terrain || data.terrain === "Plain") {
               const tiles = provinceToEmptyTiles.get(data.province) ?? [];
               tiles.push(tile);
               provinceToEmptyTiles.set(data.province, tiles);
            }
         }
      });
      for (const [province, tiles] of provinceToEmptyTiles) {
         // Group tiles by their y coordinate (row)
         const rows = new Map<number, Tile[]>();
         for (const tile of tiles) {
            const { y } = tileToPoint(tile);
            if (!rows.has(y)) rows.set(y, []);
            rows.get(y)!.push(tile);
         }

         let bestChain: Tile[] = [];
         // For each row, find the longest contiguous chain of tiles (by x)
         for (const [y, rowTiles] of rows) {
            // Sort tiles in the row by x
            const sorted = rowTiles.slice().sort((a, b) => {
               return tileToPoint(a).x - tileToPoint(b).x;
            });
            let chain: Tile[] = [];
            let prevX: number | null = null;
            for (const tile of sorted) {
               const x = tileToPoint(tile).x;
               if (chain.length === 0 || (prevX !== null && x === prevX + 1)) {
                  chain.push(tile);
               } else {
                  if (chain.length > bestChain.length) bestChain = chain;
                  chain = [tile];
               }
               prevX = x;
            }
            if (chain.length > bestChain.length) bestChain = chain;
         }

         if (bestChain.length > 0) {
            // Pick the center tile of the best chain
            const startPos = MapGrid.gridToPosition(tileToPoint(bestChain[0]));
            const endPos = MapGrid.gridToPosition(tileToPoint(bestChain[bestChain.length - 1]));
            const text = this._labelContainer.addChild(
               new UnicodeText(getProvinceName(province, G.save), {
                  fontName: Fonts.TitleFont,
                  fontSize: 36,
                  tint: MapTextColors[province],
               }),
            );
            text.anchor.set(0.5, 0.5);
            text.position.set((startPos.x + endPos.x) / 2, (startPos.y + endPos.y) / 2 - 5);
         }
      }
   }

   private _addSelector(tile: Tile): void {
      const position = MapGrid.gridToPosition(tileToPoint(tile));
      const selector = this._selectors.addChild(new Sprite(G.textures.get("Tile/Selector")));
      selector.position.set(position.x + marginX, position.y);
      selector.scale.set(TileHeight / textureHeight);
      selector.anchor.set(0.5, 0.5);
      selector.alpha = 0.25;
   }

   private _enableTileEditor(): void {
      const sprite = this.viewport.addChild(new Sprite());
      sprite.scale.set(20.2);
      sprite.anchor.set(0.5, 0.5);
      sprite.position.set(17000, 9260);
      sprite.alpha = 0.4;

      document.addEventListener("keydown", (e) => {
         switch (e.key) {
            case "w": {
               sprite.y -= 10;
               break;
            }
            case "s": {
               sprite.y += 10;
               break;
            }
            case "a": {
               sprite.x -= 10;
               break;
            }
            case "d": {
               sprite.x += 10;
               break;
            }
            case "q": {
               sprite.scale.set(sprite.scale.x + 0.01);
               break;
            }
            case "e": {
               sprite.scale.set(sprite.scale.x - 0.01);
               break;
            }
         }
         console.log(sprite.position.x, sprite.position.y, sprite.scale.x);
      });
   }
}
