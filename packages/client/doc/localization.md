# Localization Guide

This document describes how to extract hardcoded user-facing strings in the Restitutor client into the localization system. Follow it step by step.

## Quick Reference

| Item | Location |
|------|----------|
| Source files to localize | `packages/client/src/**/*.ts` and `packages/client/src/**/*.tsx` |
| English language file | `packages/client/src/languages/en.ts` |
| Translation runtime | `packages/client/src/utils/i18n.ts` |
| HTML rendering helper | `packages/client/src/ui/components/RenderHTMLComp.tsx` |
| Chronicle markup parser | `packages/client/src/ui/ParseMarkup.tsx` |
| Format helpers | `@project/shared/src/utils/Helper` (`formatNumber`, `formatDelta`, `formatPercent`, `formatPercentDelta`) |
| Translate script | `scripts/Translate.js` (run via `pnpm run translate` at repo root) |

## Workflow

For each hardcoded user-facing string:

1. **Decide** whether the string should be localized (see [Scope](#scope) below). If unsure, flag it and skip.
2. **Search** `packages/client/src/languages/en.ts` for an existing key with the same content. Reuse it if found.
3. **Add** a new entry to `en.ts` (or reuse an existing key).
4. **Replace** the hardcoded string in source with `$t(L.KeyName, ...args)`.
5. **Add imports** if the file does not already import `$t` and `L` from `../utils/i18n` (adjust relative path as needed).
6. **Run checks** (see [Verification](#verification)).

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

1. Add to `en.ts`: `RebellionIsAtLeastX: "Rebellion is at least %%",`
2. Replace: `$t(L.RebellionIsAtLeastX, "5")`

## Scope

### Localize

- User-facing text shown in the UI: labels, titles, tooltips, descriptions, button text, modal copy, game event text, chronicle entries, advisor messages, etc.
- Strings in `.ts` and `.tsx` files under `packages/client/src/`.

### Do NOT Localize

- `imageCredit` fields (image attribution text in building/definition data).
- Icon names inside `<div className="mi">icon_name</div>` — these are Material icon identifiers, not display text.
- Debug output: `console.log`, `console.warn`, `console.error`.
- Developer errors: `throw new Error(...)`.
- Code identifiers: enum keys, property names, file paths, CSS class names, React component names.
- Keys starting with `$` in `en.ts` (e.g. `$Language`) — these are language metadata, not translatable UI strings.
- Strings in `packages/shared/`, `packages/server/`, or other packages (the client localization system does not cover them).

When not sure whether a string is user-facing, **do not touch it** and **flag it** for human review.

## Core API

### `$t` and `L`

```ts
import { $t, L } from "../utils/i18n"; // adjust relative path
```

- `L` is a clone of the `EN` object from `en.ts`. At runtime, `Object.assign(L, Languages[lang])` swaps in the active language.
- `$t(L.SomeKey)` looks up the translated string and returns it.
- `$t(L.SomeKey, arg1, arg2, ...)` substitutes `%%` placeholders left-to-right with the arguments.
- `$t` always receives `L.KeyName` (which evaluates to the string value), never a bare string literal.
- Missing translations render as `⚠️<key value>`; missing arguments render as `⚠️<index>`.

### Placeholders

Use `%%` for every runtime substitution. Placeholders are replaced **by position** (left to right), not by name.

```ts
// en.ts
ItCostsXAndWillGiveYouYGold: "It costs %% %% and will give you %% Gold",

// usage
$t(L.ItCostsXAndWillGiveYouYGold, formatNumber(2000), "Lumber", formatNumber(3000))
// → "It costs 2K Lumber and will give you 2K Gold"
```

**Pluralization is not supported.** Always use the plural form in the English string (e.g. "%% months", not "%% month(s)").

### `html()` for Inline HTML in UI

When localized text contains inline HTML (`<i>`, `<b>`, `<br>`, etc.) and is rendered in React UI:

```tsx
import { html } from "../ui/components/RenderHTMLComp";

// en.ts: ExampleOfXTagInYFile: "This is an example of <i>%%</i> tag in <b>%%</b> file"
html($t(L.ExampleOfXTagInYFile, var1, var2))
```

Use `html()` only when the string contains HTML tags. Plain text does not need it.

## Parameter Extraction

### Curly-Brace Hints

When the raw string uses `{curly brace}` hints, the wrapped substring **must** become a `%%` parameter:

| Raw string | Replacement |
|------------|-------------|
| `"{Belgica} nullifies all negative attitudes towards {Lugdunensis}"` | `$t(L.XNullifiesAllNegativeAttitudesTowardsY, Province.Belgica.name(), Province.Lugdunensis.name())` |
| `"{Belgica} gets {+10%} Prestige"` | `$t(L.XGetsYPrestige, Province.Belgica.name(), "+10%")` |

Even without `{}` hints, extract variable parts into parameters when it improves reusability.

### Numeric Parameters

Extract numbers, signs, and units into parameters to increase key reuse.

| Original | Don't | Do |
|----------|-------|-----|
| `Rebellion is at least 5` | `"Rebellion is at least 5"` (no param) | `"Rebellion is at least %%"` with `"5"` |
| `-20 Tile Unrest` | `"-20 Tile Unrest"` (no param) | `"%% Tile Unrest"` with `"-20"` |

**Sign and percent rules:**

- Do **not** put signs (`+`, `-`) or `%` in the localization string when they belong to the value.
- **Hard-coded numbers** (literals like `10`): pass the fully formatted value as a string parameter, including sign and `%` if present.
- **Variables** (`let`/`const`/expressions): use `formatNumber`, `formatDelta`, `formatPercent`, or `formatPercentDelta` from `@project/shared/src/utils/Helper`. Never use `String(var)`.

| Original | Correct |
|----------|---------|
| `+10% War Power` | `"%% War Power"` with `"+10%"` (literal) or `formatPercentDelta(var)` (variable) |
| `+10 Stability` | `"%% Stability"` with `"+10"` (literal) or `formatDelta(var)` (variable) |

| Original | Incorrect |
|----------|-----------|
| `+10% War Power` | `"+%%% War Power"` with `10` |
| `+10% War Power` | `"%%% War Power"` with `"+10"` |
| `+10 Stability` | `"+%% Stability"` with `10` |
| `+10 Stability` | `"%% Stability"` with `formatDelta(10)` for a literal |

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
XAndYFormedAnAlliance: "<Province>%%</Province> and <Province>%%</Province> formed an alliance.",

// call site — pass the Province enum value, NOT getProvinceName()
$t(L.XAndYFormedAnAlliance, fromProvince, toProvince)
```

The parser reads the enum key from inside `<Province>...</Province>` and renders the localized, clickable province name.

### `<Tile>` tags

```ts
// en.ts
XDeclaredWarOnYWithTheGoalOfOccupyingZ: "<Province>%%</Province> declared war on <Province>%%</Province> with the goal of occupying %%.",

// call site — wrap each tile ID in <Tile> tags
$t(
   L.XDeclaredWarOnYWithTheGoalOfOccupyingZ,
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

Replace each `%%` in the content with `X`, `Y`, `Z`, `P`, `Q`, `R`, `S`, `T`, `U`, `V`, `W` by position (left to right):

| Content | Key |
|---------|-----|
| `%% Tile Unrest for %% months` | `XTileUnrestForYMonths` |
| `%% nullifies all negative attitudes towards %%` | `XNullifiesAllNegativeAttitudesTowardsY` |

### Merging Non-Entity Keys

When multiple **non-entity** keys share identical content, merge them into one generic key:

```ts
// Before
BuildingEffect1: "%% Tile Unrest",
EventEffect2: "%% Tile Unrest",

// After
XTileUnrest: "%% Tile Unrest",
```

Entity name keys are **never** merged, even if the text is identical. Entity prefix rules take precedence.

### Reusing Existing Keys

Before adding a new key, search `en.ts` for an existing entry with the same English text and reuse it. This takes priority over creating duplicates.

## Person Perspective

Game narration uses **first-person** ("we", "our"), not second-person ("you", "your").

**Change** second-person to first-person:

| Before | After |
|--------|-------|
| "You gain 10 prestige" | "We gain 10 prestige" |

**Exceptions — keep second-person:**

- Functional confirmation dialogs (e.g. `Are you sure you want to hard reset the game?`)
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
- Keys whose content is only tokens (`%%`), symbols, and numbers with no real text (e.g. `"%% Gold"`) → suggest inlining in source instead of localizing.

## Verification

Run these commands from the **repository root** (`E:/Restitutor`), in order, after making changes:

```sh
pnpm run build      # TypeScript compile check
pnpm run check      # Formatting, linting, import sorting (biome)
pnpm run translate  # Validate %% arg counts, remove unused keys, sync other language files, format
```

### What `pnpm run translate` Does

1. Scans all `.ts`/`.tsx` files under `packages/` (excluding `languages/`) for `L.KeyName` references and `$t(L.KeyName, ...)` calls.
2. Validates that the number of `%%` in each key's value matches the number of arguments passed to `$t`.
3. Removes unused keys from `en.ts` (keys starting with `$` are never removed).
4. Syncs non-English language files under `packages/client/src/languages/` to match `en.ts` keys.
5. Formats language files with biome.

If argument counts mismatch, the script prints file, line, key, and expected vs. actual arg count, then exits with code 1.

### After Changing Localization Content

Whenever you change a string's English content, also update its key name to match (if ≤ 64 characters). Otherwise, verify the existing key name is still descriptive; rename if not.

## Flagging Uncertain Cases

When you encounter a case not covered here, or are unsure what to do:

1. **Do not guess.** Leave the string unchanged.
2. **Flag it** in your response with:
   - File path and line number
   - The raw string
   - Why it is uncertain
   - Your best guess (if any)

This helps the maintainer extend this document.
