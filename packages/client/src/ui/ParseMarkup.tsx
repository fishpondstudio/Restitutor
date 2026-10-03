import { rgbToHex } from "@project/shared/src/thirdparty/RandomColor";
import { safeParseInt } from "@project/shared/src/utils/Helper";
import type { HTMLReactParserOptions } from "html-react-parser";
import parse from "html-react-parser";
import { type Province, Provinces } from "../game/definitions/Province";
import { getTileName } from "../game/definitions/TileName";
import { getMapBackgroundColor } from "../game/logic/MapColor";
import { getProvinceName } from "../game/logic/ProvinceLogic";
import { WorldScene } from "../scenes/WorldScene";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { FloatingTip } from "./components/FloatingTip";
import { IconCatalog } from "./IconCatalog";

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
            const content = (
               <span>
                  <span
                     className="text-link"
                     style={{ color: rgbToHex(getMapBackgroundColor(province, G.save)) }}
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
                  {G.save.state.provinces[province] ? "" : "*"}
               </span>
            );
            if (G.save.state.provinces[province]) {
               return content;
            }
            return (
               <FloatingTip label={() => $t(L.$1DoesNotCurrentlyExistOnTheMap, getProvinceName(province, G.save))}>
                  {content}
               </FloatingTip>
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
         if (tileData || getTileName(tile, G.save)) {
            return (
               <span
                  className="text-link"
                  onClick={() => {
                     G.scene
                        .getCurrent(WorldScene)
                        ?.lookAt(tile, { time: 0.2 })
                        .then((scene) => {
                           scene.drawSelectors(new Set([tile]));
                           if (tileData) {
                              scene.drawProvinceOutline(tileData.province);
                           }
                        });
                  }}
               >
                  {getTileName(tile, G.save)}
               </span>
            );
         }
      }
      if (
         node.type === "tag" &&
         node.name === "icon" &&
         node.children.length === 1 &&
         node.children[0].type === "text"
      ) {
         const text = node.children[0].data;
         if (text in IconCatalog) {
            return <img className="icon-inline" src={IconCatalog[text as keyof typeof IconCatalog]} />;
         }
      }
   },
};

export function renderMarkup(html: string): React.ReactNode {
   return parse(html, parserOptions);
}
