import type { TypedEvent } from "@project/shared/src/utils/TypedEvent";
import { useEffect, useReducer, useRef } from "react";

export function makeObservableHook<T, K>(event: TypedEvent<T>, getter: (param: K) => T) {
   return function observe(param: K): T {
      const [_, update] = useReducer(reducer, 0);
      // biome-ignore lint/correctness/useExhaustiveDependencies: wtf?
      useEffect(() => {
         event.on(update);
         return () => {
            event.off(update);
         };
      }, [event]);
      return getter(param);
   };
}

export function useTypedEvent<T>(event: TypedEvent<T>, listener: (e: T) => void) {
   return useEffect(() => {
      event.on(listener);
      return () => {
         event.off(listener);
      };
   }, [event, listener]);
}

const reducer = (value: number) => (value + 1) % 1000000;

export function refreshOnTypedEvent<T>(event: TypedEvent<T>): number {
   const [handle, update] = useReducer(reducer, 0);
   useEffect(() => {
      event.on(update);
      return () => {
         event.off(update);
      };
   }, [event]);
   return handle;
}

export function refreshOnTypedEventWhen<T>(
   event: TypedEvent<T>,
   dependenciesFunc: () => unknown[],
   log = false,
): number {
   const [handle, update] = useReducer(reducer, 0);
   const deps = useRef(dependenciesFunc());
   useEffect(() => {
      const checkChanges = () => {
         const newDeps = dependenciesFunc();
         if (newDeps.some((dep, i) => !Object.is(dep, deps.current[i]))) {
            if (log) {
               console.warn("refreshOnTypedEventWhen:", deps.current, newDeps);
            }
            update();
         }
         deps.current = newDeps;
      };
      event.on(checkChanges);
      return () => {
         event.off(checkChanges);
      };
   }, [event, dependenciesFunc, log]);
   return handle;
}
