import { keysOf } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";

interface ICultureConfig {
   name: () => string;
}

export const Culture = {
   Greek: { name: () => $t(L.CultureGreek) },
   Gallic: { name: () => $t(L.CultureGallic) },
   Italic: { name: () => $t(L.CultureItalic) },
   Iberian: { name: () => $t(L.CultureIberian) },
   Brittonic: { name: () => $t(L.CultureBrittonic) },
   Berber: { name: () => $t(L.CultureBerber) },
   Punic: { name: () => $t(L.CulturePunic) },
   Illyrian: { name: () => $t(L.CultureIllyrian) },
   Thracian: { name: () => $t(L.CultureThracian) },
   Dacian: { name: () => $t(L.CultureDacian) },
   Pannonian: { name: () => $t(L.CulturePannonian) },
   Germanic: { name: () => $t(L.CultureGermanic) },
   Noric: { name: () => $t(L.CultureNoric) },
   Raetian: { name: () => $t(L.CultureRaetian) },
   Anatolian: { name: () => $t(L.CultureAnatolian) },
   Syrian: { name: () => $t(L.CultureSyrian) },
   Cappadocian: { name: () => $t(L.CultureCappadocian) },
   Egyptian: { name: () => $t(L.CultureEgyptian) },
   Arab: { name: () => $t(L.CultureArab) },
   Sardinian: { name: () => $t(L.CultureSardinian) },
   Corsican: { name: () => $t(L.CultureCorsican) },
} as const satisfies Record<string, ICultureConfig>;

export type Culture = keyof typeof Culture;
export const Cultures = keysOf(Culture);
