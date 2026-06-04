import type { Action } from "./Action";

const actions: Map<number, Action> = new Map();

export function start(action: Action) {
   actions.set(action.id, action);
}

export function isPlaying(action: Action): boolean {
   return actions.has(action.id);
}

export function pause(action: Action) {
   actions.delete(action.id);
}

export function clear(target: object) {
   for (const [id, action] of actions) {
      if ("target" in action && action.target === target) {
         actions.delete(id);
      }
   }
}

export function tickActions(delta: number) {
   for (const [id, action] of actions) {
      const done = action.tick(delta);
      if (done) {
         action.done = true;
         actions.delete(id);
         // Are there any queued events?
         for (let j = 0; j < action.queued.length; j++) {
            start(action.queued[j]);
         }
         action.queued = [];
      }
   }
}
