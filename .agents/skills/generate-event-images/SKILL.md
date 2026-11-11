---
name: generate-event-images
description: Reuse, generate, review and integrate Three Kingdoms event artwork with period-appropriate Gongbi scenes and compressed WebP assets.
---

# Generate event images

Use this workflow for Three Kingdoms event artwork. Resolve skill links relative to this directory and project paths relative to the repository root. No prior conversation, output directory or bundled executable is required.

## Scope

- An artwork request for event files includes selection, generation when needed, export and integration unless the user requests review or previews only. Skill maintenance alone does not authorize artwork changes.
- Change only the requested assets, catalog entries and event image mappings—not mechanics, descriptions or conditions. Corrections and compression-only tasks should preserve existing mappings unless a remap is requested.
- Follow project instructions, preserve unrelated and staged work, and do not stage, add tests or verify in a browser unless requested.
- Ask about unclear scope or a different historical setting before applying this art direction.

## 1. Plan reuse first

Read the target events, including descriptions and conditions, and `packages/client/src/game/events/EventImages.ts`. Filter catalog entries by **`scenario: "ThreeKingdoms194"`**, then inspect keywords and images. Entries marked `Rome192` or missing a scenario are ineligible; never infer eligibility from filenames or relabel Roman artwork.

Classify each event:

- **Reuse:** an existing scene fits the action, setting, visible characters and narrative importance. Share its catalog key and binary; a generic topical match is not enough for a defining episode.
- **Shared new scene:** no eligible image adequately fits a group of compatible events. Use anonymous figures and a semantic `TK` catalog key, not per-event artwork.
- **Iconic new scene:** a distinctive moment or faction-defining episode warrants dedicated art and is not adequately represented. Use the relevant character references rather than anonymous substitutes. A passing mention of a named person is not sufficient reason.

Check reuse across the requested files. Share by narrative fit, not keywords alone: local settlement, regional offices and large-scale consolidation need not use the same administrative scene. Reuse count is a review signal, not a fixed cap. Preparation is not battle, incorporation is not an assault, and alternate-history outcomes are not historical claims.

For artwork changes, keep a compact event-to-image plan in a new ignored `output/event-images/<run>/` directory. Explain each new scene or replacement and report reuse/shared-new/iconic counts. Give each composition a distinct action, scale, viewpoint, setting and palette; different catalog names do not guarantee visual variety. Proceed with authorized work without introducing a routine approval gate.

## 2. Design and generate

Read [art-direction.md](references/art-direction.md) for the shared prompt, reference selection, period wardrobe and visual checklist. Write a brief for each image: event IDs, intended reuse, story moment, cast, action, setting, composition and narrative constraints.

Default to reimagined Gongbi scenes. Reconstruct a specific source only when requested or when it materially fits an iconic event; follow the source and credit rules in [production.md](references/production.md).

Use `GEMINI_API_KEY` with Nano Banana. Verify `gemini-nano-banana-2.1` through the provider's model listing before generation. If unavailable, verify a supported successor in Google's official documentation; do not silently switch provider. Never log or persist the key, reference bytes or base64 responses.

Generate **1024×1024, square 1:1**, normally two distinct candidates per image group—not per event. Allow at most two additional targeted repair/regeneration requests per image. Bound concurrency and transient retries; do not retry permanent failures or rerun completed jobs. Use unique candidate filenames.

## 3. Inspect and select

Inspect every candidate using the art-direction checklist. Choose for narrative impact, period wardrobe, coherent construction and readability. Compare candidates with the existing catalog on a contact sheet: reject repetitive staging even when individual images are technically acceptable. A successful API call or dimension check is not visual approval.

Repair isolated defects; regenerate poor compositions within the request budget. A targeted edit may use the candidate as its reference, but recheck the entire result afterward. Select autonomously for normal integration. If no candidate is acceptable, leave the existing mapping intact, complete independent work and report the unresolved issue.

## 4. Export and deliver

Follow [production.md](references/production.md) for encoding, credits, catalog edits, file handling and validation. Inspect final compressed images at full size and roughly 256px before installing them.

Report coverage, reuse versus new artwork, relevant source credits, validation and unresolved issues. Include a local comparison sheet for visual changes and aggregate size savings for compression work.

For skill-only maintenance, validate documentation consistency and local reference paths; do not generate artwork or build the game unnecessarily.
