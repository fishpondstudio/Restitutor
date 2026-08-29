import { LINE_SCALE_MODE, SmoothGraphics } from "@pixi/graphics-smooth";
import { hslToRgb } from "@project/shared/src/thirdparty/RandomColor";
import { hasFlag, pointToTile, round, type Tile, tileToPoint } from "@project/shared/src/utils/Helper";
import type { IHaveXY } from "@project/shared/src/utils/Vector2";
import {
   type ColorSource,
   Container,
   type DisplayObject,
   type FederatedPointerEvent,
   LINE_CAP,
   LINE_JOIN,
   Sprite,
   type Texture,
} from "pixi.js";
import { Fonts } from "../Fonts";
import { Goods } from "../game/definitions/Goods";
import type { Province } from "../game/definitions/Province";
import type { Terrain } from "../game/definitions/Terrain";
import { GameStateUpdated, RefreshOverlay, RefreshTiles } from "../game/Events";
import { isLand, LandSize } from "../game/Land";
import { MapBackgroundColors, MapColorsH, MapForegroundColors, MapTextColors } from "../game/logic/MapColor";
import { findProvinceLabelPosition } from "../game/logic/MapLogic";
import { getProvinceName } from "../game/logic/ProvinceLogic";
import { getTileDefense, getTileMaintenanceCost, getTileTerrain, getTileWar, isCapital } from "../game/logic/TileLogic";
import { MapGrid, TileHeight, TileWidth } from "../game/MapGrid";
import { showPanel } from "../ui/common/ShowPanel";
import { hideSidebar } from "../ui/common/SidebarManager";
import { DiplomacyPage } from "../ui/DiplomacyPage";
import { EditTilePage } from "../ui/EditTilePage";
import { TilePage } from "../ui/TilePage";
import { runFunc, sequence, to } from "../utils/actions/ActionHelper";
import { CustomAction } from "../utils/actions/CustomAction";
import { G, GameFlags, isDev } from "../utils/Global";
import { MapContainer, MapParticleContainer } from "../utils/KeyedContainer";
import { destroyAllChildren, type ISceneContext, Scene } from "../utils/SceneManager";
import { UnicodeText } from "../utils/UnicodeText";
import { getOverlay } from "./Overlays";
import { ExternalBorder, InternalBorder } from "./WorldSceneConstants";

const MarginX = 2000;
const TextureHeight = 256;
const ProvinceLabelFontSize = 36;
let time = 0;
let TerrainTextures: Record<Terrain, Texture[]> | undefined;

export class WorldScene extends Scene {
   private _indicatorContainer: MapContainer<Tile, Sprite>;
   private _tileContainer: MapParticleContainer<Tile, Sprite>;
   private _capitalContainer: MapContainer<Tile, Sprite>;
   private _overlayContainer: MapContainer<Tile, DisplayObject>;
   private _labelContainer: Container;
   private _selectors: Container<Sprite>;
   private _selectedTiles = new Set<Tile>();
   private _selectedProvince: Province;
   private _staticOutline: SmoothGraphics;
   private _dynamicOutline: SmoothGraphics;
   private _lastZoom = 0;
   private _clickTileHandler: ((tile: Tile, e: FederatedPointerEvent) => void) | undefined;
   private readonly _isEditor: boolean;

   backgroundColor(): ColorSource {
      return 0xabd3de;
   }

   constructor(context: ISceneContext) {
      super(context);
      const { app } = context;

      const max = MapGrid.maxPosition();
      this.viewport.setWorldSize(max.x + MarginX * 2, max.y);

      this._tileContainer = this.viewport.addChild(new MapParticleContainer<Tile, Sprite>(LandSize, {}));
      this._tileContainer.position.set(MarginX, 0);

      this._capitalContainer = this.viewport.addChild(new MapContainer<Tile, Sprite>());
      this._capitalContainer.position.set(MarginX, 0);

      this._overlayContainer = this.viewport.addChild(new MapContainer<Tile, DisplayObject>());
      this._overlayContainer.position.set(MarginX, 0);

      this._staticOutline = this.viewport.addChild(new SmoothGraphics());
      this._staticOutline.position.set(MarginX, 0);

      this._indicatorContainer = this.viewport.addChild(new MapContainer<Tile, Sprite>());
      this._indicatorContainer.position.set(MarginX, 0);

      this._selectors = this.viewport.addChild(new Container<Sprite>());

      this._dynamicOutline = this.viewport.addChild(new SmoothGraphics());
      this._dynamicOutline.position.set(MarginX, 0);

      this._labelContainer = this.viewport.addChild(new Container());
      this._labelContainer.position.set(MarginX, 0);

      const minZoom = Math.max(
         app.screen.width / this.viewport.worldWidth,
         app.screen.height / this.viewport.worldHeight,
      );
      const maxZoom = 1;
      this.viewport.setZoomRange(minZoom, maxZoom);

      const minPos = { x: Number.POSITIVE_INFINITY, y: Number.POSITIVE_INFINITY };
      const maxPos = { x: Number.NEGATIVE_INFINITY, y: Number.NEGATIVE_INFINITY };
      MapGrid.forEach((g) => {
         const tile = pointToTile(g);
         if (isLand(tile)) {
            const position = MapGrid.gridToPosition(g);
            this._makeTile(tile);
            this._drawIndicator(tile);
            if (G.save.state.tiles.has(tile)) {
               minPos.x = Math.min(minPos.x, position.x - TileWidth / 2);
               minPos.y = Math.min(minPos.y, position.y - TileHeight / 2);
               maxPos.x = Math.max(maxPos.x, position.x + TileWidth / 2);
               maxPos.y = Math.max(maxPos.y, position.y + TileHeight / 2);
            } else {
               const visual = this._renderTerrain(tile);
               visual.tint = 0x333333;
            }
         } else {
            G.save.state.tiles.delete(tile);
         }
      });

      // Adjust for lower part of Egypt
      maxPos.y -= TileHeight * 4;

      this._lastZoom = Math.min(
         this.viewport.screenWidth / (maxPos.x - minPos.x),
         this.viewport.screenHeight / (maxPos.y - minPos.y),
      );
      this.viewport.zoom = this._lastZoom;
      this.viewport.center = { x: MarginX + (minPos.x + maxPos.x) / 2, y: (minPos.y + maxPos.y) / 2 };

      this._updateAlpha();
      this._drawStaticOutlineAndLabel();

      RefreshTiles.on(({ tiles, options }) => {
         for (const tile of tiles) {
            const tileData = G.save.state.tiles.get(tile);
            const visual = this._tileContainer.map.get(tile);
            if (tileData && !visual) {
               this._makeTile(tile);
               this._drawIndicator(tile);
            } else if (visual) {
               if (options.indicator) {
                  this._drawIndicator(tile);
               }
               if (options.visual) {
                  this._makeTile(tile);
               }
            }
         }
         if (options.visual) {
            this._drawStaticOutlineAndLabel();
            this.drawProvinceOutline(this._selectedProvince);
         }
      });

      RefreshOverlay.on(() => {
         for (const [tile, visual] of this._overlayContainer.map) {
            this._renderOverlay(tile);
         }
      });

      GameStateUpdated.on(() => {
         switch (getOverlay()) {
            case "Upgrade": {
               for (const [tile, visual] of this._overlayContainer.map) {
                  const tileData = G.save.state.tiles.get(tile);
                  if (tileData) {
                     const text = visual as UnicodeText;
                     text.text = `${tileData.infrastructure + tileData.production + tileData.population}`;
                     this._adjustTextSize(text);
                  }
               }
               break;
            }
            case "Defense": {
               for (const [tile, visual] of this._overlayContainer.map) {
                  const tileData = G.save.state.tiles.get(tile);
                  if (tileData) {
                     const text = visual as UnicodeText;
                     text.text = `${round(getTileDefense(tile, G.save).value, 1)}`;
                     this._adjustTextSize(text);
                  }
               }
               break;
            }
            case "Maintenance": {
               for (const [tile, visual] of this._overlayContainer.map) {
                  const tileData = G.save.state.tiles.get(tile);
                  if (tileData) {
                     const text = visual as UnicodeText;
                     text.text = `${round(getTileMaintenanceCost(tile, G.save).value, 1)}`;
                     this._adjustTextSize(text);
                  }
               }
               break;
            }
         }
      });

      this._selectedProvince = G.save.state.playerProvince;
      this.drawProvinceOutline(G.save.state.playerProvince);

      this._isEditor = G.params.has("editor");
      if (this._isEditor) {
         this._enableTileEditor();
      }
   }

   private _makeTile(tile: Tile): void {
      const tileData = G.save.state.tiles.get(tile);
      const { x, y } = MapGrid.gridToPosition(tileToPoint(tile));
      // Background
      const bg = this._tileContainer.map.set(tile, new Sprite(G.textures.get("Tile/Background")));
      bg.scale.set(TileHeight / TextureHeight);
      bg.anchor.set(0.5, 0.5);
      bg.position.set(x, y);
      if (tileData) {
         bg.tint = MapBackgroundColors[tileData.province];
         // Capital
         if (isCapital(tile, G.save)) {
            const star = this._capitalContainer.map.set(tile, new Sprite(G.textures.get("Misc/Capital")));
            star.anchor.set(0.5, 0.5);
            star.scale.set(0.3);
            star.position.set(x, y + 0.25 * TileHeight);
            star.tint = MapForegroundColors[tileData.province];
         } else {
            this._capitalContainer.map.delete(tile);
         }
      } else {
         bg.tint = 0xf2fcff;
      }
      // Overlay
      this._renderOverlay(tile);
   }

   private _renderOverlay(tile: Tile): void {
      const tileData = G.save.state.tiles.get(tile);
      if (!tileData) {
         return;
      }
      const { x, y } = MapGrid.gridToPosition(tileToPoint(tile));
      switch (getOverlay()) {
         case "Terrain": {
            const visual = this._renderTerrain(tile);
            visual.tint = hslToRgb(MapColorsH[tileData.province], 100, 25);
            break;
         }
         case "Output": {
            const visual = new Sprite(G.textures.get(Goods[tileData.goods].iconTexture));
            this._overlayContainer.map.set(tile, visual);
            visual.anchor.set(0.5, 0.5);
            visual.position.set(x, y);
            visual.scale.set((0.75 * TileHeight) / TextureHeight);
            visual.tint = MapForegroundColors[tileData.province];
            break;
         }
         case "Upgrade": {
            const visual = new UnicodeText(`${tileData.infrastructure + tileData.production + tileData.population}`, {
               fontName: Fonts.MainFont,
            });
            this._adjustTextSize(visual);
            this._overlayContainer.map.set(tile, visual);
            visual.anchor.set(0.5, 0.5);
            visual.position.set(x, y);
            visual.tint = MapForegroundColors[tileData.province];
            break;
         }
         case "Defense": {
            const visual = new UnicodeText(`${round(getTileDefense(tile, G.save).value, 1)}`, {
               fontName: Fonts.MainFont,
            });
            this._adjustTextSize(visual);
            this._overlayContainer.map.set(tile, visual);
            visual.anchor.set(0.5, 0.5);
            visual.position.set(x, y);
            visual.tint = MapForegroundColors[tileData.province];
            break;
         }
         case "Maintenance": {
            const visual = new UnicodeText(`${round(getTileMaintenanceCost(tile, G.save).value, 1)}`, {
               fontName: Fonts.MainFont,
            });
            this._adjustTextSize(visual);
            this._overlayContainer.map.set(tile, visual);
            visual.anchor.set(0.5, 0.5);
            visual.position.set(x, y);
            visual.tint = MapForegroundColors[tileData.province];
            break;
         }
      }
   }

   private _renderTerrain(tile: number) {
      const { x, y } = MapGrid.gridToPosition(tileToPoint(tile));
      const textures = this._getTerrainTextures(getTileTerrain(tile));
      const visual = new Sprite(textures[tile % textures.length]);
      this._overlayContainer.map.set(tile, visual);
      visual.anchor.set(0.5, 0.5);
      visual.position.set(x, y);
      visual.scale.set(TileHeight / TextureHeight);
      return visual;
   }

   private _adjustTextSize(text: UnicodeText): void {
      text.size = 50;
      while (text.width > TileWidth - 20) {
         text.size -= 1;
      }
   }

   override scrollSensitivity(): number {
      return 1.5;
   }

   override onClicked(e: FederatedPointerEvent): void {
      const pos = this.viewport.screenToWorld(e);
      pos.x -= MarginX;

      const point = MapGrid.positionToGrid(pos);
      const tile = pointToTile(point);

      if (this._clickTileHandler) {
         this._clickTileHandler(tile, e);
         return;
      }

      if (!isLand(tile)) {
         return;
      }

      const tileData = G.save.state.tiles.get(tile);

      if (!tileData) {
         this._selectedTiles.clear();
         this._selectedTiles.add(tile);
         this.drawSelectors(this._selectedTiles);
         if (isDev()) {
            console.log(tile);
         }
         hideSidebar();
         return;
      }

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
         showPanel(EditTilePage, { tiles: this._selectedTiles });
      } else {
         this._selectedTiles.clear();
         if (e.button === 0) {
            if (isDev()) {
               console.log(tile, tileToPoint(tile), G.save.state.tiles.get(tile));
            }
            this._selectedTiles.add(tile);
            showPanel(TilePage, { tile });
         }
         if (e.button === 2) {
            const tileData = G.save.state.tiles.get(tile);
            if (tileData) {
               showPanel(DiplomacyPage, { province: tileData.province });
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
         // position.x += marginX + remToPx(SidebarWidth) / 2 / this.viewport.zoom;
         position.x += MarginX;
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

   private _updateAlpha(): void {
      const [minZoom, maxZoom] = this.viewport.getZoomRange();
      const factor = (this.viewport.zoom - minZoom) / (maxZoom - minZoom);
      this._overlayContainer.alpha = 0.5 + 0.5 * factor;
      this._capitalContainer.alpha = 0.5 + 0.5 * factor;
   }

   override onMoved(point: IHaveXY): void {
      this._updateAlpha();
      this._cullTiles();
   }

   private _cullTiles(): void {
      const visibleWorldRect = this.viewport.visibleWorldRect();
      const minX = visibleWorldRect.left - MarginX - TileWidth / 2;
      const maxX = visibleWorldRect.right - MarginX + TileWidth / 2;
      const minY = visibleWorldRect.top - TileHeight / 2;
      const maxY = visibleWorldRect.bottom + TileHeight / 2;
      for (const [, visual] of this._overlayContainer.map) {
         visual.visible = visual.x >= minX && visual.x <= maxX && visual.y >= minY && visual.y <= maxY;
      }
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

   private _drawIndicator(tile: Tile): void {
      const tileData = G.save.state.tiles.get(tile);
      this._indicatorContainer.map.delete(tile);
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
      const indicator = this._indicatorContainer.map.set(tile, new Sprite(texture));
      indicator.anchor.set(0.5, 0.5);
      if (war) {
         indicator.tint = MapForegroundColors[war.attacker];
      } else {
         indicator.tint = MapForegroundColors[tileData.province];
      }
      indicator.alpha = 0.5;
      indicator.scale.set(TileHeight / TextureHeight);
      const position = MapGrid.gridToPosition(tileToPoint(tile));
      indicator.position.set(position.x, position.y);
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

   private _drawStaticOutlineAndLabel(): void {
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
                  this._staticOutline.lineStyle(G.save.state.tiles.has(neighborTile) ? InternalBorder : ExternalBorder);
                  this._staticOutline.moveTo(c1.x, c1.y);
                  this._staticOutline.lineTo(c2.x, c2.y);
               }
            }
         }
      }
      destroyAllChildren(this._labelContainer);
      const provinceToTiles = new Map<Province, Set<Tile>>();
      G.save.state.tiles.forEach((data, tile) => {
         if (data.province) {
            const tiles = provinceToTiles.get(data.province);
            if (tiles) {
               tiles.add(tile);
            } else {
               provinceToTiles.set(data.province, new Set([tile]));
            }
         }
      });
      for (const [province, tiles] of provinceToTiles) {
         const text = this._labelContainer.addChild(
            new UnicodeText(getProvinceName(province, G.save), {
               fontName: Fonts.RomanFont,
               fontSize: ProvinceLabelFontSize,
               tint: MapTextColors[province],
            }),
         );
         text.anchor.set(0.5, 0.5);
         const position = findProvinceLabelPosition(tiles, text.width);
         text.position.set(position.x, position.y);
      }
   }

   private _addSelector(tile: Tile): void {
      const position = MapGrid.gridToPosition(tileToPoint(tile));
      const selector = this._selectors.addChild(new Sprite(G.textures.get("Tile/Selector")));
      selector.position.set(position.x + MarginX, position.y);
      selector.scale.set(TileHeight / TextureHeight);
      selector.anchor.set(0.5, 0.5);
      selector.alpha = 0.25;
   }

   private _getTerrainTextures(terrain: Terrain): Texture[] {
      if (!TerrainTextures) {
         TerrainTextures = {
            Mountain: [
               G.textures.get("Shaded/Mountain1") as Texture,
               G.textures.get("Shaded/Mountain2") as Texture,
               G.textures.get("Shaded/Mountain3") as Texture,
            ],
            Hill: [
               G.textures.get("Shaded/Hill1") as Texture,
               G.textures.get("Shaded/Hill2") as Texture,
               G.textures.get("Shaded/Hill3") as Texture,
            ],
            Forest: [
               G.textures.get("Shaded/Forest1") as Texture,
               G.textures.get("Shaded/Forest2") as Texture,
               G.textures.get("Shaded/Forest3") as Texture,
            ],
            Plain: [
               G.textures.get("Shaded/Plain1") as Texture,
               G.textures.get("Shaded/Plain2") as Texture,
               G.textures.get("Shaded/Plain3") as Texture,
            ],
            Arid: [
               G.textures.get("Shaded/Arid1") as Texture,
               G.textures.get("Shaded/Arid2") as Texture,
               G.textures.get("Shaded/Arid3") as Texture,
            ],
         };
      }
      return TerrainTextures[terrain];
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
