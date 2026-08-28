import type { Language } from "@project/shared/src/rpc/ServerMessageTypes";
import type { CountryCode } from "@project/shared/src/utils/CountryCode";
import { DE } from "../languages/de";
import { EN } from "../languages/en";
import { FR } from "../languages/fr";
import { RU } from "../languages/ru";
import { ZH_CN } from "../languages/zh-CN";

export const Languages = {
   en: EN,
   de: DE,
   "zh-CN": ZH_CN,
   ru: RU,
   fr: FR,
} as const satisfies Record<Language, Record<string, string>>;

export const LanguagesImage = {
   en: "GB",
   de: "DE",
   "zh-CN": "CN",
   ru: "RU",
   fr: "FR",
} as const satisfies Record<Language, keyof typeof CountryCode>;
