import type { ConditionChecks } from "../logic/Calculation";
import { provinceResourceChecks, victoryCountChecks } from "../logic/MissionLogic";
import {
   tkCharacterAffiliationChecks,
   tkCharacterAliveChecks,
   transferTKCharacterEffect,
} from "../logic/TKCharacterLogic";
import { requireNoPatronsChecks, requirePeaceBetweenChecks, requireWarBetweenChecks } from "../logic/TreatyLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const LuBuEvents = {
   LuBuEvent1: {
      name: () => "The Strength Behind the Legend",
      desc: () =>
         "Lu Bu's reputation draws experienced soldiers and ambitious officers to our banner. We may put their experience to immediate use, establish a corps of officers to guide our military affairs for years to come, or turn our lord's methods of battle into a lasting advantage for the army.",
      image: EventImage.TKLuBuVeteranMuster,
      condition: {
         province: new Set(["LuBu"]),
      },
      buttons: [
         {
            label: () => "Put the veterans' experience to immediate use",
            resources: { military: 100 },
         },
         {
            label: () => "Build a lasting corps of military officers",
            modifiers: {
               MilitaryPoint: { type: "add", value: 1, duration: 120 },
            },
         },
         {
            label: () => "Train the army in Lu Bu's methods of battle",
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 120 },
            },
         },
      ],
   },
   LuBuEvent2: {
      name: () => "Chen Gong's Counsel",
      desc: () =>
         "Chen Gong warns that victories alone cannot sustain our rule. A substantial effort from our officials could establish an administration capable of governing a larger domain. Alternatively, we could use that effort to improve the work of our civil officials, envoys, and military officers for the coming years.",
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
            label: () => "Extend the permanent reach of our administration",
            resources: { administrative: -100 },
            modifiers: { GoverningCapacity: { type: "add", value: 50 } },
         },
         {
            label: () => "Strengthen our civil, diplomatic, and military offices",
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
         "Gao Shun's victories have demonstrated the value of discipline and preparation. He proposes a substantial investment in our military establishment: equip a powerful assault force, spread his methods through the field army and garrisons, or fund the recruitment and organization of experienced officers. Each proposal demands the same commitment from our treasury.",
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
            label: () => "Fund and equip a powerful assault force",
            resources: { gold: -1000 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.2, duration: 36 },
            },
         },
         {
            label: () => "Train the field army and strengthen the garrisons",
            resources: { gold: -1000 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 36 },
               Defense: { type: "multiply", value: 0.1, duration: 36 },
            },
         },
         {
            label: () => "Fund the recruitment and organization of officers",
            resources: { gold: -1000, military: 100 },
         },
      ],
   },
   LuBuEvent4: {
      name: () => "The Contest for Yan",
      desc: () =>
         "Though we are at peace with Cao Cao, his power remains an obstacle to our ambitions in the central plains. We may press a claim to his lands and divert revenues toward military preparations. Alternatively, we could restrain those preparations while restoring production and strengthening our tax revenues.",
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
            label: () => "Press our claim and divert revenues toward war",
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 36 },
               LandTax: { type: "multiply", value: -0.1, duration: 36 },
            },
            casusBelli: {
               CaoCao: { casusBelli: "ConquestMission", duration: 60 },
            },
         },
         {
            label: () => "Restrain military preparations and rebuild the economy",
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
         "The commanderies once governed by Tao Qian now form part of our domain. Chen Deng's knowledge of their officials, influential families, and military households can help secure the settlement. With his service at our disposal, we may strengthen tax administration, win local cooperation, or organize households to supply our armies with men.",
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
            label: () => "Employ Chen Deng and reorganize the tax offices",
            resources: { administrative: 75 },
            modifiers: { LandTax: { type: "multiply", value: 0.1, duration: 36 } },
            custom: [transferTKCharacterEffect("ChenDeng")],
         },
         {
            label: () => "Employ Chen Deng and reconcile the local families",
            resources: { diplomatic: 75 },
            modifiers: { Stability: { type: "add", value: 10, duration: 36 } },
            custom: [transferTKCharacterEffect("ChenDeng")],
         },
         {
            label: () => "Employ Chen Deng and muster the military households",
            resources: { military: 75 },
            modifiers: { Manpower: { type: "multiply", value: 0.1, duration: 36 } },
            custom: [transferTKCharacterEffect("ChenDeng")],
         },
      ],
   },
   LuBuEvent6: {
      name: () => "The Halberd at the Camp Gate",
      desc: () =>
         "We are at peace with Liu Bei and Yuan Shu, and a gathering at our camp offers an opportunity to demonstrate the strength behind our words. A halberd beside the gate provides a challenging target for Lu Bu's bow. We may make the display an occasion to impress their envoys, or use it to rally our officers and sharpen the army's fighting spirit.",
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
            label: () => "Impress the envoys with our lord's prowess",
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
         "Yuan Shu's wealth makes closer dealings attractive, but his ambitions give our advisers pause. Our envoys could negotiate financial assistance at the cost of associating our name with a distrusted neighbor. Alternatively, they could affirm our independence from his designs and seek favor at the Han court. Either course requires diplomatic effort.",
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
            label: () => "Negotiate financial support from Yuan Shu",
            resources: { diplomatic: -50, gold: 1000 },
            modifiers: { Prestige: { type: "multiply", value: -0.1, duration: 36 } },
         },
         {
            label: () => "Distance ourselves from his ambitions and seek court favor",
            resources: { diplomatic: -50, consulPoint: 2 },
         },
      ],
   },
   LuBuEvent8: {
      name: () => "Trust Within the Camp",
      desc: () =>
         "Our victories have brought together old companions, recent recruits, and officers with followings of their own. Zhang Liao has shown the judgment needed to coordinate them in the field. We may broaden his command to strengthen the campaigning army, or spend from the treasury to settle grievances, regularize appointments, and secure the loyalty of our garrisons.",
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
            label: () => "Give Zhang Liao broader command of the field army",
            resources: { military: 50 },
            modifiers: { WarPower: { type: "multiply", value: 0.1, duration: 36 } },
         },
         {
            label: () => "Pay rewards and secure the loyalty of our garrisons",
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
         "Chen Gong presents three ways to strengthen our position against Cao Cao. We could direct a limited military effort against his supply roads, spend gold on stronger defenses, or devote greater effort to organizing a powerful offensive. The choice is whether to weaken the enemy, hold our ground, or improve the striking power of our own army.",
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
            label: () => "Concentrate our military effort on a powerful offensive",
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
         "Cao Cao's heartland now answers to us. Those who dismissed Lu Bu as a warrior without a lasting foundation must reckon with a government commanding the central plains. Enlarging our administration will allow us to govern a greater domain; its new foundations may rest upon experienced officials, cooperative local families, or dependable regional commanders.",
      image: EventImage.TKDistrictIntegration,
      condition: {
         province: new Set(["LuBu"]),
         annexAndCore: { CaoCao: Number.POSITIVE_INFINITY },
      },
      buttons: [
         {
            label: () => "Expand our government through experienced officials",
            resources: { administrative: 50 },
            modifiers: { GoverningCapacity: { type: "add", value: 50 } },
         },
         {
            label: () => "Expand our government with the support of local families",
            resources: { diplomatic: 50 },
            modifiers: { GoverningCapacity: { type: "add", value: 50 } },
         },
         {
            label: () => "Expand our government through regional commands",
            resources: { military: 50 },
            modifiers: { GoverningCapacity: { type: "add", value: 50 } },
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
