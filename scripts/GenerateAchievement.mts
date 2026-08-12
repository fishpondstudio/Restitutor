import { mkdir } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ACHIEVEMENT_SIZE = 500;
const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const framePath = resolve(projectRoot, "arts", "Frame.png");
const outputDirectory = resolve(projectRoot, "arts", "achievements");

async function generateAchievement(
  paintingPath: string,
  targetFileName: string,
): Promise<void> {
  if (basename(targetFileName) !== targetFileName) {
    throw new Error("The target must be a file name, not a path.");
  }

  const jpegFileName = targetFileName.toLowerCase().endsWith(".jpg")
    ? targetFileName
    : `${targetFileName}.jpg`;
  const outputPath = resolve(outputDirectory, jpegFileName);
  const unachievedPath = resolve(outputDirectory, `_${jpegFileName}`);

  await mkdir(outputDirectory, { recursive: true });

  await sharp(resolve(paintingPath))
    .rotate()
    .resize(ACHIEVEMENT_SIZE, ACHIEVEMENT_SIZE, {
      fit: "cover",
      position: "centre",
    })
    .composite([{ input: framePath, blend: "over" }])
    .jpeg({ quality: 90 })
    .toFile(outputPath);

  await sharp(outputPath)
    .grayscale()
    .linear(0.75, 25)
    .jpeg({ quality: 90 })
    .toFile(unachievedPath);

  console.log(`Generated: ${outputPath}`);
  console.log(`Generated: ${unachievedPath}`);
}

const [paintingPath, targetFileName, ...extraArguments] = process.argv.slice(2);

if (!paintingPath || !targetFileName || extraArguments.length > 0) {
  console.error(
    "Usage: node scripts/GenerateAchievement.mts <painting-path> <target-file-name>",
  );
  process.exitCode = 1;
} else {
  generateAchievement(paintingPath, targetFileName).catch((error: unknown) => {
    console.error("Failed to generate achievement images:", error);
    process.exitCode = 1;
  });
}
