import { LINE_SCALE_MODE, SmoothGraphics } from "@pixi/graphics-smooth";
import { AABB, type IAABB } from "@project/shared/src/utils/AABB";
import { equal, forEach, layoutSpaceBetween } from "@project/shared/src/utils/Helper";
import type { IHaveXY } from "@project/shared/src/utils/Vector2";
import {
   type ColorSource,
   Container,
   type FederatedPointerEvent,
   LINE_CAP,
   LINE_JOIN,
   Sprite,
   TilingSprite,
} from "pixi.js";
import { Fonts } from "../assets";
import { Tech } from "../game/definitions/Tech";
import { RefreshTechTree } from "../game/Events";
import { getTechPosition } from "../game/logic/TechLogic";
import { showSidebar } from "../ui/common/Sidebar";
import { SidebarWidth } from "../ui/common/SidebarComp";
import { playClick } from "../ui/Sound";
import { TechPage } from "../ui/TechPage";
import { WheelMode } from "../utils/Camera";
import { G } from "../utils/Global";
import { destroyAllChildren, type ISceneContext, Scene } from "../utils/SceneManager";
import { UnicodeText } from "../utils/UnicodeText";

const BoxWidth = 300;
const BoxHeight = 104;
const ColumnWidth = 500;
const PageHeight = 1000;
const HeaderHeight = 0;
const TopMargin = 200;
const BottomMargin = 200;
const BottomPadding = 0;

let time = 0;

export class TechTreeScene extends Scene {
   private _graphics: SmoothGraphics;
   private _selectedGraphics: SmoothGraphics;
   private _techs = new Map<Tech, IAABB>();
   private _boxContainer: Container;
   private _selectedBoxContainer: Container;
   private _selectedTech: Tech | undefined;
   private _selectedTechFrame: Sprite | undefined;

   backgroundColor(): ColorSource {
      return 0xf5edda;
   }

   constructor(context: ISceneContext) {
      super(context);
      const { app, textures } = this.context;

      const rowCount = new Map<number, number>();

      forEach(Tech, (_tech, def) => {
         const col = getTechPosition(_tech).x;
         const count = rowCount.get(col) ?? 0;
         rowCount.set(col, count + 1);
      });

      const zoom = app.screen.height / PageHeight;
      const width = rowCount.size * ColumnWidth + SidebarWidth / zoom;
      const height = PageHeight;

      this.viewport.setWorldSize(width, PageHeight);
      this.viewport.zoom = zoom;
      this.viewport.wheelMode = WheelMode.HorizontalScroll;
      this.viewport.center = { x: 0, y: height / 2 };

      const paper = G.textures.get("Misc/Paper");
      if (paper) {
         const bg = this.viewport.addChild(new TilingSprite(paper));
         bg.position.set(0, 0);
         bg.width = width;
         bg.height = height;
      }
      this._graphics = this.viewport.addChild(new SmoothGraphics());
      this._selectedGraphics = this.viewport.addChild(new SmoothGraphics());
      this._boxContainer = this.viewport.addChild(new Container());
      this._selectedBoxContainer = this.viewport.addChild(new Container());

      forEach(Tech, (tech, def) => {
         const position = getTechPosition(tech);
         const x = position.x * ColumnWidth + ColumnWidth / 2 - BoxWidth / 2;
         const totalRow = rowCount.get(position.x) ?? 1;
         const totalHeight = PageHeight - BottomMargin - TopMargin - HeaderHeight - BottomPadding;
         const y = HeaderHeight + TopMargin + layoutSpaceBetween(BoxHeight, totalHeight, totalRow, position.y);

         const container = this._boxContainer.addChild(new Container());
         container.position.set(x, y);
         container.width = BoxWidth;
         container.height = BoxHeight;

         const frame = container.addChild(new Sprite(G.textures.get("Misc/TechFrame")));
         frame.position.set(0, 0);
         frame.width = BoxWidth;
         frame.height = BoxHeight;
         frame.tint = 0x000000;
         frame.alpha = 0.35;

         if (import.meta.env.DEV) {
            const id = container.addChild(
               new UnicodeText(tech, {
                  fontName: Fonts.MainFont,
                  fontSize: 16,
                  tint: 0x333333,
               }),
            );
            id.anchor.set(0, 1);
            id.position.set(14, BoxHeight - 8);
         }

         const text = container.addChild(
            new UnicodeText(def.name(), {
               fontName: Fonts.TitleFont,
               fontSize: 30,
               tint: 0x333333,
            }),
         );
         while (text.width > BoxWidth - 40) {
            text.size--;
         }
         text.anchor.set(0.5);
         text.position.set(BoxWidth / 2, BoxHeight / 2);

         // const desc = container.addChild(
         //    new UnicodeText(getTechDesc(tech), {
         //       fontName: Fonts.MainFont,
         //       fontSize: 14,
         //       tint: 0xffffff,
         //    }),
         // );
         // while (desc.width > BoxWidth - 20) {
         //    desc.size--;
         // }
         // desc.anchor.set(0.5);
         // desc.position.set(BoxWidth / 2, BoxHeight / 2 + 10);

         this._techs.set(tech, new AABB({ x: x, y: y }, { x: x + BoxWidth, y: y + BoxHeight }));
      });

      this.drawSelected();

      let maxX = 0;
      G.save.state.provinces[G.save.state.playerProvince]?.unlockedTech.forEach((t) => {
         const box = this._techs.get(t);
         if (box) {
            maxX = Math.max(maxX, box.center.x);
         }
      });
      this.viewport.center = { x: maxX + app.screen.width / 4, y: this.viewport.center.y };

      forEach(Tech, (tech, def) => {
         const from = this._techs.get(tech);
         if (!from) {
            return;
         }
         this._graphics.lineStyle({
            width: 2,
            color: 0x000000,
            alignment: 0.5,
            join: LINE_JOIN.ROUND,
            cap: LINE_CAP.ROUND,
            alpha: 0.25,
            scaleMode: LINE_SCALE_MODE.NONE,
         });
         def.requires.forEach((t) => {
            const dep = this._techs.get(t);
            if (!dep) {
               return;
            }
            this.drawConnection(this._graphics, from, dep);
         });
      });

      RefreshTechTree.on(this._refresh.bind(this));

      // G.pixi.renderer.extract.image(this.viewport).then((image) => {
      //    image.style.position = "absolute";
      //    image.style.top = "0";
      //    image.style.left = "0";
      //    document.body.appendChild(image);
      // });

      // this.viewport.zoom = 0.5;
   }

   override onResize(width: number, height: number): void {
      const zoom = this.context.app.screen.height / PageHeight;
      this.viewport.zoom = zoom;
   }

   private _refresh(): void {
      this.drawSelected();
   }

   public update(dt: number, unscaled: number): void {
      if (this._selectedTechFrame) {
         this._selectedTechFrame.alpha = Math.sin(Math.PI * 2 * time) * 0.5 + 0.5;
         time += unscaled;
      }
   }

   private drawSelected(): void {
      this._selectedGraphics.clear();
      destroyAllChildren(this._selectedBoxContainer);
      G.save.state.provinces[G.save.state.playerProvince]?.unlockedTech.forEach((t) => {
         const frame = this._selectedBoxContainer.addChild(new Sprite(G.textures.get("Misc/TechFrameUnlocked")));
         frame.tint = 0x845ef7;
         this.drawSelectedTech(t, frame, true);
      });
      if (this._selectedTech) {
         this._selectedTechFrame = this._selectedBoxContainer.addChild(
            new Sprite(G.textures.get("Misc/TechFrameSelected")),
         );
         this._selectedTechFrame.tint = 0x845ef7;
         this.drawSelectedTech(
            this._selectedTech,
            this._selectedTechFrame,
            !G.save.state.provinces[G.save.state.playerProvince]?.unlockedTech.has(this._selectedTech),
         );
         showSidebar(<TechPage tech={this._selectedTech} />);
      }
   }

   private drawSelectedTech(tech: Tech, frame: Sprite, drawConnection: boolean): void {
      const box = this._techs.get(tech);
      if (!box) {
         return;
      }
      frame.anchor.set(0.5);
      frame.position.set(box.center.x, box.center.y);
      frame.alpha = 1;
      const to = this._techs.get(tech);
      this._selectedGraphics.lineStyle({
         width: 3,
         color: frame.tint,
         alignment: 0.5,
         join: LINE_JOIN.ROUND,
         cap: LINE_CAP.ROUND,
         alpha: 1,
         scaleMode: LINE_SCALE_MODE.NONE,
      });
      if (drawConnection) {
         Tech[tech].requires.forEach((r) => {
            const from = this._techs.get(r);
            if (from && to) {
               this.drawConnection(this._selectedGraphics, from, to);
            }
         });
      }
   }

   override onClicked(e: FederatedPointerEvent): void {
      const pos = this.viewport.screenToWorld(e.screen);
      const tech = this.getTechByPosition(pos);
      if (tech) {
         playClick();
         this._selectedTech = tech;
         this.drawSelected();
      }
   }

   public selectTech(tech: Tech): void {
      this._selectedTech = tech;
      this.drawSelected();
      const visual = this._techs.get(tech);
      if (visual) {
         this.viewport.center = { x: visual.center.x, y: visual.center.y };
      }
   }

   private getTechByPosition(pos: IHaveXY): Tech | undefined {
      for (const [tech, box] of this._techs) {
         if (box.contains(pos)) {
            return tech;
         }
      }
   }

   private drawConnection(g: SmoothGraphics, from: IAABB, to: IAABB): void {
      const fromCenter = from.center;
      const toCenter = to.center;
      const dx = toCenter.x - fromCenter.x;
      const diff = {
         x: equal(fromCenter.x, toCenter.x) ? 0 : Math.sign(dx),
         y: 0,
      };

      diff.x *= BoxWidth / 2 + 10;
      diff.y *= BoxHeight / 2 + 10;

      g.moveTo(fromCenter.x + diff.x, fromCenter.y + diff.y);
      if (diff.x === 0) {
         g.bezierCurveTo(
            fromCenter.x + diff.x,
            (fromCenter.y + toCenter.y) / 2,
            toCenter.x - diff.x,
            (fromCenter.y + toCenter.y) / 2,
            toCenter.x - diff.x,
            toCenter.y - diff.y,
         );
      } else {
         g.bezierCurveTo(
            (fromCenter.x + toCenter.x) / 2,
            fromCenter.y + diff.y,
            (fromCenter.x + toCenter.x) / 2,
            toCenter.y - diff.y,
            toCenter.x - diff.x,
            toCenter.y - diff.y,
         );
      }
   }
}
