const { spawnSync } = require("node:child_process");
const { mkdtempSync, readdirSync, rmdirSync, statSync, unlinkSync } = require("node:fs");
const { rename } = require("node:fs/promises");
const { join, resolve } = require("node:path");
const { setTimeout: delay } = require("node:timers/promises");

const musicDirectory = resolve(__dirname, "../packages/client/src/assets/music");
const markerName = "RESTITUTOR_MUSIC_PROCESSED";
const settings = {
   version: 1,
   bitrate: 128,
   sampleRate: 44100,
   channels: 2,
   loudness: -20,
   truePeak: -2,
   loudnessRange: 20,
};
const marker = JSON.stringify(settings);
const inputFilter = `aformat=sample_rates=${settings.sampleRate}:channel_layouts=stereo`;

function run(command, args) {
   const result = spawnSync(command, args, {
      encoding: "utf8",
      maxBuffer: 8 * 1024 * 1024,
      windowsHide: true,
   });
   if (result.error?.code === "ENOENT") throw new Error(`${command} must be installed and available on PATH.`);
   if (result.error) throw result.error;
   if (result.status !== 0) throw new Error(`${command} failed: ${result.stderr || result.signal || result.status}`);
   return result;
}

function ffmpeg(args) {
   return run("ffmpeg", ["-hide_banner", "-nostdin", "-nostats", "-xerror", ...args]).stderr;
}

function probe(path) {
   return JSON.parse(
      run("ffprobe", [
         "-v",
         "error",
         "-select_streams",
         "a:0",
         "-show_entries",
         "stream=codec_name,sample_rate,channels,bit_rate:format=duration:format_tags",
         "-of",
         "json",
         path,
      ]).stdout,
   );
}

function readMarker(info) {
   return Object.entries(info.format.tags ?? {}).find(([key]) => key.toUpperCase() === markerName)?.[1];
}

function normalizationFilter(truePeak = settings.truePeak) {
   return `loudnorm=I=${settings.loudness}:TP=${truePeak}:LRA=${settings.loudnessRange}`;
}

function readMeasurements(output) {
   const json = output.match(/\{\s*"input_i"[\s\S]*?\}/)?.[0];
   if (!json) throw new Error("FFmpeg did not return loudness measurements.");
   const measurements = JSON.parse(json);
   for (const key of ["input_i", "input_tp", "input_lra", "input_thresh", "target_offset"]) {
      if (!Number.isFinite(Number(measurements[key]))) {
         throw new Error(`Invalid ${key} measurement: ${measurements[key]}`);
      }
   }
   return measurements;
}

function measure(path) {
   return readMeasurements(
      ffmpeg([
         "-i",
         path,
         "-map",
         "0:a:0",
         "-af",
         `${inputFilter},${normalizationFilter()}:print_format=json`,
         "-f",
         "null",
         "-",
      ]),
   );
}

async function replace(outputPath, path) {
   for (let attempt = 0; ; attempt++) {
      try {
         await rename(outputPath, path);
         return;
      } catch (error) {
         if (process.platform !== "win32" || !["EPERM", "EACCES", "EBUSY"].includes(error.code) || attempt === 5) {
            throw new Error(
               `Cannot replace ${path}. Close any server or player using the file and retry. ${error.message}`,
            );
         }
         await delay(1000);
      }
   }
}

async function prepare(path, info, outputPath) {
   const source = measure(path);
   const sourceSize = statSync(path).size;
   let peakTarget = settings.truePeak;
   for (let attempt = 0; attempt < 3; attempt++) {
      const filter = [
         normalizationFilter(peakTarget),
         `measured_I=${source.input_i}`,
         `measured_TP=${source.input_tp}`,
         `measured_LRA=${source.input_lra}`,
         `measured_thresh=${source.input_thresh}`,
         `offset=${source.target_offset}`,
         "linear=true",
         "print_format=json",
      ].join(":");
      const metadata = Object.keys(info.format.tags ?? {})
         .filter((key) => /^(replaygain_|r128_)|^itunnorm$/i.test(key))
         .flatMap((key) => ["-metadata", `${key}=`]);
      const encoding = readMeasurements(
         ffmpeg([
            "-y",
            "-i",
            path,
            "-map",
            "0:a:0",
            "-map_metadata",
            "0",
            ...metadata,
            "-af",
            `${inputFilter},${filter}`,
            "-c:a",
            "libmp3lame",
            "-b:a",
            `${settings.bitrate}k`,
            "-ar",
            String(settings.sampleRate),
            "-ac",
            String(settings.channels),
            "-id3v2_version",
            "3",
            "-write_id3v1",
            "0",
            "-metadata",
            `${markerName}=${marker}`,
            outputPath,
         ]),
      );
      const output = measure(outputPath);
      const loudness = Number(output.input_i);
      const peak = Number(output.input_tp);
      if (peak > settings.truePeak) {
         peakTarget -= peak - settings.truePeak + 0.2;
         console.log(`  Encoded peak ${peak} dBTP; retrying from the original with more headroom.`);
         continue;
      }
      if (Math.abs(loudness - settings.loudness) > 0.5) {
         throw new Error(`Encoded loudness ${loudness} LUFS is outside the target tolerance of 0.5 LU.`);
      }
      const encoded = probe(outputPath);
      const audio = encoded.streams?.[0];
      const sourceDuration = Number(info.format.duration);
      const outputDuration = Number(encoded.format.duration);
      if (
         audio?.codec_name !== "mp3" ||
         Number(audio.sample_rate) !== settings.sampleRate ||
         audio.channels !== settings.channels ||
         Number(audio.bit_rate) !== settings.bitrate * 1000 ||
         !Number.isFinite(sourceDuration) ||
         !Number.isFinite(outputDuration) ||
         Math.abs(sourceDuration - outputDuration) > 0.1 ||
         readMarker(encoded) !== marker
      ) {
         throw new Error("Encoded audio format, duration, or processing metadata failed verification.");
      }
      if (encoding.normalization_type !== "linear") {
         console.log("  Dynamic normalization was needed to meet the loudness and peak targets.");
      }
      const outputSize = statSync(outputPath).size;
      await replace(outputPath, path);
      console.log(
         `  ${source.input_i} → ${loudness} LUFS; ${peak} dBTP; ` +
            `${(sourceSize / 1e6).toFixed(2)} → ${(outputSize / 1e6).toFixed(2)} MB`,
      );
      return;
   }
   throw new Error("Encoded true peak remains above the target after three attempts; original retained.");
}

async function main() {
   if (process.argv.length > 2) throw new Error("Usage: pnpm run music:prepare");
   const files = readdirSync(musicDirectory, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".mp3"))
      .map((entry) => entry.name)
      .sort();
   const pending = [];
   for (const name of files) {
      const path = join(musicDirectory, name);
      const info = probe(path);
      const previousMarker = readMarker(info);
      if (previousMarker === marker) {
         console.log(`Skip ${name}: already processed.`);
      } else if (previousMarker !== undefined) {
         throw new Error(`${name} has different processing metadata. Restore its original from Git before processing.`);
      } else {
         pending.push({ name, path, info });
      }
   }
   if (pending.length === 0) return;
   const temporaryDirectory = mkdtempSync(join(musicDirectory, ".music-prepare-"));
   const outputPath = join(temporaryDirectory, "output.mp3");
   let failed = 0;
   try {
      for (const { name, path, info } of pending) {
         console.log(`Process ${name}`);
         try {
            await prepare(path, info, outputPath);
         } catch (error) {
            failed++;
            console.error(`  ${error.message}`);
         }
      }
   } finally {
      try {
         unlinkSync(outputPath);
      } catch (error) {
         if (error.code !== "ENOENT") throw error;
      }
      rmdirSync(temporaryDirectory);
   }
   if (failed > 0) throw new Error(`${failed} track(s) failed; their originals were retained.`);
}

main().catch((error) => {
   console.error(error.message);
   process.exitCode = 1;
});
