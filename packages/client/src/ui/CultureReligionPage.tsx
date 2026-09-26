import { Menu, Progress, ScrollArea } from "@mantine/core";
import {
   cls,
   entriesOf,
   formatDelta,
   formatNumber,
   formatPercent,
   mapOf,
   range,
} from "@project/shared/src/utils/Helper";
import { ConvertToChristianityAction } from "../game/actions/ConvertToChristianityAction";
import { Culture } from "../game/definitions/Culture";
import { Modifiers, modifierValueToString } from "../game/definitions/Modifier";
import { ProvinceResourceNames } from "../game/definitions/ProvinceResources";
import { hasProvinceUpgrade, ProvinceUpgrades } from "../game/definitions/ProvinceUpgrades";
import { Religion } from "../game/definitions/Religion";
import { GameStateUpdated } from "../game/Events";
import {
   ApostolicSeeChristianityYearly,
   getApostolicSeeTiles,
   getChristianityYearly,
   getCulturalCohesion,
   getReligiousCohesion,
   getToleratedCulture,
   getToleratedReligion,
} from "../game/logic/InternalAffairsLogic";
import { getProvinceGoverningCost } from "../game/logic/ProvinceLogic";
import { getProvinceResource } from "../game/logic/ResourceLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { ActionButton } from "./ActionButton";
import { BreakdownComp } from "./BreakdownComp";
import { BreakdownTooltip } from "./BreakdownRow";
import { SidebarComp, SidebarHeader } from "./common/SidebarComp";
import { FloatingTip } from "./components/FloatingTip";
import { html } from "./components/RenderHTMLComp";
import { renderMarkup } from "./ParseMarkup";
import { ProvinceResourceImages } from "./ProvinceResourceImages";
import { playSound } from "./Sound";
import { TimedActionButton } from "./TimedActionButton";
import { Grid2 } from "./UIConstant";

export function CultureReligionPage(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const state = G.save.state.provinces[G.save.state.playerProvince];
   if (!state) {
      return null;
   }
   const governingCost = getProvinceGoverningCost(G.save.state.playerProvince, G.save);
   const christianity = getProvinceResource("christianity", G.save.state.playerProvince, G.save);
   const christianityYearly = getChristianityYearly(G.save.state.playerProvince, G.save);
   const religiousCohesion = getReligiousCohesion(G.save.state.playerProvince, G.save);
   const culturalCohesion = getCulturalCohesion(G.save.state.playerProvince, G.save);
   const toleratedReligions = Array.from(state.toleratedReligions);
   const toleratedReligionSlots = getToleratedReligion(G.save.state.playerProvince, G.save);
   const toleratedCultures = Array.from(state.toleratedCultures);
   const toleratedCultureSlots = getToleratedCulture(G.save.state.playerProvince, G.save);
   return (
      <SidebarComp title={<SidebarHeader title={$t(L.CultureAndReligion)} />}>
         <div className="h1">{$t(L.Culture)}</div>
         <div className="row mx10 my5">
            <div className="f1">{$t(L.ProvincialCulture)}</div>
            <div>{Culture[state.culture].name()}</div>
         </div>
         <FloatingTip
            label={() => (
               <>
                  <div>{$t(L.CulturalCohesionTooltip)}</div>
                  <div className="h10" />
                  <div>{$t(L.CohesionEffectTooltip)}</div>
               </>
            )}
         >
            <div className="row mx10 my5">
               <div className="f1">{$t(L.CulturalCohesion)}</div>
               <div>{formatPercent(culturalCohesion)}</div>
            </div>
         </FloatingTip>
         <Progress value={100 * culturalCohesion} className="mx10" />
         <div className="h10" />
         <div className="divider" />
         <BreakdownTooltip
            breakdown={toleratedCultureSlots}
            tooltip={(element) => (
               <>
                  <div className="m10">{Modifiers.ToleratedCulture.desc()}</div>
                  {element}
               </>
            )}
         >
            <div className="m10 row">
               <div className="f1">{$t(L.ToleratedCultures)}</div>
               <div>
                  {state.toleratedCultures.size}/{toleratedCultureSlots.value}
               </div>
            </div>
         </BreakdownTooltip>
         <div
            className={cls(toleratedCultureSlots.value > 0 ? "m10" : null)}
            style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}
         >
            {range(0, toleratedCultureSlots.value).map((idx) => {
               const culture = toleratedCultures[idx];
               if (culture) {
                  return (
                     <div className="box px5 py2" key={idx}>
                        {Culture[culture].name()}
                     </div>
                  );
               }
               return (
                  <Menu key={idx} position="bottom-start">
                     <FloatingTip label={() => html($t(L.SelectAToleratedCultureThisSelectionCannotBeChanged))}>
                        <Menu.Target>
                           <div className="box px5 py2 pointer" key={idx}>
                              <div className="mi sm">add</div>
                           </div>
                        </Menu.Target>
                     </FloatingTip>
                     <Menu.Dropdown className="panel">
                        <ScrollArea.Autosize mah="33vh" scrollbars="y">
                           {entriesOf(Culture)
                              .filter(([culture]) => culture !== state.culture && !toleratedCultures.includes(culture))
                              .sort((a, b) => a[1].name().localeCompare(b[1].name()))
                              .map(([culture]) => (
                                 <Menu.Item
                                    key={culture}
                                    onClick={() => {
                                       if (state.toleratedCultures.size < toleratedCultureSlots.value) {
                                          state.toleratedCultures.add(culture);
                                          GameStateUpdated.emit();
                                       } else {
                                          playSound("error");
                                       }
                                    }}
                                 >
                                    {Culture[culture].name()}
                                 </Menu.Item>
                              ))}
                        </ScrollArea.Autosize>
                     </Menu.Dropdown>
                  </Menu>
               );
            })}
         </div>
         <div className="h1">{$t(L.Religion)}</div>
         <div className="row mx10 my5">
            <div className="f1">{$t(L.ProvincialReligion)}</div>
            <div>{Religion[state.religion].name()}</div>
         </div>
         <FloatingTip
            label={() => (
               <>
                  <div>{$t(L.ReligiousCohesionTooltip)}</div>
                  <div className="h10" />
                  <div>{$t(L.CohesionEffectTooltip)}</div>
               </>
            )}
         >
            <div className="row mx10 my5">
               <div className="f1">{$t(L.ReligiousCohesion)}</div>
               <div>{formatPercent(religiousCohesion)}</div>
            </div>
         </FloatingTip>
         <Progress value={100 * religiousCohesion} className="mx10" />
         <div className="h10" />
         <div className="divider" />
         <BreakdownTooltip breakdown={toleratedReligionSlots}>
            <div className="m10 row">
               <div className="f1">{$t(L.ToleratedReligions)}</div>
               <div>
                  {state.toleratedReligions.size}/{toleratedReligionSlots.value}
               </div>
            </div>
         </BreakdownTooltip>
         <div
            className={cls(toleratedReligionSlots.value > 0 ? "m10" : null)}
            style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}
         >
            {range(0, toleratedReligionSlots.value).map((idx) => {
               const religion = toleratedReligions[idx];
               if (religion) {
                  return (
                     <div className="box px5 py2" key={idx}>
                        {Religion[religion].name()}
                     </div>
                  );
               }
               return (
                  <Menu key={idx} position="bottom-start">
                     <FloatingTip label={() => html($t(L.SelectAToleratedReligionThisSelectionCannotBeChanged))}>
                        <Menu.Target>
                           <div className="box px5 py2 pointer" key={idx}>
                              <div className="mi sm">add</div>
                           </div>
                        </Menu.Target>
                     </FloatingTip>
                     <Menu.Dropdown className="panel">
                        <ScrollArea.Autosize mah="33vh" scrollbars="y">
                           {entriesOf(Religion)
                              .sort((a, b) => a[1].name().localeCompare(b[1].name()))
                              .filter(
                                 ([religion]) => religion !== state.religion && !toleratedReligions.includes(religion),
                              )
                              .map(([religion]) => (
                                 <Menu.Item
                                    key={religion}
                                    onClick={() => {
                                       if (state.toleratedReligions.size < toleratedReligionSlots.value) {
                                          state.toleratedReligions.add(religion);
                                          GameStateUpdated.emit();
                                       } else {
                                          playSound("error");
                                       }
                                    }}
                                 >
                                    {Religion[religion].name()}
                                 </Menu.Item>
                              ))}
                        </ScrollArea.Autosize>
                     </Menu.Dropdown>
                  </Menu>
               );
            })}
         </div>
         <div className="divider" />
         <FloatingTip
            className="p0"
            fixedWidth
            label={() => (
               <>
                  <div className="m10">
                     <div className="row my5">
                        <div className="f1">{$t(L.ChristianInfluence)}</div>
                        <div>{formatNumber(christianity)}</div>
                     </div>
                     <div className="row my5">
                        <div className="f1">{$t(L.GoverningCost)}</div>
                        <div>{formatNumber(governingCost.value)}</div>
                     </div>
                  </div>
                  <div className="h2">{$t(L.ChristianInfluencePerYear)}</div>
                  <BreakdownComp breakdown={christianityYearly} />
                  <div className="m10">
                     {$t(L.ChristianInfluenceConversionEffectsDescription)}
                     <div className="h10" />
                     {mapOf(ProvinceUpgrades.ReligiousUnrest.modifiers, (modifier, data) => (
                        <div className="row my5" key={modifier}>
                           <div className="f1">{Modifiers[modifier].name()}</div>
                           <div className="text-red">{modifierValueToString(data)}</div>
                        </div>
                     ))}
                     {hasProvinceUpgrade("ReligiousUnrest", G.save.state.playerProvince, G.save) && (
                        <div className="text-red my5">{$t(L.TheEffectIsCurrentlyActive)}</div>
                     )}
                  </div>
               </>
            )}
         >
            <div className="row g5 m10">
               <div>{ProvinceResourceNames.christianity()}</div>
               <img src={ProvinceResourceImages.christianity} className="icon-block" />
               {hasProvinceUpgrade("ReligiousUnrest", G.save.state.playerProvince, G.save) && (
                  <div className="mi sm text-red">error</div>
               )}
               <div className="f1" />
               <div>
                  {formatNumber(christianity)}/{formatNumber(governingCost.value)}
                  <span className="text-green"> ({formatDelta(christianityYearly.value)})</span>
               </div>
            </div>
         </FloatingTip>
         <Progress value={(100 * christianity) / governingCost.value} className="m10" />
         <div className="m10" style={Grid2}>
            <ActionButton
               className="btn"
               action={() => ConvertToChristianityAction(G.save.state.playerProvince, G.save)}
               tooltip={(element) => (
                  <>
                     <div className="m10">{$t(L.ConvertingToChristianityDescription)}</div>
                     {element}
                  </>
               )}
            >
               {$t(L.ConvertToChristianity)}
            </ActionButton>
            <TimedActionButton timedAction="AppointBishop" />
         </div>
         <div className="box m10">
            <FloatingTip
               label={() =>
                  html(
                     $t(
                        L.ApostolicSeeEffects$1$2$3$4,
                        formatDelta(ApostolicSeeChristianityYearly),
                        Modifiers.ChristianityYearly.name(),
                        formatDelta(ApostolicSeeChristianityYearly),
                        Modifiers.ChristianityYearly.name(),
                     ),
                  )
               }
            >
               <div className="h3 row">
                  <div className="f1">{$t(L.ApostolicSee)}</div>
                  <div className="mi xs text-dimmed">info</div>
               </div>
            </FloatingTip>
            {getApostolicSeeTiles(G.save).map((tile) => {
               const owner = G.save.state.tiles.get(tile)?.province;
               return (
                  <div key={tile} className="row mx10 my5">
                     <div className="f1">{renderMarkup(`<Tile>${tile}</Tile>`)}</div>
                     <div>{renderMarkup(`<Province>${owner}</Province>`)}</div>
                     {owner === G.save.state.playerProvince && <div>{$t(L.Us)}</div>}
                  </div>
               );
            })}
         </div>
      </SidebarComp>
   );
}
