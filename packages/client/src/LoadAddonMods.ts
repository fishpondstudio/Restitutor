import { Buildings } from "./game/definitions/Building";
import { CasusBelli } from "./game/definitions/CasusBelli";
import { Culture } from "./game/definitions/Culture";
import { CultureReligionStatus } from "./game/definitions/CultureReligionStatus";
import { Goods } from "./game/definitions/Goods";
import { GreatWork } from "./game/definitions/GreatWork";
import { LegacyUpgrades } from "./game/definitions/LegacyUpgrade";
import { Modifiers } from "./game/definitions/Modifier";
import { PersonTrait } from "./game/definitions/PersonTrait";
import { Province } from "./game/definitions/Province";
import { ProvinceUpgrades } from "./game/definitions/ProvinceUpgrades";
import { ChristianHeresy, Religion } from "./game/definitions/Religion";
import { RestorationBonus } from "./game/definitions/RestorationBonus";
import { SocialClass, SocialClassBonuses } from "./game/definitions/SocialClass";
import { SpawnedProvinces } from "./game/definitions/SpawnedProvince";
import { Tech } from "./game/definitions/Tech";
import { Terrains } from "./game/definitions/Terrain";
import { TimedActions } from "./game/definitions/TimedAction";
import { GameStateUpdated } from "./game/Events";
import { GameEvents } from "./game/events/GameEvents";
import { isSteam, SteamClient } from "./rpc/SteamClient";
import { G } from "./utils/Global";

const definitions = {
   Buildings,
   CasusBelli,
   ChristianHeresy,
   Culture,
   CultureReligionStatus,
   GameEvents,
   Goods,
   GreatWork,
   LegacyUpgrades,
   Modifiers,
   PersonTrait,
   Province,
   ProvinceUpgrades,
   Religion,
   RestorationBonus,
   SocialClass,
   SocialClassBonuses,
   SpawnedProvinces,
   Tech,
   Terrains,
   TimedActions,
};

export async function loadAddonMods(): Promise<void> {
   if (isSteam()) {
      const mods = await SteamClient.loadAddonMods();
      if (mods.length > 0) {
         Object.assign(globalThis, { G, GameStateUpdated, D: definitions });
      }
      for (const mod of mods) {
         const script = document.createElement("script");
         script.textContent = mod;
         document.body.appendChild(script);
      }
   }
}
