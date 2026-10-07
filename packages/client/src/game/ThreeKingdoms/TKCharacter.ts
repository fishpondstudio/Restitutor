import { randInt, type ValueOf } from "@project/shared/src/utils/Helper";
import CaoCao from "../../assets/images/characters/CaoCao.webp";
import ChenGong from "../../assets/images/characters/ChenGong.webp";
import ChengYu from "../../assets/images/characters/ChengYu.webp";
import DianWei from "../../assets/images/characters/DianWei.webp";
import FaZheng from "../../assets/images/characters/FaZheng.webp";
import GanNing from "../../assets/images/characters/GanNing.webp";
import GongsunDu from "../../assets/images/characters/GongsunDu.webp";
import GongsunZan from "../../assets/images/characters/GongsunZan.webp";
import GuanYu from "../../assets/images/characters/GuanYu.webp";
import GuoJia from "../../assets/images/characters/GuoJia.webp";
import HanSui from "../../assets/images/characters/HanSui.webp";
import HuangGai from "../../assets/images/characters/HuangGai.webp";
import HuangZhong from "../../assets/images/characters/HuangZhong.webp";
import JiangWei from "../../assets/images/characters/JiangWei.webp";
import JiaXu from "../../assets/images/characters/JiaXu.webp";
import JuShou from "../../assets/images/characters/JuShou.webp";
import KongRong from "../../assets/images/characters/KongRong.webp";
import LiJue from "../../assets/images/characters/LiJue.webp";
import LiuBei from "../../assets/images/characters/LiuBei.webp";
import LiuBiao from "../../assets/images/characters/LiuBiao.webp";
import LiuYao from "../../assets/images/characters/LiuYao.webp";
import LiuZhang from "../../assets/images/characters/LiuZhang.webp";
import LuBu from "../../assets/images/characters/LuBu.webp";
import LuMeng from "../../assets/images/characters/LuMeng.webp";
import LuSu from "../../assets/images/characters/LuSu.webp";
import LuXun from "../../assets/images/characters/LuXun.webp";
import MaChao from "../../assets/images/characters/MaChao.webp";
import MaLiang from "../../assets/images/characters/MaLiang.webp";
import MaTeng from "../../assets/images/characters/MaTeng.webp";
import PangTong from "../../assets/images/characters/PangTong.webp";
import ShiXie from "../../assets/images/characters/ShiXie.webp";
import SimaYi from "../../assets/images/characters/SimaYi.webp";
import SunCe from "../../assets/images/characters/SunCe.webp";
import SunQuan from "../../assets/images/characters/SunQuan.webp";
import TaishiCi from "../../assets/images/characters/TaishiCi.webp";
import TaoQian from "../../assets/images/characters/TaoQian.webp";
import TianFeng from "../../assets/images/characters/TianFeng.webp";
import WangLang from "../../assets/images/characters/WangLang.webp";
import WeiYan from "../../assets/images/characters/WeiYan.webp";
import WenChou from "../../assets/images/characters/WenChou.webp";
import XiahouDun from "../../assets/images/characters/XiahouDun.webp";
import XiahouYuan from "../../assets/images/characters/XiahouYuan.webp";
import XuChu from "../../assets/images/characters/XuChu.webp";
import XuHuang from "../../assets/images/characters/XuHuang.webp";
import XunYou from "../../assets/images/characters/XunYou.webp";
import XunYu from "../../assets/images/characters/XunYu.webp";
import XuShu from "../../assets/images/characters/XuShu.webp";
import XuYou from "../../assets/images/characters/XuYou.webp";
import YanBaihu from "../../assets/images/characters/YanBaihu.webp";
import YanLiang from "../../assets/images/characters/YanLiang.webp";
import YuanShao from "../../assets/images/characters/YuanShao.webp";
import YuanShu from "../../assets/images/characters/YuanShu.webp";
import ZhangFei from "../../assets/images/characters/ZhangFei.webp";
import ZhangHe from "../../assets/images/characters/ZhangHe.webp";
import ZhangLiao from "../../assets/images/characters/ZhangLiao.webp";
import ZhangLu from "../../assets/images/characters/ZhangLu.webp";
import ZhangYan from "../../assets/images/characters/ZhangYan.webp";
import ZhangYang from "../../assets/images/characters/ZhangYang.webp";
import ZhangZhao from "../../assets/images/characters/ZhangZhao.webp";
import ZhaoYun from "../../assets/images/characters/ZhaoYun.webp";
import ZhouYu from "../../assets/images/characters/ZhouYu.webp";
import ZhugeLiang from "../../assets/images/characters/ZhugeLiang.webp";
import { GovernorMinIncl } from "../logic/GovernorLogic";
import type { TKWarlord } from "./TKWarlord";

export const TKCharacterFlags = {
   None: 0,
   Civil: 1 << 0,
   Martial: 1 << 1,
} as const;

export type TKCharacterFlag = ValueOf<typeof TKCharacterFlags>;

export const TKCharacterTier = {
   Tier1: () => "Tier S",
   Tier2: () => "Tier A",
   Tier3: () => "Tier B",
   Tier4: () => "Tier C",
} as const satisfies Record<string, () => string>;

export type TKCharacterTier = keyof typeof TKCharacterTier;

export function getTKCharacterTierToSkill(tier: TKCharacterTier): number {
   switch (tier) {
      case "Tier1":
         return randInt(5, 7); // 5-6
      case "Tier2":
         return randInt(4, 6); // 4-5
      case "Tier3":
         return randInt(3, 6); // 3-5
      case "Tier4":
         return randInt(3, 5); // 3-4
      default:
         tier satisfies never;
         return GovernorMinIncl;
   }
}

export interface ITKCharacter {
   name: () => string[];
   image: string;
   flags: TKCharacterFlag;
   tier: TKCharacterTier;
   warlord?: TKWarlord;
}

export const TKCharacters = {
   CaoCao: {
      name: () => ["Cao", "Cao", "Mengde"],
      image: CaoCao,
      tier: "Tier1",
      flags: TKCharacterFlags.Civil | TKCharacterFlags.Martial,
      warlord: "CaoCao",
   },
   ChenGong: {
      name: () => ["Chen", "Gong", "Gongtai"],
      image: ChenGong,
      tier: "Tier2",
      flags: TKCharacterFlags.Civil,
      warlord: "LuBu",
   },
   ChengYu: {
      name: () => ["Cheng", "Yu", "Zhongde"],
      image: ChengYu,
      tier: "Tier3",
      flags: TKCharacterFlags.Civil,
      warlord: "CaoCao",
   },
   DianWei: {
      name: () => ["Dian", "Wei"],
      image: DianWei,
      tier: "Tier2",
      flags: TKCharacterFlags.Martial,
      warlord: "CaoCao",
   },
   FaZheng: {
      name: () => ["Fa", "Zheng", "Xiaozhi"],
      image: FaZheng,
      tier: "Tier2",
      flags: TKCharacterFlags.Civil,
   },
   GanNing: {
      name: () => ["Gan", "Ning", "Xingba"],
      image: GanNing,
      tier: "Tier2",
      flags: TKCharacterFlags.Martial,
      warlord: "LiuBiao",
   },
   GongsunDu: {
      name: () => ["Gongsun", "Du", "Shengji"],
      image: GongsunDu,
      tier: "Tier4",
      flags: TKCharacterFlags.Martial,
      warlord: "GongsunDu",
   },
   GongsunZan: {
      name: () => ["Gongsun", "Zan", "Bogui"],
      image: GongsunZan,
      tier: "Tier3",
      flags: TKCharacterFlags.Martial,
      warlord: "GongsunZan",
   },
   GuanYu: {
      name: () => ["Guan", "Yu", "Yunchang"],
      image: GuanYu,
      tier: "Tier1",
      flags: TKCharacterFlags.Martial,
      warlord: "LiuBei",
   },
   GuoJia: {
      name: () => ["Guo", "Jia", "Fengxiao"],
      image: GuoJia,
      tier: "Tier1",
      flags: TKCharacterFlags.Civil,
      warlord: "CaoCao",
   },
   HanSui: {
      name: () => ["Han", "Sui", "Wenyue"],
      image: HanSui,
      tier: "Tier3",
      flags: TKCharacterFlags.Martial,
      warlord: "HanSui",
   },
   HuangGai: {
      name: () => ["Huang", "Gai", "Gongfu"],
      image: HuangGai,
      tier: "Tier3",
      flags: TKCharacterFlags.Martial,
      warlord: "SunCe",
   },
   HuangZhong: {
      name: () => ["Huang", "Zhong", "Hansheng"],
      image: HuangZhong,
      tier: "Tier2",
      flags: TKCharacterFlags.Martial,
      warlord: "LiuBiao",
   },
   JiangWei: {
      name: () => ["Jiang", "Wei", "Boyue"],
      image: JiangWei,
      tier: "Tier2",
      flags: TKCharacterFlags.Civil | TKCharacterFlags.Martial,
   },
   JiaXu: {
      name: () => ["Jia", "Xu", "Wenhe"],
      image: JiaXu,
      tier: "Tier2",
      flags: TKCharacterFlags.Civil,
      warlord: "LiJue",
   },
   JuShou: {
      name: () => ["Ju", "Shou"],
      image: JuShou,
      tier: "Tier3",
      flags: TKCharacterFlags.Civil,
      warlord: "YuanShao",
   },
   KongRong: {
      name: () => ["Kong", "Rong", "Wenju"],
      image: KongRong,
      tier: "Tier3",
      flags: TKCharacterFlags.Civil,
      warlord: "KongRong",
   },
   LiJue: {
      name: () => ["Li", "Jue", "Zhiran"],
      image: LiJue,
      tier: "Tier4",
      flags: TKCharacterFlags.Martial,
      warlord: "LiJue",
   },
   LiuBei: {
      name: () => ["Liu", "Bei", "Xuande"],
      image: LiuBei,
      tier: "Tier1",
      flags: TKCharacterFlags.Martial,
      warlord: "LiuBei",
   },
   LiuBiao: {
      name: () => ["Liu", "Biao", "Jingsheng"],
      image: LiuBiao,
      tier: "Tier3",
      flags: TKCharacterFlags.Civil,
      warlord: "LiuBiao",
   },
   LiuYao: {
      name: () => ["Liu", "Yao", "Zhengli"],
      image: LiuYao,
      tier: "Tier4",
      flags: TKCharacterFlags.Civil,
      warlord: "LiuYao",
   },
   LiuZhang: {
      name: () => ["Liu", "Zhang", "Jiyu"],
      image: LiuZhang,
      tier: "Tier4",
      flags: TKCharacterFlags.Civil,
      warlord: "LiuZhang",
   },
   LuBu: {
      name: () => ["Lu", "Bu", "Fengxian"],
      image: LuBu,
      tier: "Tier1",
      flags: TKCharacterFlags.Martial,
      warlord: "LuBu",
   },
   LuMeng: {
      name: () => ["Lu", "Meng", "Ziming"],
      image: LuMeng,
      tier: "Tier2",
      flags: TKCharacterFlags.Civil | TKCharacterFlags.Martial,
   },
   LuSu: {
      name: () => ["Lu", "Su", "Zijing"],
      image: LuSu,
      tier: "Tier3",
      flags: TKCharacterFlags.Civil | TKCharacterFlags.Martial,
   },
   LuXun: {
      name: () => ["Lu", "Xun", "Boyan"],
      image: LuXun,
      tier: "Tier2",
      flags: TKCharacterFlags.Civil | TKCharacterFlags.Martial,
   },
   MaChao: {
      name: () => ["Ma", "Chao", "Mengqi"],
      image: MaChao,
      tier: "Tier2",
      flags: TKCharacterFlags.Martial,
      warlord: "MaTeng",
   },
   MaLiang: {
      name: () => ["Ma", "Liang", "Jichang"],
      image: MaLiang,
      tier: "Tier3",
      flags: TKCharacterFlags.Civil,
   },
   MaTeng: {
      name: () => ["Ma", "Teng", "Shoucheng"],
      image: MaTeng,
      tier: "Tier3",
      flags: TKCharacterFlags.Martial,
      warlord: "MaTeng",
   },
   PangTong: {
      name: () => ["Pang", "Tong", "Shiyuan"],
      image: PangTong,
      tier: "Tier2",
      flags: TKCharacterFlags.Civil,
   },
   ShiXie: {
      name: () => ["Shi", "Xie", "Weiyan"],
      image: ShiXie,
      tier: "Tier4",
      flags: TKCharacterFlags.Civil,
      warlord: "ShiXie",
   },
   SimaYi: {
      name: () => ["Sima", "Yi", "Zhongda"],
      image: SimaYi,
      tier: "Tier1",
      flags: TKCharacterFlags.Civil | TKCharacterFlags.Martial,
   },
   SunCe: {
      name: () => ["Sun", "Ce", "Bofu"],
      image: SunCe,
      tier: "Tier2",
      flags: TKCharacterFlags.Martial,
      warlord: "SunCe",
   },
   SunQuan: {
      name: () => ["Sun", "Quan", "Zhongmou"],
      image: SunQuan,
      tier: "Tier1",
      flags: TKCharacterFlags.Civil | TKCharacterFlags.Martial,
   },
   TaishiCi: {
      name: () => ["Taishi", "Ci", "Ziyi"],
      image: TaishiCi,
      tier: "Tier2",
      flags: TKCharacterFlags.Martial,
      warlord: "LiuYao",
   },
   TaoQian: {
      name: () => ["Tao", "Qian", "Gongzu"],
      image: TaoQian,
      tier: "Tier4",
      flags: TKCharacterFlags.Civil,
      warlord: "TaoQian",
   },
   TianFeng: {
      name: () => ["Tian", "Feng", "Yuanhao"],
      image: TianFeng,
      tier: "Tier3",
      flags: TKCharacterFlags.Civil,
      warlord: "YuanShao",
   },
   WangLang: {
      name: () => ["Wang", "Lang", "Jingxing"],
      image: WangLang,
      tier: "Tier4",
      flags: TKCharacterFlags.Civil,
      warlord: "WangLang",
   },
   WeiYan: {
      name: () => ["Wei", "Yan", "Wenchang"],
      image: WeiYan,
      tier: "Tier2",
      flags: TKCharacterFlags.Martial,
   },
   WenChou: {
      name: () => ["Wen", "Chou"],
      image: WenChou,
      tier: "Tier3",
      flags: TKCharacterFlags.Martial,
      warlord: "YuanShao",
   },
   XiahouDun: {
      name: () => ["Xiahou", "Dun", "Yuanrang"],
      image: XiahouDun,
      tier: "Tier3",
      flags: TKCharacterFlags.Martial,
      warlord: "CaoCao",
   },
   XiahouYuan: {
      name: () => ["Xiahou", "Yuan", "Miaocai"],
      image: XiahouYuan,
      tier: "Tier3",
      flags: TKCharacterFlags.Martial,
      warlord: "CaoCao",
   },
   XuChu: {
      name: () => ["Xu", "Chu", "Zhongkang"],
      image: XuChu,
      tier: "Tier2",
      flags: TKCharacterFlags.Martial,
      warlord: "CaoCao",
   },
   XuHuang: {
      name: () => ["Xu", "Huang", "Gongming"],
      image: XuHuang,
      tier: "Tier2",
      flags: TKCharacterFlags.Martial,
      warlord: "LiJue",
   },
   XunYou: {
      name: () => ["Xun", "You", "Gongda"],
      image: XunYou,
      tier: "Tier2",
      flags: TKCharacterFlags.Civil,
      warlord: "CaoCao",
   },
   XunYu: {
      name: () => ["Xun", "Yu", "Wenruo"],
      image: XunYu,
      tier: "Tier2",
      flags: TKCharacterFlags.Civil,
      warlord: "CaoCao",
   },
   XuShu: {
      name: () => ["Xu", "Shu", "Yuanzhi"],
      image: XuShu,
      tier: "Tier2",
      flags: TKCharacterFlags.Civil,
   },
   XuYou: {
      name: () => ["Xu", "You", "Ziyuan"],
      image: XuYou,
      tier: "Tier3",
      flags: TKCharacterFlags.Civil,
      warlord: "YuanShao",
   },
   YanBaihu: {
      name: () => ["Yan", "Baihu"],
      image: YanBaihu,
      tier: "Tier4",
      flags: TKCharacterFlags.Martial,
      warlord: "YanBaihu",
   },
   YanLiang: {
      name: () => ["Yan", "Liang"],
      image: YanLiang,
      tier: "Tier3",
      flags: TKCharacterFlags.Martial,
      warlord: "YuanShao",
   },
   YuanShao: {
      name: () => ["Yuan", "Shao", "Benchu"],
      image: YuanShao,
      tier: "Tier3",
      flags: TKCharacterFlags.Martial,
      warlord: "YuanShao",
   },
   YuanShu: {
      name: () => ["Yuan", "Shu", "Gonglu"],
      image: YuanShu,
      tier: "Tier4",
      flags: TKCharacterFlags.Civil,
      warlord: "YuanShu",
   },
   ZhangFei: {
      name: () => ["Zhang", "Fei", "Yide"],
      image: ZhangFei,
      tier: "Tier1",
      flags: TKCharacterFlags.Martial,
      warlord: "LiuBei",
   },
   ZhangHe: {
      name: () => ["Zhang", "He", "Junyi"],
      image: ZhangHe,
      tier: "Tier2",
      flags: TKCharacterFlags.Martial,
      warlord: "YuanShao",
   },
   ZhangLiao: {
      name: () => ["Zhang", "Liao", "Wenyuan"],
      image: ZhangLiao,
      tier: "Tier2",
      flags: TKCharacterFlags.Martial,
      warlord: "LuBu",
   },
   ZhangLu: {
      name: () => ["Zhang", "Lu", "Gongqi"],
      image: ZhangLu,
      tier: "Tier4",
      flags: TKCharacterFlags.Civil,
      warlord: "ZhangLu",
   },
   ZhangYan: {
      name: () => ["Zhang", "Yan"],
      image: ZhangYan,
      tier: "Tier3",
      flags: TKCharacterFlags.Martial,
      warlord: "ZhangYan",
   },
   ZhangYang: {
      name: () => ["Zhang", "Yang", "Zhishu"],
      image: ZhangYang,
      tier: "Tier4",
      flags: TKCharacterFlags.Martial,
      warlord: "ZhangYang",
   },
   ZhangZhao: {
      name: () => ["Zhang", "Zhao", "Zibu"],
      image: ZhangZhao,
      tier: "Tier3",
      flags: TKCharacterFlags.Civil,
      warlord: "SunCe",
   },
   ZhaoYun: {
      name: () => ["Zhao", "Yun", "Zilong"],
      image: ZhaoYun,
      tier: "Tier2",
      flags: TKCharacterFlags.Martial,
      warlord: "GongsunZan",
   },
   ZhouYu: {
      name: () => ["Zhou", "Yu", "Gongjin"],
      image: ZhouYu,
      tier: "Tier1",
      flags: TKCharacterFlags.Civil | TKCharacterFlags.Martial,
      warlord: "SunCe",
   },
   ZhugeLiang: {
      name: () => ["Zhuge", "Liang", "Kongming"],
      image: ZhugeLiang,
      tier: "Tier1",
      flags: TKCharacterFlags.Civil | TKCharacterFlags.Martial,
   },
} satisfies Record<string, ITKCharacter>;

export type TKCharacter = keyof typeof TKCharacters;
