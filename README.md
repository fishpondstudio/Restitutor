# Restitutor

Restitutor is a historical incremental grand strategy game focused on statecraft, diplomacy, and calculated warfare. Strengthen your economy, research new technologies, form alliances, and outmaneuver rivals through high-level strategic decisions without micromanagement.

- [Play on Steam](https://store.steampowered.com/app/4431750/Restitutor_Empire_Restored/)

# Get Involved

## Localization

All localizations are contribute by the community. If you'd like to help, visit [here for more info](https://github.com/fishpondstudio/Restitutor/tree/main/packages/client/src/languages).

## Build

Prerequisites:
- Install Node.JS (20.x is recommended)
- Install [VSCode](https://code.visualstudio.com/download) and [BiomeJS](https://biomejs.dev/reference/vscode/) extension
- Install [pnpm](https://pnpm.io/installation)

Setting up dependencies:
- Clone this repository and run `pnpm install` in the terminal

Running the Project:
- Go to `packages/client` and run `pnpm run dev`
- Browse to 'http://localhost:5173/'

Type checking:
- Run `pnpm run build` in the **root** folder to compile TypeScript
- Run `pnpm run check` in the **root** folder to check for format and linter
- Run `pnpm run translate` to remove unused translation and lint translation

# License

- Game's source code is licensed under **GNU General Public License v3.0**
- Third party libraries are licensed under their corresponding licenses
- Game's artworks and assets are included in this repository for development convenience. However, due to the complications of the original licenses, please **do not redistribute them**