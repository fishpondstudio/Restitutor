import { keysOf, mapOf } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import { type IBaseModifier, type Modifier, modifierToString } from "./Modifier";

export type IPersonTrait =
   | {
        name: () => string;
        desc: () => string;
     }
   | {
        name: () => string;
        modifiers: Partial<Record<Modifier, IBaseModifier>>;
     };

export type PersonTrait = keyof typeof PersonTrait;

export const PersonTrait = {
   Diligent: {
      name: () => $t(L.PersonTraitDiligent),
      modifiers: { LandTax: { type: "multiply", value: 0.02 } },
   },
   Methodical: {
      name: () => $t(L.PersonTraitMethodical),
      modifiers: { TileOutput: { type: "multiply", value: 0.02 } },
   },
   Robust: {
      name: () => $t(L.PersonTraitRobust),
      modifiers: { Manpower: { type: "multiply", value: 0.02 } },
   },
   Steadfast: {
      name: () => $t(L.PersonTraitSteadfast),
      modifiers: { Defense: { type: "multiply", value: 0.02 } },
   },
   Prudent: {
      name: () => $t(L.PersonTraitPrudent),
      modifiers: { ArmyMaintenance: { type: "multiply", value: -0.02 } },
   },
   Efficient: {
      name: () => $t(L.PersonTraitEfficient),
      modifiers: { TileMaintenance: { type: "multiply", value: -0.02 } },
   },
   Bold: {
      name: () => $t(L.PersonTraitBold),
      modifiers: { WarPower: { type: "multiply", value: 0.02 } },
   },
   Distinguished: {
      name: () => $t(L.PersonTraitDistinguished),
      modifiers: { Prestige: { type: "multiply", value: 0.02 } },
   },
   Calm: {
      name: () => $t(L.PersonTraitCalm),
      modifiers: { Stability: { type: "add", value: 2 } },
   },
   // Governor-only traits
   Thrifty: {
      name: () => $t(L.PersonTraitThrifty),
      modifiers: { AdvisorCost: { type: "multiply", value: -0.02 } },
   },
   Fertile: {
      name: () => $t(L.PersonTraitFertile),
      desc: () => $t(L.$1OffspringChance, "+2%"),
   },
} as const satisfies Record<string, IPersonTrait>;

export const GovernorTraits = keysOf(PersonTrait);
export const AdvisorTraits = GovernorTraits.filter((trait) => trait !== "Fertile" && trait !== "Thrifty");

export function getPersonTraitDescription(trait: PersonTrait): string {
   const def: IPersonTrait = PersonTrait[trait];
   return "modifiers" in def
      ? mapOf(def.modifiers, (modifier, data) => modifierToString(modifier, data)).join(", ")
      : def.desc();
}
