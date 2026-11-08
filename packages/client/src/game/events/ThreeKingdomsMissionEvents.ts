import { fromEntries } from "@project/shared/src/utils/Helper";
import { Province } from "../definitions/Province";
import type { ConditionChecks } from "../logic/Calculation";
import { allyCountChecks, minCoreTileChecks, setProvinceNameOverrideEffect } from "../logic/MissionLogic";
import { isGreatPowerChecks } from "../logic/ProvinceLogic";
import { TKWarlords } from "../ThreeKingdoms/TKWarlord";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const ThreeKingdomsMissionEvents = {
   TKMissionAllies: {
      name: () => "A Network of Allies",
      desc: () =>
         "Our envoys have secured allies beyond our borders. Their support lends strength to our armies, weight to our word, and reassurance to our people. We must turn these agreements into a lasting advantage for our realm.",
      image: EventImage.MountedParley,
      condition: {
         conditions: function* (province, save): ConditionChecks {
            yield* allyCountChecks(2, province, save);
         },
      },
      buttons: [
         {
            label: () => "Let our allies march beside us",
            modifiers: { WarPower: { type: "multiply", value: 0.1, duration: 60 } },
         },
         {
            label: () => "Let our alliance command respect",
            modifiers: { Prestige: { type: "multiply", value: 0.1, duration: 60 } },
         },
         {
            label: () => "Let concord secure peace at home",
            modifiers: { Stability: { type: "add", value: 10, duration: 60 } },
         },
      ],
   },
   TKMissionGreatPower: {
      name: () => "A Rising Power",
      desc: () =>
         "Our name now carries weight among the powers of the realm. New commanderies acknowledge our authority, and neighboring courts can no longer dismiss our ambitions. The foundations we lay today shall determine whether this rise endures.",
      image: EventImage.HeroTriumph,
      condition: {
         conditions: function* (province, save): ConditionChecks {
            yield* isGreatPowerChecks(province, save);
            yield* minCoreTileChecks(Province[province].tiles.length + 5, province, save);
         },
      },
      buttons: [
         {
            label: () => "Strengthen the civil administration",
            modifiers: { AdministrativePoint: { type: "add", value: 1 } },
         },
         {
            label: () => "Expand our corps of envoys",
            modifiers: { DiplomaticPoint: { type: "add", value: 1 } },
         },
         {
            label: () => "Establish a permanent military staff",
            modifiers: { MilitaryPoint: { type: "add", value: 1 } },
         },
      ],
   },
   TKMissionExpand: {
      name: () => "Expand Our Borders",
      desc: () =>
         "Our banners have advanced beyond the lands that first sustained our cause. The newly governed districts offer taxes, recruits, and fresh opportunities, but possession must be secured through sound policy. Let these gains become the foundation of greater deeds.",
      image: EventImage.CavalryCharge,
      condition: {
         conditions: function* (province, save): ConditionChecks {
            yield* minCoreTileChecks(Province[province].tiles.length + 5, province, save);
         },
      },
      buttons: [
         {
            label: () => "Consolidate the new districts",
            resources: { administrative: 100 },
            modifiers: { GoverningCapacity: { type: "add", value: 50 } },
         },
         {
            label: () => "Win over neighboring courts",
            resources: { diplomatic: 100 },
            modifiers: { GoverningCapacity: { type: "add", value: 50 } },
         },
         {
            label: () => "Prepare the next campaign",
            resources: { military: 100 },
            modifiers: { GoverningCapacity: { type: "add", value: 50 } },
         },
      ],
   },
   TKMissionDouble: {
      name: () => "Double Our Domain",
      desc: () =>
         "The lands beneath our authority have doubled, and the burdens of government have grown with them. Officials who once served a modest domain must now govern a rising realm. We must give our rule the means and standing to match its reach.",
      image: EventImage.ImperialRescript,
      condition: {
         conditions: function* (province, save): ConditionChecks {
            yield* minCoreTileChecks(Province[province].tiles.length * 2, province, save);
         },
      },
      buttons: [
         {
            label: () => "Empower every branch of government",
            resources: { administrative: 25, diplomatic: 25, military: 25 },
            modifiers: { GoverningCapacity: { type: "add", value: 50 } },
         },
         {
            label: () => "Seek imperial recognition",
            resources: { consulPoint: 2 },
            modifiers: { GoverningCapacity: { type: "add", value: 50 } },
         },
         {
            label: () => "Affirm our right to govern",
            resources: { mandate: 1 },
            modifiers: { GoverningCapacity: { type: "add", value: 50 } },
         },
      ],
   },
   TKMissionCore100: {
      name: () => "A Growing Realm",
      desc: () =>
         "Across a hundred districts, our seals now authorize appointments and our registers record the harvest. Such a realm cannot be governed by the arrangements of a single commandery. Let us establish offices capable of carrying our authority to its furthest boundaries.",
      image: EventImage.ImperialCity,
      condition: {
         conditions: function* (province, save): ConditionChecks {
            yield* minCoreTileChecks(100, province, save);
         },
      },
      buttons: [
         {
            label: () => "Establish regional civil offices",
            resources: { administrative: 100 },
            modifiers: { GoverningCapacity: { type: "add", value: 100 } },
         },
         {
            label: () => "Strengthen diplomatic administration",
            resources: { diplomatic: 100 },
            modifiers: { GoverningCapacity: { type: "add", value: 100 } },
         },
         {
            label: () => "Organize regional military commands",
            resources: { military: 100 },
            modifiers: { GoverningCapacity: { type: "add", value: 100 } },
         },
      ],
   },
   TKMissionCore200: {
      name: () => "A Vast Dominion",
      desc: () =>
         "Two hundred districts acknowledge our government. Petitions, tax accounts, and reports of the harvest arrive from distant settlements. We must extend the reach of our officials and decide whether to devote their efforts to governing more land, securing its revenues, or increasing its abundance.",
      image: EventImage.ImperialPatronage,
      condition: {
         conditions: function* (province, save): ConditionChecks {
            yield* minCoreTileChecks(200, province, save);
         },
      },
      buttons: [
         {
            label: () => "Extend the civil administration",
            modifiers: {
               GoverningCapacity: { type: "add", value: 200 },
            },
         },
         {
            label: () => "Reform the land tax registers",
            modifiers: {
               GoverningCapacity: { type: "add", value: 100 },
               LandTax: { type: "multiply", value: 0.1 },
            },
         },
         {
            label: () => "Develop the resources of our domain",
            modifiers: {
               GoverningCapacity: { type: "add", value: 100 },
               TileOutput: { type: "multiply", value: 0.1 },
            },
         },
      ],
   },
   TKMissionCore300: {
      name: () => "An Empire in the Making",
      desc: () =>
         "Our rule extends over three hundred districts, embracing communities whose customs and needs differ greatly. What began as a regional undertaking has assumed the proportions of an empire. We must bind these lands together without exhausting the government that holds them.",
      image: EventImage.IdealCity,
      condition: {
         conditions: function* (province, save): ConditionChecks {
            yield* minCoreTileChecks(300, province, save);
         },
      },
      buttons: [
         {
            label: () => "Govern through regional capitals",
            modifiers: {
               GoverningCapacity: { type: "add", value: 100 },
               RegionalCapitalCount: { type: "add", value: 1 },
            },
         },
         {
            label: () => "Accommodate regional cultures",
            modifiers: {
               GoverningCapacity: { type: "add", value: 100 },
               ToleratedCulture: { type: "add", value: 1 },
            },
         },
         {
            label: () => "Affirm our mandate to rule",
            resources: { mandate: 1 },
            modifiers: {
               GoverningCapacity: { type: "add", value: 100 },
            },
         },
      ],
   },
   TKMissionHebei: {
      name: () => "Unify Hebei",
      desc: () =>
         "The plains north of the Yellow River and their mountain approaches now answer to one government. Hebei's fields and populous commanderies can sustain both our treasury and our armies. We must decide how best to draw upon the strength of these newly united lands.",
      image: EventImage.FieldHarvest,
      condition: {
         annexAndCore: {
            YuanShao: Number.POSITIVE_INFINITY,
            ZhangYan: Number.POSITIVE_INFINITY,
            ZhangYang: Number.POSITIVE_INFINITY,
            GongsunZan: Number.POSITIVE_INFINITY,
         },
      },
      buttons: [
         {
            label: () => "Develop the northern farmlands",
            modifiers: { TileOutput: { type: "multiply", value: 0.15, duration: 60 } },
         },
         {
            label: () => "Recruit from the commanderies",
            modifiers: { Manpower: { type: "multiply", value: 0.15, duration: 60 } },
         },
         {
            label: () => "Survey the estates for taxation",
            modifiers: { LandTax: { type: "multiply", value: 0.15, duration: 60 } },
         },
      ],
   },
   TKMissionLiaodong: {
      name: () => "Secure Liaodong",
      desc: () =>
         "The settlements and strongholds of Liaodong have been brought beneath our authority. Our banner now commands respect on a distant frontier, and its people look to us for order. We may draw strength from their soldiers, secure their allegiance, or proclaim our achievement throughout the realm.",
      image: EventImage.Watchtower,
      condition: { annexAndCore: { GongsunDu: Number.POSITIVE_INFINITY } },
      buttons: [
         {
            label: () => "Muster the frontier warriors",
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 60 },
            },
         },
         {
            label: () => "Reconcile the frontier communities",
            modifiers: {
               Stability: { type: "add", value: 10, duration: 60 },
            },
         },
         {
            label: () => "Proclaim our mastery of Liaodong",
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 60 },
            },
         },
      ],
   },
   TKMissionCentralPlains: {
      name: () => "Unify the Central Plains",
      desc: () =>
         "The central commanderies now lie within a single domain. Possession of this heartland gives weight to our petitions at court and draws officers and envoys to our service. We must decide how to turn our territorial strength into authority throughout the realm.",
      image: EventImage.FieldHarvest,
      condition: {
         annexAndCore: {
            CaoCao: Number.POSITIVE_INFINITY,
            LuBu: Number.POSITIVE_INFINITY,
            LiuBei: Number.POSITIVE_INFINITY,
            TaoQian: Number.POSITIVE_INFINITY,
            KongRong: Number.POSITIVE_INFINITY,
            YuanShu: Number.POSITIVE_INFINITY,
         },
      },
      buttons: [
         {
            label: () => "Seek the court's favor for our rule",
            resources: {
               consulPoint: 2,
            },
            modifiers: {
               AdministrativePoint: { type: "add", value: 1, duration: 60 },
            },
         },
         {
            label: () => "Honor our generals and empower envoys",
            resources: {
               generalSkillPoint: 2,
            },
            modifiers: {
               DiplomaticPoint: { type: "add", value: 1, duration: 60 },
            },
         },
         {
            label: () => "Assert our mandate through arms",
            resources: {
               mandate: 1,
            },
            modifiers: {
               MilitaryPoint: { type: "add", value: 1, duration: 60 },
            },
         },
      ],
   },
   TKMissionNorthwest: {
      name: () => "Unify Guanzhong and Liangzhou",
      desc: () =>
         "The passes of Guanzhong and the western frontier have been gathered beneath our banner. Here the old imperial heartland meets the roads of distant commerce and the lands that sustain frontier armies. Their union offers both security and renewed prosperity.",
      image: EventImage.HorsePasture,
      condition: {
         annexAndCore: {
            LiJue: Number.POSITIVE_INFINITY,
            MaTeng: Number.POSITIVE_INFINITY,
            HanSui: Number.POSITIVE_INFINITY,
         },
      },
      buttons: [
         {
            label: () => "Rebuild the western heartland",
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 60 },
               TileOutput: { type: "multiply", value: 0.1, duration: 60 },
            },
            resources: {
               administrative: 100,
            },
         },
         {
            label: () => "Extend our influence from the west",
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 60 },
            },
            resources: {
               diplomatic: 100,
            },
         },
         {
            label: () => "Strengthen the western armies",
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 60 },
            },
            resources: {
               military: 100,
            },
         },
      ],
   },
   TKMissionJingzhou: {
      name: () => "Unify Jingzhou",
      desc: () =>
         "The valleys and river crossings of Jingzhou are ours to administer. Through these lands pass the routes that bind the northern plains to the southern rivers and western basins. A well-governed Jingzhou shall sustain commerce in peace and armies in war.",
      image: EventImage.Merchant1,
      condition: { annexAndCore: { LiuBiao: Number.POSITIVE_INFINITY } },
      buttons: [
         {
            label: () => "Develop the river markets",
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.2, duration: 60 },
            },
         },
         {
            label: () => "Recruit soldiers from Jingzhou",
            modifiers: {
               Manpower: { type: "multiply", value: 0.2, duration: 60 },
            },
         },
         {
            label: () => "Fortify the river crossings",
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 60 },
            },
         },
      ],
   },
   TKMissionJiangdong: {
      name: () => "Unify Jiangdong",
      desc: () =>
         "The lower river and the southeastern settlements now acknowledge a common authority. Their waterways carry the produce of fertile districts to thriving markets. By joining their prosperity to our government, we may make Jiangdong a lasting pillar of the realm.",
      image: EventImage.Merchant2,
      condition: {
         annexAndCore: {
            SunCe: Number.POSITIVE_INFINITY,
            LiuYao: Number.POSITIVE_INFINITY,
            WangLang: Number.POSITIVE_INFINITY,
            YanBaihu: Number.POSITIVE_INFINITY,
         },
      },
      buttons: [
         {
            label: () => "Expand river and coastal commerce",
            modifiers: {
               TradeCapacity: { type: "add", value: 1 },
            },
         },
         {
            label: () => "Develop southern workshops",
            modifiers: {
               ProductionCapacity: { type: "add", value: 5 },
            },
         },
         {
            label: () => "Integrate the southern districts",
            modifiers: {
               GoverningCapacity: { type: "add", value: 50 },
            },
         },
      ],
   },
   TKMissionBashu: {
      name: () => "Unify Bashu and Hanzhong",
      desc: () =>
         "The fertile basin of Bashu and the northern gateway of Hanzhong stand united beneath our banner. Their sheltered fields promise rich harvests and reliable revenues, while their officials bring experience of governing the western interior. Let these resources strengthen the whole realm.",
      image: EventImage.FieldHarvest,
      condition: { annexAndCore: { LiuZhang: Number.POSITIVE_INFINITY, ZhangLu: Number.POSITIVE_INFINITY } },
      buttons: [
         {
            label: () => "Develop the basin's abundance",
            modifiers: { TileOutput: { type: "multiply", value: 0.2, duration: 60 } },
         },
         {
            label: () => "Bring the fertile estates to tax",
            modifiers: { LandTax: { type: "multiply", value: 0.2, duration: 60 } },
         },
         {
            label: () => "Employ the talents of Bashu",
            resources: { administrative: 20, diplomatic: 20, military: 20 },
         },
      ],
   },
   TKMissionJiaozhou: {
      name: () => "Unify Jiaozhou",
      desc: () =>
         "The distant southern commanderies now look to our government for order. Their ports connect the realm to far-reaching trade, while their settlements supply goods sought in distant markets. We must decide whether to enrich existing commerce, open new routes, or expand local production.",
      image: EventImage.Merchant3,
      condition: { annexAndCore: { ShiXie: Number.POSITIVE_INFINITY } },
      buttons: [
         {
            label: () => "Encourage maritime commerce",
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.1 },
            },
         },
         {
            label: () => "Open new maritime trade routes",
            modifiers: {
               TradeCapacity: { type: "add", value: 1 },
            },
         },
         {
            label: () => "Develop local production",
            modifiers: {
               ProductionCapacity: { type: "add", value: 5 },
            },
         },
      ],
   },
   TKMissionNorth: {
      name: () => "Unify the North",
      desc: () =>
         "From the western passes to the northeastern frontier, the lands of the north obey one authority. The plains that sustained competing armies may now sustain a common government. With their wealth and strength united, the future of the realm lies within our reach.",
      image: EventImage.HeroTriumph,
      condition: {
         annexAndCore: {
            YuanShao: Number.POSITIVE_INFINITY,
            ZhangYan: Number.POSITIVE_INFINITY,
            ZhangYang: Number.POSITIVE_INFINITY,
            GongsunZan: Number.POSITIVE_INFINITY,
            GongsunDu: Number.POSITIVE_INFINITY,
            CaoCao: Number.POSITIVE_INFINITY,
            LuBu: Number.POSITIVE_INFINITY,
            LiuBei: Number.POSITIVE_INFINITY,
            TaoQian: Number.POSITIVE_INFINITY,
            KongRong: Number.POSITIVE_INFINITY,
            YuanShu: Number.POSITIVE_INFINITY,
            LiJue: Number.POSITIVE_INFINITY,
            MaTeng: Number.POSITIVE_INFINITY,
            HanSui: Number.POSITIVE_INFINITY,
         },
      },
      buttons: [
         {
            label: () => "Consolidate northern government",
            modifiers: {
               GoverningCapacity: { type: "add", value: 200 },
               AdministrativePoint: { type: "add", value: 1 },
            },
         },
         {
            label: () => "Extend our influence through envoys",
            modifiers: {
               GoverningCapacity: { type: "add", value: 200 },
               DiplomaticPoint: { type: "add", value: 1 },
            },
         },
         {
            label: () => "Mobilize northern strength",
            modifiers: {
               GoverningCapacity: { type: "add", value: 200 },
               MilitaryPoint: { type: "add", value: 1 },
            },
         },
      ],
   },
   TKMissionSouth: {
      name: () => "Unify the South",
      desc: () =>
         "The southern rivers, western basins, and far-southern commanderies have been joined beneath our banner. Their harvests, revenues, and recruits may now sustain a common government. We must organize these resources so that the strength of the south serves the whole realm.",
      image: EventImage.CivicTriumph,
      condition: {
         annexAndCore: {
            LiuBiao: Number.POSITIVE_INFINITY,
            SunCe: Number.POSITIVE_INFINITY,
            LiuYao: Number.POSITIVE_INFINITY,
            WangLang: Number.POSITIVE_INFINITY,
            YanBaihu: Number.POSITIVE_INFINITY,
            LiuZhang: Number.POSITIVE_INFINITY,
            ZhangLu: Number.POSITIVE_INFINITY,
            ShiXie: Number.POSITIVE_INFINITY,
         },
      },
      buttons: [
         {
            label: () => "Survey the southern lands for tax",
            modifiers: {
               GoverningCapacity: { type: "add", value: 200 },
               LandTax: { type: "multiply", value: 0.1 },
            },
         },
         {
            label: () => "Develop the wealth of the south",
            modifiers: {
               GoverningCapacity: { type: "add", value: 200 },
               TileOutput: { type: "multiply", value: 0.1 },
            },
         },
         {
            label: () => "Organize recruitment in the south",
            modifiers: {
               GoverningCapacity: { type: "add", value: 200 },
               Manpower: { type: "multiply", value: 0.1 },
            },
         },
      ],
   },
   TKMissionChina: {
      name: () => "All Under Heaven",
      desc: () =>
         "The banners that divided the realm have yielded to a single authority. From the northern frontier to the southern seas, our officials govern lands once contested by rival courts. Let the Empire of China be proclaimed, and let its institutions preserve the unity our endeavors have won.",
      image: EventImage.CivicTriumph,
      condition: {
         annexAndCore: fromEntries(Array.from(TKWarlords, (warlord) => [warlord, Number.POSITIVE_INFINITY])),
      },
      buttons: [
         {
            label: () => "Proclaim the Empire of China",
            modifiers: { GoverningCapacity: { type: "add", value: 200 } },
            custom: [setProvinceNameOverrideEffect("EmpireOfChina")],
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
