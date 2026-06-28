import type { MantineColor } from "@mantine/core";
import { hslToHex } from "@project/shared/src/thirdparty/RandomColor";
import Clergy from "../../assets/images/socialclasses/Clergy.png";
import Equites from "../../assets/images/socialclasses/Equites.png";
import Military from "../../assets/images/socialclasses/Military.png";
import Plebs from "../../assets/images/socialclasses/Plebs.png";
import Senate from "../../assets/images/socialclasses/Senate.png";
import { $t, L } from "../../utils/i18n";
import type { IGameEffect } from "../GameEffect";
import type { IBaseModifier, Modifier } from "./Modifier";
import { TimedActions } from "./TimedAction";
export interface ISocialClassData {
   loyalty: number;
   influence: number;
}

interface ISocialClassConfig {
   name: () => string;
   color: MantineColor;
   icon: string;
   dominant: Partial<Record<Modifier, IBaseModifier>>;
   disloyal: Partial<Record<Modifier, IBaseModifier>>;
}

const ColorS = 30;
const ColorL = 60;

export const _SocialClass = {
   UpperClass: {
      name: () => $t(L.Senate),
      color: hslToHex(40, ColorS, ColorL),
      icon: Senate,
      dominant: {
         LandTax: { type: "multiply", value: -0.2 },
      },
      disloyal: {
         AdministrativePoint: { type: "add", value: -1 },
      },
   },
   MiddleClass: {
      name: () => $t(L.Equites),
      color: hslToHex(210, ColorS, ColorL),
      icon: Equites,
      dominant: {
         TileOutput: { type: "multiply", value: -0.2 },
      },
      disloyal: {
         DiplomaticPoint: { type: "add", value: -1 },
      },
   },
   LowerClass: {
      name: () => $t(L.Plebs),
      color: hslToHex(120, ColorS, ColorL),
      icon: Plebs,
      dominant: {
         DiplomaticPoint: { type: "add", value: -1 },
      },
      disloyal: {
         Stability: { type: "add", value: -10 },
      },
   },
   ReligiousClass: {
      name: () => $t(L.SocialClassClergy),
      color: hslToHex(280, ColorS, ColorL),
      icon: Clergy,
      dominant: {
         Prestige: { type: "multiply", value: -0.2 },
      },
      disloyal: {
         GoverningCapacity: { type: "multiply", value: -0.2 },
      },
   },
   MilitaryClass: {
      name: () => $t(L.SocialClassMilitary),
      color: hslToHex(0, ColorS, ColorL),
      icon: Military,
      dominant: {
         Stability: { type: "add", value: -10 },
      },
      disloyal: {
         MilitaryPoint: { type: "add", value: -1 },
      },
   },
} as const satisfies Record<string, ISocialClassConfig>;

export type SocialClass = keyof typeof _SocialClass;
export const SocialClass = _SocialClass as Record<SocialClass, ISocialClassConfig>;

export interface ISocialClassBonus {
   effect: IGameEffect;
   supporting: SocialClass[];
   opposing: SocialClass[];
}

const DefaultDuration = TimedActions.GrantSocialClassBonus.duration;

const _SocialClassBonuses = {
   MonthlyAdministrativePoint: {
      effect: {
         modifiers: {
            AdministrativePoint: { type: "add", value: 1, duration: DefaultDuration },
         },
      },
      supporting: ["UpperClass", "MiddleClass"],
      opposing: ["ReligiousClass", "LowerClass"],
   },
   AdministrativePoint: {
      effect: {
         resources: {
            administrative: 36,
         },
      },
      supporting: ["UpperClass", "MiddleClass"],
      opposing: ["ReligiousClass", "LowerClass"],
   },
   MonthlyDiplomaticPoint: {
      effect: {
         modifiers: {
            DiplomaticPoint: { type: "add", value: 1, duration: DefaultDuration },
         },
      },
      supporting: ["MiddleClass", "ReligiousClass"],
      opposing: ["LowerClass", "MilitaryClass"],
   },
   DiplomaticPoint: {
      effect: {
         resources: {
            diplomatic: 36,
         },
      },
      supporting: ["MiddleClass", "ReligiousClass"],
      opposing: ["LowerClass", "MilitaryClass"],
   },
   MonthlyMilitaryPoint: {
      effect: {
         modifiers: {
            MilitaryPoint: { type: "add", value: 1, duration: DefaultDuration },
         },
      },
      supporting: ["LowerClass", "MilitaryClass"],
      opposing: ["MiddleClass", "ReligiousClass"],
   },
   MilitaryPoint: {
      effect: {
         resources: {
            military: 36,
         },
      },
      supporting: ["LowerClass", "MilitaryClass"],
      opposing: ["MiddleClass", "ReligiousClass"],
   },
   InfantryUnitPower: {
      effect: {
         modifiers: {
            InfantryUnitPower: { type: "add", value: 1, duration: DefaultDuration },
         },
      },
      supporting: ["LowerClass", "MilitaryClass"],
      opposing: ["UpperClass", "MiddleClass"],
   },
   CavalryUnitPower: {
      effect: {
         modifiers: {
            CavalryUnitPower: { type: "add", value: 1, duration: DefaultDuration },
         },
      },
      supporting: ["MiddleClass", "MilitaryClass"],
      opposing: ["UpperClass", "LowerClass"],
   },
   RangedUnitPower: {
      effect: {
         modifiers: {
            RangedUnitPower: { type: "add", value: 1, duration: DefaultDuration },
         },
      },
      supporting: ["UpperClass", "MilitaryClass"],
      opposing: ["ReligiousClass", "MiddleClass"],
   },
   Stability: {
      effect: {
         modifiers: {
            Stability: { type: "add", value: 10, duration: DefaultDuration },
         },
      },
      supporting: ["UpperClass", "MiddleClass"],
      opposing: ["LowerClass", "MilitaryClass"],
   },
   Prestige: {
      effect: {
         modifiers: {
            Prestige: { type: "multiply", value: 0.1, duration: DefaultDuration },
         },
      },
      supporting: ["ReligiousClass", "MiddleClass"],
      opposing: ["LowerClass", "MilitaryClass"],
   },
   LandTax: {
      effect: {
         modifiers: {
            LandTax: { type: "multiply", value: 0.1, duration: DefaultDuration },
         },
      },
      supporting: ["LowerClass", "MilitaryClass"],
      opposing: ["UpperClass", "MiddleClass"],
   },
   TileOutput: {
      effect: {
         modifiers: {
            TileOutput: { type: "multiply", value: 0.1, duration: DefaultDuration },
         },
      },
      supporting: ["MiddleClass", "LowerClass"],
      opposing: ["UpperClass", "MilitaryClass"],
   },
} as const satisfies Record<string, ISocialClassBonus>;

export type SocialClassBonus = keyof typeof _SocialClassBonuses;
export const SocialClassBonuses: Record<SocialClassBonus, ISocialClassBonus> = _SocialClassBonuses;
