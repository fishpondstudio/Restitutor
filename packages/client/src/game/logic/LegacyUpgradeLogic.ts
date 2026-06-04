import { fib } from "@project/shared/src/utils/Helper";
import { type LegacyUpgrade, LegacyUpgrades } from "../definitions/LegacyUpgrade";
import type { Province } from "../definitions/Province";
import { initSaveGame, SaveGame } from "../GameState";
import { addProvinceResource, getTilesAnnexedAndCored, provinceResourceOf } from "./ProvinceLogic";

export function getLegacyUpgradeLevel(upgrade: LegacyUpgrade, province: Province, save: SaveGame): number {
   return save.state.provinces[province]?.legacyUpgrades.get(upgrade) ?? 0;
}

export function getLegacyUpgradeValue(upgrade: LegacyUpgrade, province: Province, save: SaveGame): number {
   const { modifierValue } = LegacyUpgrades[upgrade];
   return modifierValue * getLegacyUpgradeLevel(upgrade, province, save);
}

export function getLegacyUpgradeCost(level: number): number {
   return fib(level);
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
