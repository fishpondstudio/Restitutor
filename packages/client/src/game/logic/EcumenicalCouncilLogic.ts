import { entriesOf, forEach, type Tile } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { ICondition } from "../actions/GameAction";
import type { Province } from "../definitions/Province";
import { ChristianHeresy, isChristianReligion, type Religion } from "../definitions/Religion";
import { EcumenicalCouncils, type TimedAction, TimedActions } from "../definitions/TimedAction";
import type { SaveGame } from "../GameState";
import { getTimedActionTimeLeft } from "./TimedActionLogic";

export const EcumenicalCouncilPct = 0.2;
export const EcumenicalCouncilChristianityPct = 1;

export function getCouncilHeresies(timedAction: TimedAction): Set<ChristianHeresy> {
   const result = new Set<ChristianHeresy>();
   for (const [heresy, config] of entriesOf(ChristianHeresy)) {
      if (config.councils.includes(timedAction)) {
         result.add(heresy);
      }
   }
   return result;
}

export function getHereticProvinces(heresy: ChristianHeresy, save: SaveGame): Set<Province> {
   const result = new Set<Province>();
   for (const [tile, tileData] of save.state.tiles) {
      if (tileData.religion === heresy) {
         result.add(tileData.province);
      }
   }
   forEach(save.state.provinces, (province, state) => {
      if (state.religion === heresy) {
         result.add(province);
      }
   });
   return result;
}

export function getOngoingEcumenicalCouncil(province: Province, save: SaveGame): TimedAction | null {
   for (const council of EcumenicalCouncils) {
      if (getTimedActionTimeLeft(council, province, save) > 0) {
         return council;
      }
   }
   return null;
}

export function ongoingEcumenicalCouncilCondition(province: Province, save: SaveGame): ICondition {
   const ongoing = getOngoingEcumenicalCouncil(province, save);
   if (ongoing) {
      return {
         name: TimedActions[ongoing].name(),
         value: true,
      };
   }
   return {
      name: $t(L.OngoingEcumenicalCouncil),
      value: false,
   };
}

export function getReconcileTiles(province: Province, save: SaveGame): Set<Tile> {
   const result = new Set<Tile>();
   const state = save.state.provinces[province];
   if (!state) {
      return result;
   }
   if (!isChristianReligion(state.religion)) {
      return result;
   }
   const ongoing = getOngoingEcumenicalCouncil(province, save);
   if (!ongoing) {
      return result;
   }
   const heresies: Set<Religion> = getCouncilHeresies(ongoing);
   if (heresies.has(state.religion)) {
      return result;
   }
   for (const [tile, tileData] of save.state.tiles) {
      if (
         tileData.province === province &&
         tileData.coreProvinces.has(province) &&
         isChristianReligion(tileData.religion) &&
         tileData.religion !== state.religion
      ) {
         result.add(tile);
      }
   }
   return result;
}
