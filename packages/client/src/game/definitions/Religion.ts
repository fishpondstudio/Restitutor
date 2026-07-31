import { entriesOf, hasFlag, keysOf, type ValueOf } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";

export const ReligionFlags = {
   None: 0,
   Christian: 1 << 0,
} as const;

export type ReligionFlags = ValueOf<typeof ReligionFlags>;

interface IReligionConfig {
   name: () => string;
   flags: ReligionFlags;
}

const _Religion = {
   GrecoRoman: { name: () => $t(L.ReligionGrecoRoman), flags: ReligionFlags.None },
   Celtic: { name: () => $t(L.ReligionCeltic), flags: ReligionFlags.None },
   Germanic: { name: () => $t(L.ReligionGermanic), flags: ReligionFlags.None },
   Iberian: { name: () => $t(L.ReligionIberian), flags: ReligionFlags.None },
   Berber: { name: () => $t(L.ReligionBerber), flags: ReligionFlags.None },
   Eastern: { name: () => $t(L.ReligionEastern), flags: ReligionFlags.None },
   Anatolian: { name: () => $t(L.ReligionAnatolian), flags: ReligionFlags.None },
   Egyptian: { name: () => $t(L.ReligionEgyptian), flags: ReligionFlags.None },
   Judaism: { name: () => $t(L.ReligionJudaism), flags: ReligionFlags.None },
   Hunnic: { name: () => $t(L.ReligionHunnic), flags: ReligionFlags.None },
   Christianity: { name: () => $t(L.ReligionChristianity), flags: ReligionFlags.Christian },
   Donatism: { name: () => $t(L.ReligionDonatism), flags: ReligionFlags.Christian },
   Arianism: { name: () => $t(L.ReligionArianism), flags: ReligionFlags.Christian },
   Macedonianism: { name: () => $t(L.ReligionMacedonianism), flags: ReligionFlags.Christian },
   Pelagianism: { name: () => $t(L.ReligionPelagianism), flags: ReligionFlags.Christian },
   Nestorianism: { name: () => $t(L.ReligionNestorianism), flags: ReligionFlags.Christian },
   Miaphysitism: { name: () => $t(L.ReligionMiaphysitism), flags: ReligionFlags.Christian },
   Monothelitism: { name: () => $t(L.ReligionMonothelitism), flags: ReligionFlags.Christian },
   Iconoclasm: { name: () => $t(L.ReligionIconoclasm), flags: ReligionFlags.Christian },
} as const satisfies Record<string, IReligionConfig>;

export type Religion = keyof typeof _Religion;
export const Religion: Record<Religion, IReligionConfig> = _Religion;
export const Religions = keysOf(_Religion);
export const ChristianReligions = entriesOf(Religion)
   .filter(([_, config]) => hasFlag(config.flags, ReligionFlags.Christian))
   .map(([religion, _]) => religion);

export function isChristianReligion(religion: Religion): boolean {
   return hasFlag(Religion[religion].flags, ReligionFlags.Christian);
}
