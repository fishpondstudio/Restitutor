import { resetGame } from "../game/LoadSave";
import { provinceResourceOf } from "../game/logic/ProvinceLogic";
import { getVersion } from "../game/Version";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { ModalComp, ModalTitleBar } from "../utils/ModalManager";
import { isSteam, SteamClient } from "../utils/Steam";
import { FloatingTip } from "./components/FloatingTip";
import { html } from "./components/RenderHTMLComp";

export function IncompatibleSaveModal({
   supportedVersion,
   saveVersion,
}: {
   supportedVersion: number;
   saveVersion: number;
}): React.ReactNode {
   const [total, _] = provinceResourceOf("legacy", G.save.state.playerProvince, G.save);
   return (
      <ModalComp size="sm" title={<ModalTitleBar title={$t(L.IncompatibleSave)} />}>
         <div className="m10">
            <div>{html($t(L.YourSaveFileIsNotSupportedByTheGameX, getVersion()))}</div>
            <div className="h10" />
            <div className="box">
               <div className="row mx10 my5">
                  <div className="f1">{$t(L.SupportedVersion)}</div>
                  <div>{supportedVersion}</div>
               </div>
               <div className="row mx10 my5">
                  <div className="f1">{$t(L.SaveVersion)}</div>
                  <div className="text-red">{saveVersion}</div>
               </div>
            </div>
            <div className="h10" />
            <div className="col g5">
               {isSteam() && (
                  <button className="btn py2 w100" onClick={() => SteamClient.openLogFolder()}>
                     {$t(L.OpenLogFolder)}
                  </button>
               )}
               {isSteam() && (
                  <button className="btn py2 w100" onClick={() => SteamClient.openMainSaveFolder()}>
                     {$t(L.OpenSaveFolder)}
                  </button>
               )}
               <FloatingTip label={$t(L.AllYourProgressWillBeResetIncludingYourLegacyPoints)}>
                  <button
                     className="btn py2 w100 text-red"
                     onClick={async () => {
                        await resetGame();
                        window.location.reload();
                     }}
                  >
                     {$t(L.HardReset)}
                  </button>
               </FloatingTip>
               {isSteam() && (
                  <button className="btn py2 w100" onClick={() => SteamClient.quit()}>
                     {$t(L.ExitGame)}
                  </button>
               )}
            </div>
         </div>
      </ModalComp>
   );
}
