import { keysOf } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";

interface IReligionConfig {
   name: () => string;
}

export const Religion = {
   GrecoRoman: { name: () => $t(L.ReligionGrecoRoman) },
   Celtic: { name: () => $t(L.ReligionCeltic) },
   Germanic: { name: () => $t(L.ReligionGermanic) },
   Iberian: { name: () => $t(L.ReligionIberian) },
   Berber: { name: () => $t(L.ReligionBerber) },
   Eastern: { name: () => $t(L.ReligionEastern) },
   Anatolian: { name: () => $t(L.ReligionAnatolian) },
   Egyptian: { name: () => $t(L.ReligionEgyptian) },
   Judaism: { name: () => $t(L.ReligionJudaism) },
   Christianity: { name: () => $t(L.ReligionChristianity) },
} as const satisfies Record<string, IReligionConfig>;

export type Religion = keyof typeof Religion;
export const Religions = keysOf(Religion);
