import type { Tile, ValueOf } from "@project/shared/src/utils/Helper";
import type { Application, Texture } from "pixi.js";
import type { ITileConfig } from "../game/definitions/Tile";
import { GameSpeedChanged, OnLanguageChanged } from "../game/Events";
import type { SaveGame } from "../game/GameState";
import { Languages } from "../game/Languages";
import { L } from "../utils/i18n";
import type { SceneManager } from "./SceneManager";

export const GameFlags = {
   None: 0,
   Sandbox: 1 << 0,
} as const;

export type GameFlags = ValueOf<typeof GameFlags>;

export const G: IGlobals = {
   scene: null!,
   textures: null!,
   atlasUrl: null!,
   pixi: null!,
   save: null!,
   speed: 1,
   flags: GameFlags.None,
   tileEditor: new Map(),
};

export interface IGlobals {
   scene: SceneManager;
   textures: Map<string, Texture>;
   atlasUrl: Map<string, string>;
   pixi: Application;
   save: SaveGame;
   speed: number;
   flags: GameFlags;
   tileEditor: Map<Tile, ITileConfig>;
}

let previousSpeed = G.speed;

export function setSpeed(speed: number): void {
   if (G.speed === speed) return;
   previousSpeed = G.speed;
   G.speed = speed;
   GameSpeedChanged.emit(G.speed);
}

export function revertSpeed(): void {
   const currentSpeed = G.speed;
   G.speed = previousSpeed;
   previousSpeed = currentSpeed;
   GameSpeedChanged.emit(G.speed);
}

export function isPaused(): boolean {
   return G.speed <= 0;
}

export function setLanguage(lang: keyof typeof Languages) {
   G.save.options.language = lang;
   Object.assign(L, Languages[lang]);
   OnLanguageChanged.emit();
}
