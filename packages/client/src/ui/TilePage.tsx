import { Progress, Slider } from "@mantine/core";
import { clamp, formatNumber, formatPercent, type Tile } from "@project/shared/src/utils/Helper";
import { finalizeCondition } from "../game/actions/GameAction";
import { Buildings } from "../game/definitions/Building";
import { Culture } from "../game/definitions/Culture";
import { Goods, Price } from "../game/definitions/Goods";
import { Religion } from "../game/definitions/Religion";
import { getTileName } from "../game/definitions/TileName";
import { TimedActions } from "../game/definitions/TimedAction";
import { GameStateUpdated } from "../game/Events";
import { getProvinceName, getProvinceStat } from "../game/logic/ProvinceLogic";
import {
   getTileDefense,
   getTileGoodsTax,
   getTileGoverningCost,
   getTileLandTax,
   getTileMaintenanceCost,
   getTileManpower,
   getTileOutput,
   getTileUnrest,
   isCapital,
   tileIsOurCoreCondition,
} from "../game/logic/TileLogic";
import { TimedActionDescComp } from "../game/logic/TimedActionDescComp";
import { timedActionConditions } from "../game/logic/TimedActionLogic";
import { getWarForTile } from "../game/logic/WarLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { showModal } from "../utils/ModalManager";
import { ActionButton } from "./ActionButton";
import { AppeaseButton } from "./AppeaseButton";
import { BreakdownRow, BreakdownTooltip } from "./BreakdownRow";
import { CrackDownButton } from "./CrackDownButton";
import { showSidebar } from "./common/Sidebar";
import { SidebarComp } from "./common/SidebarComp";
import { colorNumberReverse } from "./components/ColorNumber";
import { FloatingTip } from "./components/FloatingTip";
import { html } from "./components/RenderHTMLComp";
import { DiplomacyPage } from "./DiplomacyPage";
import { MakeCoreButton } from "./MakeCoreButton";
import { playClick } from "./Sound";
import { TileBuildingsModal } from "./TileBuildingsModal";
import { UpgradeInfrastructureButton, UpgradePopulationButton, UpgradeProductionButton } from "./UpgradeButtons";
import { WarTooltip } from "./WarTooltip";

export function TilePage({ tile }: { tile: Tile }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const tileData = G.save.state.tiles.get(tile);
   if (!tileData) {
      return null;
   }
   const state = G.save.state.provinces[tileData.province];
   if (!state) {
      return null;
   }
   const totalUpgrades = tileData.infrastructure + tileData.production + tileData.population;
   const isMyProvince = tileData.province === G.save.state.playerProvince;
   const war = getWarForTile(tile, G.save);
   const tileProduction = getTileOutput(tile, G.save);
   const goodsTaxRate = getProvinceStat("goodsTaxRate", tileData.province, G.save) / 100;
   const goodsTax = goodsTaxRate * tileProduction.value * Price[tileData.goods];
   if (import.meta.env.DEV) {
      console.assert(goodsTax === getTileGoodsTax(tile, G.save), "Goods tax calculation is correct");
   }
   return (
      <SidebarComp title={getTileName(tile)}>
         <div className="m10">
            <div className="row my5">
               <div className="f1">{$t(L.Province)}</div>
               <button
                  onClick={() => showSidebar(<DiplomacyPage province={tileData.province} />)}
                  className="btn text-sm"
               >
                  {$t(L.Diplomacy)}
               </button>
               <div>{getProvinceName(tileData.province, G.save)}</div>
            </div>
            {isCapital(tile, G.save) && (
               <div className="row my5">
                  <div className="f1">{$t(L.Capital)}</div>
                  <div className="mi sm text-green">check_circle</div>
               </div>
            )}
            <div className="row my5">
               <div className="f1">{$t(L.Core)}</div>
               <div>
                  {tileData.coreProvinces.has(tileData.province) ? (
                     <div className="mi sm text-green">check_circle</div>
                  ) : (
                     <div className="mi sm text-red">cancel</div>
                  )}
               </div>
               <MakeCoreButton tile={tile} />
            </div>
            <div className="row my5">
               <div className="f1">{$t(L.Terrain)}</div>
               <div>{tileData.terrain}</div>
            </div>
            <div className="row my5">
               <div className="f1">{$t(L.Culture)}</div>
               <div>{Culture[tileData.culture].name()}</div>
            </div>
            <div className="row g5 my5">
               <div className="f1">{$t(L.Religion)}</div>
               {isMyProvince && (
                  <ActionButton
                     action={{
                        cost: { administrative: 10 * totalUpgrades },
                        condition: finalizeCondition({
                           breakdown: [
                              ...timedActionConditions(
                                 { action: "EvangelizeTile" },
                                 G.save.state.playerProvince,
                                 G.save,
                              ),
                              tileIsOurCoreCondition(tile, G.save.state.playerProvince, G.save),
                              {
                                 name: $t(L.OurProvinceReligionIsChristianity),
                                 value: state.religion === "Christianity",
                              },
                              {
                                 name: $t(L.TileReligionIsNotChristianity),
                                 value: tileData.religion !== "Christianity",
                              },
                           ],
                        }),
                        effect: () => {
                           tileData.religion = "Christianity";
                        },
                     }}
                     tooltip={(element) => (
                        <>
                           <TimedActionDescComp action="EvangelizeTile" />
                           {element}
                        </>
                     )}
                     className="btn text-sm"
                  >
                     {TimedActions.EvangelizeTile.name()}
                  </ActionButton>
               )}
               <div>{Religion[tileData.religion].name()}</div>
            </div>
            {war && (
               <FloatingTip
                  className="p0"
                  w={300}
                  label={
                     <>
                        <div className="m10">{$t(L.XIsCurrentlyContestedInAnOngoingWar, getTileName(tile))}</div>
                        <WarTooltip war={war} />
                     </>
                  }
               >
                  <div className="row my5 text-red">
                     <div className="f1">{$t(L.OngoingWar)}</div>
                     <div>
                        {$t(L.XYWar, getProvinceName(war.attacker, G.save), getProvinceName(war.defender, G.save))}
                     </div>
                  </div>
               </FloatingTip>
            )}
         </div>
         <div className="h1 my10">{$t(L.Upgrades)}</div>
         <div className="row mx10">
            <UpgradeInfrastructureButton tile={tile} className="f1 btn py5">
               <div className="text-xl">{tileData.infrastructure}</div>
               <div className="text-sm text-display">{$t(L.Infrastructure)}</div>
            </UpgradeInfrastructureButton>
            <UpgradeProductionButton tile={tile} className="f1 btn py5">
               <div className="text-xl">{tileData.production}</div>
               <div className="text-sm text-display">{$t(L.Production)}</div>
            </UpgradeProductionButton>
            <UpgradePopulationButton tile={tile} className="f1 btn py5">
               <div className="text-xl">{tileData.population}</div>
               <div className="text-sm text-display">{$t(L.Population)}</div>
            </UpgradePopulationButton>
         </div>
         <div className="h5" />
         <div className="mx10">
            <div className="row my5">
               <div className="f1">{$t(L.TotalUpgrades)}</div>
               <div>{totalUpgrades}</div>
            </div>
            <BreakdownRow className="my5" name={$t(L.GoverningCost)} breakdown={getTileGoverningCost(tile, G.save)} />
            <BreakdownRow className="my5" name={$t(L.Defense)} breakdown={getTileDefense(tile, G.save)} />
            <BreakdownRow className="my5" name={$t(L.Manpower)} breakdown={getTileManpower(tile, G.save)} />
            <BreakdownTooltip breakdown={tileProduction}>
               <div className="row my5">
                  <div className="f1">{$t(L.TileOutput)}</div>
                  <div>
                     {formatNumber(tileProduction.value)} {Goods[tileData.goods].name()}
                  </div>
               </div>
            </BreakdownTooltip>
         </div>
         <div className="h1 my10">{$t(L.Revenue)}</div>
         <div className="mx10">
            <BreakdownRow className="my5" name={$t(L.LandTax)} breakdown={getTileLandTax(tile, G.save)} />
            <FloatingTip
               w={300}
               className="p0"
               label={
                  <div className="m10">
                     <div className="row my5">
                        <div className="f1">{$t(L.TileOutput)}</div>
                        <div>
                           {formatNumber(tileProduction.value)} {Goods[tileData.goods].name()}
                        </div>
                     </div>
                     <div className="row my5">
                        <div className="f1">{$t(L.XPrice, Goods[tileData.goods].name())}</div>
                        <div>
                           {formatNumber(Price[tileData.goods])} {$t(L.Gold)}
                        </div>
                     </div>
                     <div className="row my5">
                        <div className="f1">{$t(L.TaxableValue)}</div>
                        <div>
                           {formatNumber(tileProduction.value * Price[tileData.goods])} {$t(L.Gold)}
                        </div>
                     </div>
                     <div className="row my5">
                        <div className="f1">{$t(L.GoodsTaxRate)}</div>
                        <div>{formatPercent(goodsTaxRate)}</div>
                     </div>
                     <div className="row my5">
                        <div className="f1">{$t(L.GoodsTax)}</div>
                        <div>{formatNumber(goodsTax)}</div>
                     </div>
                  </div>
               }
            >
               <div className="row my5">
                  <div className="f1">{$t(L.GoodsTax)}</div>
                  <div>{formatNumber(getTileGoodsTax(tile, G.save))}</div>
               </div>
            </FloatingTip>
         </div>
         <div className="h1 my10">{$t(L.Expense)}</div>
         <div className="mx10">
            <BreakdownRow className="my5" name={$t(L.Maintenance)} breakdown={getTileMaintenanceCost(tile, G.save)} />
         </div>
         <div className="h1 my10">{$t(L.Buildings)}</div>
         <div
            className="mx10"
            style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "10px" }}
         >
            {Array.from(tileData.buildings).map((building) => (
               <FloatingTip
                  key={building}
                  label={
                     <>
                        {Buildings[building].name()} ({Buildings[building].desc()})
                     </>
                  }
               >
                  <img
                     src={Buildings[building].image}
                     style={{ width: "100%", aspectRatio: "1 / 1" }}
                     className="img-border"
                  />
               </FloatingTip>
            ))}
            <button
               disabled={!isMyProvince}
               className="btn"
               style={{ width: "100%", aspectRatio: "1 / 1" }}
               onClick={() => showModal(<TileBuildingsModal tile={tile} />)}
            >
               <div className="mi lg">add</div>
            </button>
         </div>
         <div className="h1 my10">{$t(L.Autonomy)}</div>
         {isMyProvince && (
            <>
               <Slider
                  className="mx10"
                  min={0}
                  max={100}
                  step={1}
                  value={tileData.autonomy}
                  onChange={(value) => {
                     tileData.autonomy = value;
                     GameStateUpdated.emit();
                  }}
               />
               <div className="h5" />
            </>
         )}
         <FloatingTip
            w={300}
            className="p0"
            label={
               <>
                  <div className="h2">{$t(L.Autonomy)}</div>
                  <div className="m10">{$t(L.AutonomyTooltip)}</div>
                  {isMyProvince && (
                     <>
                        <div className="h2">{$t(L.SettleUnrest)}</div>
                        <div className="m10">{$t(L.SettlingUnrestAdjustsAutonomySoThatTileUnrestIsAtMostX, "0")}</div>
                     </>
                  )}
               </>
            }
         >
            <div className="row mx10">
               <div className="f1">{$t(L.Autonomy)}</div>
               {isMyProvince && (
                  <button
                     className="btn text-sm"
                     onClick={() => {
                        playClick();
                        const unrest = getTileUnrest(tile, G.save).value;
                        tileData.autonomy = clamp(tileData.autonomy + Math.ceil(unrest), 0, 100);
                        GameStateUpdated.emit();
                     }}
                  >
                     {$t(L.SettleUnrest)}
                  </button>
               )}
               <div>{tileData.autonomy}</div>
            </div>
         </FloatingTip>
         <div className="h1 my10">{$t(L.Rebellion)}</div>
         {tileData.rebellion >= 10 && (
            <div className="mx10 my5 text-red">{$t(L.XIsInCurrentRebellion, getTileName(tile))}</div>
         )}
         <div className="mx10">
            <BreakdownRow
               className="my5"
               name={$t(L.Unrest)}
               tooltip={(element) => (
                  <>
                     <div className="m10">
                        {html($t(L.UnrestDescription))}
                        <div className="text-dimmed text-italic">
                           {html($t(L.ExampleAutonomyAtXYReducesTileOutputByZP, "25", "25%", "-15", "15%"))}
                        </div>
                     </div>
                     {element}
                  </>
               )}
               breakdown={getTileUnrest(tile, G.save)}
               formatFunc={colorNumberReverse}
            />
            <div className="row my5">
               <div className="f1">{$t(L.Rebellion)}</div>
               <div>{tileData.rebellion}/10</div>
            </div>
            <Progress value={tileData.rebellion * 10} />
            {isMyProvince && (
               <div className="row mt10">
                  <AppeaseButton tile={tile} />
                  <CrackDownButton tile={tile} />
               </div>
            )}
         </div>
      </SidebarComp>
   );
}
