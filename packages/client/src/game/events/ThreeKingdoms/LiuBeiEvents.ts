import { Province } from "../../definitions/Province";
import type { ConditionChecks } from "../../logic/Calculation";
import {
   isCoreTileChecks,
   minCoreTileChecks,
   provinceResourceChecks,
   victoryCountChecks,
} from "../../logic/MissionLogic";
import {
   tkCharacterAffiliationChecks,
   tkCharacterAliveChecks,
   tkCharacterNotInRosterChecks,
   tkCharacterUnaffiliatedChecks,
   transferTKCharacterEffect,
} from "../../logic/TKCharacterLogic";
import {
   requireAnyTreatyBetweenChecks,
   requireHigherPrestigeChecks,
   requireNoPatronsChecks,
   requirePeaceBetweenChecks,
   requireWarBetweenChecks,
} from "../../logic/TreatyLogic";
import { EventImage } from "../EventImages";
import type { IGameEventConfig } from "../GameEventTypes";

export const LiuBeiEvents = {
   LiuBeiEvent1: {
      name: () => "A Name Built on Benevolence",
      desc: () =>
         "Liu Bei lacks the estates and connections of the great families, yet petitioners and scholars gather at his door. Households speak of his concern for ordinary people, while Han loyalists look to his imperial ancestry. Goodwill has brought us followers; now it must sustain a government.",
      image: EventImage.TKLiuBeiBenevolentAudience,
      condition: {
         province: new Set(["LiuBei"]),
      },
      buttons: [
         {
            label: () => "Recruit scholars for our government",
            resources: { administrative: 75 },
         },
         {
            label: () => "Cultivate ties with local families",
            resources: { diplomatic: 75 },
         },
         {
            label: () => "Affirm our devotion to the Han court",
            resources: { consulPoint: 2 },
         },
      ],
   },
   LiuBeiEvent2: {
      name: () => "Companions Through Adversity",
      desc: () =>
         "Guan Yu and Zhang Fei have stood beside Liu Bei through years of hardship. After our victories, younger officers seek their instruction and garrison commanders ask for men trained in their methods. The experience of our oldest companions can now shape more than their own troops.",
      image: EventImage.TKLiuBeiCompanions,
      condition: {
         province: new Set(["LiuBei"]),
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterAffiliationChecks("GuanYu", province, save);
            yield* tkCharacterAliveChecks("GuanYu", save);
            yield* tkCharacterAffiliationChecks("ZhangFei", province, save);
            yield* tkCharacterAliveChecks("ZhangFei", save);
            yield* victoryCountChecks(3, province, save);
         },
      },
      buttons: [
         {
            label: () => "Prepare our armies for new campaigns",
            resources: { military: 100 },
            modifiers: { WarPower: { type: "multiply", value: 0.1, duration: 36 } },
         },
         {
            label: () => "Strengthen discipline in our garrisons",
            resources: { military: 100 },
            modifiers: { Defense: { type: "multiply", value: 0.1, duration: 36 } },
         },
      ],
   },
   LiuBeiEvent3: {
      name: () => "The Responsibility of Xu",
      desc: () =>
         "The commanderies once governed by Tao Qian now answer to us. Officials bring tax registers in need of revision, local families seek assurances of fair treatment, and military households await orders. Our first appointments will show the people of Xu what to expect from Liu Bei's rule.",
      image: EventImage.TKDistrictIntegration,
      condition: {
         province: new Set(["LiuBei"]),
         annexAndCore: { TaoQian: Number.POSITIVE_INFINITY },
      },
      buttons: [
         {
            label: () => "Revise the tax registers of Xu",
            resources: { administrative: 50 },
            modifiers: { LandTax: { type: "multiply", value: 0.1, duration: 36 } },
         },
         {
            label: () => "Reconcile the people of Xu to our rule",
            resources: { diplomatic: 50 },
            modifiers: { Stability: { type: "add", value: 10, duration: 36 } },
         },
         {
            label: () => "Muster the military households of Xu",
            resources: { military: 50 },
            modifiers: { Manpower: { type: "multiply", value: 0.1, duration: 36 } },
         },
      ],
   },
   LiuBeiEvent4: {
      name: () => "An Uneasy Peace with Lu Bu",
      desc: () =>
         "We are at peace with Lu Bu, but his strength and ambitions give our advisers little confidence that this understanding will endure. Some urge us to press a claim to his lands and divert revenues toward preparing our army. Others would send envoys to improve relations and reassure our people that their homes need not become another battlefield.",
      image: EventImage.TKCouncilDeliberation,
      condition: {
         province: new Set(["LiuBei"]),
         year: [196, Number.POSITIVE_INFINITY],
         onMap: { LuBu: true },
         conditions: function* (province, save): ConditionChecks {
            yield* requireNoPatronsChecks("LuBu", save);
            yield* requirePeaceBetweenChecks(province, "LuBu", save);
         },
      },
      buttons: [
         {
            label: () => "Press our claim to Lu Bu's lands",
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 36 },
               LandTax: { type: "multiply", value: -0.1, duration: 36 },
            },
            casusBelli: {
               LuBu: { casusBelli: "ConquestMission", duration: 60 },
            },
         },
         {
            label: () => "Send envoys to preserve peace with Lu Bu",
            attitudes: { LuBu: { type: "add", value: 20, duration: 36 } },
            modifiers: { Stability: { type: "add", value: 10, duration: 36 } },
         },
      ],
   },
   LiuBeiEvent5: {
      name: () => "Guan Ping Enters Our Service",
      desc: () =>
         "Guan Ping offers to continue his household's service to Liu Bei. He bears a name already honored in our camps, but must earn the trust that accompanies it. Our recent victories have opened posts for new officers, and an invitation would bring him beneath our banner.",
      image: EventImage.TKMilitaryAppointments,
      condition: {
         province: new Set(["LiuBei"]),
         year: [200, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterUnaffiliatedChecks("GuanPing", save);
            yield* tkCharacterAffiliationChecks("GuanYu", province, save);
            yield* victoryCountChecks(3, province, save);
            yield* provinceResourceChecks("diplomatic", 50, province, save);
         },
      },
      buttons: [
         {
            label: () => "Welcome Guan Ping into our service",
            resources: { diplomatic: -50 },
            custom: [transferTKCharacterEffect("GuanPing")],
         },
      ],
   },
   LiuBeiEvent6: {
      name: () => "An Old Comrade from the North",
      desc: () =>
         "Liu Bei remembers Zhao Yun's courage and loyalty from their service alongside Gongsun Zan. Our standing among the lords now gives weight to an invitation from his old companion. Our envoys could carry a personal appeal, offering Zhao Yun a place in our army and a cause worthy of his abilities.",
      image: EventImage.TKZhaoYunReunion,
      condition: {
         province: new Set(["LiuBei"]),
         year: [200, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterAliveChecks("ZhaoYun", save);
            yield* tkCharacterNotInRosterChecks("ZhaoYun", province, save);
            yield* requireHigherPrestigeChecks(province, "GongsunZan", 1, save);
            yield* provinceResourceChecks("diplomatic", 50, province, save);
         },
      },
      buttons: [
         {
            label: () => "Invite Zhao Yun to rejoin our cause",
            resources: { diplomatic: -50 },
            custom: [transferTKCharacterEffect("ZhaoYun")],
         },
      ],
   },
   LiuBeiEvent7: {
      name: () => "Three Visits to the Thatched Cottage",
      desc: () =>
         "With Xiangyang under our authority, reports reach us of a scholar living quietly at Longzhong. Zhuge Liang is said to have studied the affairs of the realm with unusual insight, but has accepted no appointment. Liu Bei proposes visiting his cottage rather than issuing a summons, returning as often as necessary to show that we seek his counsel in earnest.",
      image: EventImage.TKLiuBeiThreeVisits,
      condition: {
         province: new Set(["LiuBei"]),
         year: [207, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterUnaffiliatedChecks("ZhugeLiang", save);
            yield* isCoreTileChecks(14745689, province, save);
            yield* minCoreTileChecks(Province.LiuBei.tiles.length * 2, province, save);
            yield* provinceResourceChecks("diplomatic", 100, province, save);
         },
      },
      buttons: [
         {
            label: () => "Seek Zhuge Liang's counsel in person",
            resources: { diplomatic: -100 },
            custom: [transferTKCharacterEffect("ZhugeLiang")],
         },
      ],
   },
   LiuBeiEvent8: {
      name: () => "The People Beneath Our Banner",
      desc: () =>
         "Carts, children, and exhausted families crowd the roads behind our army as the war with Cao Cao drives people from their homes. They trust Liu Bei to protect them. The treasury can provide food and shelter, or equip stronger escorts and supply columns to keep the refugees moving with the troops.",
      image: EventImage.TKLiuBeiRefugeeColumn,
      condition: {
         province: new Set(["LiuBei"]),
         year: [208, Number.POSITIVE_INFINITY],
         onMap: { CaoCao: true },
         conditions: function* (province, save): ConditionChecks {
            yield* requireWarBetweenChecks(province, "CaoCao", save);
            yield* provinceResourceChecks("gold", 500, province, save);
         },
      },
      buttons: [
         {
            label: () => "Feed and shelter the displaced families",
            resources: { gold: -500 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 36 },
               Prestige: { type: "multiply", value: 0.1, duration: 36 },
            },
         },
         {
            label: () => "Provision and escort the refugee columns",
            resources: { gold: -500 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 36 },
               Defense: { type: "multiply", value: 0.1, duration: 36 },
            },
         },
      ],
   },
   LiuBeiEvent9: {
      name: () => "Common Cause with the Sun House",
      desc: () =>
         "Our agreement with the Sun house has opened the way for envoys, dispatches, and military plans to pass between our courts. Cao Cao remains the immediate danger, but a treaty alone cannot coordinate two governments. Officials seek closer consultation; commanders ask for joint preparations in the field.",
      image: EventImage.TKAllianceGathering,
      condition: {
         province: new Set(["LiuBei"]),
         year: [208, Number.POSITIVE_INFINITY],
         onMap: { SunCe: true, CaoCao: true },
         conditions: function* (province, save): ConditionChecks {
            yield* requireWarBetweenChecks(province, "CaoCao", save);
            yield* requirePeaceBetweenChecks(province, "SunCe", save);
            yield* requireAnyTreatyBetweenChecks(["DefensePact", "Alliance"], province, "SunCe", save);
         },
      },
      buttons: [
         {
            label: () => "Strengthen ties between our courts",
            resources: { administrative: 50, diplomatic: 50 },
            attitudes: { SunCe: { type: "add", value: 20, duration: 36 } },
         },
         {
            label: () => "Coordinate our armies against Cao Cao",
            resources: { military: 50 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 36 },
            },
         },
      ],
   },
   LiuBeiEvent10: {
      name: () => "A Foothold in Jingzhou",
      desc: () =>
         "Petitions and tax accounts arrive from our new districts in Jingzhou. Roads through these lands lead north to the plains, south to the rivers, and west toward Yi. Our officials must decide whether to build an administration for further expansion or strengthen the civil offices and embassies already serving this foothold.",
      image: EventImage.TKRegionalAdministration,
      condition: {
         province: new Set(["LiuBei"]),
         annexAndCore: { LiuBiao: 10 },
         conditions: function* (province, save): ConditionChecks {
            yield* provinceResourceChecks("administrative", 100, province, save);
         },
      },
      buttons: [
         {
            label: () => "Extend our administration in Jingzhou",
            resources: { administrative: -100 },
            modifiers: { GoverningCapacity: { type: "add", value: 20 } },
         },
         {
            label: () => "Strengthen civil offices and embassies",
            resources: { administrative: -100 },
            modifiers: {
               AdministrativePoint: { type: "add", value: 1, duration: 60 },
               DiplomaticPoint: { type: "add", value: 1, duration: 60 },
            },
         },
      ],
   },
   LiuBeiEvent11: {
      name: () => "Wei Yan Offers His Sword",
      desc: () =>
         "Our advance into Jingzhou has brought Wei Yan to the attention of our officers. He is a bold soldier, confident in his judgment and eager for greater responsibility. Such ambition requires a capable lord to direct it. We may offer him an appointment and put his courage to use in the campaigns ahead.",
      image: EventImage.TKMilitaryAppointments,
      condition: {
         province: new Set(["LiuBei"]),
         year: [209, Number.POSITIVE_INFINITY],
         annexAndCore: { LiuBiao: 5 },
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterUnaffiliatedChecks("WeiYan", save);
            yield* minCoreTileChecks(Province.LiuBei.tiles.length * 3, province, save);
            yield* provinceResourceChecks("diplomatic", 50, province, save);
         },
      },
      buttons: [
         {
            label: () => "Give Wei Yan a place among our officers",
            resources: { diplomatic: -50 },
            custom: [transferTKCharacterEffect("WeiYan")],
         },
      ],
   },
   LiuBeiEvent12: {
      name: () => "The Talents of the Ma Brothers",
      desc: () =>
         "The learned families of Jingzhou speak well of the Ma brothers. Ma Liang is praised for sound judgment, while Ma Su eagerly debates military strategy. Neither has accepted an appointment. An invitation from our court could bring both talents into Liu Bei's service.",
      image: EventImage.TKScholarlyPatronage,
      condition: {
         province: new Set(["LiuBei"]),
         year: [211, Number.POSITIVE_INFINITY],
         annexAndCore: { LiuBiao: 5 },
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterUnaffiliatedChecks("MaLiang", save);
            yield* tkCharacterUnaffiliatedChecks("MaSu", save);
            yield* provinceResourceChecks("diplomatic", 100, province, save);
         },
      },
      buttons: [
         {
            label: () => "Invite the Ma brothers to serve at court",
            resources: { diplomatic: -100 },
            custom: [transferTKCharacterEffect("MaLiang"), transferTKCharacterEffect("MaSu")],
         },
      ],
   },
   LiuBeiEvent13: {
      name: () => "Counsel for the Western Campaign",
      desc: () =>
         "With Jingzhou supporting our advance, the first districts of Yi now receive our officials. Further progress will require more than soldiers. Pang Tong has an eye for opportunities others overlook, while Fa Zheng knows the rivalries of the western families; both remain available to receive our invitations.",
      image: EventImage.TKWesternCampaignCounsel,
      condition: {
         province: new Set(["LiuBei"]),
         year: [211, Number.POSITIVE_INFINITY],
         annexAndCore: { LiuBiao: Math.ceil(Province.LiuBiao.tiles.length / 2), LiuZhang: 1 },
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterUnaffiliatedChecks("PangTong", save);
            yield* tkCharacterUnaffiliatedChecks("FaZheng", save);
            yield* provinceResourceChecks("diplomatic", 100, province, save);
         },
      },
      buttons: [
         {
            label: () => "Seek counsel from Pang Tong and Fa Zheng",
            resources: { diplomatic: -100 },
            custom: [transferTKCharacterEffect("PangTong"), transferTKCharacterEffect("FaZheng")],
         },
      ],
   },
   LiuBeiEvent14: {
      name: () => "The Settlement of Chengdu",
      desc: () =>
         "Chengdu's registers and Liu Zhang's former commanderies are ours to administer. The basin's established families watch the followers who arrived with our armies, each expecting a place in the new order. A lasting settlement must make room for both service earned on campaign and influence rooted in the land.",
      image: EventImage.TKRegionalAssembly,
      condition: {
         province: new Set(["LiuBei"]),
         annexAndCore: { LiuZhang: Number.POSITIVE_INFINITY },
      },
      buttons: [
         {
            label: () => "Retain experienced civil officials",
            resources: { administrative: 50 },
            modifiers: { GoverningCapacity: { type: "add", value: 50 } },
         },
         {
            label: () => "Win the support of the western families",
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
   LiuBeiEvent15: {
      name: () => "New Appointments at Chengdu",
      desc: () =>
         "Disputes over appointments and accounts fill the offices at Chengdu. Jiang Wan's measured judgment and Fei Yi's tact recommend them for work that requires patience as much as authority. Both men could give the western administration a steadier hand.",
      image: EventImage.TKCivilAdministration,
      condition: {
         province: new Set(["LiuBei"]),
         year: [214, Number.POSITIVE_INFINITY],
         annexAndCore: { LiuZhang: Number.POSITIVE_INFINITY },
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterUnaffiliatedChecks("JiangWan", save);
            yield* tkCharacterUnaffiliatedChecks("FeiYi", save);
            yield* provinceResourceChecks("diplomatic", 100, province, save);
         },
      },
      buttons: [
         {
            label: () => "Appoint Jiang Wan and Fei Yi to office",
            resources: { diplomatic: -100 },
            custom: [transferTKCharacterEffect("JiangWan"), transferTKCharacterEffect("FeiYi")],
         },
      ],
   },
   LiuBeiEvent16: {
      name: () => "The Northern Gateway",
      desc: () =>
         "Hanzhong's passes now guard our western heartland. Beyond them lie the roads north, inviting another campaign, while the mountain defenses offer shelter for the basin behind us. Officers survey the routes and count the households that could supply the next muster.",
      image: EventImage.TKMountainPassPreparation,
      condition: {
         province: new Set(["LiuBei"]),
         annexAndCore: { LiuZhang: Number.POSITIVE_INFINITY, ZhangLu: Number.POSITIVE_INFINITY },
      },
      buttons: [
         {
            label: () => "Prepare Hanzhong for a northern campaign",
            modifiers: { WarPower: { type: "multiply", value: 0.15, duration: 36 } },
         },
         {
            label: () => "Fortify the passes into our heartland",
            modifiers: { Defense: { type: "multiply", value: 0.15, duration: 36 } },
         },
         {
            label: () => "Organize Hanzhong's military households",
            modifiers: { Manpower: { type: "multiply", value: 0.15, duration: 36 } },
         },
      ],
   },
   LiuBeiEvent17: {
      name: () => "The Road Toward Han Restoration",
      desc: () =>
         "The western basin and Hanzhong give substance to our promise of restoring Han authority. Cao Cao's lands remain beyond our rule, and officers urge preparations for a northern campaign. Civil officials ask for time to restore the fields and treasury before peace gives way to another war.",
      image: EventImage.TKMountainPassPreparation,
      condition: {
         province: new Set(["LiuBei"]),
         year: [219, Number.POSITIVE_INFINITY],
         onMap: { CaoCao: true },
         annexAndCore: { LiuZhang: Number.POSITIVE_INFINITY, ZhangLu: Number.POSITIVE_INFINITY },
         conditions: function* (province, save): ConditionChecks {
            yield* requireNoPatronsChecks("CaoCao", save);
            yield* requirePeaceBetweenChecks(province, "CaoCao", save);
         },
      },
      buttons: [
         {
            label: () => "Press our claim to Cao Cao's lands",
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
               WarPower: { type: "multiply", value: -0.1, duration: 36 },
               LandTax: { type: "multiply", value: 0.1, duration: 36 },
               TileOutput: { type: "multiply", value: 0.1, duration: 36 },
            },
         },
      ],
   },
   LiuBeiEvent18: {
      name: () => "The Next Generation of Commanders",
      desc: () =>
         "Guan Xing and Zhang Bao offer their swords to Liu Bei. Their fathers' names command respect in every camp, but inheritance alone will not win the confidence of soldiers. Our growing domain has room for new commanders, and the two young men ask for a chance to prove themselves.",
      image: EventImage.TKMilitaryAppointments,
      condition: {
         province: new Set(["LiuBei"]),
         year: [221, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterUnaffiliatedChecks("GuanXing", save);
            yield* tkCharacterUnaffiliatedChecks("ZhangBao", save);
            yield* tkCharacterAffiliationChecks("GuanYu", province, save);
            yield* tkCharacterAffiliationChecks("ZhangFei", province, save);
            yield* minCoreTileChecks(Province.LiuBei.tiles.length * 4, province, save);
            yield* provinceResourceChecks("diplomatic", 100, province, save);
         },
      },
      buttons: [
         {
            label: () => "Commission Guan Xing and Zhang Bao",
            resources: { diplomatic: -100 },
            custom: [transferTKCharacterEffect("GuanXing"), transferTKCharacterEffect("ZhangBao")],
         },
      ],
   },
   LiuBeiEvent19: {
      name: () => "A Principled Voice at Court",
      desc: () =>
         "Not every petitioner at Chengdu brings welcome advice. Dong Yun's reputation rests on speaking plainly and attending closely to his duties, even when silence would be easier. Giving him a place at court would bring an independent voice into our deliberations.",
      image: EventImage.TKCivilAdministration,
      condition: {
         province: new Set(["LiuBei"]),
         year: [221, Number.POSITIVE_INFINITY],
         annexAndCore: { LiuZhang: Number.POSITIVE_INFINITY },
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterUnaffiliatedChecks("DongYun", save);
            yield* provinceResourceChecks("diplomatic", 50, province, save);
         },
      },
      buttons: [
         {
            label: () => "Give Dong Yun a voice in our government",
            resources: { diplomatic: -50 },
            custom: [transferTKCharacterEffect("DongYun")],
         },
      ],
   },
   LiuBeiEvent20: {
      name: () => "Zhuge Liang Recognizes Jiang Wei",
      desc: () =>
         "From Hanzhong, Zhuge Liang studies the roads and commanderies through which a northern campaign would pass. Reports of Jiang Wei's learning and grasp of military affairs have drawn his interest. He urges us to offer the officer an appointment, judging that such talent would be of greater service beneath our banner than beyond our borders.",
      image: EventImage.TKJiangWeiInvitation,
      condition: {
         province: new Set(["LiuBei"]),
         year: [228, Number.POSITIVE_INFINITY],
         annexAndCore: { ZhangLu: Number.POSITIVE_INFINITY },
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterUnaffiliatedChecks("JiangWei", save);
            yield* tkCharacterAffiliationChecks("ZhugeLiang", province, save);
            yield* tkCharacterAliveChecks("ZhugeLiang", save);
            yield* minCoreTileChecks(Province.LiuBei.tiles.length * 5, province, save);
            yield* provinceResourceChecks("diplomatic", 50, province, save);
         },
      },
      buttons: [
         {
            label: () => "Offer Jiang Wei a place in our army",
            resources: { diplomatic: -50 },
            custom: [transferTKCharacterEffect("JiangWei")],
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
