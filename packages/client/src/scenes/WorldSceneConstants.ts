import { type ILineStyleOptions, LINE_SCALE_MODE } from "@pixi/graphics-smooth";
import { LINE_CAP, LINE_JOIN } from "pixi.js";

export const InternalBorder: ILineStyleOptions = {
   width: 1,
   alpha: 1,
   alignment: 0.5,
   scaleMode: LINE_SCALE_MODE.NONE,
   cap: LINE_CAP.ROUND,
   join: LINE_JOIN.ROUND,
   color: 0x888888,
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
