import { entriesOf, fromEntries } from "@project/shared/src/utils/Helper";
import { Goods } from "../game/definitions/Goods";
import type { ProvinceResource } from "../game/definitions/ProvinceResources";
import { IconCatalog } from "./IconCatalog";

export const ProvinceResourceImages: Partial<Record<ProvinceResource, string>> = {
   administrative: IconCatalog.Administrative,
   diplomatic: IconCatalog.Diplomatic,
   military: IconCatalog.Military,
   gold: IconCatalog.Gold,
   legacy: IconCatalog.Legacy,
   consulPoint: IconCatalog.Decree,
   generalSkillPoint: IconCatalog.VacantArmyGeneral,
   christianity: IconCatalog.EcumenicalCouncil,
   mandate: IconCatalog.Mandate,
   islam: IconCatalog.Islam,
   ...fromEntries(entriesOf(Goods).map(([key, config]) => [key, config.icon])),
} as const;
