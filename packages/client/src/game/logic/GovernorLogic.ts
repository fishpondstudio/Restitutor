import dagre from "@dagrejs/dagre";
import {
   clamp,
   clearFlag,
   entriesOf,
   filterInPlace,
   hasFlag,
   randInt,
   setFlag,
   shuffle,
   uuid4,
} from "@project/shared/src/utils/Helper";
import { type Edge, MarkerType, type Node, Position } from "@xyflow/react";
import { remToPx } from "../../ui/common/UIScaling";
import type { FamilyNode } from "../../ui/FamilyNode";
import { GovernorWithoutHeirModal } from "../../ui/GovernorWithoutHeirModal";
import { startTrack } from "../../ui/Music";
import { NewGovernorModal } from "../../ui/NewGovernorModal";
import { FamilyNodeHeight, FamilyNodeWidth } from "../../ui/UIConstant";
import { $t, L } from "../../utils/i18n";
import type { IValueBreakdown } from "../actions/GameAction";
import { finalizeBreakdown, makeValueBreakdown } from "../actions/GameAction";
import type { IFamily, IFullFamily, IGovernorFamily, IPerson } from "../definitions/Family";
import { PersonFlags } from "../definitions/Family";
import { GovernorTraits, PersonTrait } from "../definitions/PersonTrait";
import type { Province } from "../definitions/Province";
import { isChristianReligion } from "../definitions/Religion";
import { showGameEventModal } from "../events/GameEventLogic";
import { applyGameEffect, type ICustomEffect, type IGameEffect } from "../GameEffect";
import type { SaveGame } from "../GameState";
import type { INameGenerator } from "../scenarios/Scenarios";
import { getTKCharacterTierToSkill, type TKCharacter, TKCharacters } from "../ThreeKingdoms/TKCharacter";
import { onGeneralEnded } from "./ArmyLogic";
import { formatPersonName } from "./NameLogic";
import { getNameGenerator, hasScenarioFlag } from "./ScenarioLogic";
import {
   ageTKCharacter,
   getTKCharacterName,
   getTKCharacterProvince,
   isTKCharacterAlive,
   killTKCharacter,
   transferTKCharacter,
   unassignTKCharacter,
} from "./TKCharacterLogic";

export const GovernorMinIncl = 3;
export const GovernorMaxIncl = 6;
export const GovernorMaxExcl = GovernorMaxIncl + 1;

export const NewGovernorEffect = {
   modifiers: {
      Prestige: { type: "multiply", value: -0.1, duration: 12 },
   },
} as const satisfies IGameEffect;

export const GovernorWithoutHeirEffect = {
   modifiers: {
      Prestige: { type: "multiply", value: -0.1, duration: 36 },
      Stability: { type: "add", value: -10, duration: 36 },
   },
} as const satisfies IGameEffect;

export const NewChildBornEffects1 = {
   resources: { gold: 1000 },
} as const satisfies IGameEffect;

export const NewChildBornEffects2 = {
   modifiers: {
      Stability: { type: "add", value: 10, duration: 12 },
   },
} as const satisfies IGameEffect;

export const RecognizeIllegitimateChildEffect = {
   modifiers: {
      Stability: { type: "add", value: -5, duration: 12 * 5 },
      Prestige: { type: "multiply", value: -0.05, duration: 12 * 5 },
   },
} as const satisfies IGameEffect;

export function getRecognizeIllegitimateChildEffect(province: Province, save: SaveGame): IGameEffect {
   const state = save.state.provinces[province];
   return {
      ...RecognizeIllegitimateChildEffect,
      resources: state && isChristianReligion(state.religion) ? { christianity: -5 } : undefined,
   };
}

export function getDeathChance(governor: IPerson, province: Province, save: SaveGame): IValueBreakdown {
   const age = governor.age;
   const breakdown: IValueBreakdown = makeValueBreakdown({ reverse: true });
   breakdown.add.push({
      name: $t(L.AgeAbove$1, "30"),
      value: 0.5 * clamp(age - 30, 0, 100),
      desc: $t(L.$1PerAgeAbove$2, "0.5", "30"),
   });
   breakdown.add.push({
      name: $t(L.AgeAbove$1, "40"),
      value: 1 * clamp(age - 40, 0, 100),
      desc: $t(L.$1PerAgeAbove$2, "1", "40"),
   });
   breakdown.add.push({
      name: $t(L.AgeAbove$1, "50"),
      value: 1.5 * clamp(age - 50, 0, 100),
      desc: $t(L.$1PerAgeAbove$2, "1.5", "50"),
   });

   if (hasFlag(governor.flag, PersonFlags.IsGeneral)) {
      breakdown.add.push({ name: $t(L.CurrentlyAGeneral), value: 10 });
   }

   return finalizeBreakdown(breakdown);
}

export const MinimumOffspringAge = 15;

export interface IGovernorBirth {
   child: IFamily;
   legitimate: boolean;
}

export interface ITickFamilyResult {
   family: IFamily;
   births: IGovernorBirth[];
}

export function getOffspringChance(
   family: IFamily,
   female: IPerson,
   province: Province,
   save: SaveGame,
): IValueBreakdown {
   const breakdown: IValueBreakdown = makeValueBreakdown();
   if (!family.male || !female) {
      breakdown.add.push({ name: $t(L.NoPartner), value: 0 });
      return finalizeBreakdown(breakdown);
   }
   if (family.male.age < MinimumOffspringAge) {
      breakdown.add.push({ name: $t(L.FathersAgeBelow$1, "15"), value: 0 });
      return finalizeBreakdown(breakdown);
   }
   if (female.age < MinimumOffspringAge) {
      breakdown.add.push({ name: $t(L.MothersAgeBelow$1, "15"), value: 0 });
      return finalizeBreakdown(breakdown);
   }
   // Only apply Fertile trait of the governor!
   if (family.male === save.state.provinces[province]?.governor.male && family.male.traits.has("Fertile")) {
      breakdown.add.push({ name: $t(L.GovernorsTrait$1, PersonTrait.Fertile.name()), value: 2 });
   }
   const age = female.age;
   if (age >= 15 && age <= 35) {
      breakdown.add.push({
         name: $t(L.MothersAgeFrom$1To$2, "15", "35"),
         value: 10,
         desc: $t(L.$1WhenAgeIsInThisAgeRange, "10"),
      });
      return finalizeBreakdown(breakdown);
   }
   if (age >= 36 && age <= 45) {
      breakdown.add.push({
         name: $t(L.MothersAgeFrom$1To$2, "36", "45"),
         value: 5,
         desc: $t(L.$1WhenAgeIsInThisAgeRange, "5"),
      });
      return finalizeBreakdown(breakdown);
   }
   if (age > 45) {
      breakdown.add.push({
         name: $t(L.MothersAgeAbove$1, "45"),
         value: 1,
         desc: $t(L.$1WhenAgeIsInThisAgeRange, "1"),
      });
      return finalizeBreakdown(breakdown);
   }
   return finalizeBreakdown(breakdown);
}

export function generateRandomGovernor(
   province: Province,
   nameGenerator: INameGenerator,
   joinMonth = 0,
): IGovernorFamily {
   return {
      id: uuid4(),
      male: ensureTraits({
         traits: new Set(),
         name: nameGenerator.randomName({ gender: "male" }),
         flag: PersonFlags.None,
         administrative: randInt(GovernorMinIncl, GovernorMaxExcl),
         diplomatic: randInt(GovernorMinIncl, GovernorMaxExcl),
         military: randInt(GovernorMinIncl, GovernorMaxExcl),
         age: randInt(20, 30),
         province: province,
         joinMonth,
      }),
      female: null,
      concubines: [],
      children: [],
   };
}

export function makeTKCharacterGovernor(character: TKCharacter, governor: IPerson): void {
   const config = TKCharacters[character];
   const [familyName, givenName] = config.name();
   governor.character = character;
   governor.name = [familyName, givenName];
   governor.administrative = getTKCharacterTierToSkill(config.tier);
   governor.diplomatic = getTKCharacterTierToSkill(config.tier);
   governor.military = getTKCharacterTierToSkill(config.tier);
}

export function tkGovernorDeathEffect(character: TKCharacter): ICustomEffect {
   return {
      desc: () => $t(L.$1Dies, getTKCharacterName(character).fullName),
      execute: (province, save) => {
         const family = save.state.provinces[province]?.governor;
         if (family?.male?.character === character) {
            onFamilyMemberDead(family.male, province, save);
            doGovernorSuccession(province, save);
         }
      },
   };
}

export function tkCharacterSuccessionEffect(successor: TKCharacter): ICustomEffect {
   return {
      desc: (province, save) => {
         const incumbent = formatPersonName(save.state.provinces[province]?.governor.male.name);
         return $t(L.$1Succeeds$2AsGovernor, getTKCharacterName(successor).fullName, incumbent);
      },
      execute: (province, save) => {
         const state = save.state.provinces[province];
         if (!state) {
            return;
         }
         const incumbent = state.governor.male;
         if (incumbent.character === successor || !transferTKCharacter(successor, province, save)) {
            return;
         }
         unassignTKCharacter(successor, province, save);
         const household = generateRandomGovernor(
            province,
            getNameGenerator(save.state.scenario, save.options.language),
            save.state.month,
         );
         makeTKCharacterGovernor(successor, household.male);
         if (hasFlag(incumbent.flag, PersonFlags.IsGeneral)) {
            onGeneralEnded(province, save);
         }
         if (incumbent.character) {
            killTKCharacter(incumbent.character, save);
         }
         state.governor = household;
      },
   };
}

export function ensureTraits(person: IPerson): IPerson {
   const expected = Math.floor(person.age / 10);
   const candidates = shuffle(GovernorTraits.filter((trait) => !person.traits.has(trait)));
   while (person.traits.size < expected && candidates.length > 0) {
      const trait = candidates.pop();
      if (trait) {
         person.traits.add(trait);
      }
   }
   return person;
}

function findMaleDescendant(family: IFamily, predicate: (person: IPerson) => boolean): IFamily | undefined {
   const descendants = [...family.children];
   for (let index = 0; index < descendants.length; index++) {
      const descendant = descendants[index];
      if (descendant.male && predicate(descendant.male)) {
         return descendant;
      }
      descendants.push(...descendant.children);
   }
   return undefined;
}

export function getSuccessor(province: Province, save: SaveGame): IFamily | undefined {
   const governor = save.state.provinces[province]?.governor;
   if (!governor) {
      return undefined;
   }
   return (
      findMaleDescendant(governor, (person) => hasFlag(person.flag, PersonFlags.IsHeir)) ??
      findMaleDescendant(governor, () => true)
   );
}

export function doGovernorSuccession(province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   const isPlayer = province === save.state.playerProvince;
   if (isPlayer) {
      startTrack("Funeral");
   }
   const successor = getSuccessor(province, save);
   if (successor?.male) {
      successor.male.flag = clearFlag(successor.male.flag, PersonFlags.IsHeir);
      state.governor = successor as IGovernorFamily;
      applyGameEffect(NewGovernorEffect, $t(L.$1Event, $t(L.ANewGovernor)), province, save);
      if (isPlayer) {
         showGameEventModal(NewGovernorModal, { province, governor: state.governor });
      }
   } else {
      state.governor = generateRandomGovernor(
         province,
         getNameGenerator(save.state.scenario, save.options.language),
         save.state.month,
      );
      applyGameEffect(GovernorWithoutHeirEffect, $t(L.$1Event, $t(L.ANewGovernor)), province, save);
      if (isPlayer) {
         showGameEventModal(GovernorWithoutHeirModal, { province, governor: state.governor });
      }
   }
   ensureHeir(province, save);
}

export function isGovernorSon(family: IFamily, province: Province, save: SaveGame): boolean {
   const governor = save.state.provinces[province]?.governor;
   if (governor && family.male && governor.children.includes(family)) {
      return true;
   }
   return false;
}

export function setHeir(heir: IFamily, province: Province, save: SaveGame): void {
   const governor = save.state.provinces[province]?.governor;
   if (!governor || !heir.male || !governor.children.includes(heir)) {
      return;
   }
   for (const child of governor.children) {
      if (child.male) {
         child.male.flag = clearFlag(child.male.flag, PersonFlags.IsHeir);
      }
   }
   heir.male.flag = setFlag(heir.male.flag, PersonFlags.IsHeir);
}

export function ensureHeir(province: Province, save: SaveGame): void {
   const governor = save.state.provinces[province]?.governor;
   if (!governor) {
      return;
   }
   const heir =
      governor.children.find((child) => child.male && hasFlag(child.male.flag, PersonFlags.IsHeir)) ??
      governor.children.find((child) => child.male);
   if (heir) {
      setHeir(heir, province, save);
   }
}

export function recognizeIllegitimateChild(parentId: string, child: IFamily, province: Province, save: SaveGame): void {
   const parent = findFamilyById(parentId, save);
   if (!parent || parent.children.some((existingChild) => existingChild.id === child.id)) {
      return;
   }
   parent.children.push(child);
   applyGameEffect(
      getRecognizeIllegitimateChildEffect(province, save),
      $t(L.$1Event, $t(L.AQuestionOfLegitimacy)),
      province,
      save,
   );
   ensureHeir(province, save);
}

export function tickFamily(governor: IFamily, province: Province, save: SaveGame): ITickFamilyResult {
   const result: ITickFamilyResult = { family: governor, births: [] };
   tickFamilyMembers(governor, province, save, result.births);
   removeEmptyDescendantFamilies(governor);
   return result;
}

function onFamilyMemberDead(person: IPerson, province: Province, save: SaveGame): void {
   if (hasFlag(person.flag, PersonFlags.IsGeneral)) {
      onGeneralEnded(province, save);
   }
   if (person.character && getTKCharacterProvince(person.character, save) === province) {
      killTKCharacter(person.character, save);
   }
}

function tickFamilyMembers(
   family: IFamily,
   province: Province,
   save: SaveGame,
   governorBirths?: IGovernorBirth[],
): void {
   const existingChildren = [...family.children];
   if (family.male) {
      family.male.age++;
      if (family.male.character && getTKCharacterProvince(family.male.character, save) === province) {
         ageTKCharacter(family.male.character, 12, save);
      }
      ensureTraits(family.male);
      const deathChance = getDeathChance(family.male, province, save).value;
      const character = family.male.character;
      const characterDied =
         character !== undefined &&
         getTKCharacterProvince(character, save) === province &&
         !isTKCharacterAlive(character, save);
      if (Math.random() < deathChance / 100 || characterDied) {
         onFamilyMemberDead(family.male, province, save);
         family.male = null;
      }
   }
   if (family.female) {
      family.female.age++;
      ensureTraits(family.female);
      const deathChance = getDeathChance(family.female, province, save).value;
      if (Math.random() < deathChance / 100) {
         family.female = null;
      }
   }
   filterInPlace(family.concubines, (concubine) => {
      concubine.age++;
      ensureTraits(concubine);
      return Math.random() >= getDeathChance(concubine, province, save).value / 100;
   });

   const male = family.male;
   if (male) {
      const nameGenerator = getNameGenerator(save.state.scenario, save.options.language);
      const familyName = nameGenerator.getFamilyName(male.name);
      const females = family.female ? [family.female, ...family.concubines] : family.concubines;
      for (const female of females) {
         const offspringChance = getOffspringChance(family, female, province, save).value;
         if (Math.random() >= offspringChance / 100) {
            continue;
         }
         const isMale = Math.random() < 0.5;
         const [administrativeMin, administrativeMax] = getOffspringSkillRangeIncl(
            male.administrative,
            female.administrative,
         );
         const [diplomaticMin, diplomaticMax] = getOffspringSkillRangeIncl(male.diplomatic, female.diplomatic);
         const [militaryMin, militaryMax] = getOffspringSkillRangeIncl(male.military, female.military);
         const person: IPerson = ensureTraits({
            name: nameGenerator.randomName({
               gender: isMale ? "male" : "female",
               familyName,
            }),
            flag: PersonFlags.None,
            age: 0,
            traits: new Set(),
            administrative: randInt(administrativeMin, administrativeMax + 1),
            diplomatic: randInt(diplomaticMin, diplomaticMax + 1),
            military: randInt(militaryMin, militaryMax + 1),
            province: province,
            joinMonth: save.state.month,
         });
         const offspring: IFamily = {
            id: uuid4(),
            male: isMale ? person : null,
            female: isMale ? null : person,
            concubines: [],
            children: [],
         };
         if (governorBirths) {
            if (hasScenarioFlag("Concubinage", save) && female !== family.female) {
               person.flag = setFlag(person.flag, PersonFlags.IsFromConcubine);
            }
            const legitimate = hasScenarioFlag("Concubinage", save) || female === family.female;
            governorBirths.push({ child: offspring, legitimate });
            if (legitimate) {
               family.children.push(offspring);
            }
         } else {
            family.children.push(offspring);
         }
      }
   }

   for (const offspring of existingChildren) {
      tickFamilyMembers(offspring, province, save);
   }
}

export function getOffspringSkillRangeIncl(father: number, mother: number): [number, number] {
   return [
      clamp(Math.min(father - 1, mother - 1), GovernorMinIncl, GovernorMaxIncl),
      clamp(Math.max(father + 1, mother + 1), GovernorMinIncl, GovernorMaxIncl),
   ];
}

function makeFamilyNode(family: IFamily, nodes: FamilyNode[], edges: Edge[]): void {
   nodes.push({
      id: family.id,
      data: { family: family },
      type: "FamilyNode",
      position: { x: 0, y: 0 },
   });
   for (let i = family.children.length - 1; i >= 0; i--) {
      const offspring = family.children[i];
      edges.push({
         id: `${family.id}=>${offspring.id}`,
         source: family.id,
         target: offspring.id,
         markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12, color: "var(--mantine-color-dark-3)" },
         style: {
            strokeWidth: 2,
            stroke: "var(--mantine-color-dark-3)",
            filter: "drop-shadow(0 0 0.5rem rgba(0, 0, 0, 0.7))",
         },
      });
      makeFamilyNode(offspring, nodes, edges);
   }
}

export function makeFamilyTree(family: IFamily): { nodes: Node[]; edges: Edge[] } {
   const nodes: FamilyNode[] = [];
   const edges: Edge[] = [];
   makeFamilyNode(family, nodes, edges);
   return getLayoutElements({
      nodes,
      edges,
      nodeWidth: remToPx(FamilyNodeWidth),
      nodeHeight: remToPx(FamilyNodeHeight),
   });
}

export function getLayoutElements({
   nodes,
   edges,
   nodeWidth,
   nodeHeight,
}: {
   nodes: Node[];
   edges: Edge[];
   nodeWidth: number;
   nodeHeight: number;
}): { nodes: Node[]; edges: Edge[] } {
   const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
   dagreGraph.setGraph({ rankdir: "TB" });
   nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
   });
   edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
   });
   dagre.layout(dagreGraph);
   const newNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      const newNode: Node = {
         ...node,
         sourcePosition: Position.Bottom,
         targetPosition: Position.Top,
         // We are shifting the dagre node position (anchor=center center) to the top left
         // so it matches the React Flow node anchor point (top left).
         position: {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
         },
      };
      return newNode;
   });

   return { nodes: newNodes, edges };
}

export function isEligibleForMarriage(family: IFamily): boolean {
   return Boolean((family.male && !family.female) || (family.female && !family.male && family.children.length === 0));
}

export function canGetMarried(family1: IFamily, family2: IFamily): boolean {
   return (
      isEligibleForMarriage(family1) &&
      isEligibleForMarriage(family2) &&
      Boolean((family1.male && family2.female) || (family1.female && family2.male))
   );
}

export function getSpousesFromOtherProvinces(family: IFamily, province: Province, save: SaveGame): IFamily[] {
   const result: IFamily[] = [];
   if (!isEligibleForMarriage(family)) {
      return result;
   }
   for (const [otherProvince, otherProvinceState] of entriesOf(save.state.provinces)) {
      if (otherProvince === province) {
         continue;
      }
      for (const candidate of getEligibleForMarriage(otherProvinceState.governor)) {
         if (canGetMarried(family, candidate)) {
            result.push(candidate);
         }
      }
   }
   return result;
}

export function removeEmptyFamily(save: SaveGame): void {
   for (const [_, state] of entriesOf(save.state.provinces)) {
      removeEmptyDescendantFamilies(state.governor);
   }
}

function removeEmptyDescendantFamilies(family: IFamily): void {
   filterInPlace(family.children, (child) => {
      removeEmptyDescendantFamilies(child);
      return shouldRetainFamily(child);
   });
}

function shouldRetainFamily(family: IFamily): boolean {
   return Boolean(family.male || family.female || family.children.length > 0);
}

export function getFamilyMemberFrom(family: IFamily, fromProvince: Province, save: SaveGame): IFullFamily[] {
   const result: IFullFamily[] = [];
   if (family.male && family.female && family.male?.province === fromProvince) {
      result.push(family as IFullFamily);
   }
   if (family.male && family.female && family.female?.province === fromProvince) {
      result.push(family as IFullFamily);
   }
   for (const child of family.children) {
      result.push(...getFamilyMemberFrom(child, fromProvince, save));
   }
   return result;
}

export function getEligibleForMarriage(family: IFamily): IFamily[] {
   const result: IFamily[] = [];
   if (isEligibleForMarriage(family)) {
      result.push(family);
   }
   for (const child of family.children) {
      result.push(...getEligibleForMarriage(child));
   }
   return result;
}

export function findFamilyById(id: string, save: SaveGame): IFamily | undefined {
   for (const [_, state] of entriesOf(save.state.provinces)) {
      const families: IFamily[] = [state.governor];
      while (families.length > 0) {
         const family = families.pop() as IFamily;
         if (family.id === id) {
            return family;
         }
         families.push(...family.children);
      }
   }
   return undefined;
}
