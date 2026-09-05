import { clamp, entriesOf, forEach, formatNumber, type Tile } from "@project/shared/src/utils/Helper";
import { type Edge, MarkerType, type Node } from "@xyflow/react";
import { remToPx } from "../../ui/common/UIScaling";
import {
   LegacyUpgradeNodeHeight,
   LegacyUpgradeNodeSpacingX,
   LegacyUpgradeNodeSpacingY,
   LegacyUpgradeNodeWidth,
} from "../../ui/UIConstant";
import { $t, L } from "../../utils/i18n";
import {
   finalizeBreakdown,
   finalizeCondition,
   type ICondition,
   type IConditionBreakdown,
   type IValueBreakdown,
   makeValueBreakdown,
} from "../actions/GameAction";
import { type LegacyUpgrade, LegacyUpgrades } from "../definitions/LegacyUpgrade";
import { Modifiers, modifierValueToString } from "../definitions/Modifier";
import {
   type Province,
   ProvinceResourceNames,
   type ProvinceResources,
   type ProvinceStats,
} from "../definitions/Province";
import { initSaveGame, SaveGame } from "../GameState";
import { addProvinceResource, getProvinceResource, getTilesAnnexedAndCored, provinceResourceOf } from "./ProvinceLogic";

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
            x: x * (remToPx(LegacyUpgradeNodeWidth) + remToPx(LegacyUpgradeNodeSpacingX)),
            y: y * (remToPx(LegacyUpgradeNodeHeight) + remToPx(LegacyUpgradeNodeSpacingY)),
         },
      });

      def.requires.forEach((required) => {
         let opacity = 0.3;
         let color = "var(--mantine-color-dark-2)";
         if (state.legacyUpgrades.has(required) && state.legacyUpgrades.has(upgrade)) {
            color = "var(--mantine-primary-color-5)";
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
               filter: "drop-shadow(0 0 0.3125rem rgba(0, 0, 0, 0.7))",
            },
         });
      });
   });
   return { nodes, edges };
}

export function rebirth(province: Province, save: SaveGame): void {
   const newLegacyPoints = getLegacyPointsNextRun(save);
   // New legacy points should be calculated BEFORE adding rebirth history
   // because of the "Personal Best Bonus"
   const rebirthHistory = makeRebirthHistory(save);
   if (rebirthHistory) {
      save.options.rebirthHistory.unshift(rebirthHistory);
   }
   const newSave = new SaveGame();
   newSave.state.playerProvince = province;
   initSaveGame(newSave);
   addProvinceResource("legacy", newLegacyPoints.value, province, newSave);
   save.state = newSave.state;
}

export function getLegacyPointsNextRun(save: SaveGame): IValueBreakdown {
   const result = makeValueBreakdown();
   const [total, used] = provinceResourceOf("legacy", save.state.playerProvince, save);
   result.add.push({
      name: $t(L.LegacyPointsFromPreviousRuns),
      value: total,
   });
   const tilesAnnexedAndCored = getTilesAnnexedAndCored(save.state.playerProvince, save);
   result.add.push({
      name: $t(L.TilesAnnexedAndCored),
      value: tilesAnnexedAndCored,
      desc: $t(L.EachAnnexedAndCoredTileGrants$1LegacyPoint, "1"),
   });
   const previousBest = save.options.rebirthHistory.reduce((max, history) => {
      return Math.max(max, history.tileAnnexedAndCored);
   }, 0);
   result.add.push({
      name: $t(L.PersonalBestBonus),
      value: clamp(tilesAnnexedAndCored - previousBest, 0, Number.POSITIVE_INFINITY),
      desc: $t(L.PersonalBestBonusDesc$1$2, "1", formatNumber(previousBest)),
   });
   return finalizeBreakdown(result);
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
   const result: ICondition[] = [];
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

   result.push({
      name: ProvinceResourceNames.legacy(),
      value: available >= cost,
      progress: [available, cost],
   });

   result.push({
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

export type IRebirthHistory = {
   tick: number;
   province: Province;
   resources: ProvinceResources;
   stats: ProvinceStats;
   tiles: Map<Tile, { core: boolean }>;
   tileAnnexedAndCored: number;
};

export function makeRebirthHistory(save: SaveGame): IRebirthHistory | undefined {
   const state = save.state.provinces[save.state.playerProvince];
   if (!state) {
      return undefined;
   }
   return {
      tick: save.state.tick,
      province: save.state.playerProvince,
      resources: state.resources,
      stats: state.stats,
      tiles: new Map(
         Array.from(save.state.tiles)
            .filter(([_, data]) => data.province === save.state.playerProvince)
            .map(([tile, data]) => [tile, { core: data.coreProvinces.has(save.state.playerProvince) }]),
      ),
      tileAnnexedAndCored: getTilesAnnexedAndCored(save.state.playerProvince, save),
   };
}
