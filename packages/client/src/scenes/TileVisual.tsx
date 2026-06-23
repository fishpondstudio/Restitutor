import { hslToRgb } from "@project/shared/src/thirdparty/RandomColor";
import { randOne, type Tile } from "@project/shared/src/utils/Helper";
import { Container, Sprite, type Texture } from "pixi.js";
import type { Terrain } from "../game/definitions/Terrain";
import { MapBackgroundColors, MapColorsH, MapForegroundColors } from "../game/logic/MapLogic";
import { isCapital } from "../game/logic/TileLogic";
import { TileHeight } from "../game/MapGrid";
import { G } from "../utils/Global";

let TerrainTextures: Record<Terrain, (Texture | undefined)[]> | undefined;

export class TileVisual extends Container {
   private _background: Sprite;
   private _terrain: Sprite;

   constructor(tile: Tile) {
      super();

      const textureHeight = 256;
      this.scale.set(TileHeight / textureHeight);

      this._background = this.addChild(new Sprite(G.textures.get("Tile/Background")));
      this._background.anchor.set(0.5, 0.5);
      this._background.alpha = 1;

      const tileData = G.save.state.tiles.get(tile);
      const province = tileData?.province;
      if (province) {
         this._background.tint = MapBackgroundColors[province];
      }

      const terrain = tileData?.terrain ?? "Plain";

      if (!TerrainTextures) {
         TerrainTextures = {
            Mountain: [
               G.textures.get("Shaded/Mountain1"),
               G.textures.get("Shaded/Mountain2"),
               G.textures.get("Shaded/Mountain3"),
            ],
            Hill: [G.textures.get("Shaded/Hill1"), G.textures.get("Shaded/Hill2"), G.textures.get("Shaded/Hill3")],
            Forest: [
               G.textures.get("Shaded/Forest1"),
               G.textures.get("Shaded/Forest2"),
               G.textures.get("Shaded/Forest3"),
            ],
            Plain: [G.textures.get("Shaded/Plain1"), G.textures.get("Shaded/Plain2"), G.textures.get("Shaded/Plain3")],
         };
      }

      const textures = TerrainTextures[terrain];
      this._terrain = this.addChild(new Sprite(randOne(textures)));
      if (province) {
         this._terrain.tint = hslToRgb(MapColorsH[province], 30, 40);
      }

      if (isCapital(tile, G.save)) {
         const star = this.addChild(new Sprite(G.textures.get("Misc/Capital")));
         star.anchor.set(0.5, 0.5);
         star.scale.set(0.5);
         star.position.set(0, textureHeight / 3);
         if (province) {
            star.tint = MapForegroundColors[province];
         }
      }

      this._terrain.anchor.set(0.5, 0.5);
   }
}
