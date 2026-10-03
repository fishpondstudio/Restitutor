## Instructions

- If something is ambiguous or unclear, ask for clarifications - do not silently make assumptions.
- Do not add tests unless explicitly asked to.
- Game is by default running on http://localhost:5173/ - do not use browser (including headless tools) to verify your changes unless explicitly asked to. Running test suites (`pnpm test run`) is always allowed.
- Do not stage your changes unless explicitly asked to.
- Do not add comments unless necessary or explicitly asked to. Comment why (non-obvious things), not what or how.
- Don't worry about formatting when writing code - the project's formatter (`pnpm run check` in root folder) will handle formatting. If unrelated files change after running the formatter, leave those changes be.

## Project Command

- Run `pnpm run build` in the **root** folder to compile TypeScript
- Run `pnpm run check` in the **root** folder to check for format and linter
- Run `pnpm test run` in the **packages/client** folder to run unit test

When running `pnpm` command, if you get Corepack `EPERM` error, retry with approved elevated execution.

## Localization

Localization guide: docs/internal/Localization.md

After changing language files in packages/client/src/languages
- Run `pnpm run translate` in the **root** folder to lint translation