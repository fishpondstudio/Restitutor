import type { IScenario } from "./Scenarios";

// The ROTK XI-style chronology includes Liu Zhang's succession while retaining Tao Qian.
// Sun Ce and Liu Bei receive small independent holdings; borders favor game balance.
export const ThreeKingdoms194: IScenario = {
   startDate: new Date(194, 6, 1),
   provinces: new Set([
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
   ]),
   events: new Set(),
   provinceResourceNames: {
      consulPoint: () => "Imperial Favor",
   },
};
