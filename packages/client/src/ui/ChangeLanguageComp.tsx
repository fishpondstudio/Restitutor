import { Select } from "@mantine/core";
import type { Language } from "@project/shared/src/rpc/ServerMessageTypes";
import { mapOf } from "@project/shared/src/utils/Helper";
import { GameOptionUpdated } from "../game/Events";
import { Languages } from "../game/Languages";
import { showWarning } from "../game/logic/AlertLogic";
import { G, setLanguage } from "../utils/Global";
import { $t, L } from "../utils/i18n";

export function ChangeLanguageComp(): React.ReactNode {
   return (
      <Select
         checkIconPosition="right"
         leftSection={<div className="mi">translate</div>}
         className="f1"
         value={G.save.options.language}
         data={mapOf(Languages as Record<Language, Record<string, string>>, (lang, content) => ({
            label: content.$Language,
            value: lang,
         }))}
         onChange={(lang) => {
            if (lang) {
               setLanguage(lang as keyof typeof Languages);
               showWarning($t(L.SomeInGameTextsRequireAGameRestartToDisplayInTheNewLanguage));
               GameOptionUpdated.emit();
            }
         }}
      />
   );
}
