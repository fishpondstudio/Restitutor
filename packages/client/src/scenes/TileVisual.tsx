import { randOne, type Tile } from "@project/shared/src/utils/Helper";
import { BLEND_MODES, Container, Sprite, type Texture } from "pixi.js";
import type { Terrain } from "../game/definitions/Terrain";
import { MapBackgroundColors, MapForegroundColors } from "../game/logic/MapLogic";
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
               G.textures.get("Tile/ShadedMountain1"),
               G.textures.get("Tile/ShadedMountain2"),
               G.textures.get("Tile/ShadedMountain3"),
            ],
            Hill: [
               G.textures.get("Tile/ShadedHill1"),
               G.textures.get("Tile/ShadedHill2"),
               G.textures.get("Tile/ShadedHill3"),
            ],
            Forest: [
               G.textures.get("Tile/ShadedForest1"),
               G.textures.get("Tile/ShadedForest2"),
               G.textures.get("Tile/ShadedForest3"),
            ],
            Plain: [
               G.textures.get("Tile/ShadedPlain1"),
               G.textures.get("Tile/ShadedPlain2"),
               G.textures.get("Tile/ShadedPlain3"),
            ],
         };
      }

      const textures = TerrainTextures[terrain];
      this._terrain = this.addChild(new Sprite(randOne(textures)));
      this._terrain.blendMode = BLEND_MODES.MULTIPLY;
      this._terrain.alpha = 0.7;

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
