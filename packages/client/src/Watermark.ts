import { RingBuffer } from "@project/shared/src/utils/RingBuffer";
import { BitmapText } from "pixi.js";
import { Fonts } from "./assets";
import { OnResize } from "./game/Events";
import { getVersion } from "./game/Version";
import { G } from "./utils/Global";

export class Watermark {
   private _watermark: BitmapText;
   private _fps: RingBuffer<number>;
   private _version: string;

   constructor() {
      this._fps = new RingBuffer<number>(120);
      this._version = getVersion();
      this._watermark = G.scene.overlay.addChild(
         new BitmapText("", { fontName: Fonts.MainFont, fontSize: 12, tint: 0x666666 }),
      );
      this._watermark.anchor.set(0, 1);
      this._updatePosition();
      OnResize.on(({ width, height }) => {
         this._updatePosition();
      });
   }

   public update(): void {
      this._fps.push(G.pixi.ticker.FPS);
      this._watermark.text = `TICK: ${G.save.state.tick}    FPS: ${Math.round(this._fps.reduce(sum, 0) / this._fps.size)}    VERSION: ${this._version}    ${navigator.onLine ? "ONLINE" : "OFFLINE"}`;
   }

   private _updatePosition(): void {
      this._watermark.position.set(10, G.pixi.screen.height - 10);
   }
}

function sum(result: number, value: number): number {
   return result + value;
}
