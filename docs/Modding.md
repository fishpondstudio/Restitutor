# Modding Guide

Choose a mod type based on what you want to change:

| Type | Entry point in the mod's root folder | Behavior |
| --- | --- | --- |
| Total conversion (TC) | `index.html` | Loads this HTML instead of the normal game. |
| Addon | `index.js`, with no `index.html` | Runs JavaScript inside the loaded game. |

If both entry points exist, the mod is treated as a TC. The game supports one TC and multiple addons at a time.

## Addon Mods

Create `index.js` at your mod's root, without an `index.html`. Bundle it as a classic JavaScript script, not an ES module: top-level `import` and `export` are unsupported. Relative URLs resolve against the game document, not your mod folder.

For example, reduce a building's construction cost. Wrap your code in a function to avoid variable collisions with other addons:

```js
(() => {
   const building = D.Buildings.Amphitheatre;
   building.construction.gold = 75;
   GameStateUpdated.emit();
})();
```

The [loader](../packages/client/src/LoadAddonMods.ts) runs enabled addons from installed Steam Workshop folders, not arbitrary local folders or browser development sessions. Reload the game after editing a script.

Addons run after save and scene initialization and game-loop startup, with access to three globals:

### G

Access the running game through [`G`](../packages/client/src/utils/Global.tsx):

| Member | Contents |
| --- | --- |
| `G.save` | The in-memory [SaveGame](../packages/client/src/game/GameState.ts), including `state` and `options`. |
| `G.save.state` | Current provinces, tiles, player province, and other game state. |
| `G.scene` | The [scene manager](../packages/client/src/utils/SceneManager.ts). |
| `G.pixi` | The Pixi `Application`; its renderer is available as `G.pixi.renderer`. |
| `G.textures` | A `Map<string, Texture>` of loaded game textures. |

Changes to `G.save` can persist in saves; changes to `D` are runtime definition edits.

### GameStateUpdated

Use this event to refresh or observe game-state changes:

- `GameStateUpdated.emit()` synchronously notifies listeners, invalidating calculation caches, rebuilding dynamic modifiers, and refreshing subscribed UI. It does not advance time or save the game.
- `const subscription = GameStateUpdated.on(callback)` listens for future updates, such as simulation tick and player actions. The callback receives no payload but you can use `G.save` to examine the latest game save. Call `subscription.dispose()` to unsubscribe.
- `GameStateUpdated.once(callback)` listens for the next update only.

Do not emit from inside an update listener (it causes recursion), or call `clear()` (it removes the game's listeners too). See [TypedEvent.ts](../packages/shared/src/utils/TypedEvent.ts) for the full API.

### D

`D` exposes the game's shared definition objects. Follow the source links for field types and callback signatures:

| Member | Definitions |
| --- | --- |
| `D.Buildings` | [Buildings](../packages/client/src/game/definitions/Building.ts) |
| `D.CasusBelli` | [Reasons for declaring war](../packages/client/src/game/definitions/CasusBelli.ts) |
| `D.ChristianHeresy` | [Christian heresies](../packages/client/src/game/definitions/Religion.ts) |
| `D.Culture` | [Cultures](../packages/client/src/game/definitions/Culture.ts) |
| `D.CultureReligionStatus` | [Culture and religion statuses](../packages/client/src/game/definitions/CultureReligionStatus.ts) |
| `D.GameEvents` | [Game events](../packages/client/src/game/events/GameEvents.ts) |
| `D.Goods` | [Goods and recipes](../packages/client/src/game/definitions/Goods.ts) |
| `D.GreatWork` | [Great works](../packages/client/src/game/definitions/GreatWork.ts) |
| `D.LegacyUpgrades` | [Legacy upgrades](../packages/client/src/game/definitions/LegacyUpgrade.ts) |
| `D.Modifiers` | [Modifiers](../packages/client/src/game/definitions/Modifier.ts) |
| `D.PersonTrait` | [Person traits](../packages/client/src/game/definitions/PersonTrait.ts) |
| `D.Province` | [Provinces](../packages/client/src/game/definitions/Province.ts) |
| `D.ProvinceUpgrades` | [Province upgrades](../packages/client/src/game/definitions/ProvinceUpgrades.tsx) |
| `D.Religion` | [Religions](../packages/client/src/game/definitions/Religion.ts) |
| `D.RestorationBonus` | [Restoration bonuses](../packages/client/src/game/definitions/RestorationBonus.ts) |
| `D.SocialClass` | [Social classes](../packages/client/src/game/definitions/SocialClass.ts) |
| `D.SocialClassBonuses` | [Social class bonuses](../packages/client/src/game/definitions/SocialClass.ts) |
| `D.SpawnedProvinces` | [Spawned provinces](../packages/client/src/game/definitions/SpawnedProvince.ts) |
| `D.Tech` | [Technologies](../packages/client/src/game/definitions/Tech.ts) |
| `D.Terrains` | [Terrains](../packages/client/src/game/definitions/Terrain.ts) |
| `D.TimedActions` | [Timed actions](../packages/client/src/game/definitions/TimedAction.ts) |

When editing definitions:

- Modify fields, rather than replacing `D` members: assigning `D.Goods = { ... }` does not replace the game's imported object. Other addons may overwrite your edits.
- Preserve function-valued names and descriptions. Read with `D.Goods.bread.name()`; replace with `D.Goods.bread.name = () => "Artisan Bread"` (a fixed name, not a translation).
- Prefer existing identifiers. There is no registration or save-migration API for new entries.
- Edits do not reinitialize saves or scenes. One-time derived data, such as goods prices, tiers, technology links, and the great-work tile lookup, is not rebuilt by `GameStateUpdated.emit()`.

## Total Conversion Mods

Use a TC for changes to game code, UI, or initialization:

1. Fork or clone the repository and follow the [development setup](../README.md#build).
2. Make your changes. Run `pnpm run build` in the repository root to check TypeScript.
3. Run `pnpm run build` in `packages/client` to produce the game bundle in `packages/client/dist`.
4. Package the **contents** of `dist` as your mod's root: `index.html` plus its scripts and assets, preserving their paths.

To support addons, retain the addon loader and compatible globals; a TC's `index.html` alone does not load them.

The game's source code is licensed under GPLv3. Before distributing a TC, review the [licensing and asset restrictions](../README.md#license).

## Uploading to Steam Workshop

[SteamWorkshopUploader](https://github.com/nihilocrat/SteamWorkshopUploader) is a third-party upload tool. The [setup guide](https://puck.gitbook.io/modding/publishing/steamworkshopuploader) is written for Puck; adapt it for Restitutor as follows:

1. Set the uploader's `steam_appid.txt` to `4431750` and verify that the tool displays this App ID.
2. Create a Workshop item and place your mod files directly in its `WorkshopContent/<YourMod>` folder:
   - **Addon:** `index.js` at the folder root, with no `index.html`.
   - **TC:** the contents of `packages/client/dist`, with `index.html` at the folder root and all script and asset paths preserved.
3. Set the title, description, preview image, and visibility, then submit. Ignore the guide's Puck-specific tags, DLL instructions, and dedicated-server requirement for public visibility.
4. To update the same item, replace its content files, enter a change note, and submit again.

Do not nest your mod's entry point inside an extra folder. If uploading requires accepting the [Steam Workshop agreement](https://steamcommunity.com/workshop/workshoplegalagreement/), accept it and retry.