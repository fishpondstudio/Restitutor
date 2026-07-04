import sharp from "sharp";
import { glob } from "glob";


async function replaceWhiteWithTransparent(
  inputPath: string,
  outputPath: string,
  tolerance: number
) {
  const image = sharp(inputPath).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

  const out = Buffer.alloc(info.width * info.height * 4);
  const threshold = 255 - tolerance;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const origA = data[i + 3];

    if (r >= threshold && g >= threshold && b >= threshold) {
      out[i] = 255;
      out[i + 1] = 255;
      out[i + 2] = 255;
      out[i + 3] = 0;
    } else {
      out[i] = r;
      out[i + 1] = g;
      out[i + 2] = b;
      out[i + 3] = origA;
    }
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

async function convertAllFiles(): Promise<void> {
  const files = await glob("*.png", { nodir: true });
  for (const file of files) {
    await replaceWhiteWithTransparent(file, file.replace(".png", "_t.png"), 100);
  }
}

convertAllFiles().catch(err => {
  console.error("Error during batch conversion:", err);
});
