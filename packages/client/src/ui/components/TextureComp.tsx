import { SCALE_MODES } from "pixi.js";
import { G } from "../../utils/Global";

export function TextureComp({
   name,
   width,
   height,
   ...attrs
}: { name: string; width?: number; height?: number } & React.HTMLAttributes<HTMLDivElement>): React.ReactNode {
   const { style, ...rest } = attrs;
   const spriteStyle = getTextureSpriteStyle(name, width, height, style);
   if (!spriteStyle) {
      return null;
   }
   return <div style={spriteStyle} {...rest}></div>;
}

export function getTextureSpriteStyle(
   name: string,
   width?: number,
   height?: number,
   style?: React.CSSProperties,
): React.CSSProperties | null {
   const texture = G.textures.get(name);
   if (!texture) {
      return null;
   }
   const scale = width ? width / texture.width : height ? height / texture.height : 1;
   const isPixel = texture.baseTexture.scaleMode === SCALE_MODES.NEAREST;
   if (isPixel && !Number.isInteger(scale)) {
      console.error(`TextureComp: Pixel texture (${name}) should have integer scale!`);
   }
   const spriteStyle: React.CSSProperties = {
      ...style,
      backgroundImage: `url("${G.atlasUrl.get(name)}")`,
      width: `${(texture.width * scale) / 16}rem`,
      height: `${(texture.height * scale) / 16}rem`,
      backgroundPosition: `-${(texture.frame.x * scale) / 16}rem -${(texture.frame.y * scale) / 16}rem`,
      backgroundSize: `${(texture.baseTexture.width * scale) / 16}rem ${(texture.baseTexture.height * scale) / 16}rem`,
      imageRendering: isPixel ? "pixelated" : "auto",
   };
   return spriteStyle;
}
