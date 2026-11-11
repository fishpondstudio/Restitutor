# Production and integration

## WebP export

Use available tools or ad hoc scripts; Node and the project's `sharp` dependency are suitable. Default export settings:

| Setting | Value |
| --- | --- |
| Dimensions | 800×800 |
| Encoding | Lossy WebP, quality **50**, effort **6** |
| Color / transparency | Opaque sRGB |
| Metadata | Strip |
| Destination | `packages/client/src/assets/images/events/<CatalogKey>.webp` |

Quality is the encoder's 0–100 setting, not a percentage of dimensions or file size. No byte-size cap is currently enforced. Alternate settings or size-budget policies require user approval.

Resize the selected native render once, without cropping or upscaling. Inspect the exported WebP in ignored output before installation. For authorized replacements, overwrite the original path and retain the catalog key/import; do not create `V2` or other version-suffixed runtime files. Reused assets need no re-encoding.

For compression-only requests, preserve the scene, dimensions, filenames, credits and mappings. Prefer the original selected render, verifying that it matches the installed artwork rather than an obsolete candidate. If unavailable, re-encode the installed WebP without resizing and disclose that fallback. Do not generate new art or modify portraits, style references or unrelated scenarios.

## Catalog shape and credits

Inspect `packages/client/src/game/events/EventImages.ts` before editing. Preserve its interface; `scenario` is required and uses the existing `Scenario` type. Add one import and entry per new image:

```ts
import TKArmyProvisioning from "../../assets/images/events/TKArmyProvisioning.webp";

TKArmyProvisioning: {
   scenario: "ThreeKingdoms194",
   url: TKArmyProvisioning,
   credit: "This image is upscaled, reconstructed or assisted by AI-powered models",
   keywords: ["ThreeKingdoms", "Army", "Supplies", "Logistics"],
},
```

Use the exact AI credit shown above, without an appended title or model name. Keywords describe culture, subjects, actions, objects and setting—not style or production method; omit `Gongbi`, `AIGenerated` and `AI Generated`. Preserve existing credits on reused entries. Compatible events reference the same `EventImage` key, never duplicate binaries.

## Reconstruction sources

Obtain and inspect the original; verify its depicted scene, attribution and usage rights. Keep the same AI catalog credit and report the source URL and known title/artist/edition in the final response. If licensing requires additional visible attribution, clarify its display before integration. Do not invent attribution or present generated output as the original artwork. Style crops and game portraits are not reconstructed source paintings.

## Working files

The deliverables are selected WebPs, catalog entries and event mappings. Keep candidates, comparison sheets, ad hoc scripts and optional run-level notes under ignored `output/event-images/<run>/`; no PNG/JPEG masters belong in runtime assets.

Do not create per-image metadata/provenance manifests, sidecars or archives anywhere, including `docs/internal/event-art/`. Avoid extra 2K/4K masters. Preserve prior runs and user files; deleting an existing runtime asset requires task authorization and a repository-wide usage check.

## Validation

- Verify catalog imports, file existence, scenario eligibility, credits, keywords and intended event mappings.
- Check actual WebP dimensions, lossy encoding, opacity and stripped metadata; verify encoder settings through the export operation, not guesses from file size.
- Confirm event mechanics/text and unrelated assets are unchanged.
- After artwork integration, run `pnpm run check` and `pnpm run build` from the repository root, then `git diff --check`.
