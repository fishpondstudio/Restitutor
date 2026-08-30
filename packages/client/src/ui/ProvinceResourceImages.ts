import type { ProvinceResource } from "../game/definitions/Province";
import { IconCatalog } from "./IconCatalog";

export const ProvinceResourceImages = {
   administrative: IconCatalog.Administrative,
   diplomatic: IconCatalog.Diplomatic,
   military: IconCatalog.Military,
   gold: IconCatalog.Gold,
   legacy: IconCatalog.Legacy,
   consulPoint: IconCatalog.Decree,
} as const satisfies Partial<Record<ProvinceResource, string>>;
