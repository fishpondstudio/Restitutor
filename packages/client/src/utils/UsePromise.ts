import { type DependencyList, useEffect, useState } from "react";

export function usePromise<T>(promise: Promise<T>, deps: DependencyList): T | undefined {
   const [state, setState] = useState<T | undefined>(undefined);
   useEffect(() => {
      promise.then(setState);
      // biome-ignore lint/correctness/useExhaustiveDependencies: wtf?
   }, deps);
   return state;
}
