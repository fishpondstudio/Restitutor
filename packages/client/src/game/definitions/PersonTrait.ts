import { forEach, keysOf } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { SaveGame } from "../GameState";
import type { EvaluationMode, ValueCalculation } from "../logic/Calculation";
import type { Province } from "./Province";

export interface IPersonTrait {
   name: () => string;
   desc: () => string;
}

export type PersonTrait = keyof typeof PersonTrait;

export const PersonTrait = {
   Diligent: {
      name: () => $t(L.PersonTraitDiligent),
      desc: () => $t(L.$1LandTax, "+2%"),
   },
   Methodical: {
      name: () => $t(L.PersonTraitMethodical),
      desc: () => $t(L.$1TileOutput, "+2%"),
   },
   Robust: {
      name: () => $t(L.PersonTraitRobust),
      desc: () => $t(L.$1Manpower, "+2%"),
   },
   Steadfast: {
      name: () => $t(L.PersonTraitSteadfast),
      desc: () => $t(L.$1TileDefense, "+2%"),
   },
   Prudent: {
      name: () => $t(L.PersonTraitPrudent),
      desc: () => $t(L.$1ArmyMaintenanceCost, "-2%"),
   },
   Efficient: {
      name: () => $t(L.PersonTraitEfficient),
      desc: () => $t(L.$1TileMaintenanceCost, "-2%"),
   },
   Bold: {
      name: () => $t(L.PersonTraitBold),
      desc: () => $t(L.$1WarPower, "+2%"),
   },
   Distinguished: {
      name: () => $t(L.PersonTraitDistinguished),
      desc: () => $t(L.$1Prestige, "+2%"),
   },
   Calm: {
      name: () => $t(L.PersonTraitCalm),
      desc: () => $t(L.$1Stability, "+2"),
   },
   // Governor-only traits
   Thrifty: {
      name: () => $t(L.PersonTraitThrifty),
      desc: () => $t(L.$1MonthlyAdvisorCost, "-2%"),
   },
   Fertile: {
      name: () => $t(L.PersonTraitFertile),
      desc: () => $t(L.$1OffspringChance, "+2%"),
   },
} as const satisfies Record<string, IPersonTrait>;

export const GovernorTraits = keysOf(PersonTrait);
export const AdvisorTraits = GovernorTraits.filter((trait) => trait !== "Fertile" && trait !== "Thrifty");

export function attachProvinceTraitsToCalculation<M extends EvaluationMode>(
   trait: PersonTrait,
   value: number,
   calc: ValueCalculation<M>,
   province: Province,
   save: SaveGame,
): ValueCalculation<M> {
   const data = save.state.provinces[province];
   if (!data) {
      return calc;
   }
   const governor = data.governor.male;
   for (const t of governor.traits) {
      if (trait === t) {
         calc.multiply(value)?.describe($t(L.GovernorsTrait$1, PersonTrait[t].name()), governor.name.join(" "));
      }
   }
   forEach(data.advisors, (_, advisor) => {
      const selected = advisor.selected;
      if (selected) {
         for (const t of selected.traits) {
            if (trait === t) {
               calc.multiply(value)?.describe($t(L.AdvisorsTrait$1, PersonTrait[t].name()), selected.name);
            }
         }
      }
   });
   return calc;
}

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
            name: $t(L.GovernorsTrait$1, PersonTrait[t].name()),
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
                  name: $t(L.AdvisorsTrait$1, PersonTrait[t].name()),
                  desc: selected.name,
               });
            }
         });
      }
   });
   return result;
}
