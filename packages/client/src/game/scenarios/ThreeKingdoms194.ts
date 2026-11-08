import { keysOf } from "@project/shared/src/utils/Helper";
import { ChineseNameGenerator } from "../ChineseNames";
import { ThreeKingdomsEvents } from "../events/GameEvents";
import { TKWarlords } from "../ThreeKingdoms/TKWarlord";
import { getCulturesFromProvinces, getReligionsFromProvinces } from "./ScenarioHelper";
import type { IScenario } from "./Scenarios";

export const ThreeKingdoms194: IScenario = {
   startDate: new Date(194, 6, 1),
   provinces: new Set(TKWarlords),
   cultures: getCulturesFromProvinces(TKWarlords),
   religions: getReligionsFromProvinces(TKWarlords),
   nameGenerator: ChineseNameGenerator,
   get events() {
      return new Set(keysOf(ThreeKingdomsEvents));
   },
   flags: new Set(["Concubinage", "TKCharacter", "ImperialCourt"]),
   provinceResourceNames: {
      consulPoint: () => "Imperial Favor",
   },
   timedActionNames: {
      TakeLover: () => "Take a Concubine",
      RequestFunding: () => "Request Subsidies",
      EnactSenateOversight: () => "Seek Imperial Advice",
      AffirmCivicUnity: () => "Affirm Legitimacy",
      DeclareMobilization: () => "Rally Imperial Host",
      BolsterDignitas: () => "Seek Imperial Honors",
   },
   socialClassNames: {
      UpperClass: () => "Gentry",
      MiddleClass: () => "Scholars",
      LowerClass: () => "Commoners",
      ReligiousClass: () => "Clergy",
      MilitaryClass: () => "Military",
   },
};
