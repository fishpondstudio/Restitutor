import { Province } from "../../definitions/Province";
import type { ConditionChecks } from "../../logic/Calculation";
import { minCoreTileChecks, provinceResourceChecks, victoryCountChecks } from "../../logic/MissionLogic";
import { tkCharacterAffiliationChecks, tkCharacterAliveChecks } from "../../logic/TKCharacterLogic";
import { requireNoPatronsChecks, requirePeaceBetweenChecks, requireWarBetweenChecks } from "../../logic/TreatyLogic";
import { EventImage } from "../EventImages";
import type { IGameEventConfig } from "../GameEventTypes";

export const LiJueEvents = {
   LiJueEvent1: {
      name: () => "The Veterans of Liang",
      desc: () =>
         "The veterans who marched under Dong Zhuo still fill our ranks. Hardened by campaigns on the western frontier, they bring experience that younger recruits lack. Their commanders await orders: march again, take up staff appointments, or teach the army what they have learned.",
      image: EventImage.TKLiJueVeterans,
      condition: { province: new Set(["LiJue"]) },
      buttons: [
         {
            label: () => "Muster the veterans",
            resources: { military: 100 },
         },
         {
            label: () => "Establish an officer corps",
            modifiers: { MilitaryPoint: { type: "add", value: 1, duration: 120 } },
         },
         {
            label: () => "Let the veterans train the army",
            modifiers: { WarPower: { type: "multiply", value: 0.1, duration: 120 } },
         },
      ],
   },
   LiJueEvent2: {
      name: () => "Jia Xu's Counsel",
      desc: () =>
         "Jia Xu lays a warning before the council: soldiers may seize commanderies, but they cannot govern them alone. Our clerks are already burdened with appointments and petitions. He proposes either extending the civil administration or assigning experienced staff to our envoys and commanders.",
      image: EventImage.TKJiaXuCounsel,
      condition: {
         province: new Set(["LiJue"]),
         year: [195, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterAffiliationChecks("JiaXu", province, save);
            yield* tkCharacterAliveChecks("JiaXu", save);
            yield* provinceResourceChecks("administrative", 100, province, save);
         },
      },
      buttons: [
         {
            label: () => "Extend the civil administration",
            resources: { administrative: -100 },
            modifiers: { GoverningCapacity: { type: "add", value: 50 } },
         },
         {
            label: () => "Support envoys and commanders",
            resources: { administrative: -100 },
            modifiers: {
               DiplomaticPoint: { type: "add", value: 1, duration: 60 },
               MilitaryPoint: { type: "add", value: 1, duration: 60 },
            },
         },
      ],
   },
   LiJueEvent3: {
      name: () => "Rivalries Within the Liang Army",
      desc: () =>
         "The old division of commands among Li Jue, Guo Si, and their comrades has left the Liang army with rival followings. Victorious officers now press claims for rewards and appointments. The treasury can fund a settlement, but its terms will decide whose service our government values most.",
      image: EventImage.TKMilitaryAppointments,
      condition: {
         province: new Set(["LiJue"]),
         year: [195, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            yield* victoryCountChecks(3, province, save);
            yield* provinceResourceChecks("gold", 500, province, save);
         },
      },
      buttons: [
         {
            label: () => "Reward loyalty to civil authority",
            resources: { gold: -500 },
            modifiers: {
               AdministrativePoint: { type: "add", value: 1, duration: 36 },
               Stability: { type: "add", value: 10, duration: 36 },
            },
         },
         {
            label: () => "Fund envoys to coordinate the camps",
            resources: { gold: -500 },
            modifiers: {
               DiplomaticPoint: { type: "add", value: 1, duration: 36 },
               WarPower: { type: "multiply", value: 0.1, duration: 36 },
            },
         },
         {
            label: () => "Honor the army's officers",
            resources: { gold: -500 },
            modifiers: {
               MilitaryPoint: { type: "add", value: 1, duration: 36 },
               Prestige: { type: "multiply", value: 0.1, duration: 36 },
            },
         },
      ],
   },
   LiJueEvent4: {
      name: () => "Restoring the Fields of Guanzhong",
      desc: () =>
         "Victories have brought new fields and households onto our registers. Officials trained in Guanzhong now carry their methods into the conquered districts, where harvests, taxes, and recruits must sustain a growing realm. The settlement will show our new subjects what kind of rule follows our armies.",
      image: EventImage.TKAgriculturalSurvey,
      condition: {
         province: new Set(["LiJue"]),
         year: [195, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            yield* victoryCountChecks(5, province, save);
            yield* minCoreTileChecks(Province.LiJue.tiles.length + 10, province, save);
         },
      },
      buttons: [
         {
            label: () => "Restore the fields and reassure farmers",
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1, duration: 36 },
               Stability: { type: "add", value: 10, duration: 36 },
            },
         },
         {
            label: () => "Bring order to the tax registers",
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 36 },
               Prestige: { type: "multiply", value: 0.1, duration: 36 },
            },
         },
         {
            label: () => "Organize the military households",
            modifiers: {
               Manpower: { type: "multiply", value: 0.1, duration: 36 },
               WarPower: { type: "multiply", value: 0.1, duration: 36 },
            },
         },
      ],
   },
   LiJueEvent5: {
      name: () => "The Price of Courtly Respect",
      desc: () =>
         "Our borders have grown, but court officials still regard us as heirs to Dong Zhuo's military regime. A generous subsidy would give weight to our professions of loyalty to the Han. Others urge us to spend that silver on experienced officials who can earn respect through orderly government.",
      image: EventImage.TKDiplomaticSubsidy,
      condition: {
         province: new Set(["LiJue"]),
         year: [195, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            yield* minCoreTileChecks(Province.LiJue.tiles.length + 20, province, save);
            yield* provinceResourceChecks("gold", 1000, province, save);
         },
      },
      buttons: [
         {
            label: () => "Send silver to the Han court",
            resources: { gold: -1000, consulPoint: 3 },
            modifiers: { Prestige: { type: "multiply", value: 0.1, duration: 36 } },
         },
         {
            label: () => "Employ respected civil officials",
            resources: { gold: -1000, administrative: 100 },
            modifiers: { Stability: { type: "add", value: 10, duration: 36 } },
         },
      ],
   },
   LiJueEvent6: {
      name: () => "Xu Huang's Discipline",
      desc: () =>
         "Xu Huang's insistence on orderly formations and careful preparation has won the attention of our commanders. Officers gather to learn his methods, while requests for instructors arrive from field camps, garrisons, and recruiting stations. We must decide where his example will do the most good.",
      image: EventImage.TKXuHuangTraining,
      condition: {
         province: new Set(["LiJue"]),
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterAffiliationChecks("XuHuang", province, save);
            yield* tkCharacterAliveChecks("XuHuang", save);
            yield* victoryCountChecks(5, province, save);
         },
      },
      buttons: [
         {
            label: () => "Train the field army",
            resources: { military: 100 },
            modifiers: { WarPower: { type: "multiply", value: 0.1, duration: 36 } },
         },
         {
            label: () => "Reorganize the garrisons",
            resources: { military: 100 },
            modifiers: { Defense: { type: "multiply", value: 0.1, duration: 36 } },
         },
         {
            label: () => "Reform the recruitment rolls",
            resources: { military: 100 },
            modifiers: { Manpower: { type: "multiply", value: 0.1, duration: 36 } },
         },
      ],
   },
   LiJueEvent7: {
      name: () => "A Claim to Liangzhou",
      desc: () =>
         "Li Jue hails from Beidi, but the western lands remain divided among rival commands. Ma Teng and Han Sui answer to neither our officials nor our generals. Some officers urge a claim to Liangzhou; others warn that preparations for conquest will draw resources away from our fields and tax offices.",
      image: EventImage.TKLiJueWesternFrontier,
      condition: {
         province: new Set(["LiJue"]),
         onMap: { MaTeng: true, HanSui: true },
         conditions: function* (province, save): ConditionChecks {
            yield* requireNoPatronsChecks("MaTeng", save);
            yield* requireNoPatronsChecks("HanSui", save);
            yield* requirePeaceBetweenChecks(province, "MaTeng", save);
            yield* requirePeaceBetweenChecks(province, "HanSui", save);
         },
      },
      buttons: [
         {
            label: () => "Press our claim to Liangzhou",
            casusBelli: {
               MaTeng: { casusBelli: "ConquestMission", duration: 60 },
               HanSui: { casusBelli: "ConquestMission", duration: 60 },
            },
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 36 },
               LandTax: { type: "multiply", value: -0.1, duration: 36 },
            },
         },
         {
            label: () => "Put our own lands in order",
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 36 },
               TileOutput: { type: "multiply", value: 0.1, duration: 36 },
               WarPower: { type: "multiply", value: -0.1, duration: 36 },
            },
         },
      ],
   },
   LiJueEvent8: {
      name: () => "The West as Our Foundation",
      desc: () =>
         "The commanderies once held by Ma Teng and Han Sui now receive our officials. Their soldiers, registers, and influential families give us more than a secure frontier: they offer a lasting foundation for power beyond the west. The council turns from the settlement of Liangzhou to the future of the realm.",
      image: EventImage.TKNorthernConsolidation,
      condition: {
         province: new Set(["LiJue"]),
         annexAndCore: {
            MaTeng: Number.POSITIVE_INFINITY,
            HanSui: Number.POSITIVE_INFINITY,
         },
      },
      buttons: [
         {
            label: () => "Establish lasting military traditions",
            resources: { military: 100 },
            modifiers: { WarPower: { type: "multiply", value: 0.1 } },
         },
         {
            label: () => "Prepare to govern a greater realm",
            resources: { administrative: 100 },
            modifiers: { GoverningCapacity: { type: "add", value: 50 } },
         },
         {
            label: () => "Proclaim our authority from the west",
            resources: { diplomatic: 100 },
            modifiers: { Prestige: { type: "multiply", value: 0.1 } },
         },
      ],
   },
   LiJueEvent9: {
      name: () => "Jia Xu's Plans Against Cao Cao",
      desc: () =>
         "Reports from the war against Cao Cao cover the council table. Jia Xu sees opportunities along the enemy's supply roads, but our commanders ask for a concentrated offensive. A third proposal would release military staff to serve the civil offices and embassies, preparing our government for the contest beyond the battlefield.",
      image: EventImage.TKJiaXuCounsel,
      condition: {
         province: new Set(["LiJue"]),
         onMap: { CaoCao: true },
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterAffiliationChecks("JiaXu", province, save);
            yield* tkCharacterAliveChecks("JiaXu", save);
            yield* requireWarBetweenChecks(province, "CaoCao", save);
            yield* provinceResourceChecks("military", 100, province, save);
         },
      },
      buttons: [
         {
            label: () => "Disrupt Cao Cao's supply roads",
            resources: { military: -100 },
            provinceModifiers: [
               { modifier: "WarPower", type: "multiply", value: -0.2, duration: 36, province: "CaoCao" },
            ],
         },
         {
            label: () => "Concentrate our forces for an offensive",
            resources: { military: -100 },
            modifiers: { WarPower: { type: "multiply", value: 0.2, duration: 36 } },
         },
         {
            label: () => "Reassign staff to officials and envoys",
            resources: { military: -100 },
            modifiers: {
               AdministrativePoint: { type: "add", value: 1, duration: 60 },
               DiplomaticPoint: { type: "add", value: 1, duration: 60 },
            },
         },
      ],
   },
   LiJueEvent10: {
      name: () => "Beyond Dong Zhuo's Shadow",
      desc: () =>
         "Cao Cao's heartland now answers to us, and our authority reaches far beyond its western beginnings. Petitions arrive from communities that know little of the old Liang army. A government aspiring to reunite the realm must offer more than Dong Zhuo's legacy: regional institutions, respect for local customs, or a convincing claim to rule.",
      image: EventImage.TKRegionalAssembly,
      condition: {
         province: new Set(["LiJue"]),
         annexAndCore: { CaoCao: Number.POSITIVE_INFINITY },
         conditions: function* (province, save): ConditionChecks {
            yield* minCoreTileChecks(50, province, save);
         },
      },
      buttons: [
         {
            label: () => "Authorize another regional capital",
            resources: { administrative: 100 },
            modifiers: {
               GoverningCapacity: { type: "add", value: 50 },
               RegionalCapitalCount: { type: "add", value: 1 },
            },
         },
         {
            label: () => "Give local customs a place in our realm",
            resources: { diplomatic: 100 },
            modifiers: {
               GoverningCapacity: { type: "add", value: 50 },
               ToleratedCulture: { type: "add", value: 1 },
            },
         },
         {
            label: () => "Let our commanders uphold our mandate",
            resources: { military: 100, mandate: 1 },
            modifiers: {
               GoverningCapacity: { type: "add", value: 50 },
            },
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
