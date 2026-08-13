import { isSteam, SteamClient } from "../rpc/SteamClient";

export function unlockAchievement(id: string): void {
   if (isSteam()) {
      SteamClient.unlockAchievement(id);
   }
}
