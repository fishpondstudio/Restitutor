import sharp from "sharp";
import { glob } from "glob";
/**
 * Converts a grayscale texture into a white-only texture with alpha.
 * Black → alpha = 1
 * White → alpha = 0
 * Original alpha is preserved (multiplied).
 */
async function convertToWhiteAlpha(
  inputPath: string,
  outputPath: string
) {
  const image = sharp(inputPath).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

  const out = Buffer.alloc(info.width * info.height * 4);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];       // grayscale (r=g=b)
    const origA = data[i+3]; // original alpha (0–255)

    // Convert grayscale → alpha (black=1, white=0)
    const reliefAlpha = 255 - r;

    // Combine with original alpha
    const finalAlpha = Math.round((origA / 255) * (reliefAlpha / 255) * 255);

    // Output: white RGB + preserved alpha
    out[i] = 255;
    out[i + 1] = 255;
    out[i + 2] = 255;
    out[i + 3] = finalAlpha;
  }

  await sharp(out, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
    .png()
    .toFile(outputPath);

  console.log("Converted:", outputPath);
}

async function convertAllFiles() : Promise<void> {
  const files = await glob("../**/Shaded/*.png", { nodir: true });
  for (const file of files) {
    await convertToWhiteAlpha(file, file);
  }
}

convertAllFiles().catch(err => {
  console.error("Error during batch conversion:", err);
});