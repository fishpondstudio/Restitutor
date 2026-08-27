export interface IModConfigFile {
   totalConversion?: bigint;
   addons: Set<bigint>;
}

export interface IModInfo {
   id: bigint;
   kind: "TotalConversion" | "Addon";
}

export const ModConfigFile = "RestitutorModConfig" as const;
