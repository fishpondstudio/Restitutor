## Localization Scope

Strings in `.ts` and `tsx` files need localization. These files are in `./src` folder

Language files are in `./src/languages/`. Currently there's only `en.ts`

Only localize user-facing strings. Do not touch other strings. When not sure, do not touch the string and flag it out.

Do not localize `imageCredit` that contains credit for the image used.

`<div className="mi">icon_name</div>` is used for rendering icon, do not extract `icon_name` to localization.

When a string matches an existing localization key, reuse the existing key instead of adding a new one.

## Localization Format

Localization format uses %% as placeholder, and is replaced by position (left to right) at runtime. For example, given the following localization key value pair:
`{ LocalizationKey: "It costs %% %% and will give you %% Gold" }`
At runtime, call `$t(L.LocalizationKey, formatNumber(2000), "Lumber", formatNumber(3000))`. The result will be "It costs 2K Lumber and will give you 2K Gold".

Pluralization is not supported. Instead, always use plural form.

## HTML and Special Tags

When the string contains inline HTML tag (e.g. <i> or <b>), you can include that in the localization string, and wrap it in a `html` functional call (imported from `packages\client\src\ui\components\RenderHTMLComp.tsx`). e.g.

`<>This is an example of <i>{var1}</i> tag in <b>{var2}</b> file</>`
can be extracted to `{ LocalizationKey: "This is an example of <i>%%</i> tag in <b>%%</b> file" }` and replaced with
`html($t(L.LocalizationKey, var1, var2))`

When localizing Chronicles (`addChronicleEntry`), Keep the special tag (e.g. `<Province>`, `<Tile>`) in the localized string.

## Parameter Extraction Hint

If the raw string uses TypeScript string interpolation, the variable should be extracted to parameters.
In the raw string, when a substring is wrapped in `{}`, it is a hint that the substring in `{}` MUST be extract to parameters. For example:
`"{Belgica} nullifies all negative attitudes towards {Lugdunensis}"`
should be replaced with
`$t(L.XNullifiesAllNegativeAttitudesTowardsY, Province.Belgica.name(), Province.Lugdunensis.name())`

`"{Belgica} gets {+10%} Prestige"`
should be replaced with
`$t(L.XGetsYPrestige, Province.Belgica.name(), "+10%")`

If a raw string does not contains parameter extraction hints, parameter extraction can still be performed.

## Entity Name Replacement

When a direct entity type is used, it should be replaced by corresponding name. For example:
`const province: Province` should be `Province[province].name()`
`const goods: Goods` should be `Goods[goods].name()`
`const culture: Culture` should be `Culture[culture].name()`
When a corresponding name cannot be found, flag it out.

Localization keys for the following entity types should prefix the entity type:
- Province
- Culture
- Religion
- Tile
- PersonTrait
- Building
- Tech
For example:
`{ ProvinceAchaia: "Achaia" }`
`{ CultureIberian: "Iberian" }`
`{ ReligionIberian: "Iberian" }`
`{ GoodsLeather: "Leather" }`
`{ PersonTraitSteadfast: "Steadfast" }`
`{ TilePaxIulia: "Pax Iulia" }`
Even if several keys have the same content, they should be separated, not merged. For example:
`{ BuildingMarket: "Market", TechMarket: "Market" }`
`{ CultureIberian: "Iberian", ReligionIberian: "Iberian" }`

## Numeric Parameters

Try to extract numeric parameters from strings to increase the reusability to localization. For example.
`Rebellion is at least 5`.
Don't: "Rebellion is at least 5"
Do: "Rebellion is at least %%" (and pass `"5"` as parameter)
`-20 Tile Unrest`
Don't: "-20 Tile Unrest"
Do: "%% Tile Unrest" (and pass `"-20"` as parameter)

When dealing with numeric parameters, do not add sign and percentage in localization.
If the parameter is a hard-coded number (i.e. `10`), keep the sign in parameters as string.
If the parameter is a variable or constant (`let` or `const`), call `formatNumber`, `formatDelta`, `formatPercent` or `formatPercentDelta`. 
When the original parameter is a `number` type and does not have any existing format* function applied, use `formatNumber`. Do not use `String(var)`.
For example:
`+10% War Power`
Don't: "+%%% War Power" (pass `10` as parameter)
Don't: "%%% War Power" (pass `+10` or `"+10"` as parameter)
Don't: "%% War Power" (pass `formatPercentDelta(10)` as parameter)
Do: "%% War Power" (pass `"+10%"` as parameter)
Do: "%% War Power" (pass `formatPercentDelta(var1)` as parameter only when it is a variable)

For example:
`+10 Stability`
Don't: "+%% Stability" (pass `10` as parameter)
Don't: "%% Stability" (pass `+10` as parameter)
Don't: "%% Stability" (pass `formatDelta(10)` as parameter)
Do: "%% Stability" (pass `"+10"` as parameter)
Don't: "%% Stability" (pass `String(var1)` as parameter)
Do: "%% Stability" (pass `formatDelta(var1)` as parameter only when it is a variable)

## Localization Key Naming

Localization keys should match its content (UpperCamelCase) if the resulting key is <= 64 characters. Otherwise choose a short descriptive name.

When content has tokens (%%), replace them with letters X, Y, Z, P, Q, R, S, T, U, V, W by position. For example:
"%% Tile Unrest for %% months" should be XTileUnrestForYMonths.

If a localization content doesn't match its key, its key should be changed to match the content if the resulting key is <= 64 characters.

When multiple keys have the same content and are not entity names, they should be merged and a generic key name should be chosen, For example:
`{ BuildingEffect1: "%% Tile Unrest", EventEffect2: "%% Tile Unrest" }` should be
`{ XTileUnrest: "%% Tile Unrest" }`
When they are entity names, they can be duplicated - entity naming rule takes precedence.

## Improvement Suggestions

Localization should contain minimum required keys. Localization content should be consistent and clear.

List the following suggestions so that I can review. DO NOT directly implement them.
- When a key can be replaced by compositing two other keys, suggest eliminating the key.
- When several keys contain similar content, suggest replacing them with a more generic content
- When keys can be rearranged to improve reusability, suggest an alternative arrangement
- When localization content is inconsistent, e.g. different casing, different ways of describing the same thing
- When localization is ambiguous or unclear
- When localization can be improved for conciseness and clarity
- When localization contains only token (%%), symbols and numbers, i.e. without anything content to localize, they should not be part of the localization and should be inlined

Implement the following fixes directly.
When localization content has misspelling or grammar error
If a localization uses second-person perspective (you, your), it should be changed to use first-person perspective (we, our), except for:
- Purely functional UI text (e.g. Are you sure you want to hard reset the game?)
- Quote (In This Sign, You Shall Conquer).
- "I'm ready to restore the empire". Because it is a UI functional button.
If a localization does not have a person perspective, leave it as is

# Check After Making Changes

Whenever you change a localization content, also change its key accordingly to match the content if the key is <= 64 characters. Otherwise, review if the current key is still descriptive enough for the new content, if not, change it to a more descriptive name.
To check if the project compiles after changes, run `pnpm run build` in the **root** project.
After changing the project, run `pnpm run check` in the **root** project to apply formatting, linting and import sorting.
After changing language files (e.g. `en.ts`), Run `pnpm run translate` in the **root** project to check argument, remove unused keys and apply formatting.

When encountered a case not covered by the above documentation and you are not sure what to do, flag it out so I can add it here.
