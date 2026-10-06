import CaoCao from "../../assets/images/characters/CaoCao.webp";
import GongsunDu from "../../assets/images/characters/GongsunDu.webp";
import GongsunZan from "../../assets/images/characters/GongsunZan.webp";
import HanSui from "../../assets/images/characters/HanSui.webp";
import KongRong from "../../assets/images/characters/KongRong.webp";
import LiJue from "../../assets/images/characters/LiJue.webp";
import LiuBei from "../../assets/images/characters/LiuBei.webp";
import LiuBiao from "../../assets/images/characters/LiuBiao.webp";
import LiuYao from "../../assets/images/characters/LiuYao.webp";
import LiuZhang from "../../assets/images/characters/LiuZhang.webp";
import LuBu from "../../assets/images/characters/LuBu.webp";
import MaTeng from "../../assets/images/characters/MaTeng.webp";
import ShiXie from "../../assets/images/characters/ShiXie.webp";
import SunCe from "../../assets/images/characters/SunCe.webp";
import TaoQian from "../../assets/images/characters/TaoQian.webp";
import WangLang from "../../assets/images/characters/WangLang.webp";
import YanBaihu from "../../assets/images/characters/YanBaihu.webp";
import YuanShao from "../../assets/images/characters/YuanShao.webp";
import YuanShu from "../../assets/images/characters/YuanShu.webp";
import ZhangLu from "../../assets/images/characters/ZhangLu.webp";
import ZhangYan from "../../assets/images/characters/ZhangYan.webp";
import ZhangYang from "../../assets/images/characters/ZhangYang.webp";
import type { Province } from "../definitions/Province";
import type { IScenario } from "./Scenarios";

const ThreeKingdomsWarlord = [
   "LiJue",
   "YuanShao",
   "CaoCao",
   "LuBu",
   "LiuBei",
   "LiuBiao",
   "SunCe",
   "LiuZhang",
   "YuanShu",
   "GongsunZan",
   "GongsunDu",
   "TaoQian",
   "ZhangLu",
   "ZhangYang",
   "MaTeng",
   "KongRong",
   "HanSui",
   "ShiXie",
   "ZhangYan",
   "LiuYao",
   "WangLang",
   "YanBaihu",
] as const satisfies readonly Province[];

export type ThreeKingdomsWarlord = (typeof ThreeKingdomsWarlord)[number];

export const ThreeKingdoms194: IScenario = {
   startDate: new Date(194, 6, 1),
   provinces: new Set(ThreeKingdomsWarlord),
   events: new Set(),
   provinceResourceNames: {
      consulPoint: () => "Imperial Favor",
   },
};

export const ThreeKingdomsWarlordImages: Record<ThreeKingdomsWarlord, string> = {
   LiJue,
   YuanShao,
   CaoCao,
   LuBu,
   LiuBei,
   LiuBiao,
   SunCe,
   LiuZhang,
   YuanShu,
   GongsunZan,
   GongsunDu,
   TaoQian,
   ZhangLu,
   ZhangYang,
   MaTeng,
   KongRong,
   HanSui,
   ShiXie,
   ZhangYan,
   LiuYao,
   WangLang,
   YanBaihu,
};
