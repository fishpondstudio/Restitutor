import type { ConditionChecks } from "../../logic/Calculation";
import { provinceResourceChecks, victoryCountChecks } from "../../logic/MissionLogic";
import {
   tkCharacterAffiliationChecks,
   tkCharacterAliveChecks,
   transferTKCharacterEffect,
} from "../../logic/TKCharacterLogic";
import { requireNoPatronsChecks, requirePeaceBetweenChecks, requireWarBetweenChecks } from "../../logic/TreatyLogic";
import { EventImage } from "../EventImages";
import type { IGameEventConfig } from "../GameEventTypes";

export const LuBuEvents = {
   LuBuEvent1: {
      name: () => "The Strength Behind the Legend",
      desc: () =>
         "Veterans and ambitious young officers gather at Lu Bu's camp, drawn by the name of the realm's most feared warrior. Some seek a place in the next campaign; others hope to learn his methods or earn a staff appointment. Reputation has brought them here. We must turn it into strength.",
      image: EventImage.TKLuBuVeteranMuster,
      condition: {
         province: new Set(["LuBu"]),
      },
      buttons: [
         {
            label: () => "Muster the veterans",
            resources: { military: 100 },
         },
         {
            label: () => "Establish an officer corps",
            modifiers: {
               MilitaryPoint: { type: "add", value: 1, duration: 120 },
            },
         },
         {
            label: () => "Train the army in Lu Bu's methods",
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 120 },
            },
         },
      ],
   },
   LuBuEvent2: {
      name: () => "Chen Gong's Counsel",
      desc: () =>
         "Chen Gong brings petitions and unfinished registers before the council. Victories, he warns, will mean little if our officials cannot govern the lands we take. He asks for an administrative effort worthy of our ambitions, whether to extend our government's reach or strengthen the offices already serving it.",
      image: EventImage.TKCivilAdministration,
      condition: {
         province: new Set(["LuBu"]),
         year: [195, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterAffiliationChecks("ChenGong", province, save);
            yield* tkCharacterAliveChecks("ChenGong", save);
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
            label: () => "Strengthen every branch of government",
            resources: { administrative: -100 },
            modifiers: {
               AdministrativePoint: { type: "add", value: 1, duration: 40 },
               DiplomaticPoint: { type: "add", value: 1, duration: 40 },
               MilitaryPoint: { type: "add", value: 1, duration: 40 },
            },
         },
      ],
   },
   LuBuEvent3: {
      name: () => "Gao Shun's Formation Breakers",
      desc: () =>
         "Gao Shun's disciplined troops have earned their reputation for breaking enemy formations. Other commanders now ask for the equipment, training, and officers that make his men so dependable. The treasury can fund an elite assault force or spread his example more widely through the army.",
      image: EventImage.TKGaoShunFormationBreakers,
      condition: {
         province: new Set(["LuBu"]),
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterAffiliationChecks("GaoShun", province, save);
            yield* tkCharacterAliveChecks("GaoShun", save);
            yield* victoryCountChecks(3, province, save);
            yield* provinceResourceChecks("gold", 1000, province, save);
         },
      },
      buttons: [
         {
            label: () => "Equip an elite assault force",
            resources: { gold: -1000 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.2, duration: 36 },
            },
         },
         {
            label: () => "Train field troops and garrisons",
            resources: { gold: -1000 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 36 },
               Defense: { type: "multiply", value: 0.1, duration: 36 },
            },
         },
         {
            label: () => "Recruit experienced officers",
            resources: { gold: -1000, military: 100 },
         },
      ],
   },
   LuBuEvent4: {
      name: () => "The Contest for Yan",
      desc: () =>
         "Peace with Cao Cao has not settled the question of who will command the central plains. Our officers urge a claim to his lands, while the tax officials count the cost of another campaign. Silver sent to the camps cannot also restore the fields and workshops that sustain them.",
      image: EventImage.TKCouncilDeliberation,
      condition: {
         province: new Set(["LuBu"]),
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
            label: () => "Restore the fields and treasury",
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 36 },
               TileOutput: { type: "multiply", value: 0.1, duration: 36 },
               WarPower: { type: "multiply", value: -0.1, duration: 36 },
            },
         },
      ],
   },
   LuBuEvent5: {
      name: () => "Chen Deng and the Settlement of Xu",
      desc: () =>
         "Tao Qian's former commanderies now receive our orders, but their registers and local loyalties are less easily mastered. Chen Deng knows the officials, landed families, and military households of Xu. Employing him would give our new government an experienced hand in the settlement.",
      image: EventImage.TKDistrictIntegration,
      condition: {
         province: new Set(["LuBu"]),
         annexAndCore: { TaoQian: Number.POSITIVE_INFINITY },
         conditions: function* (_province, save): ConditionChecks {
            yield* tkCharacterAliveChecks("ChenDeng", save);
         },
      },
      buttons: [
         {
            label: () => "Have Chen Deng reform the tax offices",
            resources: { administrative: 75 },
            modifiers: { LandTax: { type: "multiply", value: 0.1, duration: 36 } },
            custom: [transferTKCharacterEffect("ChenDeng")],
         },
         {
            label: () => "Have Chen Deng reconcile the families",
            resources: { diplomatic: 75 },
            modifiers: { Stability: { type: "add", value: 10, duration: 36 } },
            custom: [transferTKCharacterEffect("ChenDeng")],
         },
         {
            label: () => "Have Chen Deng muster the households",
            resources: { military: 75 },
            modifiers: { Manpower: { type: "multiply", value: 0.1, duration: 36 } },
            custom: [transferTKCharacterEffect("ChenDeng")],
         },
      ],
   },
   LuBuEvent6: {
      name: () => "The Halberd at the Camp Gate",
      desc: () =>
         "Envoys from Liu Bei and Yuan Shu have gathered at our camp. Lu Bu calls for a halberd to be set beside the gate and takes up his bow before the assembled officers. A single shot could lend force to our diplomacy or give the army another tale to carry into battle.",
      image: EventImage.TKLuBuHalberdShot,
      condition: {
         province: new Set(["LuBu"]),
         year: [196, Number.POSITIVE_INFINITY],
         onMap: { LiuBei: true, YuanShu: true },
         conditions: function* (province, save): ConditionChecks {
            yield* requirePeaceBetweenChecks(province, "LiuBei", save);
            yield* requirePeaceBetweenChecks(province, "YuanShu", save);
         },
      },
      buttons: [
         {
            label: () => "Let the envoys witness his prowess",
            resources: { diplomatic: 100 },
            modifiers: { Prestige: { type: "multiply", value: 0.1, duration: 36 } },
         },
         {
            label: () => "Rally our officers and inspire the army",
            resources: { military: 100 },
            modifiers: { WarPower: { type: "multiply", value: 0.1, duration: 36 } },
         },
      ],
   },
   LuBuEvent7: {
      name: () => "The Price of Yuan Shu's Friendship",
      desc: () =>
         "Yuan Shu's treasury offers relief from the expense of maintaining our army, but his ambitions trouble the council. Our envoys could seek his silver, accepting the stain of his friendship, or distance us from his designs and carry assurances of loyalty to the Han court.",
      image: EventImage.TKDiplomaticSubsidy,
      condition: {
         province: new Set(["LuBu"]),
         year: [197, Number.POSITIVE_INFINITY],
         onMap: { YuanShu: true },
         conditions: function* (province, save): ConditionChecks {
            yield* requireNoPatronsChecks("YuanShu", save);
            yield* requirePeaceBetweenChecks(province, "YuanShu", save);
            yield* provinceResourceChecks("diplomatic", 50, province, save);
         },
      },
      buttons: [
         {
            label: () => "Negotiate a subsidy from Yuan Shu",
            resources: { diplomatic: -50, gold: 1000 },
            modifiers: { Prestige: { type: "multiply", value: -0.1, duration: 36 } },
         },
         {
            label: () => "Reject his designs and honor the Han",
            resources: { diplomatic: -50, consulPoint: 2 },
         },
      ],
   },
   LuBuEvent8: {
      name: () => "Trust Within the Camp",
      desc: () =>
         "Victory has filled our camps with old companions, new recruits, and officers who answer first to their own patrons. Zhang Liao has shown a steady hand in bringing them together. A broader field command could make use of his judgment, though the garrisons also press their claims for rewards and settled appointments.",
      image: EventImage.TKMilitaryAppointments,
      condition: {
         province: new Set(["LuBu"]),
         year: [198, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterAffiliationChecks("ZhangLiao", province, save);
            yield* tkCharacterAliveChecks("ZhangLiao", save);
            yield* victoryCountChecks(5, province, save);
         },
      },
      buttons: [
         {
            label: () => "Give Zhang Liao broader field command",
            resources: { military: 50 },
            modifiers: { WarPower: { type: "multiply", value: 0.1, duration: 36 } },
         },
         {
            label: () => "Reward the garrisons for their loyalty",
            resources: { gold: -500 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 36 },
               Defense: { type: "multiply", value: 0.1, duration: 36 },
            },
         },
      ],
   },
   LuBuEvent9: {
      name: () => "Chen Gong's Plans Against Cao Cao",
      desc: () =>
         "Chen Gong studies the roads supplying Cao Cao's army and marks where a small force could cause the greatest disruption. Other reports call for stronger walls and stocked depots. Lu Bu's commanders favor an offensive, but gathering the army for such a blow would demand a greater military effort.",
      image: EventImage.TKChenGongFieldCommand,
      condition: {
         province: new Set(["LuBu"]),
         onMap: { CaoCao: true },
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterAffiliationChecks("ChenGong", province, save);
            yield* tkCharacterAliveChecks("ChenGong", save);
            yield* requireWarBetweenChecks(province, "CaoCao", save);
         },
      },
      buttons: [
         {
            label: () => "Disrupt Cao Cao's supply roads",
            resources: { military: -50 },
            provinceModifiers: [
               { modifier: "WarPower", type: "multiply", value: -0.1, duration: 36, province: "CaoCao" },
            ],
         },
         {
            label: () => "Fund stronger defenses and supply depots",
            resources: { gold: -500 },
            modifiers: { Defense: { type: "multiply", value: 0.2, duration: 36 } },
         },
         {
            label: () => "Gather the army for a decisive blow",
            resources: { military: -100 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.2, duration: 36 },
            },
         },
      ],
   },
   LuBuEvent10: {
      name: () => "More Than a Warrior",
      desc: () =>
         "Cao Cao's heartland now answers to Lu Bu. Those who dismissed him as a warrior without a lasting foundation must reckon with his seals on the registers of the central plains. Officials, local families, and regional commanders await the appointments that will turn victory into government.",
      image: EventImage.TKDistrictIntegration,
      condition: {
         province: new Set(["LuBu"]),
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
