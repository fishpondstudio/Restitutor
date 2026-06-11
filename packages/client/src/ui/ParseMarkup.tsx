import { safeParseInt } from "@project/shared/src/utils/Helper";
import type { HTMLReactParserOptions } from "html-react-parser";
import parse from "html-react-parser";
import { type Province, Provinces } from "../game/definitions/Province";
import { getTileName } from "../game/definitions/TileName";
import { MapBackgroundColors } from "../game/logic/MapLogic";
import { getProvinceName } from "../game/logic/ProvinceLogic";
import { WorldScene } from "../scenes/WorldScene";
import { G } from "../utils/Global";

const parserOptions: HTMLReactParserOptions = {
   replace: (node) => {
      if (
         node.type === "tag" &&
         node.name === "province" &&
         node.children.length === 1 &&
         node.children[0].type === "text"
      ) {
         const text = node.children[0].data;
         const province = text as Province;
         if (Provinces.includes(province as Province)) {
            return (
               <span
                  className="text-link"
                  style={{ color: `#${MapBackgroundColors[province].toString(16)}` }}
                  onClick={() => {
                     const state = G.save.state.provinces[province];
                     if (!state) {
                        return;
                     }
                     G.scene
                        .getCurrent(WorldScene)
                        ?.lookAt(state.capital, { time: 0.2 })
                        .then((scene) => scene.drawProvinceOutline(province));
                  }}
               >
                  {getProvinceName(province, G.save)}
               </span>
            );
         }
      }
      if (
         node.type === "tag" &&
         node.name === "tile" &&
         node.children.length === 1 &&
         node.children[0].type === "text"
      ) {
         const tile = safeParseInt(node.children[0].data);
         const tileData = G.save.state.tiles.get(tile);
         if (tileData) {
            return (
               <span
                  className="text-link"
                  onClick={() => {
                     G.scene
                        .getCurrent(WorldScene)
                        ?.lookAt(tile, { time: 0.2 })
                        .then((scene) => {
                           scene.drawSelectors(new Set([tile]));
                           scene.drawProvinceOutline(tileData.province);
                        });
                  }}
               >
                  {getTileName(tile)}
               </span>
            );
         }
      }
   },
};

export function renderMarkup(html: string): React.ReactNode {
   return parse(html, parserOptions);
}
