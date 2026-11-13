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
         "The Black Mountain strongholds now receive our orders. Their communities know the passes better than any official sent from the plains, and their cooperation will matter long after our armies leave. The Yuan seal must become more than a sign of conquest in these hills.",
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
         "Hebei's great families arrive with lists of clients suited to embassies and military appointments. Their experience would serve us well, but their patrons expect influence in return. Our officials must decide whether to accommodate these networks or build a wider administration answerable directly to Yuan Shao.",
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
         "Our officials now hold the registers of the lands that sustained Yuan Shu's rival court. His former clients seek assurances, while our followers call for a proclamation celebrating the ascendancy of our branch of the family. One Yuan banner flies over the settlement, but its meaning remains ours to define.",
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
         "Gongsun Zan's former commanderies now acknowledge the Yuan seal. Tax officials bring their registers, local notables offer help restoring production, and military households await new commanders. The northern rivalry has left us lands to govern as well as victories to celebrate.",
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
      name: () => "The Council Before the Campaign",
      desc: () =>
         "Cao Cao remains beyond our authority. In council, officers argue that Hebei's strength should be turned against him, while officials urge patience until the fields and treasury can bear another campaign. Pressing our claim would give the army its purpose, but divert revenues from the work at home.",
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
         "Draft proclamations against Cao Cao pass between the council's writers. Some speak to households fearful of the war, others to soldiers awaiting battle, and still others to men whose loyalty to Cao Cao might be shaken. The words we choose will determine where our appeal is heard.",
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
         "Our army is stronger than Cao Cao's, but every additional soldier must be fed. Reports of thinly guarded convoys and crowded depots reach the council. Officers request silver for stores and escorts; the treasurer asks how much of our advantage we are prepared to pay to preserve.",
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
            label: () => "Fully provision and guard the convoys",
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
            label: () => "Send a modest supplement of supplies",
            resources: { gold: -100 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.01, duration: 36 },
            },
         },
      ],
   },
   YuanShaoEvent10: {
      name: () => "The Settlement of Cao Cao's Lands",
      desc: () =>
         "The heartland from which Cao Cao challenged the Yuan house now answers to us. Its officials await confirmation in office, its families seek a place in our councils, and its garrisons require new orders. Hebei can no longer be the sole foundation of a government reaching across the central plains.",
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
