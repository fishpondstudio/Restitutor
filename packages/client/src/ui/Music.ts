import { hasFlag, randOne } from "@project/shared/src/utils/Helper";
import AgnusDeiX from "../assets/music/AgnusDeiX.mp3";
import AmazingGrace2011 from "../assets/music/AmazingGrace2011.mp3";
import Americana from "../assets/music/Americana.mp3";
import Angevin from "../assets/music/Angevin.mp3";
import CourtOfTheQueen from "../assets/music/CourtOfTheQueen.mp3";
import Crusade from "../assets/music/Crusade.mp3";
import FiveArmies from "../assets/music/FiveArmies.mp3";
import Legionnaire from "../assets/music/Legionnaire.mp3";
import LostFrontier from "../assets/music/LostFrontier.mp3";
import MemoriesOfStone from "../assets/music/MemoriesOfStone.mp3";
import MidnightTale from "../assets/music/MidnightTale.mp3";
import ProcessionOfTheKing from "../assets/music/ProcessionOfTheKing.mp3";
import RoyalCoupling from "../assets/music/RoyalCoupling.mp3";
import TempleOfTheManes from "../assets/music/TempleOfTheManes.mp3";
import TheAncientLegend from "../assets/music/TheAncientLegend.mp3";
import Titan from "../assets/music/Titan.mp3";
import VirtutesVocis from "../assets/music/VirtutesVocis.mp3";
import { isChristianReligion } from "../game/definitions/Religion";
import { GameOptionUpdated, GameStateUpdated } from "../game/Events";
import { getCurrentWars } from "../game/logic/WarLogic";
import { G, GameFlags } from "../utils/Global";
import { MusicPlayer, type MusicPlaylist, type MusicTrack } from "./MusicPlayer";

export const MusicTags = ["Default", "War", "Wedding", "Christian", "Funeral", "Birth"] as const;
export type MusicTag = (typeof MusicTags)[number];

interface TaggedMusicTrack extends MusicTrack {
   readonly tag: MusicTag;
}

export const MusicCatalog: readonly TaggedMusicTrack[] = [
   { url: LostFrontier, tag: "Default" },
   { url: TheAncientLegend, tag: "Default" },
   { url: RoyalCoupling, tag: "Default" },
   { url: Americana, tag: "Default" },
   { url: TempleOfTheManes, tag: "Default" },
   { url: Titan, tag: "Default" },
   { url: Angevin, tag: "Default" },
   { url: MemoriesOfStone, tag: "Default" },
   { url: MidnightTale, tag: "Default" },

   { url: VirtutesVocis, tag: "Christian" },
   { url: AmazingGrace2011, tag: "Christian" },

   { url: Legionnaire, tag: "War" },
   { url: Crusade, tag: "War" },
   { url: FiveArmies, tag: "War" },

   { url: ProcessionOfTheKing, tag: "Wedding" },

   { url: CourtOfTheQueen, tag: "Birth" },

   { url: AgnusDeiX, tag: "Funeral" },
] as const;

let player: MusicPlayer | undefined;
let playlistTags = new Set<MusicTag>(["Default"]);
let playlist: MusicPlaylist = MusicCatalog.filter((track) => playlistTags.has(track.tag));
let pendingTrack: MusicTrack | undefined;
let disposeMusic: (() => void) | undefined;

export function setPlaylist(tags: readonly MusicTag[]): void {
   const next = new Set(tags);
   if (next.size === playlistTags.size && [...next].every((tag) => playlistTags.has(tag))) return;
   playlistTags = next;
   playlist = MusicCatalog.filter((track) => playlistTags.has(track.tag));
   player?.setPlaylist(playlist);
}

export function startTrack(tag: MusicTag): void {
   if (hasFlag(G.flags, GameFlags.Sandbox)) return;
   const candidates = MusicCatalog.filter((track) => track.tag === tag);
   if (candidates.length === 0) return;
   const track = randOne(candidates);
   if (player) {
      player.playTrack(track);
   } else {
      pendingTrack = track;
   }
}

export function initMusic(): void {
   disposeMusic?.();
   const music = new MusicPlayer();
   player = music;
   updatePlaylist();
   music.setPlaylist(playlist);
   if (pendingTrack) {
      music.playTrack(pendingTrack);
      pendingTrack = undefined;
   }
   music.setVolume(G.save.options.musicVolume);
   const options = GameOptionUpdated.on(() => music.setVolume(G.save.options.musicVolume));
   const state = GameStateUpdated.on(updatePlaylist);
   const listeners = new AbortController();
   const events = { signal: listeners.signal };
   const updatePlayback = () => {
      if (document.hidden || !document.hasFocus()) music.pause();
      else music.resume();
   };
   const dispose = () => {
      listeners.abort();
      options.dispose();
      state.dispose();
      music.dispose();
      if (player === music) player = undefined;
   };
   window.addEventListener("pointerdown", updatePlayback, events);
   window.addEventListener("keydown", updatePlayback, events);
   window.addEventListener("focus", updatePlayback, events);
   window.addEventListener("blur", updatePlayback, events);
   document.addEventListener("visibilitychange", updatePlayback, events);
   window.addEventListener("pageshow", updatePlayback, events);
   window.addEventListener("pagehide", (event) => (event.persisted ? music.pause() : dispose()), events);
   disposeMusic = dispose;
   updatePlayback();
}

function updatePlaylist(): void {
   if (getCurrentWars(G.save.state.playerProvince, G.save).length > 0) {
      setPlaylist(["War"]);
   } else {
      const tags: MusicTag[] = ["Default"];
      const state = G.save.state.provinces[G.save.state.playerProvince];
      if (state && isChristianReligion(state.religion)) {
         tags.push("Christian");
      }
      setPlaylist(tags);
   }
}

if (import.meta.hot) {
   import.meta.hot.dispose(() => disposeMusic?.());
}
