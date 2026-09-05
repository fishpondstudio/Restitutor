import { sound } from "@pixi/sound";
import { forEach } from "@project/shared/src/utils/Helper";
import click from "../assets/sounds/click.mp3";
import error from "../assets/sounds/error.mp3";
import event from "../assets/sounds/event.mp3";
import shatter from "../assets/sounds/shatter.mp3";
import sword from "../assets/sounds/sword.mp3";

import { G } from "../utils/Global";

const SoundClips = {
   click,
   error,
   sword,
   event,
   shatter,
} as const satisfies Record<string, string>;

export type SoundClip = keyof typeof SoundClips;

export function loadSounds(): void {
   forEach(SoundClips, (key, value) => {
      sound.add(key, value);
   });
}

export function playSound(clip: SoundClip): void {
   if (!G.save) return;
   sound.play(clip, { volume: G.save.options.volume });
}

document.addEventListener(
   "click",
   (e) => {
      if (e.target instanceof HTMLElement) {
         if (e.target.dataset.skipSound) {
            return;
         }
         if (getComputedStyle(e.target).cursor.includes("pointer")) {
            playSound("click");
         }
      }
   },
   { capture: true },
);
