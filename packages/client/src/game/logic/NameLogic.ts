import type { Language } from "@project/shared/src/rpc/ServerMessageTypes";

const CJK =
   /^[\p{Script_Extensions=Han}\p{Script_Extensions=Hiragana}\p{Script_Extensions=Katakana}\p{Script_Extensions=Hangul}]+$/u;

export type INameEntry = { en: string } & Partial<Record<Language, string>>;

export function resolveNameEntry(entry: INameEntry, language: Language): string {
   return entry[language] ?? entry.en;
}

export function formatPersonName(parts: readonly string[] | undefined): string {
   const names = (parts ?? []).filter((p) => p.length > 0);
   return names.join(names.every((p) => CJK.test(p)) ? "" : " ");
}
