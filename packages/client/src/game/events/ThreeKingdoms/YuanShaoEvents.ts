import { Province } from "../../definitions/Province";
import { requireHigherWarPowerChecks } from "../../logic/ArmyLogic";
import type { ConditionChecks } from "../../logic/Calculation";
import {
   minCoreTileChecks,
   provinceResourceChecks,
   victoryCountChecks,
   warPowerChecks,
} from "../../logic/MissionLogic";
import {
   tkCharacterAliveChecks,
   tkCharacterUnaffiliatedChecks,
   transferTKCharacterEffect,
} from "../../logic/TKCharacterLogic";
import { requireNoPatronsChecks, requirePeaceBetweenChecks, requireWarBetweenChecks } from "../../logic/TreatyLogic";
import { EventImage } from "../EventImages";
import type { IGameEventConfig } from "../GameEventTypes";

export const YuanShaoEvents = {
   YuanShaoEvent1: {
      name: () => "Four Generations, Three Excellencies",
      desc: () =>
         "The Yuan name has been honored through four generations of service in the highest offices of the Han. Scholars seek our patronage, influential families offer introductions, and old clients stand ready to answer our summons. This inheritance cannot govern the realm for us, but wisely employed it may open doors that armies alone cannot force.",
      image: EventImage.TKScholarlyPatronage,
      condition: {
         province: new Set(["YuanShao"]),
      },
      buttons: [
         { label: () => "Call upon our family connections", resources: { diplomatic: 75 } },
         { label: () => "Gather scholars beneath our banner", resources: { administrative: 75 } },
         { label: () => "Honor our service to the Han", resources: { consulPoint: 2 } },
      ],
   },
   YuanShaoEvent2: {
      name: () => "Pacify the Black Mountains",
      desc: () =>
         "The mountain strongholds that challenged Yuan authority now lie within our domain. Our officials can make their submission a visible triumph of government, our envoys can reconcile their communities, or our officers can put their knowledge of the passes to military use. The settlement we choose will determine how these lands serve our cause.",
      image: EventImage.TKMountainReconciliation,
      condition: {
         province: new Set(["YuanShao"]),
         annexAndCore: { ZhangYan: Number.POSITIVE_INFINITY },
      },
      buttons: [
         {
            label: () => "Establish Yuan authority in the hills",
            resources: { administrative: 50 },
            modifiers: { Prestige: { type: "multiply", value: 0.1, duration: 36 } },
         },
         {
            label: () => "Reconcile the mountain communities",
            resources: { diplomatic: 50 },
            modifiers: { Stability: { type: "add", value: 10, duration: 36 } },
         },
         {
            label: () => "Organize the defense of the passes",
            resources: { military: 50 },
            modifiers: { Defense: { type: "multiply", value: 0.1, duration: 36 } },
         },
      ],
   },
   YuanShaoEvent3: {
      name: () => "The Great Families of Hebei",
      desc: () =>
         "The great families of Hebei offer men versed in negotiation and military affairs, but expect appointments worthy of their standing. Bringing their clients into service would demand considerable effort from our officials. We may employ that effort to secure their talents, or devote it to extending the reach of an administration answerable to us alone.",
      image: EventImage.TKScholarlyPatronage,
      condition: {
         province: new Set(["YuanShao"]),
         year: [195, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            yield* provinceResourceChecks("administrative", 100, province, save);
         },
      },
      buttons: [
         {
            label: () => "Employ their envoys and officers",
            resources: { administrative: -100 },
            modifiers: {
               DiplomaticPoint: { type: "add", value: 1, duration: 60 },
               MilitaryPoint: { type: "add", value: 1, duration: 60 },
            },
         },
         {
            label: () => "Extend our own civil administration",
            resources: { administrative: -100 },
            modifiers: { GoverningCapacity: { type: "add", value: 20 } },
         },
      ],
   },
   YuanShaoEvent4: {
      name: () => "The Yuan House and the Han Court",
      desc: () =>
         "Our military strength and treasury give weight to the Yuan house's professions of loyalty. A generous contribution to the imperial court would win favor and display our devotion to the Han. Yet our advisers also urge us to strengthen the officials, envoys, and officers who maintain order in our own domain.",
      image: EventImage.TKDiplomaticSubsidy,
      condition: {
         province: new Set(["YuanShao"]),
         year: [195, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            yield* warPowerChecks(10_000, province, save);
            yield* provinceResourceChecks("gold", 1000, province, save);
         },
      },
      buttons: [
         {
            label: () => "Send a generous subsidy to the court",
            resources: { gold: -1000, consulPoint: 3 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 36 },
            },
         },
         {
            label: () => "Strengthen our government at home",
            resources: {
               administrative: 30,
               diplomatic: 30,
               military: 30,
            },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 36 },
            },
         },
      ],
   },
   YuanShaoEvent5: {
      name: () => "One Yuan Banner",
      desc: () =>
         "The lands that sustained Yuan Shu's rival establishment now answer to our government. His former clients, households, and estates must be brought into the settlement. We may proclaim the ascendancy of our branch of the Yuan house, reconcile the people to our rule, or bring the landed wealth of these territories onto our tax rolls.",
      image: EventImage.TKPublicProclamation,
      condition: {
         province: new Set(["YuanShao"]),
         annexAndCore: { YuanShu: Number.POSITIVE_INFINITY },
      },
      buttons: [
         {
            label: () => "Proclaim the ascendancy of our house",
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 36 },
            },
         },
         {
            label: () => "Reconcile Yuan Shu's former subjects",
            modifiers: {
               Stability: { type: "add", value: 10, duration: 36 },
            },
         },
         {
            label: () => "Register the estates for taxation",
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 36 },
            },
         },
      ],
   },
   YuanShaoEvent11: {
      name: () => "Zhang He Joins Our Service",
      desc: () =>
         "The struggle for the north demands commanders who can do more than lead a charge. Zhang He, styled Junyi, has shown a keen eye for the battlefield and a steady hand in command. We can welcome him into our service and make his talents available for the campaigns ahead.",
      image: EventImage.TKMilitaryAppointments,
      condition: {
         province: new Set(["YuanShao"]),
         year: [199, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterUnaffiliatedChecks("ZhangHe", save);
            yield* tkCharacterAliveChecks("ZhangHe", save);
            yield* victoryCountChecks(3, province, save);
            yield* minCoreTileChecks(Province.YuanShao.tiles.length + 6, province, save);
         },
      },
      buttons: [
         {
            label: () => "Welcome Zhang He into our service",
            custom: [transferTKCharacterEffect("ZhangHe")],
         },
      ],
   },
   YuanShaoEvent6: {
      name: () => "Settling the Northern Rivalry",
      desc: () =>
         "The commanderies once held by Gongsun Zan now acknowledge our authority. Their officials, local notables, and military households offer different means of strengthening Yuan rule. We may regularize their revenues, secure cooperation in restoring production, or draw their soldiers into the service of our armies.",
      image: EventImage.TKAgriculturalSurvey,
      condition: {
         province: new Set(["YuanShao"]),
         annexAndCore: { GongsunZan: Number.POSITIVE_INFINITY },
      },
      buttons: [
         {
            label: () => "Reorganize the northern tax offices",
            resources: { administrative: 75 },
            modifiers: { LandTax: { type: "multiply", value: 0.1, duration: 36 } },
         },
         {
            label: () => "Enlist local support for production",
            resources: { diplomatic: 75 },
            modifiers: { TileOutput: { type: "multiply", value: 0.1, duration: 36 } },
         },
         {
            label: () => "Muster the northern military households",
            resources: { military: 75 },
            modifiers: { Manpower: { type: "multiply", value: 0.1, duration: 36 } },
         },
      ],
   },
   YuanShaoEvent7: {
      name: () => "The Counsel Before the Campaign",
      desc: () =>
         "Cao Cao remains beyond our authority, and our council debates how to approach the contest ahead. Some urge us to press our claim to his territories and divert revenues toward preparing an offensive. Others would restrain military preparations while strengthening the fields and tax registers that sustain our power.",
      image: EventImage.TKCouncilDeliberation,
      condition: {
         province: new Set(["YuanShao"]),
         year: [199, Number.POSITIVE_INFINITY],
         onMap: { CaoCao: true },
         conditions: function* (province, save): ConditionChecks {
            yield* requireNoPatronsChecks("CaoCao", save);
            yield* requirePeaceBetweenChecks(province, "CaoCao", save);
         },
      },
      buttons: [
         {
            label: () => "Press our claim and prepare for war",
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 36 },
               LandTax: { type: "multiply", value: -0.1, duration: 36 },
            },
            casusBelli: {
               CaoCao: { casusBelli: "ConquestMission", duration: 60 },
            },
         },
         {
            label: () => "Replenish our fields and treasury",
            modifiers: {
               WarPower: { type: "multiply", value: -0.1, duration: 36 },
               LandTax: { type: "multiply", value: 0.1, duration: 36 },
               TileOutput: { type: "multiply", value: 0.1, duration: 36 },
            },
         },
      ],
   },
   YuanShaoEvent8: {
      name: () => "A Proclamation Against Cao Cao",
      desc: () =>
         "Our armies face Cao Cao, but the struggle also reaches the proclamations read in every commandery and camp. Our officials can reassure the people of our cause, our officers can rally the army against our rival, or our envoys can carry appeals into his ranks. Each undertaking demands effort from those entrusted to carry it out.",
      image: EventImage.TKYuanShaoArmyProclamation,
      condition: {
         province: new Set(["YuanShao"]),
         onMap: { CaoCao: true },
         conditions: function* (province, save): ConditionChecks {
            yield* requireWarBetweenChecks(province, "CaoCao", save);
         },
      },
      buttons: [
         {
            label: () => "Reassure our people of our cause",
            resources: { administrative: -50 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 36 },
            },
         },
         {
            label: () => "Rally our soldiers against Cao Cao",
            resources: { military: -50 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 36 },
            },
         },
         {
            label: () => "Undermine loyalty in Cao Cao's ranks",
            resources: { diplomatic: -50 },
            provinceModifiers: [
               { modifier: "WarPower", type: "multiply", value: -0.1, duration: 36, province: "CaoCao" },
            ],
         },
      ],
   },
   YuanShaoEvent9: {
      name: () => "Provisioning the Greater Army",
      desc: () =>
         "Our army holds the advantage over Cao Cao in strength, but its stores and supply roads must sustain that advantage in the field. Officers submit plans ranging from a thorough expansion of provisions and convoy protection to a modest reinforcement of existing arrangements. The treasury must bear the cost of whichever provision we authorize.",
      image: EventImage.TKArmyProvisioning,
      condition: {
         province: new Set(["YuanShao"]),
         onMap: { CaoCao: true },
         conditions: function* (province, save): ConditionChecks {
            yield* requireWarBetweenChecks(province, "CaoCao", save);
            yield* requireHigherWarPowerChecks(province, "CaoCao", save);
         },
      },
      buttons: [
         {
            label: () => "Fund a full supply and escort program",
            resources: { gold: -1000 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.25, duration: 36 },
            },
         },
         {
            label: () => "Reinforce the depots and supply convoys",
            resources: { gold: -500 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 36 },
            },
         },
         {
            label: () => "Provide a modest supply supplement",
            resources: { gold: -100 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.01, duration: 36 },
            },
         },
      ],
   },
   YuanShaoEvent10: {
      name: () => "Overcome Cao Cao",
      desc: () =>
         "Our authority now extends across the heartland from which Cao Cao challenged the Yuan house. These lands require officials to govern them, envoys to reconcile their influential families, and officers to organize their garrisons. We must enlarge our government and choose whose service will give the new settlement its foundation.",
      image: EventImage.TKDistrictIntegration,
      condition: {
         province: new Set(["YuanShao"]),
         annexAndCore: { CaoCao: Number.POSITIVE_INFINITY },
      },
      buttons: [
         {
            label: () => "Retain experienced civil officials",
            resources: { administrative: 50 },
            modifiers: { GoverningCapacity: { type: "add", value: 50 } },
         },
         {
            label: () => "Win the support of local families",
            resources: { diplomatic: 50 },
            modifiers: { GoverningCapacity: { type: "add", value: 50 } },
         },
         {
            label: () => "Establish regional military commands",
            resources: { military: 50 },
            modifiers: { GoverningCapacity: { type: "add", value: 50 } },
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
