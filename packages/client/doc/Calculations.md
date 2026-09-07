# Optional calculation breakdowns

Shared infrastructure lives in `src/game/logic/Calculation.ts`. Existing getters and breakdown helpers remain unchanged; migrate individual dependency chains when profiling justifies it.

## Public API

Migrated getters default to the existing breakdown result and accept a final `"value"` argument for a primitive:

```ts
getTileManpower(tile, save); // IValueBreakdown
getTileManpower(tile, save, "breakdown"); // IValueBreakdown
getTileManpower(tile, save, "value"); // number
```

These calls illustrate the intended API; only migrated getters support explicit modes. Conditions follow the same convention, returning `IConditionBreakdown` or `boolean`. Currently, `getTileUpgradeCost` and `getGameEventCondition` are migrated at the top level. Custom game-event conditions and their reusable condition helpers produce lazy `ConditionChecks`.

`EvaluationResult<M, B>` describes the mode/result relationship. `EvaluationGetter<Args, B>` provides the public overloads for an arbitrary parameter tuple, including a union return for a runtime-variable mode. `EvaluationFunction<Key, B>` is its keyed `(key, save, mode?)` alias. `EvaluationImplementation<Key, B>` describes an internal generic implementation with a required mode.

## Declaring getters

Use `defineValueGetter` instead of repeating overloads for each uncached value getter:

```ts
export const getPopulationValue = defineValueGetter(
   (tile: Tile, save: SaveGame, mode: EvaluationMode = "breakdown") => {
      const calc = new ValueCalculation(mode);
      const data = save.state.tiles.get(tile);
      if (data) {
         calc.add(data.population * 1000)?.describe($t(L.Population));
      }
      return calc.finish();
   },
);

getPopulationValue(tile, save); // IValueBreakdown
getPopulationValue(tile, save, "breakdown"); // IValueBreakdown
getPopulationValue(tile, save, "value"); // number
```

The helper infers all preceding parameters from the implementation. The existing `defineConditionGetter` works identically with `ConditionCalculation`, exposing `IConditionBreakdown` and `boolean` results. For automatic short-circuiting, prefer the generator-based `defineConditionChecks` API described below.

The two accumulator-based helpers return the original function unchanged. They do not forward calls, construct argument arrays, or add per-call allocations. The variadic tuples exist only in types.

**The implementation must supply `mode: EvaluationMode = "breakdown"` and return the matching accumulator's `finish()` result on every path.** The shared helpers contain the type assertions that expose the public overloads; they trust this mode/result relationship, just as handwritten overloads do. They do not insert a runtime default or validate the returned shape.

These exports are `const` functions rather than hoisted function declarations. Check initialization-time dependencies when converting an existing getter. Existing callers and nested breakdown producers do not need to change.

## Value calculations

Use one accumulator per evaluation:

```ts
const calc = new ValueCalculation(mode);

calc.add(data.population * 1000)?.describe(
   $t(L.Population),
   $t(L.$1PerPopulationUpgrade, "1000"),
);

if (data.buildings.has("ArmyCamp")) {
   calc.multiply(0.2)?.describe(Buildings.ArmyCamp.name());
}

return calc.finish();
```

`add(value)` and `multiply(value)` always update numeric totals. In breakdown mode they also return the newly appended breakdown item, which exposes `describe(name, desc?)`. In value mode they return `undefined`.

**Keep presentation expressions inside the optional call.** JavaScript skips its arguments when the handle is absent, including object literals, translations, formatting, and function calls. Do not compute descriptions beforehand, pass eagerly constructed metadata into the arithmetic methods, or introduce per-contribution callbacks.

The explanation item is also the handle: there is no second wrapper object, and its method lives on the prototype. Its numeric value is readonly through the handle. Do not mutate returned breakdown arrays or item values to change a calculation: numeric totals, not the arrays, are authoritative.

In value mode, calculation infrastructure allocates only the accumulator. Gameplay helpers and legacy callees can still allocate independently.

### Arithmetic and configuration

`multiply(value)` **adds a multiplier contribution**, matching the existing `IValueBreakdown.multiply` array. It does not multiply the current total by that value.

The result is:

```ts
roundIfProvided(totalAdd * clamp(totalMultiply, 0, Infinity))
```

`finish(round?)` preserves the clamp and rounding order of `finalizeBreakdown`, but does not rescan the recorded entries. Supply an existing rounding function where possible rather than creating a callback on every call.

The constructor takes `(mode, multiplyBase = 1, reverse?)`. Numeric configuration uses primitive arguments, so value mode needs no options object. For a custom multiplier base and label:

```ts
const calc = new ValueCalculation(mode, maintenance / 100, true);
calc.multiplyBase?.describe($t(L.ArmyMaintenance));
```

The default base label is localized only in breakdown mode. `reverse` affects presentation only.

`finish()` can be called again, but a detailed calculation returns the same breakdown object. Do not share an accumulator between evaluations or treat repeated detailed results as independent snapshots.

## Conditions

Use `defineConditionChecks` for conditions that should stop at the first failure in value mode:

```ts
export const getRevenueCoverage = defineConditionChecks(
   function* (province: Province, save: SaveGame): ConditionChecks {
      const revenue = getProvinceIncome(province, save).revenue.value;
      const totalInterest = getMonthlyInterestCost(province, save);

      (yield revenue >= totalInterest)?.describe(
         $t(L.WeHaveEnoughRevenueToCoverTheInterestCost),
         {
            desc: $t(L.Revenue$1InterestCost$2, formatNumber(revenue), formatNumber(totalInterest)),
            progress: [revenue, totalInterest],
         },
      );
   },
);

getRevenueCoverage(province, save); // IConditionBreakdown
getRevenueCoverage(province, save, "breakdown"); // IConditionBreakdown
getRevenueCoverage(province, save, "value"); // boolean
```

`ConditionChecks` is `Generator<boolean, void, ConditionExplanation | undefined>`. Each `yield` suspends execution after evaluating a predicate. The shared evaluator decides whether to resume and supplies the optional explanation handle as the result of the yield expression.

- In value mode, a passing check resumes with `undefined`, so description arguments are skipped. A failed check closes the generator and returns `false` immediately. Later predicates, loops, descriptions, and nested calls do not execute.
- In breakdown mode, every check resumes with its explanation item. The generator fills in its metadata and continues, even after a failure. The evaluator returns the complete breakdown.
- A bare `return` or reaching the end completes the checks already yielded. An empty generator succeeds, matching `finalizeCondition([])`. To express failure, `yield false`; do not return a boolean.

The optional details object supports `desc`, `progress`, and `hidden`. Its allocation, including any progress tuple, is skipped in value mode. Keep all presentation work inside `?.describe(...)`.

The generator receives only gameplay arguments, ending in a required `SaveGame` argument. The wrapper owns the optional trailing mode, including defaulting omitted or explicitly `undefined` modes to `"breakdown"`. Requiring `save` last makes mode detection unambiguous without relying on function arity, default parameters, or parameter names. There is no accumulator, mode parameter, `finish()`, or early-failure guard in the generator body.

Preserve predicate order and keep predicates free of gameplay side effects: value mode intentionally skips work after a failure. The evaluator invokes the generator's `return()` on early termination so ordinary `finally` cleanup runs. Cleanup must not yield additional checks or perform gameplay effects. Exceptions propagate rather than being converted into failed conditions.

Raw `ConditionChecks` producers compose directly with `yield*`:

```ts
function* eventChecks(province: Province, save: SaveGame): ConditionChecks {
   yield* minCoreTileChecks(10, province, save);
   yield* anyCoreTileChecks(targetTiles, province, save);
}

export const getEventChecks = defineConditionChecks(eventChecks);
```

Only the public getter is wrapped. Nested generators are producers, not independently evaluated getters; `yield*` forwards yielded predicates, explanation handles, completion, and early closure without creating an intermediate evaluator or breakdown. A `for...of` loop must not replace `yield*`, because it cannot forward explanation handles back to the nested generator.

Unmigrated paths may still use eager `ICondition` or `ICondition[]` producers. Once invoked, those producers construct all condition objects and presentation metadata before their results can be evaluated, so do not call them from migrated event producers.

Unlike the identity declaration helpers, `defineConditionChecks` has a runtime driver: each evaluation uses an argument array, a generator instance, and iterator-result objects. Delegated generators add their own iterator overhead but no nested evaluator or breakdown allocation. Value mode creates no condition accumulator, explanation items, breakdown arrays, or presentation metadata in migrated producers. Gameplay dependencies may still allocate legacy breakdowns or collections, so this is not an allocation-free guarantee for the full call graph. Generator overhead can outweigh short-circuit savings when most checks pass, so profile representative early-failing, late-failing, and all-passing workloads before expanding migration.

`ConditionCalculation` and `defineConditionGetter` remain available for existing accumulator-based implementations. They record every supplied check and do not automatically short-circuit subsequent predicate evaluation.

## Modifier helpers

`ModifierLogic.ts` provides additive, accumulator-based counterparts:

- `attachModifiersToCalculation(type, calc, province, save)`
- `attachTileModifiersToCalculation(modifiers, calc)`

They preserve static/dynamic modifier order and the existing duration-description rules. Formatting happens only through optional explanation calls. Both return the original accumulator.

Keep using `attachModifiers` and `attachTileModifiers` in legacy implementations. Do not build temporary legacy breakdowns to feed migrated calculations.

## Cached getters

Use `cacheTileEvaluation` or `cacheProvinceEvaluation` from `CacheLogic.ts` for migrated keyed getters. They expose the public overloads while supplying a required mode to the implementation:

```ts
export const getExample = cacheTileEvaluation<IValueBreakdown>((tile, save, mode) => {
   const calc = new ValueCalculation(mode);
   const data = save.state.tiles.get(tile);
   if (data) {
      calc.add(data.population * 1000)?.describe($t(L.Population));
   }
   return calc.finish();
});

getExample(tile, save); // IValueBreakdown
getExample(tile, save, "value"); // number
```

The callback is contextually generic in its mode, so `calc.finish()` has the appropriate conditional return type without gameplay casts. Explicitly supplying the breakdown type also makes the wrapper's public result contract clear.

For uncached getters, use the declaration helpers described above. The cache wrappers already supply public overloads and the default mode; their callbacks do not need `defineValueGetter` or `defineConditionGetter`.

All four public cache helpers share the same keyed storage and `GameStateUpdated` invalidation. The session has one global `SaveGame`, so cache entries are keyed only by wrapper identity and tile/province, not by save. The public `save` argument is still forwarded to calculations. Each wrapper has an opaque namespace; function names are not cache keys. Weak references allow discarded wrappers to be collected. Lookups do not allocate result wrappers or cache maps; storage is created only when inserting a result.

`cacheTile` and `cacheProvince` cache any normal return value, including `0`, `false`, `null`, and `undefined`. They use explicit presence checks rather than treating falsy values as cache misses.

Evaluation cache behavior (`cacheTileEvaluation` and `cacheProvinceEvaluation`):

- Only breakdowns are cached. A breakdown miss calculates and stores the full result.
- A cached breakdown serves either mode, using `.value` for primitive requests.
- A value miss calculates the primitive directly without storing it or creating a cache map. Repeated value requests recompute until a breakdown is cached.

`GameStateUpdated` replaces the shared weak-map store, immediately invalidating both caching policies without per-wrapper generation counters.

Create wrappers at module scope, like the existing cached getters. The caches retain the existing event-based freshness contract: mutations between update events are not automatically detected. Returned breakdowns should be treated as read-only by consumers.

The `cacheTile` and `cacheProvince` signatures remain compatible with existing callers. Their storage uses collision-free wrapper identities and correctly caches falsy results. They are not mode-aware and must not wrap a migrated getter.

## Incremental migration rules

1. Preserve existing public breakdown interfaces and default calls.
2. Request a child's `"value"` whenever its explanations are not consumed, even if the parent itself is producing a breakdown.
3. Calls to unmigrated children may continue using `.value`; those children still allocate until migrated.
4. Preserve contribution order, conditions, rounding, early-return behavior, and presentation metadata. In particular, inspect legacy early returns that bypass finalization rather than blindly replacing them with `finish()`.
5. Migrate helpers that return individual `ICondition` objects or condition arrays when they are on the selected hot path; wrapping their legacy results does not remove their allocations.
6. Profile cold, warm, and mixed-mode calls. Compound results such as province income need an explicit numeric summary API; the keyed wrappers here target single value/condition breakdowns only.
