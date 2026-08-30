import { ProvinceResourceImages } from "./ProvinceResourceImages";

export const IconCatalog = {
   ...ProvinceResourceImages,
} as const satisfies Record<string, string>;
