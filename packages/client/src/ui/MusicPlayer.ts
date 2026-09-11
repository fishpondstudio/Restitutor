import { shuffle } from "@project/shared/src/utils/Helper";

export interface MusicTrack {
   readonly url: string;
   readonly gain?: number;
}

export type MusicPlaylist = readonly MusicTrack[];

const CrossfadeSeconds = 4;
const PreloadSeconds = 30;
const LoadTimeoutSeconds = 30;
const RetrySeconds = 30;

interface Deck {
   audio: HTMLAudioElement;
   source: MediaElementAudioSourceNode;
   gain: GainNode;
   track?: MusicTrack;
   deadline?: number;
   starting?: object;
}

export class MusicPlayer {
   private readonly context = new AudioContext();
   private readonly volume = this.context.createGain();
   private readonly decks = [this.createDeck(), this.createDeck()];
   private readonly retries = new Map<string, number>();
   private readonly timer: ReturnType<typeof setInterval>;
   private playlist: MusicPlaylist = [];
   private queue: MusicTrack[] = [];
   private requestedTrack?: MusicTrack;
   private current?: Deck;
   private transition?: { incoming?: Deck; endsAt: number };
   private lastTrackUrl?: string;
   private paused = true;
   private disposed = false;
   private lifecycle = 0;

   constructor() {
      this.volume.gain.value = 0;
      this.volume.connect(this.context.destination);
      void this.context.suspend();
      this.timer = setInterval(() => this.update(), 250);
   }

   setPlaylist(playlist: MusicPlaylist): void {
      if (this.disposed || this.playlist === playlist) return;
      this.playlist = playlist;
      this.queue = [];
      this.clearPending();
      this.update();
   }

   playTrack(track: MusicTrack): void {
      if (this.disposed || this.requestedTrack?.url === track.url) return;
      this.requestedTrack = track;
      this.clearPending();
      this.update();
   }

   pause(): void {
      if (this.disposed || this.paused) return;
      this.paused = true;
      this.lifecycle++;
      this.decks.forEach((deck) => {
         deck.starting = undefined;
         deck.audio.pause();
      });
      void this.context.suspend();
   }

   resume(): void {
      if (this.disposed) return;
      if (!this.paused && this.context.state === "running") {
         this.update();
         return;
      }
      this.paused = false;
      const lifecycle = ++this.lifecycle;
      void this.context.resume().then(
         () => {
            if (lifecycle === this.lifecycle) this.update();
         },
         () => {
            if (lifecycle === this.lifecycle) this.pause();
         },
      );
   }

   setVolume(value: number): void {
      if (this.disposed) return;
      const gain = Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
      const now = this.context.currentTime;
      holdGain(this.volume.gain, now);
      this.volume.gain.linearRampToValueAtTime(gain, now + 0.05);
   }

   dispose(): void {
      if (this.disposed) return;
      this.disposed = true;
      this.lifecycle++;
      clearInterval(this.timer);
      this.decks.forEach((deck) => {
         this.clearDeck(deck);
         deck.source.disconnect();
         deck.gain.disconnect();
      });
      this.volume.disconnect();
      void this.context.close();
   }

   private clearPending(): void {
      if (this.transition) return;
      for (const deck of this.decks) {
         if (deck !== this.current && deck.track?.url !== this.requestedTrack?.url) this.clearDeck(deck);
      }
   }

   private update(): void {
      if (this.disposed || this.paused || this.context.state !== "running") return;
      const now = this.context.currentTime;
      for (const deck of this.decks) {
         if (deck.deadline !== undefined && now >= deck.deadline) {
            this.fail(deck, new Error("Music load timed out"));
         }
      }
      if (this.current) this.start(this.current);
      if (this.transition) {
         if (this.transition.incoming) this.start(this.transition.incoming);
         if (now < this.transition.endsAt) return;
         const incoming = this.transition.incoming;
         // Keep a requested outgoing track alive so fading back to it does not restart it.
         for (const deck of this.decks) {
            if (deck !== incoming && deck.track?.url !== this.requestedTrack?.url) this.clearDeck(deck);
         }
         this.current = incoming;
         this.transition = undefined;
      }
      const current = this.current;
      const playingRequested = this.requestedTrack && current?.track?.url === this.requestedTrack.url;
      const requested = playingRequested ? undefined : this.requestedTrack;
      const keepCurrent =
         playingRequested ||
         (!requested && current?.track && this.playlist.some((track) => track.url === current.track?.url));
      const remaining =
         current && Number.isFinite(current.audio.duration)
            ? current.audio.duration - current.audio.currentTime
            : Number.POSITIVE_INFINITY;
      if (!requested && this.playlist.length === 0) {
         if (current && (!playingRequested || remaining <= CrossfadeSeconds)) this.fade();
         return;
      }
      if (keepCurrent && remaining > PreloadSeconds) return;
      const next =
         this.decks.find((deck) => deck !== current && deck.track) ?? this.decks.find((deck) => deck !== current)!;
      if (requested) {
         if (next.track?.url !== requested.url) {
            this.clearDeck(next);
            this.prepare(next, requested);
         }
      } else if (!next.track) {
         this.queue = this.queue.filter((track) => (this.retries.get(track.url) ?? 0) <= now);
         if (this.queue.length === 0) {
            this.queue = shuffle(this.playlist.filter((track) => (this.retries.get(track.url) ?? 0) <= now));
         }
         if (this.queue.length > 1 && this.queue[0].url === this.lastTrackUrl) {
            [this.queue[0], this.queue[1]] = [this.queue[1], this.queue[0]];
         }
         const track = this.queue[0];
         if (!track || track.url === current?.track?.url) return;
         this.prepare(next, track);
      }
      if (!keepCurrent || remaining <= CrossfadeSeconds) this.start(next);
   }

   private createDeck(): Deck {
      const audio = new Audio();
      audio.preload = "auto";
      const source = this.context.createMediaElementSource(audio);
      const gain = this.context.createGain();
      gain.gain.value = 0;
      source.connect(gain);
      gain.connect(this.volume);
      return { audio, source, gain };
   }

   private prepare(deck: Deck, track: MusicTrack): void {
      deck.track = track;
      deck.deadline = this.context.currentTime + LoadTimeoutSeconds;
      deck.audio.oncanplay = () => {
         if (deck.audio.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) return;
         if (!deck.starting) deck.deadline = undefined;
         this.update();
      };
      deck.audio.onwaiting = () => {
         deck.deadline ??= this.context.currentTime + LoadTimeoutSeconds;
      };
      deck.audio.onerror = () => {
         if (!deck.audio.error) return;
         this.fail(deck, deck.audio.error);
         this.update();
      };
      deck.audio.onended = () => {
         if (!deck.audio.ended) return;
         this.release(deck);
         this.update();
      };
      deck.audio.src = track.url;
      deck.audio.load();
   }

   private start(deck: Deck): void {
      const { audio, track } = deck;
      if (!track || deck.starting || audio.ended) return;
      if (!audio.paused) {
         if (deck !== this.current && !this.transition) this.fade(deck);
         return;
      }
      if (audio.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) return;
      const request = {};
      deck.starting = request;
      deck.deadline = this.context.currentTime + LoadTimeoutSeconds;
      void audio.play().then(
         () => {
            if (deck.starting !== request) return;
            deck.starting = undefined;
            deck.deadline = undefined;
            if (deck !== this.current && !this.transition) {
               this.retries.delete(track.url);
               this.fade(deck);
            }
         },
         (error: unknown) => {
            if (deck.starting !== request) return;
            deck.starting = undefined;
            if (error instanceof DOMException && error.name === "NotAllowedError") {
               this.pause();
            } else if (!(error instanceof DOMException && error.name === "AbortError")) {
               this.fail(deck, error);
            }
         },
      );
   }

   private fade(incoming?: Deck): void {
      if (this.requestedTrack?.url === this.current?.track?.url && incoming?.track?.url !== this.requestedTrack?.url) {
         this.requestedTrack = undefined;
      }
      // An override can cancel preloading, so consume the playlist entry only when playback starts.
      if (incoming && !this.requestedTrack && this.queue[0]?.url === incoming.track?.url) this.queue.shift();
      const now = this.context.currentTime;
      const target = incoming?.track?.gain ?? 1;
      for (const deck of this.decks) {
         const gain = deck.gain.gain;
         holdGain(gain, now);
         const initial = gain.value;
         const curve = Float32Array.from({ length: 128 }, (_, index) => {
            const angle = (index / 127) * (Math.PI / 2);
            return deck === incoming ? initial + (target - initial) * Math.sin(angle) : initial * Math.cos(angle);
         });
         if (typeof gain.cancelAndHoldAtTime === "function") {
            gain.setValueCurveAtTime(curve, now, CrossfadeSeconds);
         } else {
            // Firefox cannot cancel an active value curve, so use equivalent linear segments.
            for (let index = 1; index < curve.length; ++index) {
               gain.linearRampToValueAtTime(curve[index], now + (index / (curve.length - 1)) * CrossfadeSeconds);
            }
         }
      }
      if (incoming) this.lastTrackUrl = incoming.track?.url;
      // The audio clock also freezes loading deadlines and crossfades while paused.
      this.transition = { incoming, endsAt: now + CrossfadeSeconds };
   }

   private fail(deck: Deck, error: unknown): void {
      if (!deck.track) return;
      console.warn(`Skipping music track: ${deck.track.url}`, error);
      this.retries.set(deck.track.url, this.context.currentTime + RetrySeconds);
      this.release(deck);
   }

   private release(deck: Deck): void {
      if (deck.track?.url === this.requestedTrack?.url) this.requestedTrack = undefined;
      if (this.transition) {
         const other = deck === this.current ? this.transition.incoming : this.current;
         const survivor = other && !other.audio.ended && !other.audio.error ? other : undefined;
         this.transition = undefined;
         this.current = survivor;
         if (survivor) {
            this.lastTrackUrl = survivor.track?.url;
            const now = this.context.currentTime;
            holdGain(survivor.gain.gain, now);
            survivor.gain.gain.linearRampToValueAtTime(survivor.track?.gain ?? 1, now + 0.25);
         }
      } else if (deck === this.current) {
         this.current = undefined;
      }
      this.clearDeck(deck);
   }

   private clearDeck(deck: Deck): void {
      if (!deck.track) return;
      deck.starting = undefined;
      deck.track = undefined;
      deck.deadline = undefined;
      deck.audio.oncanplay = null;
      deck.audio.onwaiting = null;
      deck.audio.onerror = null;
      deck.audio.onended = null;
      deck.audio.pause();
      deck.audio.removeAttribute("src");
      deck.audio.load();
      deck.gain.gain.cancelScheduledValues(this.context.currentTime);
      deck.gain.gain.value = 0;
   }
}

function holdGain(gain: AudioParam, now: number): void {
   if (typeof gain.cancelAndHoldAtTime === "function") {
      gain.cancelAndHoldAtTime(now);
      return;
   }
   const value = gain.value;
   gain.cancelScheduledValues(now);
   gain.setValueAtTime(value, now);
}
