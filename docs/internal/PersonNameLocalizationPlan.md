# Plan: person-name display + language-aware name generator (revision 10)

Status: **implemented in the worktree (uncommitted)**; native zh-TW sign-off pending (§7). Revision 10 binds the `Language` once in `getNameGenerator(scenario, language)` instead of threading it as a separate parameter, formats consul names at generation time, and merges the per-gender helpers in `ChineseNames.ts`.

| Revision | Change |
|---|---|
| 1 → 2 | Storage redesign (name keys, union types, translator-tooling commit) |
| 2 → 3 | Scope cut: saved localized names accepted; no key storage, no tooling, no migration |
| 3 → 4 | Generator takes an explicit `Language`; module-level language accessor dropped |
| 4 → 5 | `INameGenerator.randomName` takes an options object; name entries carry per-language overrides with English fallback; zh-TW gets traditional Chinese |
| 5 → 6 | zh-TW data is a complete set with an English-only fallback; the zh-TW × TK-name mix is accepted |
| 6 → 7 | Advisor candidate React key switched to `key={i}` |
| 7 → 8 | Advisor names formatted inside `initAdvisors`; explicit resolution policy for inherited-script names |
| 8 → 9 | Resolution policy dropped — trust the `Language` argument, accept mismatches |
| 9 → 10 | Language bound in `getNameGenerator(scenario, language)`; `initProvince`/`initAdvisors`/`generateRandomGovernor` keep their original signatures; consul names formatted at generation; `ChineseNames.ts` per-gender helpers merged |

## 0. State of the repository when this plan is reviewed

| Item | File | Status |
|---|---|---|
| Localization pass (all `$t(L.*)` conversions, 978 keys) | `packages/client/src/languages/*`, game/ui files | committed — `Localization` ×2 on `ThreeKingdoms` |
| zh-CN trait labels `文`/`武` → `文官`/`武官` | `packages/client/src/languages/zh-CN.ts:5113-5114` | committed — in `Localization` |
| Advisor candidate React key `key={candidate.name}` → `key={i}` | `packages/client/src/ui/GovernmentSingletonModal.tsx:256` | committed — `Key fix` |
| This document | `docs/internal/PersonNameLocalizationPlan.md` | untracked |
| §3–§4 (C1, C2, C3.1) | see §3.6 and Appendix A | implemented in the worktree, uncommitted; `pnpm run build`, `pnpm run check`, `pnpm test run` pass |

Not yet done: manual verification (§5, needs maintainer go-ahead) and native zh-TW sign-off (§7).

---

## 1. Accepted limitations (maintainer decisions)

- Names saved in one language stay in that language after a switch. No keys in save state, no migration. TK character names are key-based and *do* re-localize — an accepted asymmetry (documented in C3).
- **Script mismatches are accepted.** A family name is inherited as an already-stored string while the given name is generated in the *active* language, so after a switch a person can end up mixed: `曹` + `Hong`, `Cao` + `洪`, and a simplified family name with a traditional given name in zh-TW. Rationale: trust the `Language` argument; do not add detection logic.
- In zh-TW, TK character names are still English (external-owned translation not yet delivered), so a TK ruler named `Cao Cao` has descendants displayed as `Cao 洪`. Accepted for the same reason.
- Legacy dev saves may contain mixed names (`曹 Hong`); dev saves are discarded (code unreleased).

## 2. What gets fixed

**P1 — the same person renders two ways.** `getTKCharacterName()` (`game/logic/TKCharacterLogic.ts:125`) joins CJK parts tightly, but 21 display sites do `person.name.join(" ")` on the stored array (`曹 操`).

**P3 — generated names ignore the language.** `ChineseNames.ts` pools are romanized-only (hanzi in trailing comments), so a Chinese game generates `Cao Hong`-style names: a freshly generated governor, spouse, advisor or child is romanized in a Chinese game, and the family name inherited from a localized parent (`logic/GovernorLogic.ts:324` → `ChineseNames.getFamilyName = name[0]`) makes it worse (`曹 Hong`). Fixing the pools fixes the normal case — newly generated families are fully in the active language. Two exceptions remain mixed-script by decision (§1): (a) post-switch inheritance, e.g. a `曹` parent in an English session; (b) the zh-TW case with **no** switch at all, where a TK ruler is still stored as `Cao Cao` (external translation pending) and therefore yields `Cao 洪`.

**P3b — advisor names are collapsed too early.** `definitions/Advisor.ts:21` stores `nameGenerator.randomName("male").join(" ")`, so a CJK name is already `曹 操`-shaped before any display site sees it. Formatting at display time cannot repair an internal space; the join has to move to generation time.

---

## 3. Design

### 3.1 One display formatter

New `packages/client/src/game/logic/NameLogic.ts`:

```ts
const CJK = /^[\p{Script_Extensions=Han}\p{Script_Extensions=Hiragana}\p{Script_Extensions=Katakana}\p{Script_Extensions=Hangul}]+$/u;

export function formatPersonName(parts: readonly string[] | undefined): string {
   const names = (parts ?? []).filter((p) => p.length > 0);
   return names.join(names.every((p) => CJK.test(p)) ? "" : " ");
}
```

Used in three places: **person display sites** (§4 C1), **advisor creation** (§4 C2) and **consul name generation** (`createSaveGame`, `tickConsulElection`; Senate scenarios only, so Latin in practice). `getTKCharacterName` delegates to it (no behaviour change).

### 3.2 Scenario generator vs. language-bound generator

```ts
// game/scenarios/Scenarios.ts
export interface IRandomNameOptions {
   gender: "male" | "female";
   familyName?: string;
   random?: () => number;
}

export interface IScenarioRandomNameOptions extends IRandomNameOptions {
   language: Language;
}

// What a scenario declares (IScenario.nameGenerator)
export interface IScenarioNameGenerator {
   getFamilyName: (name: string[]) => string;
   randomName: (options: IScenarioRandomNameOptions) => string[];
}

// What game code receives: language already bound
export interface INameGenerator {
   getFamilyName: (name: string[]) => string;
   randomName: (options: IRandomNameOptions) => string[];
}
```

```ts
// game/logic/ScenarioLogic.ts
export function getNameGenerator(scenario: Scenario, language: Language): INameGenerator {
   const generator = Scenarios[scenario].nameGenerator;
   return {
      getFamilyName: (name) => generator.getFamilyName(name),
      randomName: (options) => generator.randomName({ ...options, language }),
   };
}
```

The generator and the language always travel together, so the language is bound once at `getNameGenerator` rather than threaded as a separate parameter. It is still an explicit, required argument — no module-level state.

`RomanNameGenerator` satisfies `IScenarioNameGenerator` and ignores `language`; its pools **and its output** are unchanged (Latin, three parts, every language). `ChineseNameGenerator` resolves each part through per-language data with a single `randomName` that picks the given-name pool by gender.

### 3.3 Name data with per-language overrides

```ts
type INameEntry = { en: string } & Partial<Record<Language, string>>;

const FamilyNames: readonly INameEntry[] = [
   { en: "Bao", "zh-CN": "鲍", "zh-TW": "鮑" },
   ...
];

export function resolveNameEntry(entry: INameEntry, language: Language): string {
   return entry[language] ?? entry.en;
}
```

`en` is the required base; every other language is an optional override. zh-CN and zh-TW both get complete sets (312 entries each), so the only fallback that ever triggers is → `en`.

### 3.4 Resolution: one language per call

No script detection, no inherited-family special case:

- A **generated** part (family or given) is looked up with the **`language` argument only**.
- An inherited family name is **not re-resolved** — it is the string already stored on the parent.
- Language → data mapping: `zh-CN` → `zh-CN` values, `zh-TW` → `zh-TW` values, every other language → its own override if a future one is added, otherwise `en`.

Consequence, accepted per §1: a `曹` parent yields `曹洪` while the game stays in a Chinese language; after switching to English the same parent yields `曹 Hong`. No detection, no fallback chain, no `DEFAULT_CHINESE_VARIANT`.

### 3.5 Producing the zh-TW data

The pools contain **312 entries spanning 293 distinct hanzi**. Traditional forms are generated from a curated simplified→traditional character map covering exactly those 293 characters, so every zh-CN value has a zh-TW counterpart (complete sets, §3.3). Characters whose traditional form is context-dependent in names are decided per name convention. For native review:

| Simplified | Chosen traditional | Where | Note |
|---|---|---|---|
| 钟 | 鍾 | family 钟, 钟离 → 鍾離 | surname form (鍾繇), not 鐘 |
| 冲 | 沖 | male given | 曹沖 |
| 云 | 雲 | male given | 趙雲 |
| 丰 | 豐 | male given | 田豐 |
| 术 | 術 | male given | 袁術 |
| 据 | 據 | male given | |
| 艳 | 豔 | female given | Taiwan MOE standard (variant 艷) |
| 于, 范, 沈, 采 | unchanged | family / given | surname/name usage, not 於, 範, 瀋, 採 |

Native sign-off is a merge requirement (§7).

### 3.6 Supplying `language` to every generation point

The language enters at exactly two kinds of places: `createSaveGame` and every `getNameGenerator` call. Functions that receive an `INameGenerator` (`initProvince`, `initAdvisors`, `generateRandomGovernor`) keep their original signatures.

| Entry point | Change | Call sites → language source |
|---|---|---|
| `createSaveGame` | `({ scenario, province, language })`; also writes `save.options.language = language` so generated names and the stored option agree | `Bootstrap.ts` → `"en"` (brand-new save, no stored option yet; Rome), `LegacyUpgradeLogic.ts` (`rebirth`) → `save.options.language` |
| `getNameGenerator` | `(scenario, language)` | `GameState.ts` (`createSaveGame`) → `language`; `ProvinceLogic.ts` (`spawnProvince`), `MigrateSave.ts`, `TickProvince.ts`, `TickLogic.ts` (`tickConsulElection`), `GovernorLogic.ts` (`tickFamilyMembers`), `SpouseActions.ts` ×2 → `save.options.language`; `AddDebugFunctions.ts` → `G.save.options.language` |
| `randomName` calls | options object `{ gender, familyName? }`, no language | all generation sites |

`rebirth()` matters: it builds a fresh save (options default to `en`) then keeps the old options (`save.state = newSave.state`, `LegacyUpgradeLogic.ts:112-114`), so passing `save.options.language` at the `createSaveGame` call is what preserves a Chinese player's script across a rebirth.

No module-level language state; no change to `utils/i18n.ts` or `setLanguage()`.

---

## 4. Work items (one change, three commits)

### 4.0 Implementation constraints (apply to C1–C2)

- **No generation behaviour change outside the new data.** Preserve pool order, keep duplicate entries as separate entries, and keep the random-number consumption identical (one draw for the family when not inherited, one for the given name, in that order). Converting entries is an in-place shape change: same array lengths, same ordering, same indices — so English and Roman output must be byte-identical to today.
- **Share the entry type.** `INameEntry` plus `resolveNameEntry` live in one module (proposed: `game/logic/NameLogic.ts`) and are imported by `ChineseNames.ts`, so the data shape and its resolver cannot drift.
- **Native zh-TW review stays a merge gate** (§7).

### C1 — formatter and person display sites

1. Add `game/logic/NameLogic.ts` (`formatPersonName`, `resolveNameEntry`); route `getTKCharacterName` through `formatPersonName`.
2. Replace the 21 person display sites with `formatPersonName(person.name)` (Appendix A). **Advisor display sites are not touched** — see C2.

### C2 — generator, advisor storage, and threading

1. Split the generator types (§3.2): scenarios declare `IScenarioNameGenerator`; `getNameGenerator(scenario, language)` returns a language-bound `INameGenerator` whose `randomName` takes `{ gender, familyName?, random? }`. `RomanNames.ts` adopts the signature with its pools and output unchanged.
2. Convert the three `ChineseNames.ts` pools to `INameEntry` objects: the 312 hanzi move out of the comments into `"zh-CN"`, 312 traditional values are added (§3.5), `en` keeps today's romanizations. Merge `randomMaleName`/`randomFemaleName` into `randomName` (pool chosen by gender; draw order unchanged).
3. Resolve every part with the bound language (§3.4).
4. `definitions/Advisor.ts`: format at generation time, so the stored string is final —

   ```ts
   return {
      name: formatPersonName(nameGenerator.randomName({ gender: "male" })),
      level: i,
      traits: new Set(traits),
   };
   ```

   `IAdvisor.name` stays a plain string; the two UI sites keep rendering it directly. Consul names (`GameState.ts` `createSaveGame`, `TickLogic.ts` `tickConsulElection`) are formatted the same way.
5. Supply `language` at `createSaveGame` and every `getNameGenerator` call (§3.6).

### C3 — docs and verification

1. `docs/internal/Localization.md`: generated names are **data, not localization keys** (stored in save state, intentionally not re-localized); generator data may carry per-language overrides with English fallback; TK character names stay key-based and do re-localize.
2. Run §5.

## 5. Verification

Automated: `pnpm run build`, `pnpm run check`, `pnpm test run`, `pnpm run translate` (expected no-op — no language files touched).

Manual (game on localhost:5173, only with maintainer go-ahead):

1. **zh-CN**, Three Kingdoms 194: `曹操` in government modal, diplomacy, family tree, tooltips, birth/succession/illegitimate-child dialogs, advisor dropdown; a child born in the run is `曹X`; a freshly created advisor is `陈X`-shaped (no internal space).
2. **en**, same scenario: `Cao Cao`, child `Cao X`, advisors `Chen X`.
3. **zh-TW**: newly generated families follow the active language — new governors, spouses, advisors and adults are traditional (`陳`, `張`, `劉`), with no simplified form where the two differ.
4. **Switch cases (expected, not bugs):** switch zh-CN → en mid-run, let a child be born under an existing `曹` parent → `曹 Hong`; in zh-TW, a TK ruler stored as `Cao Cao` gets `Cao 洪`. Confirms §3.4 (active language only, inherited family untouched) rather than a silent script rule.
5. **de/ru** (no overrides): generated names romanized, exactly as today.
6. **Rome192** (all languages): unchanged — three Latin parts, space-joined; offspring inherit the nomen (index 1).
7. **Rebirth** from a zh-CN run: newly generated names are hanzi (proves the `rebirth` wiring in §3.6).

## 6. Risks

| Risk | Mitigation |
|---|---|
| Missing a call site → generator never receives a language | `language` is a required parameter of `getNameGenerator` and `createSaveGame`, so an omission is a compile error; inventory in §3.6 is closed |
| Traditional conversion errors (293 characters) | Character map listed in the change; ambiguous characters separated (§3.5); native sign-off is a merge requirement (§7) |
| Post-switch script mismatches (`曹 Hong`, `Cao 洪`) | Accepted by decision (§1); visible in §5 item 4 so reviewers see the exact behaviour |
| Advisor names baked at creation → a later switch does not re-render them | Consistent with the accepted storage design (§1); formatting happens once, at generation |
| zh-TW mixes traditional generated names with English TK names | Accepted (§1); resolved when the external zh-TW translation lands |
| `createSaveGame` called without a meaningful language (`Bootstrap.ts:122`) | New-player save is Rome192 (Latin names); `"en"` is explicit and harmless |
| Legacy dev saves with `曹 Hong` | Accepted; dev saves discarded |

## 7. Decisions

All design decisions are resolved; nothing blocks implementation.

- Trust the `Language` argument: no inherited-script detection, no fallback chain, no `DEFAULT_CHINESE_VARIANT` (§3.4); mismatches accepted (§1).
- Complete zh-TW data set, English-only fallback (§3.3).
- Advisor names formatted at generation time (§4 C2.4); `key={i}` for advisor candidates (applied).
- **Native sign-off for the zh-TW data is a merge requirement** before merging the change (incorrect names would otherwise persist in saves under the accepted storage design).

Non-blocking logistics (no answer needed to start): commit granularity (C1/C2/C3 as three commits vs. one), whether this document stays in `docs/internal/`, and whether a `formatPersonName` unit test is wanted.

## Appendix A — person display sites (21 sites; 13 files, 14 rows — `SpouseActions.ts` appears twice)

Advisor sites are deliberately absent: `ui/GovernmentSingletonModal.tsx:249`, `:272` and `definitions/ModifierUpdate.ts:41` render `advisor.name` / `advisor.selected?.name`, which is already final after C2.4. The advisor React key is already `key={i}` (§0).

| File:line | Current | Replacement |
|---|---|---|
| `actions/SpouseActions.ts:51,107` | `daughter.name.join(" ")` | `formatPersonName(daughter.name)` |
| `actions/SpouseActions.ts:167` | `name.join(" ")` | `formatPersonName(name)` |
| `definitions/ModifierUpdate.ts:38` | `state.governor.male.name.join(" ")` | `formatPersonName(state.governor.male.name)` |
| `logic/DiplomacyLogic.ts:58,60` | `family.male/female.name.join(" ")` | `formatPersonName(...name)` |
| `ui/DiplomacyPage.tsx:133` | `theirState.governor.male.name.join(" ")` | `formatPersonName(...name)` |
| `ui/FamilyNode.tsx:54` | `person.name.join(" ")` | `formatPersonName(person.name)` |
| `ui/GovernmentSingletonModal.tsx:70` | `state.governor.male.name.join(" ")` | `formatPersonName(...name)` |
| `ui/GovernorWithoutHeirModal.tsx:25` | `governor.male.name.join(" ")` | `formatPersonName(...name)` |
| `ui/IllegitimateChildModal.tsx:31,45,58` | `person.name.join(" ")` | `formatPersonName(person.name)` |
| `ui/LookForSpouseModal.tsx:63,69,136` | `f.male/female.name.join(" ")`, `person.name.join(" ")` | `formatPersonName(...)` |
| `ui/LoversComponent.tsx:34` | `concubine.name.join(" ")` | `formatPersonName(concubine.name)` |
| `ui/NewChildBornModal.tsx:21` | `person.name.join(" ")` | `formatPersonName(person.name)` |
| `ui/NewGovernorModal.tsx:25` | `governor.male.name.join(" ")` | `formatPersonName(...name)` |
| `ui/PersonTooltip.tsx:18,38` | `person.name.join(" ")` | `formatPersonName(person.name)` |

## Appendix B — generator data

- `ChineseNames.ts`: 123 family / 145 male given / 44 female given = 312 entries; 293 distinct hanzi.
- 80 romanized values repeat across entries (`"Yan"` ×7, `"Yu"` ×6, …) with different hanzi; the entry-object form keeps them distinct without any key scheme.
- `RomanNames.ts`: **signature changes** to the options-object form and satisfies `IScenarioNameGenerator` (§3.2); its pools and its output remain unchanged (Latin, three parts, every language).

## Appendix C — verification commands

Commands marked **[pre-change]** describe the current tree and stop being valid once the pools become entry objects; they are evidence for the plan, not post-change checks.

```bash
# person display sites still using join (advisor names must not appear here)
grep -rn 'name\.join(" ")' --include=*.ts --include=*.tsx packages/client/src

# advisor name collapsed at generation time [pre-change]
sed -n '16,24p' packages/client/src/game/definitions/Advisor.ts

# generator surface that must switch to the options object
grep -rn "randomName(" --include=*.ts --include=*.tsx packages/client/src
grep -rn "getNameGenerator(\|createSaveGame(" --include=*.ts --include=*.tsx packages/client/src

# pool size and distinct hanzi [pre-change]
awk 'NR>=4 && NR<=330' packages/client/src/game/ChineseNames.ts | grep '^   "' | wc -l    # expect 312
node -e 'const fs=require("fs");const t=fs.readFileSync("packages/client/src/game/ChineseNames.ts","utf8");console.log(new Set([...t.matchAll(/\/\/ (\S+)/g)].map(m=>m[1]).join("")).size)'  # 293

# pool size after the conversion [post-change]
grep -c '"zh-CN":' packages/client/src/game/ChineseNames.ts    # expect 312
grep -c '"zh-TW":' packages/client/src/game/ChineseNames.ts    # expect 312
grep -c '"en":'    packages/client/src/game/ChineseNames.ts    # expect 312

# inheritance path and rebirth wiring
sed -n '320,340p' packages/client/src/game/logic/GovernorLogic.ts
sed -n '100,115p' packages/client/src/game/logic/LegacyUpgradeLogic.ts
```
