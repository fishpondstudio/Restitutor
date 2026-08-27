import { forEach, setFlag } from "@project/shared/src/utils/Helper";
import * as Sentry from "@sentry/browser";
import { Assets, BitmapFont, type Spritesheet, type TextStyleFontWeight, type Texture } from "pixi.js";
import { FontFaces, Fonts } from "./Fonts";
import { startGameLoop } from "./GameLoop";
import { addDebugFunctions } from "./game/AddDebugFunctions";
import { SentryDSN, SupportedSaveVersion } from "./game/definitions/Constant";
import { GameStateFlags, initNewPlayerSaveGame, initSaveGame, SaveGame } from "./game/GameState";
import { loadGame, resetGame, saveGame } from "./game/LoadSave";
import { RomeMap } from "./game/RomeMap";
import { showBootstrapModal } from "./game/ShowBootstrapModal";
import { getVersion } from "./game/Version";
import { loadGameScene } from "./LoadGameScene";
import { migrateSave } from "./MigrateSave";
import { isSteam, SteamClient } from "./rpc/SteamClient";
import { showPanel } from "./ui/common/ShowPanel";
import { hideLoading } from "./ui/components/LoadingComp";
import { initHighlighter } from "./ui/Highlighter";
import { IncompatibleSaveModal } from "./ui/IncompatibleSaveModal";
import { loadSounds } from "./ui/Sound";
import { G, isDev, setLanguage } from "./utils/Global";
import { SceneManager } from "./utils/SceneManager";

export async function bootstrap(): Promise<void> {
   initErrorTracking();
   console.time("Load Assets");
   await Promise.all([Assets.init({ manifest: "./manifest.json" }), ...FontFaces.map((f) => f.load())]);
   console.timeEnd("Load Assets");
   console.time("Load Font");
   FontFaces.forEach((f) => {
      if (f.weight !== "normal" || f.style !== "normal") {
         return;
      }
      let weight = f.weight as TextStyleFontWeight;
      if (f.family === Fonts.RomanFont || f.family === Fonts.MainFont) {
         weight = "bold";
      }
      BitmapFont.from(
         f.family,
         {
            fill: "#ffffff",
            fontSize: 64,
            fontFamily: f.family,
            fontWeight: weight,
         },
         { chars: BitmapFont.ASCII, resolution: 2, padding: 8 },
      );
   });
   console.timeEnd("Load Font");

   console.time("Load Sprites");
   const textures: Map<string, Texture> = new Map();
   const atlasUrl: Map<string, string> = new Map();

   const bundle = await Assets.load<Spritesheet>("atlas");
   forEach(bundle.textures, (path, texture) => {
      textures.set(String(path), texture);
      atlasUrl.set(String(path), bundle.data.meta.image!);
   });

   G.textures = textures;
   G.atlasUrl = atlasUrl;
   console.timeEnd("Load Sprites");

   G.scene = new SceneManager({ app: G.pixi, textures });

   let isNewPlayer = false;

   if (import.meta.env.DEV && G.params.has("reset")) {
      await resetGame();
      const params = new URLSearchParams(location.search);
      params.delete("reset");
      window.location.search = params.toString();
      return;
   }

   try {
      G.save = await loadGame();
      migrateSave(G.save);
      if (G.save.options.version !== SupportedSaveVersion) {
         hideLoading();
         showPanel(
            <IncompatibleSaveModal supportedVersion={SupportedSaveVersion} saveVersion={G.save.options.version} />,
         );
         return;
      }
   } catch (error) {
      isNewPlayer = true;
   }

   if (isDev()) {
      G.tileEditor = RomeMap;
      G.tileEditor.forEach((data, tile) => {
         if (!data.province) {
            throw new Error(`Invalid tile config: ${tile}: ${JSON.stringify(data)}`);
         }
      });
   }

   if (isNewPlayer) {
      G.save = new SaveGame();
      initSaveGame(G.save);
      initNewPlayerSaveGame(G.save);
      G.save.state.flags = setFlag(G.save.state.flags, GameStateFlags.ShowTutorial);
   }

   document.documentElement.style.setProperty("font-size", `${G.save.options.uiScale}rem`);
   setLanguage(G.save.options.language);
   loadSounds();
   addDebugFunctions();
   loadGameScene();
   startGameLoop();
   showBootstrapModal(G.save, isNewPlayer);
   hideLoading();
   initHighlighter();
   loadAddonMods();
   setInterval(() => saveGame(G.save), isSteam() ? 60_000 : 10_000);
}

function initErrorTracking(): void {
   if (isDev()) {
      return;
   }
   Sentry.init({
      dsn: SentryDSN,
      sendDefaultPii: true,
      release: getVersion(),
   });
}

async function loadAddonMods(): Promise<void> {
   if (isSteam()) {
      const mods = await SteamClient.loadAddonMods();
      for (const mod of mods) {
         const script = document.createElement("script");
         script.textContent = mod;
         document.body.appendChild(script);
      }
   }
}
