export function remToPx(rem: string): number {
   return Number.parseFloat(rem) * Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
}
