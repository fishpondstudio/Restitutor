import { keysOf } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";

interface ICultureConfig {
   name: () => string;
   code: string;
}

const _Culture = {
   Han: { name: () => "Han", code: "HA" },
   Greek: { name: () => $t(L.CultureGreek), code: "GR" },
   Gallic: { name: () => $t(L.CultureGallic), code: "GA" },
   Italic: { name: () => $t(L.CultureItalic), code: "IT" },
   Iberian: { name: () => $t(L.CultureIberian), code: "IB" },
   Brittonic: { name: () => $t(L.CultureBrittonic), code: "BR" },
   Berber: { name: () => $t(L.CultureBerber), code: "BE" },
   Punic: { name: () => $t(L.CulturePunic), code: "PU" },
   Illyrian: { name: () => $t(L.CultureIllyrian), code: "IL" },
   Thracian: { name: () => $t(L.CultureThracian), code: "TH" },
   Dacian: { name: () => $t(L.CultureDacian), code: "DA" },
   Pannonian: { name: () => $t(L.CulturePannonian), code: "PA" },
   Germanic: { name: () => $t(L.CultureGermanic), code: "GE" },
   Noric: { name: () => $t(L.CultureNoric), code: "NO" },
   Raetian: { name: () => $t(L.CultureRaetian), code: "RA" },
   Anatolian: { name: () => $t(L.CultureAnatolian), code: "AN" },
   Syrian: { name: () => $t(L.CultureSyrian), code: "SY" },
   Cappadocian: { name: () => $t(L.CultureCappadocian), code: "CA" },
   Egyptian: { name: () => $t(L.CultureEgyptian), code: "EG" },
   Arab: { name: () => $t(L.CultureArab), code: "AR" },
   Sardinian: { name: () => $t(L.CultureSardinian), code: "SA" },
   Corsican: { name: () => $t(L.CultureCorsican), code: "CO" },
   Hunnic: { name: () => $t(L.CultureHunnic), code: "HU" },
   Steppe: { name: () => $t(L.CultureSteppe), code: "ST" },
} as const satisfies Record<string, ICultureConfig>;

export type Culture = keyof typeof _Culture;
export const Culture: Record<Culture, ICultureConfig> = _Culture;
export const Cultures = keysOf(_Culture);
