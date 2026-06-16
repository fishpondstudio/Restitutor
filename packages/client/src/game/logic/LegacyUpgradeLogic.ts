import { entriesOf, forEach } from "@project/shared/src/utils/Helper";
import { type Edge, MarkerType, type Node } from "@xyflow/react";
import { $t, L } from "../../utils/i18n";
import { finalizeCondition, type IConditionBreakdown } from "../actions/GameAction";
import { type LegacyUpgrade, LegacyUpgrades } from "../definitions/LegacyUpgrade";
import { Modifiers, modifierValueToString } from "../definitions/Modifier";
import { type Province, ProvinceResourceNames } from "../definitions/Province";
import { initSaveGame, SaveGame } from "../GameState";
import { addProvinceResource, getProvinceResource, getTilesAnnexedAndCored, provinceResourceOf } from "./ProvinceLogic";

export const LegacyUpgradeNodeWidth = 160;
export const LegacyUpgradeNodeHeight = 90;
export const LegacyUpgradeNodeSpacingX = 90;
export const LegacyUpgradeNodeSpacingY = 90;

export function makeLegacyUpgradeNodes(province: Province, save: SaveGame): { nodes: Node[]; edges: Edge[] } {
   const nodes: Node[] = [];
   const edges: Edge[] = [];

   const state = save.state.provinces[province];
   if (!state) {
      return { nodes, edges };
   }

   forEach(LegacyUpgrades, (upgrade, def) => {
      const [x, y] = def.position;
      nodes.push({
         id: upgrade,
         data: { legacyUpgrade: upgrade },
         type: "LegacyUpgradeNode",
         position: {
            x: x * (LegacyUpgradeNodeWidth + LegacyUpgradeNodeSpacingX),
            y: y * (LegacyUpgradeNodeHeight + LegacyUpgradeNodeSpacingY),
         },
      });

      def.requires.forEach((required) => {
         let opacity = 0.3;
         let color = "var(--mantine-color-dark-2)";
         if (state.legacyUpgrades.has(required) && state.legacyUpgrades.has(upgrade)) {
            color = "var(--mantine-primary-color-4)";
            opacity = 1;
         } else if (canUpgradeLegacyUpgrade(upgrade, province, save) && state.legacyUpgrades.has(required)) {
            opacity = 1;
         }
         edges.push({
            id: `${required}->${upgrade}`,
            source: required,
            target: upgrade,
            markerEnd: {
               type: MarkerType.ArrowClosed,
               width: 12,
               height: 12,
               color,
            },
            style: {
               strokeWidth: 2,
               stroke: color,
               opacity,
            },
         });
      });
   });
   return { nodes, edges };
}

export function rebirth(province: Province, save: SaveGame): void {
   const newSave = new SaveGame();
   newSave.state.playerProvince = province;
   const [total, _] = provinceResourceOf("legacy", save.state.playerProvince, save);
   initSaveGame(newSave);
   addProvinceResource(
      "legacy",
      total + getTilesAnnexedAndCored(save.state.playerProvince, save),
      save.state.playerProvince,
      newSave,
   );
   save.state = newSave.state;
}

export function getLegacyUpgradeCost(province: Province, save: SaveGame): number {
   const state = save.state.provinces[province];
   if (!state) {
      return 0;
   }
   return 1 + state.legacyUpgrades.size;
}

export function canUpgradeLegacyUpgrade(
   upgrade: LegacyUpgrade,
   province: Province,
   save: SaveGame,
): IConditionBreakdown {
   const result: IConditionBreakdown = { value: false, breakdown: [] };
   const state = save.state.provinces[province];
   if (!state) {
      return finalizeCondition(result);
   }
   if (state.legacyUpgrades.has(upgrade)) {
      return finalizeCondition(result);
   }
   const cost = getLegacyUpgradeCost(province, save);
   const available = getProvinceResource("legacy", province, save);
   const def = LegacyUpgrades[upgrade];

   result.breakdown.push({
      name: ProvinceResourceNames.legacy(),
      value: available >= cost,
      progress: [available, cost],
   });

   result.breakdown.push({
      name: $t(L.Prerequisites),
      value: def.requires.length === 0 || def.requires.some((upgrade) => state?.legacyUpgrades.has(upgrade)),
   });

   return finalizeCondition(result);
}

export function getLegacyUpgradeName(upgrade: LegacyUpgrade): string {
   const def = LegacyUpgrades[upgrade];
   if ("modifiers" in def) {
      return entriesOf(def.modifiers)
         .map(([modifier, data]) => {
            return `${modifierValueToString(data)} ${Modifiers[modifier].name()}`;
         })
         .join(", ");
   }
   if ("name" in def) {
      return def.name();
   }
   return upgrade;
}

export function hasLegacyUpgrade(upgrade: LegacyUpgrade, province: Province, save: SaveGame): boolean {
   const state = save.state.provinces[province];
   if (!state) {
      return false;
   }
   return state.legacyUpgrades.has(upgrade);
}
