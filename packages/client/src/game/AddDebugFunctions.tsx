import { randInt, range, uuid4 } from "@project/shared/src/utils/Helper";
import { ChronicleModal } from "../ui/ChronicleModal";
import { DeclareWarOnUsModal } from "../ui/DeclareWarOnUsEventModal";
import { DrawnIntoWarModal } from "../ui/DrawnIntoWarEventModal";
import { InvaderConqueredWarGoalModal } from "../ui/InvaderConqueredWarGoalModal";
import { InvaderSueForWhitePeaceModal } from "../ui/InvaderSueForWhitePeaceModal";
import { WarEndedModal } from "../ui/WarEndedModal";
import { G } from "../utils/Global";
import { showModal } from "../utils/ModalManager";
import { PersonFlags } from "./definitions/Family";
import { GameStateUpdated } from "./Events";
import { resetGame, saveGame } from "./LoadSave";
import { rebirth } from "./logic/LegacyUpgradeLogic";
import { addProvinceResource, GovernorMaxExcl, GovernorMinIncl } from "./logic/ProvinceLogic";
import { monthToDate } from "./logic/TickLogic";
import { addGameEvent } from "./logic/TickProvince";
import { forceAlliance } from "./logic/TreatyLogic";
import { type IWar, WarFlag, WarLogFlag } from "./logic/WarLogic";
import { randomFemaleName, randomMaleName } from "./RomanNames";
import { DefaultShortcuts } from "./ShortcutDefinition";

export function addDebugFunctions(): void {
   if (!import.meta.env.DEV) return;
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
   globalThis.forceAlliance = (province: Province) => {
      forceAlliance(G.save.state.playerProvince, province, G.save);
      GameStateUpdated.emit();
   };
   // @ts-expect-error
   globalThis.completeMissions = () => {
      // TODO: Implement
      GameStateUpdated.emit();
   };
   // @ts-expect-error
   globalThis.showChronicle = () => {
      showModal(
         <ChronicleModal
            years={[
               monthToDate(G.save.state.month).getFullYear() - 1,
               monthToDate(G.save.state.month).getFullYear() - 1,
            ]}
         />,
      );
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
            roll: 0.5,
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
            roll: 0.5,
            successChance: 0.5,
            result: "Success",
            flag: WarLogFlag.None,
         };
      }),
      flag: WarFlag.None,
   };

   // @ts-expect-error
   globalThis.declareWarOnUs = () => {
      showModal(<DeclareWarOnUsModal war={warOnUs} />);
   };
   // @ts-expect-error
   globalThis.drawnIntoWar = () => {
      showModal(<DrawnIntoWarModal war={wasAsCoalition} />);
   };
   // @ts-expect-error
   globalThis.invaderSueForWhitePeace = () => {
      showModal(<InvaderSueForWhitePeaceModal war={warOnUs} />);
   };
   // @ts-expect-error
   globalThis.invaderConqueredWarGoal = () => {
      showModal(<InvaderConqueredWarGoalModal war={warOnUs} />);
   };
   // @ts-expect-error
   globalThis.warEnded = () => {
      showModal(<WarEndedModal war={wasAsCoalition} />);
   };
   // @ts-expect-error
   globalThis.undoTutorial = () => {
      G.save.state.completedTutorials = new Set(Array.from(G.save.state.completedTutorials).slice(0, -1));
      GameStateUpdated.emit();
   };
   // @ts-expect-error
   globalThis.addChild = (female: boolean) => {
      const governor = G.save.state.provinces[G.save.state.playerProvince]?.governor;
      if (!governor) {
         return;
      }
      if (female) {
         governor.children.push({
            id: uuid4(),
            male: null,
            female: {
               traits: new Set(),
               name: randomFemaleName(governor.male.name[1]),
               age: 0,
               administrative: randInt(GovernorMinIncl, GovernorMaxExcl),
               diplomatic: randInt(GovernorMinIncl, GovernorMaxExcl),
               military: randInt(GovernorMinIncl, GovernorMaxExcl),
               province: G.save.state.playerProvince,
               flag: PersonFlags.None,
            },
            children: [],
         });
      } else {
         governor.children.push({
            id: uuid4(),
            male: {
               traits: new Set(),
               name: randomMaleName(governor.male.name[1]),
               age: 0,
               administrative: randInt(GovernorMinIncl, GovernorMaxExcl),
               diplomatic: randInt(GovernorMinIncl, GovernorMaxExcl),
               military: randInt(GovernorMinIncl, GovernorMaxExcl),
               province: G.save.state.playerProvince,
               flag: PersonFlags.None,
            },
            female: null,
            children: [],
         });
      }
   };
}
