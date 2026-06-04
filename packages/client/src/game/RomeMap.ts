import type { Tile } from "@project/shared/src/utils/Helper";
import { jsonDecode } from "@project/shared/src/utils/Serialization";
import _Rome from "./definitions/Rome.json?raw";
import type { ITileConfig } from "./definitions/Tile";
import { TileName } from "./definitions/TileName";

export const RomeMap = jsonDecode<Map<Tile, ITileConfig>>(_Rome);

RomeMap.forEach((config, tile) => {
   console.assert(TileName[tile] !== undefined, `TileName missing for tile ${tile}: ${config.name}`);
});
