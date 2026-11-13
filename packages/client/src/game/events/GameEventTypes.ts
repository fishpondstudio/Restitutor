import type { Province } from "../definitions/Province";
import type { ProvinceNameOverride } from "../definitions/ProvinceNameOverrides";
import type { ProvinceUpgrade } from "../definitions/ProvinceUpgrades";
import type { Religion } from "../definitions/Religion";
import type { Tech } from "../definitions/Tech";
import type { ICustomEffect, IGameEffect } from "../GameEffect";
import type { SaveGame } from "../GameState";
import type { ConditionChecks } from "../logic/Calculation";
import type { GameEventOrder } from "./GameEventOrder";
import type { GameEventType } from "./GameEvents";
import type { IGameEventCondition } from "./GameEventTypes";
import type { ImageWithCredit } from "./ImageWithCredit";

export interface IGameEventCondition {
   year?: [number, number];
   nameOverride?: ProvinceNameOverride;
   province?: Set<Province>;
   playerOnly?: boolean;
   onMap?: Partial<Record<Province, boolean>>;
   religion?: Set<Religion>;
   techs?: Set<Tech>;
   provinceUpgrades?: Set<ProvinceUpgrade>;
   annexAndCore?: Partial<Record<Province, number>>;
   conditions?: (province: Province, save: SaveGame) => ConditionChecks;
}
export interface IGameEventConfig {
   name: () => string;
   desc: () => string;
   type?: GameEventType;
   wikipedia?: string;
   achievement?: string;
   image: ImageWithCredit;
   order?: GameEventOrder;
   condition?: IGameEventCondition;
   buttons: IGameEventButton[];
}
export interface IGameEventButton extends IGameEffect {
   label: () => string;
   custom?: ICustomEffect[];
}
