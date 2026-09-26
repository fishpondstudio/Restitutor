import { forEach, hasFlag, type Tile } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { Culture } from "../definitions/Culture";
import { makeModifierGetter } from "../definitions/Modifier";
import type { Province } from "../definitions/Province";
import { hasProvinceUpgrade, ProvinceUpgrades } from "../definitions/ProvinceUpgrades";
import { isChristianReligion, Religion } from "../definitions/Religion";
import { ApostolicSeeTiles, Tiles } from "../definitions/TileConstants";
import { getTileName } from "../definitions/TileName";
import { TimedActions } from "../definitions/TimedAction";
import { GameStateFlags, type SaveGame } from "../GameState";
import { getAttitudeTowards } from "./DiplomacyLogic";
import { EcumenicalCouncilChristianityPct, ongoingEcumenicalCouncilCondition } from "./EcumenicalCouncilLogic";
import { getProvinceName } from "./ProvinceLogic";
import { getTimedActionTimeLeft } from "./TimedActionLogic";

export const getChristianityYearly = makeModifierGetter("ChristianityYearly", 1, (result, province, save) => {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }

   let ownedApostolicSees = 0;
   let apostolicSeeCount = 0;
   getApostolicSeeTiles(save).forEach((tile) => {
      apostolicSeeCount++;
      const owner = save.state.tiles.get(tile)?.province;
      if (owner === province) {
         result.add.push({
            name: $t(L.$1ApostolicSee, getTileName(tile, save)),
            value: ApostolicSeeChristianityYearly,
         });
         ownedApostolicSees++;
      }
   });
   if (apostolicSeeCount === ownedApostolicSees) {
      result.add.push({ name: $t(L.AllApostolicSees), value: apostolicSeeCount * ApostolicSeeChristianityYearly });
   }

   if (hasProvinceUpgrade("ChristianFervor", province, save) && isChristianReligion(state.religion)) {
      result.add.push({ name: ProvinceUpgrades.ChristianFervor.name(), value: 1 });
   }
   if (getTimedActionTimeLeft("ChristianEmpire", province, save) > 0) {
      forEach(save.state.provinces, (otherProvince, state) => {
         if (
            isChristianReligion(state.religion) &&
            province !== otherProvince &&
            getAttitudeTowards(otherProvince, province, save).value > 0
         ) {
            result.add.push({
               name: `${TimedActions.ChristianEmpire.name()} (${getProvinceName(otherProvince, save)})`,
               value: 1,
            });
         }
      });
   }
   if (state.religion === "Islam") {
      result.add.push({ name: Religion.Islam.name(), value: -1 });
   }
   const ongoingCouncil = ongoingEcumenicalCouncilCondition(province, save);
   if (ongoingCouncil.value) {
      result.multiply.push({ name: ongoingCouncil.name, value: EcumenicalCouncilChristianityPct });
   }
});

export const getToleratedReligion = makeModifierGetter("ToleratedReligion", 0, (result, province, save) => {});
export const getToleratedCulture = makeModifierGetter("ToleratedCulture", 0, (result, province, save) => {
   if (hasProvinceUpgrade("InclusiveCitizenship", province, save)) {
      result.add.push({ name: ProvinceUpgrades.InclusiveCitizenship.name(), value: 1 });
   }
});

export function getReligiousCohesion(province: Province, save: SaveGame): number {
   let sameReligion = 0;
   let total = 0;
   const state = save.state.provinces[province];
   if (!state) {
      return 0;
   }
   for (const [tile, data] of save.state.tiles) {
      if (data.province === province) {
         const totalUpgrades = data.infrastructure + data.production + data.population;
         if (data.religion === state.religion || state.toleratedReligions.has(data.religion)) {
            sameReligion += totalUpgrades;
         }
         total += totalUpgrades;
      }
   }
   return sameReligion / total;
}

export function getCulturalCohesion(province: Province, save: SaveGame): number {
   let sameCulture = 0;
   let total = 0;
   const state = save.state.provinces[province];
   if (!state) {
      return 0;
   }
   for (const [tile, data] of save.state.tiles) {
      if (data.province === province) {
         const totalUpgrades = data.infrastructure + data.production + data.population;
         if (data.culture === state.culture || state.toleratedCultures.has(data.culture)) {
            sameCulture += totalUpgrades;
         }
         total += totalUpgrades;
      }
   }
   return sameCulture / total;
}

export function changeProvinceReligion(religion: Religion, province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   if (state.toleratedReligions.has(religion)) {
      state.toleratedReligions.delete(religion);
   }
   state.religion = religion;
}

export function changeProvinceCulture(culture: Culture, province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   if (state.toleratedCultures.has(culture)) {
      state.toleratedCultures.delete(culture);
   }
   state.culture = culture;
}

export function getCulturePercentage(
   culture: Culture,
   province: Province,
   save: SaveGame,
): { count: number; percentage: number } {
   let count = 0;
   let totalTiles = 0;
   for (const data of save.state.tiles.values()) {
      if (data.province !== province) {
         continue;
      }
      totalTiles++;
      if (data.culture === culture) {
         count++;
      }
   }
   return { count, percentage: totalTiles === 0 ? 0 : count / totalTiles };
}

export function getReligionPercentage(
   religion: Religion,
   province: Province,
   save: SaveGame,
): { count: number; percentage: number } {
   let count = 0;
   let totalTiles = 0;
   for (const data of save.state.tiles.values()) {
      if (data.province !== province) {
         continue;
      }
      totalTiles++;
      if (data.religion === religion) {
         count++;
      }
   }
   return { count, percentage: totalTiles === 0 ? 0 : count / totalTiles };
}

export function getProvinceCultures(province: Province, save: SaveGame): Set<Culture> {
   const cultures = new Set<Culture>();
   for (const data of save.state.tiles.values()) {
      if (data.province === province && data.coreProvinces.has(province)) {
         cultures.add(data.culture);
      }
   }
   return cultures;
}

export function getApostolicSeeTiles(save: SaveGame): Tile[] {
   if (hasFlag(save.state.flags, GameStateFlags.ConstantinopleApostolicSee)) {
      return [...ApostolicSeeTiles, Tiles.Constantinople];
   }
   return ApostolicSeeTiles;
}

export const ApostolicSeeChristianityYearly = 1;
