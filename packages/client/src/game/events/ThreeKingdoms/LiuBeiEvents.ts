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
         "Liu Bei has neither the estates nor the old connections of the great families, but his concern for the people has drawn followers to our banner. Scholars offer their service, local households speak well of us, and loyalists look to our lord's descent from the Han imperial house. We may draw upon this goodwill to staff our government, extend our connections, or affirm our devotion to the court.",
      image: EventImage.TKLiuBeiBenevolentAudience,
      condition: {
         province: new Set(["LiuBei"]),
      },
      buttons: [
         {
            label: () => "Gather able scholars",
            resources: { administrative: 75 },
         },
         {
            label: () => "Seek local support",
            resources: { diplomatic: 75 },
         },
         {
            label: () => "Honor the Han",
            resources: { consulPoint: 2 },
         },
      ],
   },
   LiuBeiEvent2: {
      name: () => "Companions Through Adversity",
      desc: () =>
         "Guan Yu and Zhang Fei have shared Liu Bei's hardships from the earliest days of our cause. Our victories have won their methods respect among the officers, giving us an opportunity to put that experience to wider use. They may prepare the field army for further campaigns, or bring greater discipline to the garrisons that guard our domain.",
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
            label: () => "Ready the field army",
            resources: { military: 100 },
            modifiers: { WarPower: { type: "multiply", value: 0.1, duration: 36 } },
         },
         {
            label: () => "Drill our garrisons",
            resources: { military: 100 },
            modifiers: { Defense: { type: "multiply", value: 0.1, duration: 36 } },
         },
      ],
   },
   LiuBeiEvent3: {
      name: () => "The Responsibility of Xu",
      desc: () =>
         "The commanderies once governed by Tao Qian now answer to us. Their officials bring tax registers in need of revision, local families seek assurances of fair treatment, and military households await orders. We must decide whether to secure the revenues of Xu, reconcile its people, or organize the recruits who will defend it.",
      image: EventImage.TKDistrictIntegration,
      condition: {
         province: new Set(["LiuBei"]),
         annexAndCore: { TaoQian: Number.POSITIVE_INFINITY },
      },
      buttons: [
         {
            label: () => "Revise the tax rolls",
            resources: { administrative: 50 },
            modifiers: { LandTax: { type: "multiply", value: 0.1, duration: 36 } },
         },
         {
            label: () => "Win local support",
            resources: { diplomatic: 50 },
            modifiers: { Stability: { type: "add", value: 10, duration: 36 } },
         },
         {
            label: () => "Muster our recruits",
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
            label: () => "Press our claim",
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 36 },
               LandTax: { type: "multiply", value: -0.1, duration: 36 },
            },
            casusBelli: {
               LuBu: { casusBelli: "ConquestMission", duration: 60 },
            },
         },
         {
            label: () => "Seek an accord",
            attitudes: { LuBu: { type: "add", value: 20, duration: 36 } },
            modifiers: { Stability: { type: "add", value: 10, duration: 36 } },
         },
      ],
   },
   LiuBeiEvent5: {
      name: () => "Guan Ping Enters Our Service",
      desc: () =>
         "Guan Yu's household has long been bound to our cause, and Guan Ping offers to continue that service. He brings a soldier's resolve and a name whose obligations he understands. Our victories have opened a place for officers willing to shoulder new responsibilities; we may send for him and welcome him beneath our banner.",
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
            label: () => "Welcome Guan Ping",
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
            label: () => "Welcome Zhao Yun",
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
            label: () => "Visit him in person",
            resources: { diplomatic: -100 },
            custom: [transferTKCharacterEffect("ZhugeLiang")],
         },
      ],
   },
   LiuBeiEvent8: {
      name: () => "The People Beneath Our Banner",
      desc: () =>
         "Families displaced by the struggle with Cao Cao gather beneath our banners, trusting that Liu Bei will not abandon them. Feeding and sheltering them would reassure our people and uphold our good name. Our officers instead propose stronger escorts and better provisions for the marching columns, protecting the families without leaving the army unready to fight. Either undertaking will require money from the treasury.",
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
            label: () => "Shelter the people",
            resources: { gold: -500 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 36 },
               Prestige: { type: "multiply", value: 0.1, duration: 36 },
            },
         },
         {
            label: () => "Guard our columns",
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
         "Our agreement with the Sun house gives us support in the struggle against Cao Cao, but officials and commanders must put it to practical use. Closer dealings between our courts could improve the work of our officials and envoys while strengthening mutual trust. Our officers would instead use the partnership to improve military preparations and the fighting strength of our armies.",
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
            label: () => "Strengthen our ties",
            resources: { administrative: 50, diplomatic: 50 },
            attitudes: { SunCe: { type: "add", value: 20, duration: 36 } },
         },
         {
            label: () => "Ready our armies",
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
         "Our officials now govern a substantial foothold in the lands once held by Liu Biao. Petitions and accounts arrive from districts along the roads between the northern plains, the southern rivers, and the west. A considerable administrative effort could extend the lasting reach of our government, or improve the work of the civil and diplomatic offices serving these lands.",
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
            label: () => "Extend our rule",
            resources: { administrative: -100 },
            modifiers: { GoverningCapacity: { type: "add", value: 20 } },
         },
         {
            label: () => "Empower our offices",
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
            label: () => "Welcome Wei Yan",
            resources: { diplomatic: -50 },
            custom: [transferTKCharacterEffect("WeiYan")],
         },
      ],
   },
   LiuBeiEvent12: {
      name: () => "The Talents of the Ma Brothers",
      desc: () =>
         "Among the learned families of Jingzhou, the Ma brothers enjoy a growing reputation. Ma Liang is praised for his sound judgment, while Ma Su speaks readily on questions of military strategy. Both remain without appointments. Our envoys can invite them to court, where their learning may serve the government and the deliberations of our council.",
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
            label: () => "Welcome the brothers",
            resources: { diplomatic: -100 },
            custom: [transferTKCharacterEffect("MaLiang"), transferTKCharacterEffect("MaSu")],
         },
      ],
   },
   LiuBeiEvent13: {
      name: () => "Counsel for the Western Campaign",
      desc: () =>
         "Our position in Jingzhou is secure enough to support an advance into Yi, where the first districts now acknowledge our authority. Pang Tong offers a keen eye for opportunities that others overlook, while Fa Zheng knows the interests and rivalries of the western commanderies. We may send invitations to both men and seek the counsel needed to carry this undertaking forward.",
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
            label: () => "Seek their counsel",
            resources: { diplomatic: -100 },
            custom: [transferTKCharacterEffect("PangTong"), transferTKCharacterEffect("FaZheng")],
         },
      ],
   },
   LiuBeiEvent14: {
      name: () => "The Settlement of Chengdu",
      desc: () =>
         "Chengdu and the lands once governed by Liu Zhang now answer to us. The western basin offers fertile estates and experienced officials, but its established families must be reconciled with the followers who accompanied our armies. We must enlarge our government, choosing whether civil officials, cooperative local families, or regional commanders will give the settlement its foundation.",
      image: EventImage.TKRegionalAssembly,
      condition: {
         province: new Set(["LiuBei"]),
         annexAndCore: { LiuZhang: Number.POSITIVE_INFINITY },
      },
      buttons: [
         {
            label: () => "Retain our officials",
            resources: { administrative: 50 },
            modifiers: { GoverningCapacity: { type: "add", value: 50 } },
         },
         {
            label: () => "Win over the gentry",
            resources: { diplomatic: 50 },
            modifiers: { GoverningCapacity: { type: "add", value: 50 } },
         },
         {
            label: () => "Establish commands",
            resources: { military: 50 },
            modifiers: { GoverningCapacity: { type: "add", value: 50 } },
         },
      ],
   },
   LiuBeiEvent15: {
      name: () => "Officials for the Chengdu Administration",
      desc: () =>
         "Governing the western commanderies calls for men who can settle disputes and attend patiently to the business of office. Jiang Wan's measured judgment and Fei Yi's tact recommend them for such service. We can invite both men to Chengdu and give the new administration officials capable of earning trust as well as carrying out our orders.",
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
            label: () => "Employ their talents",
            resources: { diplomatic: -100 },
            custom: [transferTKCharacterEffect("JiangWan"), transferTKCharacterEffect("FeiYi")],
         },
      ],
   },
   LiuBeiEvent16: {
      name: () => "The Northern Gateway",
      desc: () =>
         "Hanzhong now guards the northern approaches to our western heartland. Its roads can carry armies toward the north, while its passes offer strong positions from which to defend the basin. We may prepare a force for campaigning, strengthen the mountain defenses, or organize the military households that will replenish our ranks.",
      image: EventImage.TKMountainPassPreparation,
      condition: {
         province: new Set(["LiuBei"]),
         annexAndCore: { LiuZhang: Number.POSITIVE_INFINITY, ZhangLu: Number.POSITIVE_INFINITY },
      },
      buttons: [
         {
            label: () => "Ready an offensive",
            modifiers: { WarPower: { type: "multiply", value: 0.15, duration: 36 } },
         },
         {
            label: () => "Fortify the passes",
            modifiers: { Defense: { type: "multiply", value: 0.15, duration: 36 } },
         },
         {
            label: () => "Muster fresh troops",
            modifiers: { Manpower: { type: "multiply", value: 0.15, duration: 36 } },
         },
      ],
   },
   LiuBeiEvent17: {
      name: () => "The Road Toward Han Restoration",
      desc: () =>
         "Possession of the western basin and Hanzhong gives weight to our promise of restoring Han authority. Though we are at peace with Cao Cao, his domain remains beyond our control. Some advisers urge us to press our claim and divert revenues toward a northern campaign. Others would restrain military preparations while restoring the fields and tax revenues that must sustain it.",
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
            label: () => "Press our claim",
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 36 },
               LandTax: { type: "multiply", value: -0.1, duration: 36 },
            },
            casusBelli: {
               CaoCao: { casusBelli: "ConquestMission", duration: 60 },
            },
         },
         {
            label: () => "Rebuild our lands",
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
         "The names of Guan Yu and Zhang Fei carry weight throughout our armies, but their sons must earn reputations of their own. Guan Xing and Zhang Bao offer to continue their households' service beneath our banner. Our domain now calls for more officers than the old companions alone could provide; we may welcome both sons into its service.",
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
            label: () => "Welcome their sons",
            resources: { diplomatic: -100 },
            custom: [transferTKCharacterEffect("GuanXing"), transferTKCharacterEffect("ZhangBao")],
         },
      ],
   },
   LiuBeiEvent19: {
      name: () => "A Principled Voice at Court",
      desc: () =>
         "A settled court needs advisers who will speak honestly, not merely repeat what pleases those above them. Dong Yun is known for his integrity and careful attention to duty. We may invite him into our service, giving a principled official a place in the government now established over the western commanderies.",
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
            label: () => "Welcome Dong Yun",
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
            label: () => "Welcome Jiang Wei",
            resources: { diplomatic: -50 },
            custom: [transferTKCharacterEffect("JiangWei")],
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
