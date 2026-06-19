import GeneralSkillPoint from "../../assets/images/modifiers/GeneralSkillPoint.webp";
import GoverningCapacity from "../../assets/images/modifiers/GoverningCapacity.webp";
import LandTax from "../../assets/images/modifiers/LandTax.webp";
import Manpower from "../../assets/images/modifiers/Manpower.webp";
import Prestige from "../../assets/images/modifiers/Prestige.webp";
import Stability from "../../assets/images/modifiers/Stability.webp";
import TileOutput from "../../assets/images/modifiers/TileOutput.webp";
import TradeProfit from "../../assets/images/modifiers/TradeProfit.webp";
import WarPower from "../../assets/images/modifiers/WarPower.webp";
import type { ImageWithCredit } from "../events/ImageWithCredit";
import type { IGameEffect } from "../GameEffect";

export interface IRestorationBonus {
   effect: IGameEffect;
   image: ImageWithCredit;
}

export const RestorationBonus = {
   GoverningCapacity: {
      effect: {
         modifiers: {
            GoverningCapacity: { type: "add", value: 20 },
         },
      },
      image: {
         url: GoverningCapacity,
         credit: "Image Credit: Cicero's tale about Catiline, Hans Werner Schmidt (1912)",
      },
   } as IRestorationBonus,
   Stability: {
      effect: {
         modifiers: {
            Stability: { type: "add", value: 2 },
         },
      },
      image: {
         url: Stability,
         credit: "Image Credit: Das Forum Romanum, J. Bühlmann (1901)",
      },
   } as IRestorationBonus,
   WarPower: {
      effect: {
         modifiers: {
            WarPower: { type: "multiply", value: 0.02 },
         },
      },
      image: {
         url: WarPower,
         credit: "Image Credit: Julius Caesar's triumphal procession, Weimar (c.1800s)",
      },
   } as IRestorationBonus,
   Prestige: {
      effect: {
         modifiers: {
            Prestige: { type: "multiply", value: 0.02 },
         },
      },
      image: {
         url: Prestige,
         credit: "Image Credit: The Age of Augustus, the Birth of Christ, Jean-Léon Gérôme (1852)",
      },
   } as IRestorationBonus,
   LandTax: {
      effect: {
         modifiers: {
            LandTax: { type: "multiply", value: 0.02 },
         },
      },
      image: {
         url: LandTax,
         credit: "Image Credit: Cincinnatus behind the plow, Anton Hoffmann (1920)",
      },
   } as IRestorationBonus,
   TileOutput: {
      effect: {
         modifiers: {
            TileOutput: { type: "multiply", value: 0.02 },
         },
      },
      image: {
         url: TileOutput,
         credit: "Image Credit: A Forge, Antonio Zucchi (c.1700s)",
      },
   } as IRestorationBonus,
   Manpower: {
      effect: {
         modifiers: {
            Manpower: { type: "multiply", value: 0.02 },
         },
      },
      image: {
         url: Manpower,
         credit:
            "Image Credit: Inneres eines römischen Hauses. Haus des Cornelius Rufus in Pompeji (Rekonstruktion), Adolf Lehmann (1906)",
      },
   } as IRestorationBonus,
   TradeProfit: {
      effect: {
         modifiers: {
            TradeProfit: { type: "multiply", value: 0.02 },
         },
      },
      image: {
         url: TradeProfit,
         credit: "Image Credit: In der Wüste, Adolf Lehmann (c.1900s)",
      },
   } as IRestorationBonus,
   GeneralSkillPoint: {
      effect: {
         resources: {
            generalSkillPoint: 5,
         },
      },
      image: {
         url: GeneralSkillPoint,
         credit: "Image Credit: Gaius Mucius Scaevola, Hans Werner Schmidt (1920)",
      },
   } as IRestorationBonus,
} as const satisfies Record<string, IRestorationBonus>;

export type RestorationBonus = keyof typeof RestorationBonus;
