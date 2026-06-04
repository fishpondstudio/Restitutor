import { Slider } from "@mantine/core";
import { MaxGoodsTaxRate, MinGoodsTaxRate } from "../game/definitions/Province";
import { GameStateUpdated } from "../game/Events";
import { getProvinceStat, setProvinceStat } from "../game/logic/ProvinceLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";

export function GoodsTaxRateComp(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const goodsTaxRate = getProvinceStat("goodsTaxRate", G.save.state.playerProvince, G.save);
   return (
      <>
         <div className="row">
            <div className="f1">{$t(L.GoodsTaxRate)}</div>
            <div>{goodsTaxRate}%</div>
         </div>
         <div className="h10" />
         <Slider
            value={goodsTaxRate}
            min={MinGoodsTaxRate}
            max={MaxGoodsTaxRate}
            step={1}
            onChange={(value) => {
               setProvinceStat("goodsTaxRate", value, G.save.state.playerProvince, G.save);
               GameStateUpdated.emit();
            }}
         />
         <div className="h10" />
         <div className="row">
            <button
               className="btn"
               onClick={() => {
                  setProvinceStat("goodsTaxRate", MinGoodsTaxRate, G.save.state.playerProvince, G.save);
                  GameStateUpdated.emit();
               }}
            >
               {$t(L.Min)}
            </button>
            <div className="f1" />
            <button
               className="btn"
               onClick={() => {
                  setProvinceStat("goodsTaxRate", MaxGoodsTaxRate, G.save.state.playerProvince, G.save);
                  GameStateUpdated.emit();
               }}
            >
               {$t(L.Max)}
            </button>
         </div>
      </>
   );
}
