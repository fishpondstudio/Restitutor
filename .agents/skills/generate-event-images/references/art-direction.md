# Art direction

## Shared prompt

Use this block in each generation prompt, followed by the scene brief and explicit roles for the supplied references:

> Heroic Three Kingdoms storytelling in classical Chinese Gongbi painting (工笔画): meticulous fine-line ink contouring, smooth mineral pigment washes and traditional illustrated-history linework. Depict Late Eastern Han / Three Kingdoms clothing, not later theatrical costumes. Expressive faces, purposeful gestures, clear silhouettes and one strong focal action readable at game-dialog size. Fine natural line variation, carefully delineated textiles, armor lacing, architecture and landscape. Subtle ivory paper fibers and mineral pigment granulation, not a brown aging filter or noisy overlay. Choose a scene-specific balance of vermilion, malachite, azurite, ochre, charcoal, ivory and restrained gold; do not give every scene the same beige ground and robe colors. Layered pictorial depth, deliberate negative space and controlled light-dark contrast. Movement, weather, painted night or firelight are welcome when appropriate to the story. No 3D, photorealism, photographic faces, anime, oil painting, cinematic post-processing or blur. No text, pseudo-characters, captions, logos, watermark, lettered seals, frames or collage. Opaque square background.

## References

- **Style:** use costume-free detail crops from [style-sheet.webp](../assets/style-sheet.webp) for linework, palette and textures only. Its hats and armor are not historical evidence. Do not copy the sheet layout, labels, poses or character identities.
- **Named characters:** read each current `image` property in `packages/client/src/game/ThreeKingdoms/TKCharacter.ts`, resolve its import relative to that file, inspect the portrait and attach it directly. Preserve recognizable face, hair and color cues while adapting headwear and equipment to the historical guidance below. Portrait likeness does not justify copying fantasy wardrobe. Ignore the portrait's background, border and pose. Do not assume filenames, substitute TV stills or maintain a separate portrait library; ask if a required image is missing.
- **Anonymous shared scenes:** normally need only style crops. Avoid recognizable rulers, faction-specific emblems and identifying props.
- **Reconstruction:** an identified original guides compositional relationships, not identity or wardrobe by default. Apply the source-verification requirements in [production.md](production.md).

Do not use a complete previous event image as the default composition reference. It encourages repeated staging and propagates defects; use it only for a deliberate targeted edit or reconstruction.

## Historical wardrobe

Use the event's Late Eastern Han / Three Kingdoms setting for the entire cast, including background figures. A later illustration of the story is not evidence of period clothing.

- Use cross-collared, right-closing robes, waist sashes, appropriate work tunics and trousers, and simple shoes or practical boots. Avoid later round-collared official uniforms, rank badges and Qing features.
- For informal civilian scenes, plain soft cloth headwraps or bound topknots are conservative choices. Formal Han crowns existed; do not label every rigid or ridged crown as Tang. Use a specific crown only when its form and social context are supported, rather than an invented generic scholar cap. Avoid later futou, winged official hats and theatrical headpieces.
- Prefer restrained laced lamellar armor and simple helmets over elaborate sculpted beast shoulders, decorative metal collars and later theatrical armor ensembles. Scale armor alone is not evidence of an anachronism; evaluate the complete construction.

Useful research starting points are the National Museum of China's [上衣下袴](https://www.chnmuseum.cn/yj/xscg/xslw/201812/t20181224_33119.shtml), Academia Sinica's [Han relief clothing terminology](https://rub.ihp.sinica.edu.tw/~hanrelief/h/h80_0204.htm), and the Met's [Han horse and rider](https://www.metmuseum.org/art/collection/search/62843). Check dates and context: Western Han objects and later Northern/Southern Dynasties figures are not exact Late Han reconstructions. State uncertainty rather than certifying generated clothing as archaeologically exact.

## Composition

State what the scene must not imply: an ongoing battle during explicitly peaceful preparation, forced submission during reconciliation, or final imperial unification during a regional milestone. A retrospective combat illustration can suit an event explicitly celebrating past victories; do not invent a named historical battle, its outcome or an unchosen option. Do not insert an absent rival or emperor merely because the event mentions them.

Match dramatic scale to narrative importance. Faction-defining scenes should convey the relevant person's character and stakes; regional milestones should convey geography and achievement. Reserve quiet paperwork for genuinely administrative subjects, rather than using it as a universal illustration of power.

Military subjects can use battle, cavalry, formations, field command, convoys, fortifications and fleets where the event supports them. Peaceful musters, garrison reviews and monumental ceremonies can convey strength without inventing combat. Keep period wardrobe while allowing heroic staging.

Vary wide landscapes, close character moments, elevated views, diagonals, silhouettes, weather and scene-specific palettes. Share technique, not identical composition. Avoid recurring pavilion-and-pine framing, polite semicircles and red/green/blue robed groups around a desk.

Use a few clearly constructed foreground figures and simplify supporting ranks or crowds to convey scale. Horses, weapons and carts require careful review, not automatic exclusion. Do not solve generation difficulty by reducing every army or imperial occasion to a handful of people.

## Visual checklist

- Check every figure's headwear, collar closure, shoulder/chest armor, hem and footwear, including small background figures.
- Check emotional impact, character recognition, military or ceremonial scale and distinction from neighboring images on the contact sheet.
- Every hand connects to its owner; sleeves do not merge between people. Document handovers and load-bearing hands should read naturally.
- One weapon shaft connects to its blade and grip; no floating spikes, extra bowstrings, shafts through faces or borrowed weapons. For archery, both taut string segments meet at the arrow nock and each joins a bow tip.
- Horses have coherent limbs, reins, bridles and saddles. Cart shafts, axle, wheels and platform connect logically; sacks rest on something.
- Roofs, columns, tent walls and hems form complete structures. Natural occlusion is fine; an erased-looking strip or midair cutoff is not.
- Faces remain distinct; recurring named characters remain recognizable. Look for cloned faces, accidental named rulers, writing and copied reference layouts. Small likenesses remain interpretations.
- Fine lines, textiles, armor and muted washes remain readable in the final WebP at full size and roughly 256px.
