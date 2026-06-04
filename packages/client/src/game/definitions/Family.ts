import type { ValueOf } from "@project/shared/src/utils/Helper";
import type { PersonTrait } from "./PersonTrait";
import type { GovernorStats, Province } from "./Province";

export const PersonFlags = {
   None: 0,
   IsGeneral: 1 << 0,
} as const;

export type PersonFlag = ValueOf<typeof PersonFlags>;

export interface IPerson extends GovernorStats {
   name: [string, string, string];
   age: number;
   flag: PersonFlag;
   traits: Set<PersonTrait>;
   province: Province;
}

export interface IFamily {
   id: string;
   male: IPerson | null;
   female: IPerson | null;
   children: IFamily[];
}

export interface IGovernorFamily extends IFamily {
   male: IPerson;
}

export interface IFullFamily extends IFamily {
   male: IPerson;
   female: IPerson;
}
