Hi,

I am pleased to present Patch 0.18. This patch introduces a new playable province, divorce mechanic, and brings Steam Workshop mod support.

[h2]New Playable Province: Britannia[/h2]

Britannia is now available as a playable province. Its campaign follows the province through the late Roman period, from Septimius Severus at Eboracum in 208 A.D. to the withdrawal of Constantine's forces in 407 A.D.

The missions for Britannia are focused across the channel: they first open campaigns against Germania, Belgica, or Lugdunensis, followed by establishing a bridgehead in Gaul, taking Belgica as a client, and weakening Lugdunensis through intrigue. Further missions focus on conquering northern Gaul, reaching the Mediterranean coast, and securing a foothold in Tarraconensis.

Britannia also has three unique Provincial Spirits:

[list]
[*][b]Maritime Ambition[/b] - Enemy tiles reachable by sea from our province contribute 20% less War Score.
[*][b]Naval Tradition[/b] - Gain 0.5% War Power for each core coastal tile, up to 50%.
[*][b]Coastal Mandate[/b] - Gain 1 Consul Point when coring a coastal tile.
[/list]

[h2]Divorce[/h2]

After being married for 120 months (10 years), the governor's spouse can be divorced.

[list]
[*]Divorce costs 1,000 Gold and, in provinces following a Christian religion, 10 Christian Influence.
[*]Divorce applies -10 Stability and -10% Prestige for 60 months.
[/list]


[h2]Mod + Steam Workshop[/h2]

I am happy to announce that modding is supported via Steam Workshop. After you've subscribed to mods and Steam has downloaded them, the game should launch with "Mods Manager" - there you can choose what mods you want to load. There are two kinds of supported mods: addon and total conversion. You can load multiple addon mods, but only one total conversion mods.

When you have installed mods, the game will always launch with "Mods Manager". This prevents badly behaving mods from "bricking" the game. If you don't have mods installed, the game will launch normally as before.

We are still in the early days of modding - I will work on adding APIs, documentation and examples. If you want to get your hands dirty, you can read the source code on GitHub (the source code is GPL 2.0 Licensed). I have also created #restitutor-modding channel on Discord.


[h2]Other Changes[/h2]

[list]
[*]Mandate is now displayed on the Internal Affairs page.
[*]The Reconquista casus belli has also been balanced: tiles originally owned by us now contribute 20% less to War Score, down from 30%.
[/list]
