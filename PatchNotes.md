Hi,

I am pleased to present Patch 0.17. As early access approaches, I am keeping patches smaller and more frequent to avoid releasing one giant patch before launch and potentially breaking everything.

[h2]Terrain Expansions[/h2]

I have added terrain information to all tiles. Previously, it was only available for Roman Empire tiles. This does not affect gameplay at the moment, but it will make future content expansions easier. I decided to add it now because migrating the data later could be risky, and I would rather do it before release. I have also added an [b]Arid[/b] terrain type, which is not currently used.

The expanded map requires more rendering work, and I noticed some stuttering when zooming out. I spent some time optimizing the rendering code by adding viewport culling and reducing draw calls. After these optimizations, performance should be roughly back to pre-expansion levels.

[h2]macOS Support[/h2]

In this patch, I have added macOS support. I built and tested it on my aging 2018 MacBook, which is the only Mac I own. The game runs natively on Intel-based Macs, while newer Apple silicon Macs will run it through Rosetta 2. Rosetta 2 adds a bit of overhead, but since the game is very lightweight, it should not pose a problem. The macOS build is also notarized. Although notarization costs €100 per year, it means the game should work out of the box without triggering the "scary" security warning.

[h2]Other Changes[/h2]

[list]
[*][b]Capital Relocation Point[/b] has been replaced with [b]Mandate[/b], which can be used to [b]Relocate Capital[/b]. I plan to expand its use in the future.
[*][b]Nullify Truce[/b] is unlocked by [b]Merchant Guilds[/b] technology.
[*]Map rendering has been optimized, improving performance when displaying terrain.
[*]Packaged desktop builds now load game content more reliably.
[*]A macOS build is now available.
[/list]
