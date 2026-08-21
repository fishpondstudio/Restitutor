Hi,

I am pleased to present Patch 0.15. This patch expands the endgame with three grand missions - restoring the Western Roman Empire and dominating the western and eastern Mediterranean - each accompanied by new achievements. It also introduces two new Senate Actions, new Legacy upgrades for tolerated cultures and religions, clearer tile information with culture and religion status, and a round of warfare, AI, and production balancing.

[h2]New Missions and Achievements[/h2]

Three new grand missions are available for late-game campaigns, replacing the old Incorporation of Hispania mission:

[list]
[*][b]The Western Roman Empire Restored[/b] - Annex and core every province of the Western Roman Empire, from Britannia to Africa. Completing it renames your province to the Western Roman Empire and grants +200 Governing Capacity plus one point of each type. Unlocks the achievement Renovatio Imperii.
[*][b]Dominion of the Western Sea[/b] - Bring every port and island from the Pillars of Hercules to the Adriatic under your rule, including Baetica, Tarraconensis, Narbonensis, Italia, Sicilia, Corsica, Sardinia, Dalmatia, Africa, and Mauretania. Choose to govern through law, bind the ports through diplomacy, or entrust the sea to our fleets. Unlocks the achievement Mare Nostrum.
[*][b]Dominion of the Eastern Sea[/b] - Control the great ports and islands from the Adriatic to the Nile, spanning Macedonia, Achaia, Asia, Syria, Judea, Aegyptus, and more. As with the western dominion, law, treaty, and fleets offer three paths to +100 Governing Capacity and a point of your chosen kind. Unlocks the achievement Queen of Cities.
[/list]

Mission event lists on the Mission page can now be collapsed for easier navigation.

[h2]New Senate Actions[/h2]

[list]
[*][b]Nullify Truce[/b] - Immediately ends one of our active truces, opening the path to declaring a new war. Available once every 24 months.
[*][b]Bolster Dignitas[/b] - Gain +20% Prestige for 12 months at the cost of 1 Consul point.
[/list]

Existing timed actions were also rebalanced

[list]
[*]Declare Mobilization now provides +20% War Power (up from 10%).
[*]Affirm Civic Unity now grants +20 Stability (up from 10).
[/list]

[h2]Legacy Upgrades[/h2]

Two new Legacy upgrades extend the legacy tree branches:

[list]
[*]+1 Tolerated Culture.
[*]+1 Tolerated Religion.
[/list]

[h2]Tile Information and Defense[/h2]

[list]
[*]Tiles now display their culture and religion status as Dominant, Tolerated, or Minor.
[*]Tiles not connected to the provincial capital by land receive -10% Tile Defense.
[*]Tiles in open rebellion (rebellion 10 or higher) receive -20% Tile Defense.
[*]Infrastructure now grants +1% Tile Defense per level (up from 0.5%).
[*]Tiles show which provinces have a core claim on them.
[/list]

[h2]Warfare Balance[/h2]

[list]
[*]Under a Reconquista casus belli, tiles originally owned by us now contribute 30% less to war score (down from 50%).
[*]Conquering tiles that is our core contribute 30% less to war score (down from 50%).
[/list]

[h2]NPC Improvements[/h2]

[list]
[*]NPC provinces now fill their tolerated culture and religion slots based on the makeup of their tiles.
[*]NPC provinces now use Appease to calm heavily rebellious tiles before unrest escalates.
[*]NPC provinces manage army maintenance between peacetime and wartime, keeping forces affordable in peace and effective in war.
[*]Fixed NPC conscription targets potentially exceeding valid bounds.
[/list]

[h2]Other Changes[/h2]

[list]
[*]Evangelize now costs Christianity instead of Administrative Power.
[*]Added French language support, translated by community contributors (@vergiiiCIV)
[*]The Chronicle page is now virtualized, improving performance in long campaigns.
[/list]

[h2]Bug Fixes[/h2]

[list]
[*]Fixed production capacity being over-allocated beyond the province's limit; excess capacity is now automatically reduced, prioritizing higher-tier goods.
[/list]
