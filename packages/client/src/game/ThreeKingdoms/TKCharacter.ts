import type { ValueOf } from "@project/shared/src/utils/Helper";
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

export type TKCharacterTier = ValueOf<typeof TKCharacterTier>;

export interface ITKCharacter {
   name: () => string;
   image: string;
   flags: TKCharacterFlag;
   tier: TKCharacterTier;
   warlord?: TKWarlord;
}

export const TKCharacters = {
   CaoCao: {
      name: () => "Cao Cao",
      image: CaoCao,
      tier: TKCharacterTier.Tier1,
      flags: TKCharacterFlags.Civil | TKCharacterFlags.Martial,
      warlord: "CaoCao",
   },
   ChenGong: {
      name: () => "Chen Gong",
      image: ChenGong,
      tier: TKCharacterTier.Tier2,
      flags: TKCharacterFlags.Civil,
      warlord: "LuBu",
   },
   ChengYu: {
      name: () => "Cheng Yu",
      image: ChengYu,
      tier: TKCharacterTier.Tier3,
      flags: TKCharacterFlags.Civil,
      warlord: "CaoCao",
   },
   DianWei: {
      name: () => "Dian Wei",
      image: DianWei,
      tier: TKCharacterTier.Tier2,
      flags: TKCharacterFlags.Martial,
      warlord: "CaoCao",
   },
   FaZheng: {
      name: () => "Fa Zheng",
      image: FaZheng,
      tier: TKCharacterTier.Tier2,
      flags: TKCharacterFlags.Civil,
   },
   GanNing: {
      name: () => "Gan Ning",
      image: GanNing,
      tier: TKCharacterTier.Tier2,
      flags: TKCharacterFlags.Martial,
      warlord: "LiuBiao",
   },
   GongsunDu: {
      name: () => "Gongsun Du",
      image: GongsunDu,
      tier: TKCharacterTier.Tier4,
      flags: TKCharacterFlags.Martial,
      warlord: "GongsunDu",
   },
   GongsunZan: {
      name: () => "Gongsun Zan",
      image: GongsunZan,
      tier: TKCharacterTier.Tier3,
      flags: TKCharacterFlags.Martial,
      warlord: "GongsunZan",
   },
   GuanYu: {
      name: () => "Guan Yu",
      image: GuanYu,
      tier: TKCharacterTier.Tier1,
      flags: TKCharacterFlags.Martial,
      warlord: "LiuBei",
   },
   GuoJia: {
      name: () => "Guo Jia",
      image: GuoJia,
      tier: TKCharacterTier.Tier1,
      flags: TKCharacterFlags.Civil,
      warlord: "CaoCao",
   },
   HanSui: {
      name: () => "Han Sui",
      image: HanSui,
      tier: TKCharacterTier.Tier3,
      flags: TKCharacterFlags.Martial,
      warlord: "HanSui",
   },
   HuangGai: {
      name: () => "Huang Gai",
      image: HuangGai,
      tier: TKCharacterTier.Tier3,
      flags: TKCharacterFlags.Martial,
      warlord: "SunCe",
   },
   HuangZhong: {
      name: () => "Huang Zhong",
      image: HuangZhong,
      tier: TKCharacterTier.Tier2,
      flags: TKCharacterFlags.Martial,
      warlord: "LiuBiao",
   },
   JiangWei: {
      name: () => "Jiang Wei",
      image: JiangWei,
      tier: TKCharacterTier.Tier2,
      flags: TKCharacterFlags.Civil | TKCharacterFlags.Martial,
   },
   JiaXu: {
      name: () => "Jia Xu",
      image: JiaXu,
      tier: TKCharacterTier.Tier2,
      flags: TKCharacterFlags.Civil,
      warlord: "LiJue",
   },
   JuShou: {
      name: () => "Ju Shou",
      image: JuShou,
      tier: TKCharacterTier.Tier3,
      flags: TKCharacterFlags.Civil,
      warlord: "YuanShao",
   },
   KongRong: {
      name: () => "Kong Rong",
      image: KongRong,
      tier: TKCharacterTier.Tier3,
      flags: TKCharacterFlags.Civil,
      warlord: "KongRong",
   },
   LiJue: {
      name: () => "Li Jue",
      image: LiJue,
      tier: TKCharacterTier.Tier4,
      flags: TKCharacterFlags.Martial,
      warlord: "LiJue",
   },
   LiuBei: {
      name: () => "Liu Bei",
      image: LiuBei,
      tier: TKCharacterTier.Tier3,
      flags: TKCharacterFlags.Martial,
      warlord: "LiuBei",
   },
   LiuBiao: {
      name: () => "Liu Biao",
      image: LiuBiao,
      tier: TKCharacterTier.Tier3,
      flags: TKCharacterFlags.Civil,
      warlord: "LiuBiao",
   },
   LiuYao: {
      name: () => "Liu Yao",
      image: LiuYao,
      tier: TKCharacterTier.Tier4,
      flags: TKCharacterFlags.Civil,
      warlord: "LiuYao",
   },
   LiuZhang: {
      name: () => "Liu Zhang",
      image: LiuZhang,
      tier: TKCharacterTier.Tier4,
      flags: TKCharacterFlags.Civil,
      warlord: "LiuZhang",
   },
   LuBu: {
      name: () => "Lu Bu",
      image: LuBu,
      tier: TKCharacterTier.Tier1,
      flags: TKCharacterFlags.Martial,
      warlord: "LuBu",
   },
   LuMeng: {
      name: () => "Lu Meng",
      image: LuMeng,
      tier: TKCharacterTier.Tier2,
      flags: TKCharacterFlags.Civil | TKCharacterFlags.Martial,
   },
   LuSu: {
      name: () => "Lu Su",
      image: LuSu,
      tier: TKCharacterTier.Tier3,
      flags: TKCharacterFlags.Civil | TKCharacterFlags.Martial,
   },
   LuXun: {
      name: () => "Lu Xun",
      image: LuXun,
      tier: TKCharacterTier.Tier2,
      flags: TKCharacterFlags.Civil | TKCharacterFlags.Martial,
   },
   MaChao: {
      name: () => "Ma Chao",
      image: MaChao,
      tier: TKCharacterTier.Tier2,
      flags: TKCharacterFlags.Martial,
      warlord: "MaTeng",
   },
   MaLiang: {
      name: () => "Ma Liang",
      image: MaLiang,
      tier: TKCharacterTier.Tier3,
      flags: TKCharacterFlags.Civil,
   },
   MaTeng: {
      name: () => "Ma Teng",
      image: MaTeng,
      tier: TKCharacterTier.Tier3,
      flags: TKCharacterFlags.Martial,
      warlord: "MaTeng",
   },
   PangTong: {
      name: () => "Pang Tong",
      image: PangTong,
      tier: TKCharacterTier.Tier1,
      flags: TKCharacterFlags.Civil,
   },
   ShiXie: {
      name: () => "Shi Xie",
      image: ShiXie,
      tier: TKCharacterTier.Tier4,
      flags: TKCharacterFlags.Civil,
      warlord: "ShiXie",
   },
   SimaYi: {
      name: () => "Sima Yi",
      image: SimaYi,
      tier: TKCharacterTier.Tier1,
      flags: TKCharacterFlags.Civil | TKCharacterFlags.Martial,
   },
   SunCe: {
      name: () => "Sun Ce",
      image: SunCe,
      tier: TKCharacterTier.Tier2,
      flags: TKCharacterFlags.Martial,
      warlord: "SunCe",
   },
   SunQuan: {
      name: () => "Sun Quan",
      image: SunQuan,
      tier: TKCharacterTier.Tier3,
      flags: TKCharacterFlags.Civil | TKCharacterFlags.Martial,
   },
   TaishiCi: {
      name: () => "Taishi Ci",
      image: TaishiCi,
      tier: TKCharacterTier.Tier2,
      flags: TKCharacterFlags.Martial,
      warlord: "LiuYao",
   },
   TaoQian: {
      name: () => "Tao Qian",
      image: TaoQian,
      tier: TKCharacterTier.Tier4,
      flags: TKCharacterFlags.Civil,
      warlord: "TaoQian",
   },
   TianFeng: {
      name: () => "Tian Feng",
      image: TianFeng,
      tier: TKCharacterTier.Tier3,
      flags: TKCharacterFlags.Civil,
      warlord: "YuanShao",
   },
   WangLang: {
      name: () => "Wang Lang",
      image: WangLang,
      tier: TKCharacterTier.Tier4,
      flags: TKCharacterFlags.Civil,
      warlord: "WangLang",
   },
   WeiYan: {
      name: () => "Wei Yan",
      image: WeiYan,
      tier: TKCharacterTier.Tier2,
      flags: TKCharacterFlags.Martial,
   },
   WenChou: {
      name: () => "Wen Chou",
      image: WenChou,
      tier: TKCharacterTier.Tier3,
      flags: TKCharacterFlags.Martial,
      warlord: "YuanShao",
   },
   XiahouDun: {
      name: () => "Xiahou Dun",
      image: XiahouDun,
      tier: TKCharacterTier.Tier3,
      flags: TKCharacterFlags.Martial,
      warlord: "CaoCao",
   },
   XiahouYuan: {
      name: () => "Xiahou Yuan",
      image: XiahouYuan,
      tier: TKCharacterTier.Tier3,
      flags: TKCharacterFlags.Martial,
      warlord: "CaoCao",
   },
   XuChu: {
      name: () => "Xu Chu",
      image: XuChu,
      tier: TKCharacterTier.Tier2,
      flags: TKCharacterFlags.Martial,
      warlord: "CaoCao",
   },
   XuHuang: {
      name: () => "Xu Huang",
      image: XuHuang,
      tier: TKCharacterTier.Tier2,
      flags: TKCharacterFlags.Martial,
      warlord: "LiJue",
   },
   XunYou: {
      name: () => "Xun You",
      image: XunYou,
      tier: TKCharacterTier.Tier2,
      flags: TKCharacterFlags.Civil,
      warlord: "CaoCao",
   },
   XunYu: {
      name: () => "Xun Yu",
      image: XunYu,
      tier: TKCharacterTier.Tier2,
      flags: TKCharacterFlags.Civil,
      warlord: "CaoCao",
   },
   XuShu: {
      name: () => "Xu Shu",
      image: XuShu,
      tier: TKCharacterTier.Tier2,
      flags: TKCharacterFlags.Civil,
   },
   XuYou: {
      name: () => "Xu You",
      image: XuYou,
      tier: TKCharacterTier.Tier3,
      flags: TKCharacterFlags.Civil,
      warlord: "YuanShao",
   },
   YanBaihu: {
      name: () => "Yan Baihu",
      image: YanBaihu,
      tier: TKCharacterTier.Tier4,
      flags: TKCharacterFlags.Martial,
      warlord: "YanBaihu",
   },
   YanLiang: {
      name: () => "Yan Liang",
      image: YanLiang,
      tier: TKCharacterTier.Tier3,
      flags: TKCharacterFlags.Martial,
      warlord: "YuanShao",
   },
   YuanShao: {
      name: () => "Yuan Shao",
      image: YuanShao,
      tier: TKCharacterTier.Tier3,
      flags: TKCharacterFlags.Martial,
      warlord: "YuanShao",
   },
   YuanShu: {
      name: () => "Yuan Shu",
      image: YuanShu,
      tier: TKCharacterTier.Tier4,
      flags: TKCharacterFlags.Civil,
      warlord: "YuanShu",
   },
   ZhangFei: {
      name: () => "Zhang Fei",
      image: ZhangFei,
      tier: TKCharacterTier.Tier1,
      flags: TKCharacterFlags.Martial,
      warlord: "LiuBei",
   },
   ZhangHe: {
      name: () => "Zhang He",
      image: ZhangHe,
      tier: TKCharacterTier.Tier2,
      flags: TKCharacterFlags.Martial,
      warlord: "YuanShao",
   },
   ZhangLiao: {
      name: () => "Zhang Liao",
      image: ZhangLiao,
      tier: TKCharacterTier.Tier2,
      flags: TKCharacterFlags.Martial,
      warlord: "LuBu",
   },
   ZhangLu: {
      name: () => "Zhang Lu",
      image: ZhangLu,
      tier: TKCharacterTier.Tier4,
      flags: TKCharacterFlags.Civil,
      warlord: "ZhangLu",
   },
   ZhangYan: {
      name: () => "Zhang Yan",
      image: ZhangYan,
      tier: TKCharacterTier.Tier3,
      flags: TKCharacterFlags.Martial,
      warlord: "ZhangYan",
   },
   ZhangYang: {
      name: () => "Zhang Yang",
      image: ZhangYang,
      tier: TKCharacterTier.Tier4,
      flags: TKCharacterFlags.Martial,
      warlord: "ZhangYang",
   },
   ZhangZhao: {
      name: () => "Zhang Zhao",
      image: ZhangZhao,
      tier: TKCharacterTier.Tier3,
      flags: TKCharacterFlags.Civil,
      warlord: "SunCe",
   },
   ZhaoYun: {
      name: () => "Zhao Yun",
      image: ZhaoYun,
      tier: TKCharacterTier.Tier1,
      flags: TKCharacterFlags.Martial,
      warlord: "GongsunZan",
   },
   ZhouYu: {
      name: () => "Zhou Yu",
      image: ZhouYu,
      tier: TKCharacterTier.Tier1,
      flags: TKCharacterFlags.Civil | TKCharacterFlags.Martial,
      warlord: "SunCe",
   },
   ZhugeLiang: {
      name: () => "Zhuge Liang",
      image: ZhugeLiang,
      tier: TKCharacterTier.Tier1,
      flags: TKCharacterFlags.Civil | TKCharacterFlags.Martial,
   },
} satisfies Record<string, ITKCharacter>;

export type TKCharacter = keyof typeof TKCharacters;
