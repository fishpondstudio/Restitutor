import Administrative from "../assets/images/Administrative.svg";
import Decree from "../assets/images/Decree.svg";
import Diplomatic from "../assets/images/Diplomatic.svg";
import Gold from "../assets/images/Gold.svg";
import Legacy from "../assets/images/Legacy.svg";
import Military from "../assets/images/Military.svg";
import type { ProvinceResource } from "../game/definitions/Province";

export const ProvinceResourceImages = {
   administrative: Administrative,
   diplomatic: Diplomatic,
   military: Military,
   gold: Gold,
   legacy: Legacy,
   generalSkillPoint: Military,
   consulPoint: Decree,
} as const satisfies Partial<Record<ProvinceResource, string>>;
