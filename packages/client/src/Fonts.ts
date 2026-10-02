import MonospaceFont from "./assets/fonts/GoogleSansCode-SemiBold.ttf";
import LiShu from "./assets/fonts/LiShu.ttf";
import RomanFont from "./assets/fonts/Metamorphous-Regular.ttf";
import MainFontBold from "./assets/fonts/Sentient-Bold.ttf";
import MainFontItalic from "./assets/fonts/Sentient-Italic.ttf";
import MainFont from "./assets/fonts/Sentient-Regular.ttf";
import TitleFont from "./assets/fonts/YoungSerif-Bold-Mod.ttf";

export const Fonts = {
   MainFont: "MainFont",
   TitleFont: "TitleFont",
   RomanFont: "RomanFont",
   MonospaceFont: "MonospaceFont",
} as const;

export const FontFaces = [
   new FontFace(Fonts.MainFont, `url("${MainFont}")`, { weight: "normal", style: "normal" }),
   new FontFace(Fonts.TitleFont, `url("${TitleFont}")`, { weight: "normal", style: "normal" }),
   new FontFace(Fonts.MonospaceFont, `url("${MonospaceFont}")`, { weight: "normal", style: "normal" }),
   new FontFace(Fonts.MainFont, `url("${MainFontItalic}")`, { weight: "normal", style: "italic" }),
   new FontFace(Fonts.MainFont, `url("${MainFontBold}")`, { weight: "bold", style: "normal" }),
   new FontFace(Fonts.RomanFont, `url("${RomanFont}")`, { weight: "normal", style: "normal" }),
];

export const ChineseFontOverride = [
   new FontFace("RomanFont", `url("${LiShu}")`, { weight: "normal", style: "normal" }),
   new FontFace("RomanFont", `url("${LiShu}")`, { weight: "bold", style: "normal" }),
   new FontFace("TitleFont", `url("${LiShu}")`, { weight: "normal", style: "normal" }),
   new FontFace("TitleFont", `url("${LiShu}")`, { weight: "bold", style: "normal" }),
] as const;
