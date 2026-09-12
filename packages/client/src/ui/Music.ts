import { hasFlag, randOne } from "@project/shared/src/utils/Helper";
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

const MusicBaseUrl = "https://restitutor-music.fishpondstudio.com";

export const MusicCatalog: readonly TaggedMusicTrack[] = [
   { url: `${MusicBaseUrl}/LostFrontier.mp3`, tag: "Default" },
   { url: `${MusicBaseUrl}/TheAncientLegend.mp3`, tag: "Default" },
   { url: `${MusicBaseUrl}/RoyalCoupling.mp3`, tag: "Default" },
   { url: `${MusicBaseUrl}/Americana.mp3`, tag: "Default" },
   { url: `${MusicBaseUrl}/TempleOfTheManes.mp3`, tag: "Default" },
   { url: `${MusicBaseUrl}/Titan.mp3`, tag: "Default" },
   { url: `${MusicBaseUrl}/Angevin.mp3`, tag: "Default" },
   { url: `${MusicBaseUrl}/MemoriesOfStone.mp3`, tag: "Default" },
   { url: `${MusicBaseUrl}/MidnightTale.mp3`, tag: "Default" },

   { url: `${MusicBaseUrl}/VirtutesVocis.mp3`, tag: "Christian" },
   { url: `${MusicBaseUrl}/AmazingGrace2011.mp3`, tag: "Christian" },

   { url: `${MusicBaseUrl}/Legionnaire.mp3`, tag: "War" },
   { url: `${MusicBaseUrl}/Crusade.mp3`, tag: "War" },
   { url: `${MusicBaseUrl}/FiveArmies.mp3`, tag: "War" },

   { url: `${MusicBaseUrl}/ProcessionOfTheKing.mp3`, tag: "Wedding" },

   { url: `${MusicBaseUrl}/CourtOfTheQueen.mp3`, tag: "Birth" },

   { url: `${MusicBaseUrl}/AgnusDeiX.mp3`, tag: "Funeral" },
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
