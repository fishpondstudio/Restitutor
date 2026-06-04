import { forEach, setFlag } from "@project/shared/src/utils/Helper";
import { jsonDecode } from "@project/shared/src/utils/Serialization";
import * as Sentry from "@sentry/browser";
import { Assets, BitmapFont, type Spritesheet, type TextStyleFontWeight, type Texture } from "pixi.js";
import { FontFaces } from "./assets";
import { checkTextures } from "./CheckTextures";
import { startGameLoop } from "./GameLoop";
import { addDebugFunctions } from "./game/AddDebugFunctions";
import { SentryDSN, SupportedSaveVersion } from "./game/definitions/Constant";
import { Province } from "./game/definitions/Province";
import Rome from "./game/definitions/Rome.json?raw";
import { GameStateFlags, initSaveGame, SaveGame } from "./game/GameState";
import { loadGame, saveGame } from "./game/LoadSave";
import { validateConfig } from "./game/logic/ValidateConfig";
import { showBootstrapModal } from "./game/ShowBootstrapModal";
import { getVersion } from "./game/Version";
import { loadGameScene } from "./LoadGameScene";
import { migrateSave } from "./MigrateSave";
import { hideLoading } from "./ui/components/LoadingComp";
import { initHighlighter } from "./ui/Highlighter";
import { IncompatibleSaveModal } from "./ui/IncompatibleSaveModal";
import { loadSounds } from "./ui/Sound";
import { G, setLanguage } from "./utils/Global";
import { showModal } from "./utils/ModalManager";
import { SceneManager } from "./utils/SceneManager";
import { isSteam } from "./utils/Steam";

export async function bootstrap(): Promise<void> {
   initErrorTracking();
   console.time("Load Assets");
   FontFaces.forEach((f) => {
      document.fonts.add(f);
   });
   await Promise.all([Assets.init({ manifest: "./manifest.json" }), ...FontFaces.map((f) => f.load())]);
   console.timeEnd("Load Assets");
   console.time("Load Font");
   FontFaces.forEach((f) => {
      if (f.weight !== "normal" || f.style !== "normal") {
         return;
      }
      BitmapFont.from(
         f.family,
         {
            fill: "#ffffff",
            fontSize: 64,
            fontFamily: f.family,
            fontWeight: f.weight as TextStyleFontWeight,
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

   try {
      G.save = await loadGame();
      migrateSave(G.save);
      if (G.save.options.version !== SupportedSaveVersion) {
         hideLoading();
         showModal(
            <IncompatibleSaveModal supportedVersion={SupportedSaveVersion} saveVersion={G.save.options.version} />,
         );
         return;
      }
   } catch (error) {
      isNewPlayer = true;
   }

   if (import.meta.env.DEV) {
      G.tileEditor = jsonDecode(Rome);
      G.tileEditor.forEach((data, tile) => {
         if (!data.province) {
            throw new Error(`Invalid tile config: ${tile}: ${JSON.stringify(data)}`);
         }
         data.culture = Province[data.province].culture;
         data.religion = Province[data.province].religion;
      });
      // console.log(jsonEncode(G.tileEditor));
      // G.tileEditor = new Map<Tile, ITileData>();
      // const saved = await idbGet<Map<Tile, ITileData>>("TileEditor");
      // if (saved) {
      //    const provinces = new Set<Province>(Province);
      //    saved.forEach((data, tile) => {
      //       if (!data.terrain || !Terrain.includes(data.terrain)) {
      //          data.terrain = "Plain";
      //       }
      //       if (data.province && !Province.includes(data.province)) {
      //          data.province = undefined;
      //       }
      //       if (data.province) {
      //          provinces.delete(data.province);
      //       }
      //    });
      //    G.tileEditor = saved;
      //    idbSet("TileEditor", G.tileEditor);
      //    console.log(jsonEncode(G.tileEditor));
      //    console.log(provinces);
      // }
   }

   if (isNewPlayer) {
      G.save = new SaveGame();
      initSaveGame(G.save);
      G.save.state.flags = setFlag(G.save.state.flags, GameStateFlags.ShowTutorial);
   }

   setLanguage(G.save.options.language);
   loadSounds();
   addDebugFunctions();
   checkTextures();
   validateConfig();
   // connectWebSocket();
   // try {
   //    await Promise.race([OnConnectionChanged.toPromise((connected) => connected), rejectIn(10)]);
   // } catch (error) {
   //    console.error(error);
   //    showError(String(error));
   // }
   loadGameScene();
   startGameLoop();
   showBootstrapModal(G.save, isNewPlayer);
   hideLoading();
   initHighlighter();
   setInterval(() => saveGame(G.save), isSteam() ? 60_000 : 10_000);
}

function initErrorTracking(): void {
   if (import.meta.env.DEV) {
      return;
   }
   Sentry.init({
      dsn: SentryDSN,
      sendDefaultPii: true,
      release: getVersion(),
   });
}
