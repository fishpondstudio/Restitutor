import { entriesOf, forEach, keysOf, randInt, range, type Tile, uuid4 } from "@project/shared/src/utils/Helper";
import { WorldScene } from "../scenes/WorldScene";
import { BarbarianRaidModal } from "../ui/BarbarianRaidModal";
import { ChronicleModal } from "../ui/ChronicleModal";
import { showPanel } from "../ui/common/ShowPanel";
import { DeclareWarOnUsModal } from "../ui/DeclareWarOnUsModal";
import { DrawnIntoWarModal } from "../ui/DrawnIntoWarModal";
import { EcumenicalCouncilPage } from "../ui/EcumenicalCouncilPage";
import { GreatWorkCompletedModal } from "../ui/GreatWorkCompletedModal";
import { InvaderConqueredWarGoalModal } from "../ui/InvaderConqueredWarGoalModal";
import { InvaderSueForWhitePeaceModal } from "../ui/InvaderSueForWhitePeaceModal";
import { RestorationBonusModal } from "../ui/RestorationBonusModal";
import { WarEndedModal } from "../ui/WarEndedModal";
import { G, isDev } from "../utils/Global";
import { renderMap } from "./ASCIIMapRenderer";
import { type IFamily, PersonFlags } from "./definitions/Family";
import { GreatWork } from "./definitions/GreatWork";
import type { Province } from "./definitions/Province";
import { SpawnedProvinces } from "./definitions/SpawnedProvince";
import { TileName } from "./definitions/TileName";
import type { TimedAction } from "./definitions/TimedAction";
import { GameStateUpdated, RefreshTiles } from "./Events";
import { resetGame, saveGame } from "./LoadSave";
import { monthToDate } from "./logic/GameDateTime";
import { ensureHeir, findFamilyById } from "./logic/GovernorLogic";
import { rebirth } from "./logic/LegacyUpgradeLogic";
import { addProvinceResource, GovernorMaxExcl, GovernorMinIncl, spawnProvince } from "./logic/ProvinceLogic";
import { addGameEvent } from "./logic/TickProvince";
import { settleTile } from "./logic/TileLogic";
import { startTimedAction } from "./logic/TimedActionLogic";
import { type IWar, WarFlag, WarLogFlag } from "./logic/WarLogic";
import { randomFemaleName, randomMaleName } from "./RomanNames";
import { DefaultShortcuts } from "./ShortcutDefinition";

export function addDebugFunctions(): void {
   if (!isDev()) return;
   // @ts-expect-error
   globalThis.G = G;
   // @ts-expect-error
   globalThis.reset = async () => {
      await resetGame();
      window.location.reload();
   };
   // @ts-expect-error
   globalThis.rebirth = async (province: Province) => {
      rebirth(province, G.save);
      await saveGame(G.save);
      window.location.reload();
   };
   // @ts-expect-error
   globalThis.save = async () => {
      await saveGame(G.save);
      window.location.reload();
   };
   // @ts-expect-error
   globalThis.addResources = () => {
      addProvinceResource("gold", 100_000, G.save.state.playerProvince, G.save);
      addProvinceResource("administrative", 10_000, G.save.state.playerProvince, G.save);
      addProvinceResource("military", 10_000, G.save.state.playerProvince, G.save);
      addProvinceResource("diplomatic", 10_000, G.save.state.playerProvince, G.save);
      addProvinceResource("legacy", 1_000, G.save.state.playerProvince, G.save);
      GameStateUpdated.emit();
   };
   // @ts-expect-error
   globalThis.migrate = () => {
      G.save.options.shortcuts = DefaultShortcuts;
   };
   // @ts-expect-error
   globalThis.showEvent = (event: GameEvent) => {
      addGameEvent(event, G.save.state.playerProvince, G.save);
   };
   // @ts-expect-error
   globalThis.initDiplomacy = () => {
      GameStateUpdated.emit();
   };
   // @ts-expect-error
   globalThis.showChronicle = () => {
      showPanel(ChronicleModal, {
         years: [monthToDate(G.save.state.month).getFullYear() - 1, monthToDate(G.save.state.month).getFullYear() - 1],
      });
   };

   // @ts-expect-error
   globalThis.showRestorationBonus = () => {
      showPanel(RestorationBonusModal, {});
   };

   // @ts-expect-error
   globalThis.startTimedAction = (timedAction: TimedAction) => {
      startTimedAction(timedAction, G.save.state.playerProvince, G.save);
      GameStateUpdated.emit();
   };

   const warOnUs: IWar = {
      attacker: "Aquitania",
      coAttackers: new Map(),
      defender: G.save.state.playerProvince,
      coDefenders: new Map(),
      tiles: new Set([G.save.state.provinces.Lugdunensis?.capital ?? 0]),
      casusBelli: "ConquestMission",
      requiredWarScore: 100,
      actualWarScore: 0,
      log: range(1, 23).map((i) => {
         return {
            month: i,
            rolls: [0.5, 0.5, 0.5],
            successChance: 0.5,
            result: "Success",
            flag: WarLogFlag.None,
         };
      }),
      flag: WarFlag.None,
   };

   const wasAsCoalition: IWar = {
      attacker: "Aquitania",
      coAttackers: new Map(),
      defender: "Germania",
      coDefenders: new Map([[G.save.state.playerProvince, { value: true, breakdown: [] }]]),
      tiles: new Set([G.save.state.provinces.Germania?.capital ?? 0]),
      casusBelli: "ConquestMission",
      requiredWarScore: 100,
      actualWarScore: 0,
      log: range(1, 23).map((i) => {
         return {
            month: i,
            rolls: [0.5, 0.5, 0.5],
            successChance: 0.5,
            result: "Success",
            flag: WarLogFlag.None,
         };
      }),
      flag: WarFlag.None,
   };

   // @ts-expect-error
   globalThis.declareWarOnUs = () => {
      showPanel(DeclareWarOnUsModal, { war: warOnUs });
   };
   // @ts-expect-error
   globalThis.drawnIntoWar = () => {
      showPanel(DrawnIntoWarModal, { war: wasAsCoalition });
   };
   // @ts-expect-error
   globalThis.invaderSueForWhitePeace = () => {
      showPanel(InvaderSueForWhitePeaceModal, { war: warOnUs });
   };
   // @ts-expect-error
   globalThis.invaderConqueredWarGoal = () => {
      showPanel(InvaderConqueredWarGoalModal, { war: warOnUs });
   };
   // @ts-expect-error
   globalThis.warEnded = () => {
      showPanel(WarEndedModal, { war: wasAsCoalition });
   };
   // @ts-expect-error
   globalThis.undoTutorial = (number = 1) => {
      G.save.state.completedTutorials = new Set(Array.from(G.save.state.completedTutorials).slice(0, -number));
      GameStateUpdated.emit();
   };
   // @ts-expect-error
   globalThis.selectTiles = (tiles: number[]) => {
      const scene = G.scene.getCurrent(WorldScene);
      if (!scene) {
         return;
      }
      scene.drawSelectors(new Set(tiles));
   };
   // @ts-expect-error
   globalThis.spawnProvinces = () => {
      const tiles: Tile[] = [];
      forEach(SpawnedProvinces, (province) => {
         spawnProvince(province, "Debug", G.save).forEach((tile) => {
            tiles.push(tile);
         });
      });
      RefreshTiles.emit({ tiles: tiles, options: { visual: true, indicator: true } });
      GameStateUpdated.emit();
   };
   // @ts-expect-error
   globalThis.showBarbarian = () => {
      showPanel(BarbarianRaidModal, {});
   };
   // @ts-expect-error
   globalThis.showEcumenicalCouncil = () => {
      startTimedAction("EcumenicalCouncil2", G.save.state.playerProvince, G.save);
      showPanel(EcumenicalCouncilPage, {});
   };
   // @ts-expect-error
   globalThis.addChild = (id: string, female: boolean) => {
      const family = findFamilyById(id, G.save);
      if (!family) {
         return;
      }
      doAddChild(family, female);
      GameStateUpdated.emit();
   };

   // @ts-expect-error
   globalThis.printSquare = () => {
      console.log(renderMap(G.save, false));
   };

   // @ts-expect-error
   globalThis.showNamedTiles = () => {
      G.scene.getCurrent(WorldScene)?.drawSelectors(new Set(keysOf(TileName)));
   };

   // @ts-expect-error
   globalThis.printHex = () => {
      console.log(renderMap(G.save, true));
   };

   // @ts-expect-error
   globalThis.showGreatWorks = () => {
      G.scene.getCurrent(WorldScene)?.drawSelectors(new Set(entriesOf(GreatWork).map(([key, value]) => value.tile)));
   };

   // @ts-expect-error
   globalThis.settle = (tile: Tile, province: Province) => {
      settleTile(tile, province, G.save);
      RefreshTiles.emit({ tiles: [tile], options: { indicator: true, visual: true } });
   };

   // @ts-expect-error
   globalThis.completeGreatWork = () => {
      showPanel(GreatWorkCompletedModal, { greatWork: "DiocletiansPalace" });
   };

   function doAddChild(family: IFamily, female: boolean): void {
      if (!family.male || !family.female) {
         return;
      }
      if (female) {
         family.children.push({
            id: uuid4(),
            male: null,
            female: {
               traits: new Set(),
               name: randomFemaleName(family.male.name[1]),
               age: 0,
               administrative: randInt(GovernorMinIncl, GovernorMaxExcl),
               diplomatic: randInt(GovernorMinIncl, GovernorMaxExcl),
               military: randInt(GovernorMinIncl, GovernorMaxExcl),
               province: G.save.state.playerProvince,
               flag: PersonFlags.None,
               joinMonth: G.save.state.month,
            },
            concubines: [],
            children: [],
         });
      } else {
         family.children.push({
            id: uuid4(),
            male: {
               traits: new Set(),
               name: randomMaleName(family.male.name[1]),
               age: 0,
               administrative: randInt(GovernorMinIncl, GovernorMaxExcl),
               diplomatic: randInt(GovernorMinIncl, GovernorMaxExcl),
               military: randInt(GovernorMinIncl, GovernorMaxExcl),
               province: G.save.state.playerProvince,
               flag: PersonFlags.None,
               joinMonth: G.save.state.month,
            },
            female: null,
            concubines: [],
            children: [],
         });
      }
      family.children.forEach((child) => {
         doAddChild(child, female);
      });
      ensureHeir(G.save.state.playerProvince, G.save);
   }
}
