import { entriesOf, fromEntries } from "@project/shared/src/utils/Helper";
import { Goods } from "../game/definitions/Goods";
import type { ProvinceResource } from "../game/definitions/Province";
import { IconCatalog } from "./IconCatalog";

export const ProvinceResourceImages = {
   administrative: IconCatalog.Administrative,
   diplomatic: IconCatalog.Diplomatic,
   military: IconCatalog.Military,
   gold: IconCatalog.Gold,
   legacy: IconCatalog.Legacy,
   consulPoint: IconCatalog.Decree,
   generalSkillPoint: IconCatalog.VacantArmyGeneral,
   christianity: IconCatalog.EcumenicalCouncil,
   ...fromEntries(entriesOf(Goods).map(([key, config]) => [key, config.icon])),
} as const satisfies Partial<Record<ProvinceResource, string>>;
