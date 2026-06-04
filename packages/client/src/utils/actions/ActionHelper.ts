import type { Action } from "./Action";
import Delay from "./Delay";
import type { EasingFunction } from "./Easing";
import { Easing } from "./Easing";
import Parallel from "./Parallel";
import Repeat from "./Repeat";
import RunFunc from "./RunFunc";
import Sequence from "./Sequence";
import { TargetAction } from "./TargetAction";

export function to<T extends Record<string, any>>(
   target: T,
   targetValue: Partial<Record<keyof T, any>>,
   seconds: number,
   interpolation: EasingFunction = Easing.Linear,
): Action {
   return new TargetAction(target, targetValue, seconds, interpolation);
}

export function delay(seconds: number): Action {
   return new Delay(seconds);
}

export function runFunc(fn: () => void): Action {
   return new RunFunc(fn);
}

export function sequence(...actions: Array<Action>): Action {
   return new Sequence(...actions);
}

export function parallel(...actions: Array<Action>): Action {
   return new Parallel(...actions);
}

export function repeat(action: Action, times = -1): Action {
   return new Repeat(action, times);
}
