export function randomColor(random: () => number = Math.random): number {
   const randomInt = (min: number, max: number): number => {
      return Math.floor(random() * (max - min + 1)) + min;
   };
   const h = randomInt(0, 360);
   const s = randomInt(50, 100);
   const l = randomInt(70, 100);
   return hslToRgb(h, s, l);
}

export function hslToRgb(h: number, s: number, l: number): number {
   s /= 100;
   l /= 100;

   const k = (n: number) => (n + h / 30) % 12;
   const a = s * Math.min(l, 1 - l);
   const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

   const r = Math.round(f(0) * 255);
   const g = Math.round(f(8) * 255);
   const b = Math.round(f(4) * 255);

   return (r << 16) + (g << 8) + b;
}

export function rgbToHsl(color: number): [number, number, number] {
   const r = (color >> 16) & 0xff;
   const g = (color >> 8) & 0xff;
   const b = color & 0xff;

   const rN = r / 255;
   const gN = g / 255;
   const bN = b / 255;

   const max = Math.max(rN, gN, bN);
   const min = Math.min(rN, gN, bN);

   let h = 0;
   let s = 0;
   let l = (max + min) / 2;

   if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
         case rN:
            h = (gN - bN) / d + (gN < bN ? 6 : 0);
            break;
         case gN:
            h = (bN - rN) / d + 2;
            break;
         case bN:
            h = (rN - gN) / d + 4;
            break;
      }
      h = h * 60;
   }

   // Ensure h is in [0, 360)
   h = Math.round(h);
   s = Math.round(s * 100);
   l = Math.round(l * 100);

   return [h, s, l];
}
