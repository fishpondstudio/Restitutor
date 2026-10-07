import type { Province } from "../definitions/Province";
import type { TKCharacter } from "./TKCharacter";

const _TKWarlords = [
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

export type TKWarlord = (typeof _TKWarlords)[number];
export const TKWarlords = new Set<TKWarlord>(_TKWarlords);

export interface ITKWarlordCharacter {
   character: TKCharacter;
}

export const TKWarlordCharacters = {
   LiJue: { character: "LiJue" },
   YuanShao: { character: "YuanShao" },
   CaoCao: { character: "CaoCao" },
   LuBu: { character: "LuBu" },
   LiuBei: { character: "LiuBei" },
   LiuBiao: { character: "LiuBiao" },
   SunCe: { character: "SunCe" },
   LiuZhang: { character: "LiuZhang" },
   YuanShu: { character: "YuanShu" },
   GongsunZan: { character: "GongsunZan" },
   GongsunDu: { character: "GongsunDu" },
   TaoQian: { character: "TaoQian" },
   ZhangLu: { character: "ZhangLu" },
   ZhangYang: { character: "ZhangYang" },
   MaTeng: { character: "MaTeng" },
   KongRong: { character: "KongRong" },
   HanSui: { character: "HanSui" },
   ShiXie: { character: "ShiXie" },
   ZhangYan: { character: "ZhangYan" },
   LiuYao: { character: "LiuYao" },
   WangLang: { character: "WangLang" },
   YanBaihu: { character: "YanBaihu" },
} satisfies Record<TKWarlord, ITKWarlordCharacter>;
