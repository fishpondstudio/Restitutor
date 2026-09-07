import { clamp } from "@mantine/hooks";
import { $t, L } from "../../utils/i18n";
import type { ICondition, IConditionBreakdown, IValueBreakdown, IValueBreakdownItem } from "../actions/GameAction";
import type { SaveGame } from "../GameState";

export type EvaluationMode = "value" | "breakdown";
export type EvaluationBreakdown = IValueBreakdown | IConditionBreakdown;

export type EvaluationResult<M extends EvaluationMode, B extends EvaluationBreakdown> = M extends "value"
   ? B["value"]
   : B;

export type EvaluationImplementation<Key, B extends EvaluationBreakdown> = <M extends EvaluationMode>(
   key: Key,
   save: SaveGame,
   mode: M,
) => EvaluationResult<M, B>;

export interface EvaluationGetter<Args extends unknown[], B extends EvaluationBreakdown> {
   (...args: [...Args, mode?: "breakdown"]): B;
   (...args: [...Args, mode: "value"]): B["value"];
   (...args: [...Args, mode: EvaluationMode]): B | B["value"];
}

export type EvaluationFunction<Key, B extends EvaluationBreakdown> = EvaluationGetter<[key: Key, save: SaveGame], B>;

export function defineValueGetter<Args extends unknown[]>(
   implementation: (...args: [...Args, mode?: EvaluationMode]) => IValueBreakdown | number,
): EvaluationGetter<Args, IValueBreakdown> {
   return implementation as EvaluationGetter<Args, IValueBreakdown>;
}

export function defineConditionGetter<Args extends unknown[]>(
   implementation: (...args: [...Args, mode?: EvaluationMode]) => IConditionBreakdown | boolean,
): EvaluationGetter<Args, IConditionBreakdown> {
   return implementation as EvaluationGetter<Args, IConditionBreakdown>;
}

export type ConditionChecks = Generator<boolean, void, ConditionExplanation | undefined>;

export function defineConditionChecks<Args extends unknown[]>(
   implementation: (...args: [...Args, save: SaveGame]) => ConditionChecks,
): EvaluationGetter<[...Args, save: SaveGame], IConditionBreakdown> {
   function evaluate(...args: [...Args, save: SaveGame, mode?: EvaluationMode]): IConditionBreakdown | boolean {
      const last = args[args.length - 1];
      let mode: EvaluationMode = "breakdown";
      if (last === "value" || last === "breakdown" || last === undefined) {
         mode = last === "value" ? "value" : "breakdown";
         args.pop();
      }
      const checks = implementation(...(args as [...Args, save: SaveGame]));
      const calc = mode === "breakdown" ? new ConditionCalculation("breakdown") : undefined;
      let step = checks.next();
      try {
         while (!step.done) {
            if (calc === undefined && !step.value) {
               return false;
            }
            step = checks.next(calc?.check(step.value));
         }
         return calc?.finish() ?? true;
      } finally {
         // An early failure must still run generator cleanup, without resuming normal check evaluation.
         if (!step.done) {
            checks.return();
         }
      }
   }

   return evaluate as EvaluationGetter<[...Args, save: SaveGame], IConditionBreakdown>;
}

export class ValueExplanation implements IValueBreakdownItem {
   name = "";
   desc?: string;

   constructor(readonly value: number) {}

   describe(name: string, desc?: string): void {
      this.name = name;
      this.desc = desc;
   }
}

export type ConditionDescription = Pick<ICondition, "desc" | "progress" | "hidden">;

export class ConditionExplanation implements ICondition {
   name = "";
   desc?: string;
   progress?: ICondition["progress"];
   hidden?: boolean;

   constructor(readonly value: boolean) {}

   describe(name: string, details?: ConditionDescription): void {
      this.name = name;
      this.desc = details?.desc;
      this.progress = details?.progress;
      this.hidden = details?.hidden;
   }
}

export class ValueCalculation<M extends EvaluationMode> {
   private totalAdd = 0;
   private totalMultiply: number;
   private readonly breakdown: (IValueBreakdown & { multiplyBase: ValueExplanation }) | undefined;

   constructor({ mode, multiplyBase = 1, reverse = false }: { mode: M; multiplyBase?: number; reverse?: boolean }) {
      this.totalMultiply = multiplyBase;
      if (mode === "breakdown") {
         const base = new ValueExplanation(multiplyBase);
         base.describe($t(L.BaseValue));
         this.breakdown = {
            value: 0,
            totalAdd: 0,
            totalMultiply: multiplyBase,
            add: [],
            multiplyBase: base,
            multiply: [],
            reverse,
         };
      }
   }

   get multiplyBase(): ValueExplanation | undefined {
      return this.breakdown?.multiplyBase;
   }

   add(value: number): ValueExplanation | undefined {
      this.totalAdd += value;
      if (this.breakdown === undefined) {
         return undefined;
      }
      const item = new ValueExplanation(value);
      this.breakdown.add.push(item);
      return item;
   }

   multiply(value: number): ValueExplanation | undefined {
      this.totalMultiply += value;
      if (this.breakdown === undefined) {
         return undefined;
      }
      const item = new ValueExplanation(value);
      this.breakdown.multiply.push(item);
      return item;
   }

   finish(round?: (value: number) => number): EvaluationResult<M, IValueBreakdown> {
      const totalMultiply = clamp(this.totalMultiply, 0, Number.POSITIVE_INFINITY);
      let value = this.totalAdd * totalMultiply;
      if (round) {
         value = round(value);
      }
      const breakdown = this.breakdown;
      if (breakdown !== undefined) {
         breakdown.totalAdd = this.totalAdd;
         breakdown.totalMultiply = totalMultiply;
         breakdown.value = value;
      }
      // Construction ties the presence of the breakdown to M; TS cannot narrow a conditional type here.
      return (breakdown ?? value) as EvaluationResult<M, IValueBreakdown>;
   }
}

export class ConditionCalculation<M extends EvaluationMode> {
   private value = true;
   private readonly breakdown: IConditionBreakdown | undefined;

   constructor(mode: M) {
      if (mode === "breakdown") {
         this.breakdown = { value: true, breakdown: [] };
      }
   }

   check(value: boolean): ConditionExplanation | undefined {
      this.value = this.value && value;
      if (this.breakdown === undefined) {
         return undefined;
      }
      const item = new ConditionExplanation(value);
      this.breakdown.breakdown.push(item);
      return item;
   }

   finish(): EvaluationResult<M, IConditionBreakdown> {
      const breakdown = this.breakdown;
      if (breakdown !== undefined) {
         breakdown.value = this.value;
      }
      // As above, the constructor enforces the relationship between M and the return shape.
      return (breakdown ?? this.value) as EvaluationResult<M, IConditionBreakdown>;
   }
}
