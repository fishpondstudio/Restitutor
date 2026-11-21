import { keysOf } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import { ChineseNameGenerator } from "../ChineseNames";
import { ThreeKingdomsEvents } from "../events/GameEvents";
import { TKWarlords } from "../ThreeKingdoms/TKWarlord";
import { getCulturesFromProvinces, getReligionsFromProvinces } from "./ScenarioHelper";
import type { IScenario } from "./Scenarios";

export const ThreeKingdoms194: IScenario = {
   name: () => $t(L.RiseOfTheWarlords),
   desc: () => $t(L.RiseOfTheWarlordsDesc),
   startDate: new Date(194, 6, 1),
   provinces: new Set(TKWarlords),
   greatWorks: new Set([
      "HulaoGate",
      "TempleOfConfucius",
      "Dujiangyan",
      "FirstQinEmperorsMausoleum",
      "HanGreatWallJadeGate",
      "WhiteHorseTemple",
      "BronzeSparrowTerrace",
      "StoneCity",
      "YellowCraneTower",
      "JianmenPass",
   ]),
   cultures: getCulturesFromProvinces(TKWarlords),
   religions: getReligionsFromProvinces(TKWarlords),
   nameGenerator: ChineseNameGenerator,
   events: new Set(keysOf(ThreeKingdomsEvents)),
   flags: new Set(["Concubinage", "TKCharacter", "ImperialCourt"]),
   provinceResourceNames: {
      consulPoint: () => $t(L.ImperialFavor),
   },
   timedActionNames: {
      TakeLover: () => $t(L.TakeAConcubine),
      RequestFunding: () => $t(L.RequestSubsidies),
      EnactSenateOversight: () => $t(L.SeekImperialAdvice),
      AffirmCivicUnity: () => $t(L.AffirmLegitimacy),
      DeclareMobilization: () => $t(L.RallyImperialHost),
      BolsterDignitas: () => $t(L.SeekImperialHonors),
   },
   socialClassNames: {
      UpperClass: () => $t(L.SocialClassGentry),
      MiddleClass: () => $t(L.SocialClassScholars),
      LowerClass: () => $t(L.SocialClassCommoners),
      ReligiousClass: () => $t(L.SocialClassClergy),
      MilitaryClass: () => $t(L.SocialClassMilitary),
   },
};
