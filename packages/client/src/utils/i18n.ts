import { isNullOrUndefined } from "@project/shared/src/utils/Helper";
import { EN } from "../languages/en";

export function $t(str: string, ...subs: (string | number)[]): string {
   const translation = str;
   if (translation) {
      return interpolate(translation, subs);
   }
   return `⚠️${str}`;
}

function interpolate(phase: string, subs: (string | number)[]): string {
   const firstTokenIdx = phase.indexOf("%%");
   if (firstTokenIdx === -1) {
      return phase;
   }

   let out = "";
   let from = 0;
   let subIdx = 0;
   let tokenIdx = firstTokenIdx;

   while (tokenIdx !== -1) {
      out += phase.slice(from, tokenIdx);

      const sub = subs[subIdx];
      if (!isNullOrUndefined(sub)) {
         out += String(sub);
      } else {
         out += `⚠️${subIdx}`;
      }

      subIdx += 1;
      from = tokenIdx + 2;
      tokenIdx = phase.indexOf("%%", from);
   }

   return out + phase.slice(from);
}

// We need to clone it because when switching languages, we will mutate the object!
export const L = structuredClone(EN);
