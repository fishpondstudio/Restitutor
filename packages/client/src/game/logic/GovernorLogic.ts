import dagre from "@dagrejs/dagre";
import { clamp } from "@mantine/hooks";
import {
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
import { FamilyNodeHeight, FamilyNodeWidth } from "../../ui/UIConstant";
import { $t, L } from "../../utils/i18n";
import type { IValueBreakdown } from "../actions/GameAction";
import { finalizeBreakdown, makeValueBreakdown } from "../actions/GameAction";
import type { IFamily, IFullFamily, IGovernorFamily, IPerson } from "../definitions/Family";
import { PersonFlags } from "../definitions/Family";
import { GovernorTraits, PersonTrait } from "../definitions/PersonTrait";
import type { Province } from "../definitions/Province";
import type { SaveGame } from "../GameState";
import { randomFemaleName, randomMaleName } from "../RomanNames";
import { GovernorMaxExcl, GovernorMaxIncl, GovernorMinIncl } from "./ProvinceLogic";
import { onGeneralEnded } from "./WarLogic";

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

export function getOffspringChance(
   family: IFamily,
   province: Province,
   save: SaveGame,
   female: IPerson | null = family.female,
): IValueBreakdown {
   const breakdown: IValueBreakdown = makeValueBreakdown();
   if (!family.male || !female) {
      breakdown.add.push({ name: $t(L.NoSpouse), value: 0 });
      return finalizeBreakdown(breakdown);
   }
   if (family.male.age < MinimumOffspringAge) {
      breakdown.add.push({ name: $t(L.HusbandsAgeBelow$1, "15"), value: 0 });
      return finalizeBreakdown(breakdown);
   }
   if (female.age < MinimumOffspringAge) {
      breakdown.add.push({ name: $t(L.WifesAgeBelow$1, "15"), value: 0 });
      return finalizeBreakdown(breakdown);
   }
   // Only apply Fertile trait of the governor!
   if (family.male === save.state.provinces[province]?.governor.male && family.male.traits.has("Fertile")) {
      breakdown.add.push({ name: $t(L.GovernorsTrait$1, PersonTrait.Fertile.name()), value: 2 });
   }
   const age = female.age;
   if (age >= 15 && age <= 35) {
      breakdown.add.push({
         name: $t(L.WifesAgeFrom$1To$2, "15", "35"),
         value: 10,
         desc: $t(L.$1WhenAgeIsInThisAgeRange, "10"),
      });
      return finalizeBreakdown(breakdown);
   }
   if (age >= 36 && age <= 45) {
      breakdown.add.push({
         name: $t(L.WifesAgeFrom$1To$2, "36", "45"),
         value: 5,
         desc: $t(L.$1WhenAgeIsInThisAgeRange, "5"),
      });
      return finalizeBreakdown(breakdown);
   }
   if (age > 45) {
      breakdown.add.push({
         name: $t(L.WifesAgeAbove$1, "45"),
         value: 1,
         desc: $t(L.$1WhenAgeIsInThisAgeRange, "1"),
      });
      return finalizeBreakdown(breakdown);
   }
   return finalizeBreakdown(breakdown);
}

export function generateRandomGovernor(province: Province, joinMonth = 0): IGovernorFamily {
   return {
      id: uuid4(),
      male: ensureTraits({
         traits: new Set(),
         name: randomMaleName(),
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

export function getHeir(province: Province, save: SaveGame): IFamily | undefined {
   const governor = save.state.provinces[province]?.governor;
   if (!governor) {
      return undefined;
   }
   const heir = governor.children.find((child) => child.male && hasFlag(child.male.flag, PersonFlags.IsHeir));
   if (heir) {
      return heir;
   }
   return governor.children.find((child) => child.male);
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
   const heir = getHeir(province, save);
   if (heir) {
      setHeir(heir, province, save);
   }
}

export function tickFamily(governor: IFamily, province: Province, save: SaveGame): IFamily {
   if (governor.male) {
      governor.male.age++;
      ensureTraits(governor.male);
      const deathChance = getDeathChance(governor.male, province, save).value;
      if (Math.random() < deathChance / 100) {
         if (hasFlag(governor.male.flag, PersonFlags.IsGeneral)) {
            onGeneralEnded(province, save);
         }
         governor.male = null;
      }
   }
   if (governor.female) {
      governor.female.age++;
      ensureTraits(governor.female);
      const deathChance = getDeathChance(governor.female, province, save).value;
      if (Math.random() < deathChance / 100) {
         governor.female = null;
      }
   }
   filterInPlace(governor.concubines, (concubine) => {
      concubine.age++;
      ensureTraits(concubine);
      return Math.random() >= getDeathChance(concubine, province, save).value / 100;
   });

   const newOffspring = new Set<IFamily>();
   const male = governor.male;
   if (male) {
      const females = governor.female ? [governor.female, ...governor.concubines] : governor.concubines;
      for (const female of females) {
         const offspringChance = getOffspringChance(governor, province, save, female).value;
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
            name: isMale ? randomMaleName(male.name[1]) : randomFemaleName(male.name[1]),
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
         newOffspring.add(offspring);
         governor.children.push(offspring);
      }
   }

   filterInPlace(governor.children, (offspring) => {
      if (newOffspring.has(offspring)) {
         return true;
      }
      const result = tickFamily(offspring, province, save);
      return Boolean(result.male || result.female || result.concubines.length > 0);
   });
   return governor;
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
      nodes.push({
         id: offspring.id,
         data: { family: offspring },
         type: "FamilyNode",
         position: { x: 0, y: 0 },
      });
      edges.push({
         id: `${family.id}=>${offspring.id}`,
         source: family.id,
         target: offspring.id,
         markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12, color: "var(--mantine-color-dark-3)" },
         style: {
            strokeWidth: 2,
            stroke: "var(--mantine-color-dark-3)",
            filter: "drop-shadow(0 0 0.3125rem rgba(0, 0, 0, 0.7))",
         },
      });
   }
}

export function makeFamilyTree(family: IFamily): { nodes: Node[]; edges: Edge[] } {
   const nodes: FamilyNode[] = [];
   const edges: Edge[] = [];
   makeFamilyNode(family, nodes, edges);
   for (const child of family.children) {
      makeFamilyNode(child, nodes, edges);
   }
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

export function getSpousesFromOtherProvinces(family: IFamily, province: Province, save: SaveGame): IFamily[] {
   const result: IFamily[] = [];
   if (family.male && family.female) {
      return result;
   }
   if (!family.male) {
      for (const [otherProvince, otherProvinceState] of entriesOf(save.state.provinces)) {
         if (otherProvince === province) {
            continue;
         }
         if (!otherProvinceState.governor.female) {
            result.push(otherProvinceState.governor);
         }
         for (const child of otherProvinceState.governor.children) {
            if (child.male && !child.female) {
               result.push(child);
            }
         }
      }
   }
   if (!family.female) {
      for (const [otherProvince, otherProvinceState] of entriesOf(save.state.provinces)) {
         if (otherProvince === province) {
            continue;
         }
         if (!otherProvinceState.governor.male) {
            result.push(otherProvinceState.governor);
         }
         for (const child of otherProvinceState.governor.children) {
            if (child.female && !child.male) {
               result.push(child);
            }
         }
      }
   }
   return result;
}

export function removeEmptyFamily(save: SaveGame): void {
   for (const [_, state] of entriesOf(save.state.provinces)) {
      filterInPlace(state.governor.children, (family) => {
         if (family.male || family.female || family.concubines.length > 0) {
            return true;
         }
         return false;
      });
   }
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
   if (family.male && !family.female) {
      result.push(family);
   }
   if (family.female && !family.male) {
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
