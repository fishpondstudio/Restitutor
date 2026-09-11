import { type ILineStyleOptions, LINE_SCALE_MODE } from "@pixi/graphics-smooth";
import { hslToRgb } from "@project/shared/src/thirdparty/RandomColor";
import { LINE_CAP, LINE_JOIN } from "pixi.js";

export const OceanColor = hslToRgb(193, 45, 75);

export const InternalBorder: ILineStyleOptions = {
   width: 1,
   alpha: 1,
   alignment: 0.5,
   scaleMode: LINE_SCALE_MODE.NONE,
   cap: LINE_CAP.ROUND,
   join: LINE_JOIN.ROUND,
   color: 0x888888,
};

export const WarBorder: ILineStyleOptions = {
   ...InternalBorder,
   scaleMode: LINE_SCALE_MODE.NORMAL,
   width: 5,
   alpha: 1,
   color: 0xeb4d4b,
};

export const ExternalBorder: ILineStyleOptions = {
   width: 2,
   alpha: 1,
   alignment: 0.5,
   scaleMode: LINE_SCALE_MODE.NONE,
   cap: LINE_CAP.ROUND,
   join: LINE_JOIN.ROUND,
   color: 0x888888,
};

export const CoastBorder: ILineStyleOptions = {
   ...ExternalBorder,
   color: hslToRgb(193, 25, 50),
};

export const Coastlines: ILineStyleOptions[] = [
   { ...CoastBorder, scaleMode: LINE_SCALE_MODE.NORMAL, width: 140, alpha: 1, color: hslToRgb(193, 45, 74) },
   { ...CoastBorder, scaleMode: LINE_SCALE_MODE.NORMAL, width: 90, alpha: 1, color: hslToRgb(193, 45, 73) },
   { ...CoastBorder, scaleMode: LINE_SCALE_MODE.NORMAL, width: 50, alpha: 1, color: hslToRgb(193, 45, 71) },
   { ...CoastBorder, scaleMode: LINE_SCALE_MODE.NORMAL, width: 20, alpha: 1, color: hslToRgb(193, 45, 69) },
];
