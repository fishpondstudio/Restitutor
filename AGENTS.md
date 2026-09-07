## Instructions

- Do not add tests unless explicitly asked to.
- Do not stage your changes unless explicitly asked to.
- Do not add comments unless necessary or explicitly asked to. Comment why (non-obvious things), not what or how.

## Project Command

- Run `pnpm run build` in the **root** folder to compile TypeScript
- Run `pnpm run check` in the **root** folder to check for format and linter
- Run `pnpm test run` in the **packages/client** folder to run unit test

When running `pnpm` command, if you get Corepack `EPERM` error, retry with approved elevated execution.

## Localization

Localization guide: packages\client\doc\Localization.md

After changing language files in packages\client\src\languages
- Run `pnpm run translate` in the **root** folder to lint translation