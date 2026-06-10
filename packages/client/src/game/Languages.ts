import type { Language } from "@project/shared/src/rpc/ServerMessageTypes";
import type { CountryCode } from "@project/shared/src/utils/CountryCode";
import { EN } from "../languages/en";
import { ZH_CN } from "../languages/zh-CN";

export const Languages = {
   en: EN,
   "zh-CN": ZH_CN,
} as const satisfies Record<Language, Record<string, string>>;

export const LanguagesImage = {
   en: "GB",
   "zh-CN": "CN",
} as const satisfies Record<Language, keyof typeof CountryCode>;
