import { hasFlag, range, shuffle, type Tile } from "@project/shared/src/utils/Helper";
import { ConvertCultureAction } from "../actions/ConvertCultureAction";
import { EvangelizeTileAction } from "../actions/EvangelizeTileAction";
import { finalizeCondition, tryDoAction } from "../actions/GameAction";
import { InviteToIslamAction } from "../actions/InviteToIslamAction";
import { MakeCoreAction } from "../actions/MakeCoreAction";
import { RepayLoanAction } from "../actions/RepayLoanAction";
import type { Province } from "../definitions/Province";
import { ProvinceFlags } from "../definitions/ProvinceState";
import { isChristianReligion } from "../definitions/Religion";
import type { SaveGame } from "../GameState";
import { getSettledTileAutonomy, setTileAutonomy } from "./AutonomyLogic";
import { getProvinceTilesCached } from "./CacheLogic";
import { pledgeProvinceConsulVotesConditions } from "./ProvinceLogic";
import { getCultureStatus, getReligionStatus, getTileUnrest } from "./TileLogic";
import { getTimedActionCooldownLeft } from "./TimedActionLogic";

export function tickAutomation(province: Province, save: SaveGame): void {
   automaticallySettleUnrest(province, save);
   automaticallyPledgeSupport(province, save);
   automaticallyMakeCore(province, save);
   automaticallyEvangelize(province, save);
   automaticallyInviteToIslam(province, save);
   automaticallyConvertCulture(province, save);
   automaticallyRepayLoans(province, save);
}

function automaticallyRepayLoans(province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (!state || !hasFlag(state.flags, ProvinceFlags.AutomaticallyRepayLoans)) {
      return;
   }
   for (const loan of [...state.loans]) {
      tryDoAction(RepayLoanAction(loan, province, save), { headless: true }, province, save);
   }
}

function automaticallySettleUnrest(province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (
      !state ||
      !hasFlag(state.flags, ProvinceFlags.AutomaticallySettleUnrest) ||
      getTimedActionCooldownLeft("AdjustAutonomy", province, save) > 0
   ) {
      return;
   }
   let selectedTile: Tile | undefined;
   let highestUnrest = 0;
   for (const [tile, data] of save.state.tiles) {
      if (data.province !== province || getSettledTileAutonomy(tile, save) === data.autonomy) {
         continue;
      }
      const unrest = getTileUnrest(tile, save).value;
      if (unrest > highestUnrest) {
         selectedTile = tile;
         highestUnrest = unrest;
      }
   }
   if (selectedTile !== undefined) {
      setTileAutonomy(selectedTile, getSettledTileAutonomy(selectedTile, save), province, save);
   }
}

function automaticallyPledgeSupport(province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (
      state &&
      hasFlag(state.flags, ProvinceFlags.AutomaticallyPledgeSupport) &&
      finalizeCondition(pledgeProvinceConsulVotesConditions(province, save)).value
   ) {
      pledgeProvinceConsulVotes(province, save);
   }
}

function automaticallyMakeCore(province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (
      !state ||
      !hasFlag(state.flags, ProvinceFlags.AutomaticallyMakeCore) ||
      getTimedActionCooldownLeft("MakeCore", province, save) > 0
   ) {
      return;
   }
   for (const tile of getProvinceTilesCached(province, save)) {
      if (tryDoAction(MakeCoreAction(tile, province, save), { headless: true }, province, save)) {
         break;
      }
   }
}

function automaticallyEvangelize(province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (
      !state ||
      !isChristianReligion(state.religion) ||
      getTimedActionCooldownLeft("EvangelizeTile", province, save) > 0
   ) {
      return;
   }
   const evangelizeMinor = hasFlag(state.flags, ProvinceFlags.AutomaticallyEvangelizeMinorReligions);
   const evangelizeTolerated = hasFlag(state.flags, ProvinceFlags.AutomaticallyEvangelizeToleratedReligions);
   if (!evangelizeMinor && !evangelizeTolerated) {
      return;
   }
   for (const tile of getProvinceTilesCached(province, save)) {
      const status = getReligionStatus(tile, save);
      if (!((status === "Minor" && evangelizeMinor) || (status === "Tolerated" && evangelizeTolerated))) {
         continue;
      }
      if (tryDoAction(EvangelizeTileAction(tile, province, save), { headless: true }, province, save)) {
         break;
      }
   }
}

function automaticallyConvertCulture(province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (!state || getTimedActionCooldownLeft("ConvertCulture", province, save) > 0) {
      return;
   }
   const convertMinor = hasFlag(state.flags, ProvinceFlags.AutomaticallyConvertMinorCultures);
   const convertTolerated = hasFlag(state.flags, ProvinceFlags.AutomaticallyConvertToleratedCultures);
   if (!convertMinor && !convertTolerated) {
      return;
   }
   for (const tile of getProvinceTilesCached(province, save)) {
      const status = getCultureStatus(tile, save);
      if (!((status === "Minor" && convertMinor) || (status === "Tolerated" && convertTolerated))) {
         continue;
      }
      if (tryDoAction(ConvertCultureAction(tile, province, save), { headless: true }, province, save)) {
         break;
      }
   }
}

function automaticallyInviteToIslam(province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (state?.religion !== "Islam" || getTimedActionCooldownLeft("InviteToIslam", province, save) > 0) {
      return;
   }
   const inviteMinor = hasFlag(state.flags, ProvinceFlags.AutomaticallyInviteMinorReligionsToIslam);
   const inviteTolerated = hasFlag(state.flags, ProvinceFlags.AutomaticallyInviteToleratedReligionsToIslam);
   if (!inviteMinor && !inviteTolerated) {
      return;
   }
   for (const tile of getProvinceTilesCached(province, save)) {
      const status = getReligionStatus(tile, save);
      if (!((status === "Minor" && inviteMinor) || (status === "Tolerated" && inviteTolerated))) {
         continue;
      }
      if (tryDoAction(InviteToIslamAction(tile, province, save), { headless: true }, province, save)) {
         break;
      }
   }
}

export function pledgeProvinceConsulVotes(province: Province, save: SaveGame): void {
   const votes = save.state.senate.votes.get(province);
   if (!votes) {
      save.state.senate.votes.set(
         province,
         new Set(shuffle(range(0, save.state.senate.consulCandidates.length)).slice(0, 2)),
      );
   }
}
