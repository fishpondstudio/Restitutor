import MainFontBold from "./assets/fonts/Sentient-Bold.ttf";
import MainFontItalic from "./assets/fonts/Sentient-Italic.ttf";
import MainFont from "./assets/fonts/Sentient-Regular.ttf";
import TitleFont from "./assets/fonts/YoungSerif-Bold-Mod.ttf";

export const Fonts = {
   MainFont: "MainFont",
   TitleFont: "TitleFont",
} as const;

export const FontFaces = [
   new FontFace(Fonts.MainFont, `url("${MainFont}")`, { weight: "normal", style: "normal" }),
   new FontFace(Fonts.TitleFont, `url("${TitleFont}")`, { weight: "normal", style: "normal" }),
   new FontFace(Fonts.MainFont, `url("${MainFontItalic}")`, { weight: "normal", style: "italic" }),
   new FontFace(Fonts.MainFont, `url("${MainFontBold}")`, { weight: "bold", style: "normal" }),
];
