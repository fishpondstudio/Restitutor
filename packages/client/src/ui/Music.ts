import { randOne } from "@project/shared/src/utils/Helper";
import AgnusDeiX from "../assets/music/AgnusDeiX.mp3";
import AmazingGrace2011 from "../assets/music/AmazingGrace2011.mp3";
import Crusade from "../assets/music/Crusade.mp3";
import Hiraeth from "../assets/music/Hiraeth.mp3";
import Legionnaire from "../assets/music/Legionnaire.mp3";
import LostFrontier from "../assets/music/LostFrontier.mp3";
import RoyalCoupling from "../assets/music/RoyalCoupling.mp3";
import TheAncientLegend from "../assets/music/TheAncientLegend.mp3";
import WagnerBridalChorusPiano from "../assets/music/WagnerBridalChorusPiano.mp3";
import { GameOptionUpdated } from "../game/Events";
import { G } from "../utils/Global";
import { MusicPlayer, type MusicPlaylist, type MusicTrack } from "./MusicPlayer";

export const MusicTags = ["Default", "War", "Wedding", "Religion", "Funeral"] as const;
export type MusicTag = (typeof MusicTags)[number];

interface TaggedMusicTrack extends MusicTrack {
   readonly tags: readonly MusicTag[];
}

export const MusicCatalog: readonly TaggedMusicTrack[] = [
   { url: LostFrontier, tags: ["Default"] },
   { url: TheAncientLegend, tags: ["Default"] },
   { url: RoyalCoupling, tags: ["Default"] },
   { url: Hiraeth, tags: ["Default"] },
   // War
   { url: Legionnaire, tags: ["War"] },
   { url: Crusade, tags: ["War"] },
   // Wedding
   { url: WagnerBridalChorusPiano, tags: ["Wedding"] },
   // Religion
   { url: AmazingGrace2011, tags: ["Religion"] },
   // Funeral
   { url: AgnusDeiX, tags: ["Funeral"] },
] as const;

const DefaultPlaylist: MusicPlaylist = MusicCatalog.filter((track) => track.tags.includes("Default"));

let player: MusicPlayer | undefined;
let playlist: MusicPlaylist = DefaultPlaylist;
let pendingTrack: MusicTrack | undefined;
let disposeMusic: (() => void) | undefined;

// Reuse playlist arrays so repeated game-state updates preserve the shuffle queue.
export function setPlaylist(next: MusicPlaylist): void {
   playlist = next;
   player?.setPlaylist(next);
}

export function startTrackByTag(tag: MusicTag): void {
   const candidates = MusicCatalog.filter((track) => track.tags.includes(tag));
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
   music.setPlaylist(playlist);
   if (pendingTrack) {
      music.playTrack(pendingTrack);
      pendingTrack = undefined;
   }
   music.setVolume(G.save.options.musicVolume);
   const options = GameOptionUpdated.on(() => music.setVolume(G.save.options.musicVolume));
   const listeners = new AbortController();
   const events = { signal: listeners.signal };
   const updatePlayback = () => {
      if (document.hidden || !document.hasFocus()) music.pause();
      else music.resume();
   };
   const dispose = () => {
      listeners.abort();
      options.dispose();
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

if (import.meta.hot) {
   import.meta.hot.dispose(() => disposeMusic?.());
}
