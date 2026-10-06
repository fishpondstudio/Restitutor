import type { Province } from "../definitions/Province";
import type { TKCharacter } from "./TKCharacter";

export const TKWarlords = [
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

export type TKWarlord = (typeof TKWarlords)[number];

export const TKWarlordCharacters = {
   LiJue: "LiJue",
   YuanShao: "YuanShao",
   CaoCao: "CaoCao",
   LuBu: "LuBu",
   LiuBei: "LiuBei",
   LiuBiao: "LiuBiao",
   SunCe: "SunCe",
   LiuZhang: "LiuZhang",
   YuanShu: "YuanShu",
   GongsunZan: "GongsunZan",
   GongsunDu: "GongsunDu",
   TaoQian: "TaoQian",
   ZhangLu: "ZhangLu",
   ZhangYang: "ZhangYang",
   MaTeng: "MaTeng",
   KongRong: "KongRong",
   HanSui: "HanSui",
   ShiXie: "ShiXie",
   ZhangYan: "ZhangYan",
   LiuYao: "LiuYao",
   WangLang: "WangLang",
   YanBaihu: "YanBaihu",
} satisfies Record<TKWarlord, TKCharacter>;
