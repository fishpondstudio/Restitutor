import { Menu, Progress, ScrollArea, Switch } from "@mantine/core";
import {
   cls,
   entriesOf,
   formatNumber,
   formatPercent,
   hasFlag,
   mapOf,
   range,
   toggleFlag,
} from "@project/shared/src/utils/Helper";
import { ConvertToChristianityAction } from "../game/actions/ConvertToChristianityAction";
import { finalizeBreakdown } from "../game/actions/GameAction";
import { ToggleIslamicPolicyAction } from "../game/actions/ToggleIslamicPolicyAction";
import { Culture } from "../game/definitions/Culture";
import { CultureReligionStatus } from "../game/definitions/CultureReligionStatus";
import { durationToString, Modifiers, modifierValueToString } from "../game/definitions/Modifier";
import { getResourceName } from "../game/definitions/ProvinceResources";
import { ProvinceFlags } from "../game/definitions/ProvinceState";
import {
   getProvinceUpgradeDesc,
   hasProvinceUpgrade,
   IslamicPolicies,
   ProvinceUpgrades,
} from "../game/definitions/ProvinceUpgrades";
import { isChristianReligion, Religion } from "../game/definitions/Religion";
import { IslamicActions } from "../game/definitions/TimedAction";
import { GameStateUpdated } from "../game/Events";
import { getProvinceTilesCached } from "../game/logic/CacheLogic";
import {
   getApostolicSeeEffect,
   getApostolicSeeTiles,
   getChristianityYearly,
   getCulturalCohesion,
   getIslamInfluenceYearly,
   getReligiousCohesion,
   getToleratedCulture,
   getToleratedReligion,
} from "../game/logic/InternalAffairsLogic";
import { getProvinceGoverningCost } from "../game/logic/ProvinceLogic";
import { getProvinceResource } from "../game/logic/ResourceLogic";
import { getCultureStatus, getReligionStatus } from "../game/logic/TileLogic";
import { getTimedActionCooldownLeft } from "../game/logic/TimedActionLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { ActionButton } from "./ActionButton";
import { BreakdownComp } from "./BreakdownComp";
import { BreakdownTooltip } from "./BreakdownRow";
import { ConvertCultureButton } from "./ConvertCultureButton";
import { CircleComp } from "./common/CircleComp";
import { SidebarComp, SidebarHeader } from "./common/SidebarComp";
import { colorNumber } from "./components/ColorNumber";
import { FloatingTip } from "./components/FloatingTip";
import { html } from "./components/RenderHTMLComp";
import { EvangelizeTileButton } from "./EvangelizeTileButton";
import { InviteToIslamButton } from "./InviteToIslamButton";
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
   if (state.religion === "Islam") {
      christianityYearly.multiply.push({ name: Religion.Islam.name(), value: -1 });
      finalizeBreakdown(christianityYearly);
   }
   const religiousCohesion = getReligiousCohesion(G.save.state.playerProvince, G.save);
   const culturalCohesion = getCulturalCohesion(G.save.state.playerProvince, G.save);
   const toleratedReligions = Array.from(state.toleratedReligions);
   const toleratedReligionSlots = getToleratedReligion(G.save.state.playerProvince, G.save);
   const toleratedCultures = Array.from(state.toleratedCultures);
   const toleratedCultureSlots = getToleratedCulture(G.save.state.playerProvince, G.save);
   const cultureTiles = getProvinceTilesCached(G.save.state.playerProvince, G.save).flatMap((tile) => {
      const tileData = G.save.state.tiles.get(tile);
      if (tileData && tileData.culture !== state.culture) {
         return [[tile, tileData]] as const;
      }
      return [];
   });
   const religionTiles = getProvinceTilesCached(G.save.state.playerProvince, G.save).flatMap((tile) => {
      const tileData = G.save.state.tiles.get(tile);
      if (tileData && tileData.religion !== state.religion) {
         return [[tile, tileData]] as const;
      }
      return [];
   });
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
         {toleratedCultureSlots.value > 0 && (
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
                                 .filter(
                                    ([culture]) => culture !== state.culture && !toleratedCultures.includes(culture),
                                 )
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
         )}
         <div className="box m10">
            <div className="h3">{$t(L.AutomaticallyConvertCultures)}</div>
            <div className="row mx10 my5">
               <div className="f1">{$t(L.ConvertMinorCultures)}</div>
               <Switch
                  size="xs"
                  checked={hasFlag(state.flags, ProvinceFlags.AutomaticallyConvertMinorCultures)}
                  onChange={() => {
                     state.flags = toggleFlag(state.flags, ProvinceFlags.AutomaticallyConvertMinorCultures);
                     GameStateUpdated.emit();
                  }}
               />
            </div>
            <div className="row mx10 my5">
               <div className="f1">{$t(L.ConvertToleratedCultures)}</div>
               <Switch
                  size="xs"
                  checked={hasFlag(state.flags, ProvinceFlags.AutomaticallyConvertToleratedCultures)}
                  onChange={() => {
                     state.flags = toggleFlag(state.flags, ProvinceFlags.AutomaticallyConvertToleratedCultures);
                     GameStateUpdated.emit();
                  }}
               />
            </div>
         </div>
         {cultureTiles.length > 0 && (
            <div className="m10">
               <table className="data-table">
                  <thead>
                     <tr>
                        <th>{$t(L.Tile)}</th>
                        <th>{$t(L.Culture)}</th>
                        <th></th>
                     </tr>
                  </thead>
                  <tbody>
                     {cultureTiles.map(([tile, tileData]) => (
                        <tr key={tile}>
                           <td>
                              {renderMarkup(`<Tile>${tile}</Tile>`)}{" "}
                              <span className="text-dimmed">
                                 ({tileData.infrastructure}/{tileData.production}/{tileData.population})
                              </span>
                           </td>
                           <td>
                              <div className="row g5">
                                 <CircleComp
                                    size="1rem"
                                    color={CultureReligionStatus[getCultureStatus(tile, G.save)].color}
                                 />
                                 <div className="f1">{Culture[tileData.culture].name()}</div>
                              </div>
                           </td>
                           <td className="text-right">
                              <ConvertCultureButton tile={tile} />
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}
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
         <IslamicReligionComp />
         <div className="h3">{Religion.Christianity.name()}</div>
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
                  <div className="box m5">
                     <div className="h2">{$t(L.ChristianInfluencePerYear)}</div>
                     <BreakdownComp breakdown={christianityYearly} />
                  </div>
                  {state.religion === "Islam" && (
                     <div className="m10 text-yellow">
                        {$t(L.IslamicInfluenceConversionDesc$1, Modifiers.ChristianityYearly.name())}
                     </div>
                  )}
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
               <div>{getResourceName("christianity", G.save.state.scenario)}</div>
               <img src={ProvinceResourceImages.christianity} className="icon-block" />
               {hasProvinceUpgrade("ReligiousUnrest", G.save.state.playerProvince, G.save) && (
                  <div className="mi sm text-red">error</div>
               )}
               <div className="f1" />
               <div>
                  {formatNumber(christianity)}/{formatNumber(governingCost.value)}{" "}
                  {colorNumber(christianityYearly.value)}
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
            <FloatingTip label={getApostolicSeeEffect}>
               <div className="h3 row">
                  <div className="f1">{$t(L.ApostolicSee)}</div>
                  <div className="mi xs text-dimmed">info</div>
               </div>
            </FloatingTip>
            {Array.from(getApostolicSeeTiles(G.save)).map((tile) => {
               const owner = G.save.state.tiles.get(tile)?.province;
               return (
                  <div key={tile} className="row g5 mx10 my5">
                     <div className="f1">{renderMarkup(`<Tile>${tile}</Tile>`)}</div>
                     <div>{renderMarkup(`<Province>${owner}</Province>`)}</div>
                     {owner === G.save.state.playerProvince && <div className="text-dimmed">{$t(L.Us)}</div>}
                  </div>
               );
            })}
         </div>
         <div className="box m10">
            <div className="h3">{$t(L.AutomaticallyEvangelize)}</div>
            <div className="row mx10 my5">
               <div className="f1">{$t(L.EvangelizeMinorReligions)}</div>
               <Switch
                  size="xs"
                  checked={hasFlag(state.flags, ProvinceFlags.AutomaticallyEvangelizeMinorReligions)}
                  onChange={() => {
                     state.flags = toggleFlag(state.flags, ProvinceFlags.AutomaticallyEvangelizeMinorReligions);
                     GameStateUpdated.emit();
                  }}
               />
            </div>
            <div className="row mx10 my5">
               <div className="f1">{$t(L.EvangelizeToleratedReligions)}</div>
               <Switch
                  size="xs"
                  checked={hasFlag(state.flags, ProvinceFlags.AutomaticallyEvangelizeToleratedReligions)}
                  onChange={() => {
                     state.flags = toggleFlag(state.flags, ProvinceFlags.AutomaticallyEvangelizeToleratedReligions);
                     GameStateUpdated.emit();
                  }}
               />
            </div>
         </div>
         {religionTiles.length > 0 && (isChristianReligion(state.religion) || state.religion === "Islam") && (
            <div className="m10">
               <table className="data-table">
                  <thead>
                     <tr>
                        <th>{$t(L.Tile)}</th>
                        <th>{$t(L.Religion)}</th>
                        <th></th>
                     </tr>
                  </thead>
                  <tbody>
                     {religionTiles.map(([tile, tileData]) => (
                        <tr key={tile}>
                           <td>
                              {renderMarkup(`<Tile>${tile}</Tile>`)}{" "}
                              <span className="text-dimmed">
                                 ({tileData.infrastructure}/{tileData.production}/{tileData.population})
                              </span>
                           </td>
                           <td>
                              <div className="row g5">
                                 <CircleComp
                                    size="1rem"
                                    color={CultureReligionStatus[getReligionStatus(tile, G.save)].color}
                                 />
                                 <div className="f1">{Religion[tileData.religion].name()}</div>
                              </div>
                           </td>
                           <td className="text-right">
                              {state.religion === "Islam" ? (
                                 <InviteToIslamButton tile={tile} />
                              ) : (
                                 <EvangelizeTileButton tile={tile} />
                              )}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}
      </SidebarComp>
   );
}

function IslamicReligionComp(): React.ReactNode {
   const state = G.save.state.provinces[G.save.state.playerProvince];
   if (state?.religion !== "Islam") {
      return null;
   }
   const islam = getProvinceResource("islam", G.save.state.playerProvince, G.save);
   const islamYearly = getIslamInfluenceYearly(G.save.state.playerProvince, G.save);
   const islamicPolicyCooldown = getTimedActionCooldownLeft("ChangeIslamicPolicy", G.save.state.playerProvince, G.save);
   return (
      <>
         <div className="h3">{Religion.Islam.name()}</div>
         <FloatingTip
            label={() => (
               <>
                  <div className="m10">
                     {$t(L.IslamicInfluenceConversionDesc$1, Modifiers.ChristianityYearly.name())}
                  </div>
                  <div className="row m10">
                     <div className="f1">{$t(L.IslamicInfluence)}</div>
                     <div>{formatNumber(islam)}</div>
                  </div>
                  <div className="box m5">
                     <div className="h2">{$t(L.IslamicInfluencePerYear)}</div>
                     <BreakdownComp breakdown={islamYearly} />
                  </div>
               </>
            )}
            fixedWidth
            className="p0"
         >
            <div className="row g5 m10">
               <div>{$t(L.IslamicInfluence)}</div>
               <img src={ProvinceResourceImages.islam} className="icon-block" />
               <div className="f1" />
               <div>
                  {formatNumber(islam)} {colorNumber(islamYearly.value)}
               </div>
            </div>
         </FloatingTip>
         <div className="box m10">
            <div className="h3 row g5">
               <div className="f1">{$t(L.IslamicPolicies)}</div>
               {islamicPolicyCooldown > 0 && (
                  <>
                     <div className="mi xs">schedule</div>
                     <FloatingTip
                        label={() => $t(L.WeCanChangeIslamicPoliciesIn$1, durationToString(islamicPolicyCooldown))}
                     >
                        <div>{durationToString(islamicPolicyCooldown)}</div>
                     </FloatingTip>
                  </>
               )}
            </div>
            {IslamicPolicies.map((policy) => (
               <div className="m10 row" key={policy}>
                  <div className="f1">
                     <FloatingTip label={() => getProvinceUpgradeDesc(policy)}>
                        <div>{ProvinceUpgrades[policy].name()}</div>
                     </FloatingTip>
                  </div>
                  <ActionButton
                     className="text-sm"
                     action={() => ToggleIslamicPolicyAction(policy, G.save.state.playerProvince, G.save)}
                     tooltip={(element) => (
                        <>
                           <div className="h2">{ProvinceUpgrades[policy].name()}</div>
                           <div className="m10">{getProvinceUpgradeDesc(policy)}</div>
                           {element}
                        </>
                     )}
                  >
                     {hasProvinceUpgrade(policy, G.save.state.playerProvince, G.save) ? (
                        <div className="text-red">{$t(L.Repeal)}</div>
                     ) : (
                        <div>{$t(L.Enact)}</div>
                     )}
                  </ActionButton>
               </div>
            ))}
         </div>
         <div className="m10" style={Grid2}>
            {IslamicActions.map((action) => (
               <TimedActionButton timedAction={action} key={action} />
            ))}
         </div>
         <div className="box m10">
            <div className="h3">{$t(L.AutomaticallyInviteToIslam)}</div>
            <div className="row mx10 my5">
               <div className="f1">{$t(L.InviteMinorReligionsToIslam)}</div>
               <Switch
                  size="xs"
                  aria-label={$t(L.InviteMinorReligionsToIslam)}
                  checked={hasFlag(state.flags, ProvinceFlags.AutomaticallyInviteMinorReligionsToIslam)}
                  onChange={() => {
                     state.flags = toggleFlag(state.flags, ProvinceFlags.AutomaticallyInviteMinorReligionsToIslam);
                     GameStateUpdated.emit();
                  }}
               />
            </div>
            <div className="row mx10 my5">
               <div className="f1">{$t(L.InviteToleratedReligionsToIslam)}</div>
               <Switch
                  size="xs"
                  aria-label={$t(L.InviteToleratedReligionsToIslam)}
                  checked={hasFlag(state.flags, ProvinceFlags.AutomaticallyInviteToleratedReligionsToIslam)}
                  onChange={() => {
                     state.flags = toggleFlag(state.flags, ProvinceFlags.AutomaticallyInviteToleratedReligionsToIslam);
                     GameStateUpdated.emit();
                  }}
               />
            </div>
         </div>
      </>
   );
}
