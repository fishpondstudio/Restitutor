import type { Tile } from "@project/shared/src/utils/Helper";
import { Container, Sprite, Texture } from "pixi.js";
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
               G.textures.get("Tile/Mountain"),
               G.textures.get("Tile/Mountain2"),
               G.textures.get("Tile/Mountain3"),
            ],
            Hill: [G.textures.get("Tile/Hill"), G.textures.get("Tile/Hill2"), G.textures.get("Tile/Hill3")],
            Forest: [G.textures.get("Tile/Forest"), G.textures.get("Tile/Forest2"), G.textures.get("Tile/Forest3")],
            Plain: [Texture.EMPTY],
         };
      }

      const textures = TerrainTextures[terrain];
      this._terrain = this.addChild(new Sprite(textures[tile % textures.length]));

      if (province) {
         this._terrain.tint = MapForegroundColors[province];
      } else {
         this._terrain.tint = 0x999999;
      }

      if (isCapital(tile, G.save)) {
         const star = this.addChild(new Sprite(G.textures.get("Misc/Capital")));
         star.anchor.set(0.5, 0.5);
         star.scale.set(0.5);
         star.position.set(0, textureHeight / 3);
         star.tint = this._terrain.tint;
      }

      this._terrain.anchor.set(0.5, 0.5);
   }
}
