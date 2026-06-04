import { safeParseInt } from "@project/shared/src/utils/Helper";

const ACharCode = "A".charCodeAt(0);
export function stringToPosition(mission: string): [number, number] {
   const letter = mission.charAt(0);
   const number = safeParseInt(mission.charAt(1));
   return [letter.charCodeAt(0) - ACharCode, number - 1];
}
