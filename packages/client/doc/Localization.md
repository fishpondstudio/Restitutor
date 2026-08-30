# Localization Guide

This document describes how to extract hardcoded user-facing strings in the Restitutor client into the localization system. Follow it step by step.

## Quick Reference

| Item | Location |
|------|----------|
| Source files to localize | `packages/client/src/**/*.ts` and `packages/client/src/**/*.tsx` |
| Language files and ownership | See [Language Registry](#language-registry) |
| Translation runtime | `packages/client/src/utils/i18n.ts` |
| Language switching | `packages/client/src/utils/Global.tsx` (`setLanguage`) |
| HTML rendering helper | `packages/client/src/ui/components/RenderHTMLComp.tsx` |
| Chronicle markup parser | `packages/client/src/ui/ParseMarkup.tsx` |
| Format helpers | `@project/shared/src/utils/Helper` (`formatNumber`, `formatDelta`, `formatPercent`, `formatPercentDelta`) |
| Translate & sync script | `scripts/Translate.js` (run via `pnpm run translate` at repo root; syncs files in the [Language Registry](#language-registry), removes unused keys, and validates) |

## Language Registry

This registry is the single source of truth for language files and their ownership. Follow its ownership column whenever adding, translating, reviewing, correcting, or synchronizing localization content.

| Language | File | Ownership | Handling |
|----------|------|-----------|----------|
| English | `packages/client/src/languages/en.ts` | **Base** | Source of truth for keys, English content, and validation. |
| German | `packages/client/src/languages/de.ts` | **Machine** | String values are translated and maintained through machine translation. |
| Russian | `packages/client/src/languages/ru.ts` | **Machine** | String values are translated and maintained through machine translation. |
| Simplified Chinese | `packages/client/src/languages/zh-CN.ts` | **Machine** | String values are translated and maintained through machine translation. |
| French | `packages/client/src/languages/fr.ts` | **External** | String values are reserved for the external translator. Keys may be synchronized mechanically, but string values must not be translated, reviewed, corrected, or otherwise revised. |
| Spanish | `packages/client/src/languages/es.ts` | **Machine** | String values are translated and maintained through machine translation. |

## Workflow

For each hardcoded user-facing string:

1. **Decide** whether the string should be localized (see [Scope](#scope) below). If unsure, flag it and skip.
2. **Search** `en.ts` in the [Language Registry](#language-registry) for an existing key with the same content. Reuse it if found.
3. **Add** a new entry to `en.ts` (or reuse an existing key). **Always append new keys at the end of the file** — do not manually interleave them alphabetically. This keeps review diffs clean and focused on the actual additions.
4. **Replace** the hardcoded string in source with `$t(L.KeyName, ...args)`.
5. **Add imports** if the file does not already import `$t` and `L` from `../utils/i18n` (adjust relative path as needed).
6. **Run `pnpm run translate`** (see [Verification](#verification)). This syncs new keys from `en.ts` to the other files in the [Language Registry](#language-registry), adding English values as placeholders.
7. **Translate the new keys** only in files marked **Machine** in the [Language Registry](#language-registry), replacing the English placeholders with appropriate translations (see [Translating to Other Languages](#translating-to-other-languages)). Follow the registry's handling rules for every other ownership type.
8. **Run all checks** again (see [Verification](#verification)).

### Minimal Example

**Before** (`SomeModal.tsx`):

```tsx
<ModalTitleBar title="Incompatible Save" />
```

**After**:

1. Add to `en.ts`: `IncompatibleSave: "Incompatible Save",`
2. Replace in source:

```tsx
import { $t, L } from "../utils/i18n";

<ModalTitleBar title={$t(L.IncompatibleSave)} />
```

### Example with Parameters

**Before**:

```tsx
`Rebellion is at least 5`
```

**After**:

1. Add to `en.ts`: `RebellionIsAtLeast$1: "Rebellion is at least $1",`
2. Replace: `$t(L.RebellionIsAtLeast$1, "5")`

## Scope

### Localize

- User-facing text shown in the UI: labels, titles, tooltips, descriptions, button text, modal copy, game event text, chronicle entries, advisor messages, etc.
- Strings in `.ts` and `.tsx` files under `packages/client/src/`.

### Do NOT Localize

- `imageCredit` field values in building/definition data (the raw attribution text). The UI label is localized separately (e.g. `$t(L.ImageCredit$1, config.imageCredit)`).
- Icon names inside `<div className="mi">icon_name</div>` — these are Material icon identifiers, not display text.
- Debug output: `console.log`, `console.warn`, `console.error`.
- Developer errors: `throw new Error(...)`.
- Code identifiers: enum keys, property names, file paths, CSS class names, React component names.
- Keys starting with `$$` in `en.ts` (e.g. `$$Language`, `$$Credits`) — these are language metadata, not translatable UI strings.
- Strings in `packages/shared/`, `packages/server/`, or other packages (the client localization system does not cover them).

When not sure whether a string is user-facing, **do not touch it** and **flag it** for human review.

## Core API

### `$t` and `L`

```ts
import { $t, L } from "../utils/i18n"; // adjust relative path
```

- `L` is a clone of the `EN` object from `en.ts`. At runtime, `setLanguage()` in `Global.tsx` calls `Object.assign(L, Languages[lang])` to swap in the active language.
- `$t(L.SomeKey)` looks up the translated string and returns it. `L.SomeKey` evaluates to the string value for the active language.
- `$t(L.SomeKey, arg1, arg2, ...)` substitutes `$1`, `$2`, `$3`, ... tokens with the arguments (by token number, not by position in the string).
- `$t` always receives `L.KeyName` (which evaluates to the string value), never a bare string literal.
- Falsy translation values (e.g. `undefined` or `""`) render as `⚠️` followed by that value (e.g. `⚠️undefined`).
- Missing arguments render as `⚠️<token number>` (1-based; e.g. missing `$1` → `⚠️1`, missing `$10` → `⚠️10`).

### Placeholders

Use `$1`, `$2`, `$3`, ... for every runtime substitution. Tokens are **numbered** (1-indexed) and may appear in **any order** in the string. The same token number can be reused to repeat a value without passing the argument twice. Tokens must start from `$1` and be consecutive with no gaps (e.g. `$1 $2 $3` ✓, `$1 $3 $4` ✗, `$2 $3 $4` ✗).

```ts
// en.ts
ItCosts$1And$2WillGiveYou$3Gold: "It costs $1 $2 and will give you $3 Gold",

// usage
$t(L.ItCosts$1And$2WillGiveYou$3Gold, formatNumber(2000), "Lumber", formatNumber(3000))
// → "It costs 2K Lumber and will give you 2K Gold"
```

Reusing a token (example only — not a real key):

```ts
// en.ts
$1MarchesOn$1Again: "$1 marches on $1 again",

// usage — only one argument needed, even though $1 appears twice
$t(L.$1MarchesOn$1Again, getProvinceName(province, save))
```

Translators may reorder tokens in non-English strings when grammar requires it (see [Translating to Other Languages](#translating-to-other-languages)).

**Pluralization is not supported.** Always use the plural form in the English string (e.g. "$1 months", not "$1 month(s)").

### `html()` for Inline HTML in UI

When localized text contains inline HTML (`<i>`, `<b>`, `<q>`, `<br>`) and is rendered in React UI:

```tsx
import { html } from "../ui/components/RenderHTMLComp";

// en.ts: Make$1OurCoreTile: "Make <i>$1</i> our core tile."
html($t(L.Make$1OurCoreTile, getTileName(tile)))
```

Use `html()` only when the string contains HTML tags. Plain text does not need it.

**This is validated automatically** by `pnpm run translate` — if a key's content contains `<i>`, `<b>`, `<q>`, or `<br>` and the call site in a `.tsx` file is not wrapped in `html()`, the script reports an error. Chronicle tags (`<Province>`, `<Tile>`) are excluded. Use `html` imported from `RenderHTMLComp` (not an alias); keys used only in `.ts` files are exempt because callers wrap the result.

## Parameter Extraction

### Curly-Brace Hints

When the raw string uses `{curly brace}` hints, the wrapped substring **must** become a `$1`, `$2`, ... parameter:

| Raw string | Replacement |
|------------|-------------|
| `"{Belgica} nullifies all negative attitudes towards {Lugdunensis}"` | `$t(L.$1NullifiesAllNegativeAttitudesTowards$2, Province.Belgica.name(), Province.Lugdunensis.name())` |
| `"{Belgica} gets {+10%} Prestige"` | `$t(L.$1Gets$2Prestige, Province.Belgica.name(), "+10%")` |

Even without `{}` hints, extract variable parts into parameters when it improves reusability.

### Numeric Parameters

Extract numbers, signs, and units into parameters to increase key reuse.

| Original | Don't | Do |
|----------|-------|-----|
| `Rebellion is at least 5` | `"Rebellion is at least 5"` (no param) | `"Rebellion is at least $1"` with `"5"` |
| `-20 Tile Unrest` | `"-20 Tile Unrest"` (no param) | `"$1 Tile Unrest"` with `"-20"` |

**Sign and percent rules:**

- Do **not** put signs (`+`, `-`) or `%` in the localization string when they belong to the value.
- **Hard-coded numbers** (literals like `10`): pass the fully formatted value as a string parameter, including sign and `%` if present.
- **Variables** (`let`/`const`/expressions): use `formatNumber`, `formatDelta`, `formatPercent`, or `formatPercentDelta` from `@project/shared/src/utils/Helper`. Never use `String(var)`.

| Original | Correct |
|----------|---------|
| `+10% War Power` | `"$1 War Power"` with `"+10%"` (literal) or `formatPercentDelta(var)` (variable) |
| `+10 Stability` | `"$1 Stability"` with `"+10"` (literal) or `formatDelta(var)` (variable) |

| Original | Incorrect |
|----------|-----------|
| `+10% War Power` | `"+$1% War Power"` with `10` |
| `+10% War Power` | `"$1% War Power"` with `"+10"` |
| `+10 Stability` | `"+$1 Stability"` with `10` |
| `+10 Stability` | `"$1 Stability"` with `formatDelta(10)` for a literal |

## Entity Names

When a variable holds an entity, pass its localized **display name** at the call site — not the raw enum key (except for Chronicle `<Province>` tags; see below).

| Variable type | Call-site expression |
|---------------|---------------------|
| `province: Province` | `Province[province].name()` or `getProvinceName(province, save)` when name overrides matter |
| `goods: Goods` | `Goods[goods].name()` |
| `culture: Culture` | `Culture[culture].name()` |
| `religion: Religion` | `Religion[religion].name()` |
| `tile: Tile` (display name) | `getTileName(tile)` or `TileName[tile]?.()` |
| `building`, `tech`, `personTrait`, etc. | `Building[x].name()`, `Tech[x].name()`, `PersonTrait[x].name()`, etc. |

If no `.name()` helper exists for an entity type, flag it.

### Entity Key Prefixes

Keys for entity display names in `en.ts` must be prefixed with the entity type, even when multiple keys share the same English text:

| Entity type | Key pattern | Example |
|-------------|-------------|---------|
| Province | `Province{Name}` | `ProvinceAchaia: "Achaia"` |
| Culture | `Culture{Name}` | `CultureIberian: "Iberian"` |
| Religion | `Religion{Name}` | `ReligionIberian: "Iberian"` |
| Goods | `Goods{Name}` | `GoodsLeather: "Leather"` |
| Tile | `Tile{Name}` | `TilePaxIulia: "Pax Iulia"` |
| PersonTrait | `PersonTrait{Name}` | `PersonTraitSteadfast: "Steadfast"` |
| Building | `Building{Name}` | `BuildingMarket: "Market"` |
| Tech | `Tech{Name}` | `TechMarket: "Market"` |

**Never merge** entity name keys even if the text is identical:

```ts
// Correct — separate keys
BuildingMarket: "Market",
TechMarket: "Market",
CultureIberian: "Iberian",
ReligionIberian: "Iberian",
```

Entity definitions (e.g. `packages/client/src/game/definitions/Culture.ts`, `Goods.ts`, `Province.ts`) already reference these keys via `$t(L.EntityKey)`.

## Chronicle Entries (`addChronicleEntry`)

Chronicle text uses special XML-like tags parsed by `renderMarkup()` in `ParseMarkup.tsx`. **Keep these tags in the localized string.**

### `<Province>` tags

```ts
// en.ts
$1And$2FormedAnAlliance: "<Province>$1</Province> and <Province>$2</Province> formed an alliance.",

// call site — pass the Province enum value, NOT getProvinceName()
$t(L.$1And$2FormedAnAlliance, fromProvince, toProvince)
```

The parser reads the enum key from inside `<Province>...</Province>` and renders the localized, clickable province name.

### `<Tile>` tags

```ts
// en.ts
$1DeclaredWarOn$2WithTheGoalOfOccupying$3: "<Province>$1</Province> declared war on <Province>$2</Province> with the goal of occupying $3.",

// call site — wrap each tile ID in <Tile> tags
$t(
   L.$1DeclaredWarOn$2WithTheGoalOfOccupying$3,
   attacker,
   defender,
   Array.from(war.tiles).map((tile) => `<Tile>${tile}</Tile>`).join(", "),
)
```

The parser reads the numeric tile ID from inside `<Tile>...</Tile>` and renders the localized, clickable tile name.

Chronicle content is rendered via `renderMarkup()`, not `html()`. Do not strip or rename `<Province>` / `<Tile>` tags.

## Key Naming

- Keys use **UpperCamelCase**.
- Keys should match their English content when the resulting key is **≤ 64 characters**. If longer, choose a short but descriptive name.
- When content changes, update the key to match (if ≤ 64 chars) or verify the existing key is still descriptive.

### Token Placeholders in Key Names

Embed `$1`, `$2`, `$3`, ... directly in the key name at the position where the value should appear in the English content. Tokens in the key name must match the tokens in the content in the same order.

| Content | Key |
|---------|-----|
| `$1 Tile Unrest for $2 months` | `$1TileUnrestFor$2Months` |
| `$1 nullifies all negative attitudes towards $2` | `$1NullifiesAllNegativeAttitudesTowards$2` |

When a key would exceed **64 characters**, omit tokens from the name and append them at the end:

| Content | Key |
|---------|------|
| `"A long description with $1 and $2 and $3"` | `LongDescription$1$2$3` (instead of `$1LongDescriptionWith$2And$3`) |
| `"<Province>$1</Province> negotiated a white peace with <Province>$2</Province>. … $3-month truce …"` | `ChronicleWhitePeace$1$2$3` |
| `"The heir of the old governor $1 ($2 Administrative, … $6 offspring) is appointed."` | `OldGovernorHeir$1$2$3$4$5$6` |

### Merging Non-Entity Keys

When multiple **non-entity** keys share identical content, merge them into one generic key:

```ts
// Before
BuildingEffect1: "$1 Tile Unrest",
EventEffect2: "$1 Tile Unrest",

// After
$1TileUnrest: "$1 Tile Unrest",
```

Entity name keys are **never** merged, even if the text is identical. Entity prefix rules take precedence.

### Reusing Existing Keys

Before adding a new key, search `en.ts` for an existing entry with the same English text and reuse it. This takes priority over creating duplicates.

## Translating to Other Languages

This section describes how localization files are translated. The [Language Registry](#language-registry) determines which files may be machine-translated.

### Overview

- `en.ts` is the source of truth for all keys and for validation, as recorded in the [Language Registry](#language-registry).
- Each file listed in the [Language Registry](#language-registry) exports a constant with the same keys as `en.ts`. The export name is the uppercased filename with hyphens replaced by underscores.
- At runtime, `setLanguage()` in `Global.tsx` copies the selected language object into `L`; `$t` then interpolates tokens from that translation.

### What to Translate

- Translate only the **string values** (the text in double quotes).
- **Do not rename keys.** Key names are code identifiers shared across all languages.
- **Do not translate or remove `$1`, `$2`, … tokens.** These are placeholders filled in at runtime.
- **Do not translate** `$$Language`, `$$Credits`, or other `$$` metadata values unless you are setting the display name for that language (e.g. `$$Language: "Русский"` in the Russian file).
- **Preserve HTML and Chronicle tags** (`<i>`, `<b>`, `<Province>`, `<Tile>`, etc.) and keep their structure intact.

### Ensuring Consistent Terminology

Before translating a new key, **search the target language file for existing translations of the same gameplay terms**. This ensures consistency across the entire UI.

For example, when translating a key containing "tiles annexed and cored":

1. Search the target language file for keys like `TilesAnnexedAndCored`, `OccupyAndCore`, `MakeCore`, etc.
2. Reuse the same translation for "tiles", "annexed", "cored", "restoration", etc.

**Never translate the same English term differently in different keys.** If `TilesAnnexedAndCored` uses "владения" for "tiles", do not use "участки" in another key.

### Reordering Tokens

Because tokens are numbered (`$1`, `$2`, …) rather than positional (`%%`), **you may rearrange tokens** in a translation when word order in your language differs from English.

| Language | String |
|----------|--------|
| English | `"$1 declared war on $2"` |
| Example reorder | `"$2 wurde von $1 den Krieg erklärt"` |

Rules when reordering:

- **Keep every token number** that appears in the English string (`$1` … `$N`, consecutive, no gaps).
- **Do not renumber tokens** (e.g. do not turn English `$2` into `$1` in your translation).
- **Do not add or remove tokens.**
- The caller still passes arguments in the same order (`arg1` → `$1`, `arg2` → `$2`, …) regardless of where those tokens appear in your sentence.

Reusing a token to repeat a value is also allowed in translations (e.g. repeat `$1` where English does).

### After Translation

Run the same checks in [Verification](#verification). `pnpm run translate` validates token rules against `en.ts` only; still follow the same `$1`…`$N` rules in your language file.

To initialize or fully reset every non-English file to English placeholders: `pnpm run translate --reset`. Before using it, consult the [Language Registry](#language-registry): files reserved for external translation are also reset by this command.

To alphabetically sort keys in `en.ts`: `pnpm run translate --sort` (optional; not used in normal workflow).

## Person Perspective

Game narration uses **first-person** ("we", "our"), not second-person ("you", "your").

**Change** second-person to first-person:

| Before | After |
|--------|-------|
| "You gain 10 prestige" | "We gain 10 prestige" |

**Exceptions — keep second-person:**

- Functional confirmation dialogs (e.g. `AreYouSureYouWantToHardResetTheGameThisCannotBeUndone`: "Are you sure you want to hard reset the game? This cannot be undone.")
- Quotes (e.g. `In This Sign, You Shall Conquer`)
- The button text `I'm ready to restore the empire`

If a string has no person perspective, leave it as is.

## Grammar and Spelling

Fix misspellings and grammar errors in localization content **directly** (do not just list them as suggestions).

## Improvement Suggestions (Review Only)

When reviewing localization, **list** the following for human review. **Do NOT implement** these directly:

- Keys composable from two other keys → suggest eliminating the redundant key.
- Similar content across keys → suggest a more generic shared key.
- Rearrangements that improve reusability → suggest an alternative.
- Inconsistent casing or wording for the same concept.
- Ambiguous or unclear phrasing.
- Opportunities for conciseness and clarity.
- Keys whose content is only tokens (`$1`, `$2`, ...), symbols, and numbers with no real text (e.g. `"$1 Gold"`) → suggest inlining in source instead of localizing.

## Verification

Run these commands from the **repository root**, in order, after making changes:

```sh
pnpm run build      # TypeScript compile check
pnpm run check      # Formatting, linting, import sorting (biome)
pnpm run translate  # Validate token consecutiveness, arg counts, key-name match, remove unused keys, sync other language files, format
```

Then run the client test suite from `packages/client`:

```sh
pnpm test run
```

### What `pnpm run translate` Does

1. Scans all `.ts`/`.tsx` files under `packages/` (excluding `languages/`) for `L.KeyName` references and `$t(L.KeyName, ...)` calls.
2. **Validates token consecutiveness** (`en.ts`) — checks every key's value for `$N` tokens: they must start from `$1` and be consecutive with no gaps (e.g. `$1 $2 $3` ✓, `$1 $3 $4` ✗, `$2 $3 $4` ✗). Skips `$$` metadata keys.
3. **Validates key-content token match** (`en.ts`) — verifies that the `$1`, `$2`, ... tokens in the key name appear in the same order as in the content value.
4. **Validates argument counts** — checks that the highest `$N` index in each key's value matches the number of arguments passed to `$t` (reusing the same token number does not require duplicate arguments).
5. **Validates `html()` wrapper** — if a key's content in `en.ts` contains `<i>`, `<b>`, `<q>`, or `<br>`, the `$t()` call site in `.tsx` files must be wrapped in `html()` from `RenderHTMLComp`. Chronicle tags (`<Province>`, `<Tile>`) are excluded. Keys used only in `.ts` files are exempt because callers wrap the result. Add new tag names to `HTML_TAGS` in `scripts/Translate.js` when introducing other inline HTML in `en.ts`.
6. Removes unused keys from `en.ts` (keys starting with `$` are never removed).
7. Syncs every other file in the [Language Registry](#language-registry) to match the keys in `en.ts`. Key synchronization does not change a file's ownership or permit edits to its translated values.
8. Formats language files with biome.

If any validation fails, the script prints details (file, line, key, expected vs. actual), exits with code 1, and **does not** modify language files.

### After Changing Localization Content

Whenever you change a string's English content in `en.ts`, also update its key name to match (if ≤ 64 characters). Otherwise, verify the existing key name is still descriptive; rename if not.

## Flagging Uncertain Cases

When you encounter a case not covered here, or are unsure what to do:

1. **Do not guess.** Leave the string unchanged.
2. **Flag it** in your response with:
   - File path and line number
   - The raw string
   - Why it is uncertain
   - Your best guess (if any)

This helps the maintainer extend this document.
