import { forEach, keysOf } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { SaveGame } from "../GameState";
import type { Province } from "./Province";

export interface IPersonTrait {
   name: () => string;
   desc: () => string;
}

export type PersonTrait = keyof typeof PersonTrait;

export const PersonTrait = {
   Diligent: {
      name: () => $t(L.PersonTraitDiligent),
      desc: () => $t(L.XLandTax, "+2%"),
   },
   Methodical: {
      name: () => $t(L.PersonTraitMethodical),
      desc: () => $t(L.XTileOutput, "+2%"),
   },
   Robust: {
      name: () => $t(L.PersonTraitRobust),
      desc: () => $t(L.XManpower, "+2%"),
   },
   Steadfast: {
      name: () => $t(L.PersonTraitSteadfast),
      desc: () => $t(L.XTileDefense, "+2%"),
   },
   Prudent: {
      name: () => $t(L.PersonTraitPrudent),
      desc: () => $t(L.XArmyMaintenanceCost, "-2%"),
   },
   Efficient: {
      name: () => $t(L.PersonTraitEfficient),
      desc: () => $t(L.XTileMaintenanceCost, "-2%"),
   },
   Bold: {
      name: () => $t(L.PersonTraitBold),
      desc: () => $t(L.XWarPower, "+2%"),
   },
   Distinguished: {
      name: () => $t(L.PersonTraitDistinguished),
      desc: () => $t(L.XPrestige, "+2%"),
   },
   Calm: {
      name: () => $t(L.PersonTraitCalm),
      desc: () => $t(L.XStability, "+2"),
   },
   // Governor-only traits
   Thrifty: {
      name: () => $t(L.PersonTraitThrifty),
      desc: () => $t(L.XMonthlyAdvisorCost, "-2%"),
   },
   Fertile: {
      name: () => $t(L.PersonTraitFertile),
      desc: () => $t(L.XOffspringChance, "+2%"),
   },
} as const satisfies Record<string, IPersonTrait>;

export const GovernorTraits = keysOf(PersonTrait);
export const AdvisorTraits = GovernorTraits.filter((trait) => trait !== "Fertile" && trait !== "Thrifty");

export function getProvinceTraits(
   trait: PersonTrait,
   province: Province,
   save: SaveGame,
): { name: string; desc: string }[] {
   const result: { name: string; desc: string }[] = [];
   const data = save.state.provinces[province];
   if (!data) {
      return result;
   }
   const governor = data.governor.male;
   governor.traits.forEach((t) => {
      if (trait === t) {
         result.push({
            name: $t(L.GovernorsTraitX, PersonTrait[t].name()),
            desc: governor.name.join(" "),
         });
      }
   });
   forEach(data.advisors, (_, advisor) => {
      const selected = advisor.selected;
      if (selected) {
         selected.traits.forEach((t) => {
            if (trait === t) {
               result.push({
                  name: $t(L.AdvisorsTraitX, PersonTrait[t].name()),
                  desc: selected.name,
               });
            }
         });
      }
   });
   return result;
}
