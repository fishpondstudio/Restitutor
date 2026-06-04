import { Select } from "@mantine/core";
import { formatNumber, keysOf } from "@project/shared/src/utils/Helper";
import { Fragment, useEffect, useState } from "react";
import { LookForLocalSpouseAction, OfferMarriageAction } from "../game/actions/SpouseActions";
import type { IFamily, IPerson } from "../game/definitions/Family";
import type { Province } from "../game/definitions/Province";
import { type SocialClass, SocialClassNames } from "../game/definitions/SocialClass";
import { GameStateUpdated } from "../game/Events";
import { getEligibleForMarriage, getSpousesFromOtherProvinces } from "../game/logic/GovernorLogic";
import { getProvinceName } from "../game/logic/ProvinceLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { ModalComp, ModalTitleBar } from "../utils/ModalManager";
import { ActionButton } from "./ActionButton";
import { Grid3 } from "./UIConstant";

export function LookForSpouseModal({ family, province }: { family?: IFamily; province?: Province }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const state = G.save.state.provinces[G.save.state.playerProvince];
   if (!state) {
      return null;
   }
   const [selectedFamily, setSelectedFamily] = useState<IFamily | undefined>(family);
   const [selectedProvince, setSelectedProvince] = useState<Province | undefined>(province);
   const person = selectedFamily?.male ?? selectedFamily?.female;

   const eligibleForMarriage = getEligibleForMarriage(state.governor);
   const spouseCandidates = selectedFamily
      ? getSpousesFromOtherProvinces(selectedFamily, G.save.state.playerProvince, G.save)
      : [];
   const candidates = spouseCandidates.filter((spouse) => {
      if (!selectedProvince) {
         return true;
      }
      const person = (spouse.male ?? spouse.female) as IPerson;
      return person.province === selectedProvince;
   });

   useEffect(() => {
      if (!eligibleForMarriage.find((f) => f.id === selectedFamily?.id)) {
         if (eligibleForMarriage.length > 0) {
            setSelectedFamily(eligibleForMarriage[0]);
         } else {
            setSelectedFamily(undefined);
         }
      }
   }, [selectedFamily, eligibleForMarriage]);

   return (
      <ModalComp title={<ModalTitleBar title={$t(L.LookForSpouse)} dismiss />}>
         <div className="box m10">
            <div className="h1">{$t(L.SelectFamilyMember)}</div>
            <Select
               className="m10"
               checkIconPosition="right"
               allowDeselect={false}
               data={eligibleForMarriage.map((f) => {
                  if (f.male) {
                     return {
                        value: f.id,
                        label: `${f.male.name.join(" ")} ${$t(L.M)}`,
                     };
                  }
                  if (f.female) {
                     return {
                        value: f.id,
                        label: `${f.female.name.join(" ")} ${$t(L.F)}`,
                     };
                  }
                  throw new Error("Should not happen");
               })}
               value={selectedFamily?.id}
               onChange={(value) => {
                  if (value) {
                     setSelectedFamily(eligibleForMarriage.find((f) => f.id === value) as IFamily);
                  } else {
                     setSelectedFamily(undefined);
                  }
               }}
            />
            {person && selectedFamily && (
               <div className="m10">
                  <div>
                     {$t(
                        L.AgeXAdministrativeYDiplomaticZMilitaryP,
                        formatNumber(person.age),
                        formatNumber(person.administrative),
                        formatNumber(person.diplomatic),
                        formatNumber(person.military),
                     )}
                  </div>
                  <div className="h5" />
                  <div className="text-yellow text-italic">
                     {selectedFamily.male ? $t(L.HisSpouseWillJoinOurFamily) : $t(L.SheWillJoinHerSpousesFamily)}
                  </div>
               </div>
            )}
         </div>
         {person && selectedFamily && (
            <>
               <div className="box m10">
                  <div className="h1">{$t(L.FromX, getProvinceName(G.save.state.playerProvince, G.save))}</div>
                  <div className="m10" style={Grid3}>
                     <LocalSpouseButton family={selectedFamily} socialClass="UpperClass" />
                     <LocalSpouseButton family={selectedFamily} socialClass="MiddleClass" />
                     <LocalSpouseButton family={selectedFamily} socialClass="LowerClass" />
                  </div>
               </div>
               <div className="box m10">
                  <div className="h1">{$t(L.FromOtherProvinces)}</div>
                  <Select
                     clearable={true}
                     className="m10"
                     checkIconPosition="right"
                     data={keysOf(G.save.state.provinces).map((p) => ({ value: p, label: getProvinceName(p, G.save) }))}
                     value={selectedProvince}
                     onChange={(value) => {
                        if (value) {
                           setSelectedProvince(value as Province);
                        } else {
                           setSelectedProvince(undefined);
                        }
                     }}
                  />
                  {candidates.map((spouse, i) => {
                     const person = (spouse.male ?? spouse.female) as IPerson;
                     return (
                        <Fragment key={spouse.id}>
                           <div className="divider" />
                           <div className="mx10 my5 row">
                              <div className="f1">
                                 <div className="text-display text-lg">
                                    <div className="mi sm inline">{spouse.male ? "male" : "female"}</div>
                                    {person.name.join(" ")}
                                 </div>
                                 <div className="text-dimmed text-sm">
                                    {$t(
                                       L.XAgeYSkillZPQ,
                                       getProvinceName(person.province, G.save),
                                       formatNumber(person.age),
                                       formatNumber(person.administrative),
                                       formatNumber(person.diplomatic),
                                       formatNumber(person.military),
                                    )}
                                 </div>
                              </div>
                              <ActionButton
                                 action={OfferMarriageAction(
                                    selectedFamily,
                                    spouse,
                                    G.save.state.playerProvince,
                                    G.save,
                                 )}
                                 tooltip={(element) => (
                                    <>
                                       <div className="m10">{$t(L.OfferingMarriageIncreasesAttitudeByX, "50")}</div>
                                       {element}
                                    </>
                                 )}
                              >
                                 {$t(L.OfferMarriage)}
                              </ActionButton>
                           </div>
                        </Fragment>
                     );
                  })}
                  {candidates.length === 0 && (
                     <div className="text-dimmed text-center m10">{$t(L.NoEligibleSpousesFound)}</div>
                  )}
               </div>
            </>
         )}
      </ModalComp>
   );
}

function LocalSpouseButton({ family, socialClass }: { family: IFamily; socialClass: SocialClass }): React.ReactNode {
   return (
      <ActionButton
         tooltip={(element) => (
            <>
               <div className="m10">
                  {$t(
                     L.FindAnEligibleSpouseFromXClassInYTheZClassWillGain50Loyalty,
                     SocialClassNames[socialClass](),
                     getProvinceName(G.save.state.playerProvince, G.save),
                     SocialClassNames[socialClass](),
                  )}
               </div>
               {element}
            </>
         )}
         action={LookForLocalSpouseAction(socialClass, family, G.save.state.playerProvince, G.save)}
      >
         {SocialClassNames[socialClass]()}
      </ActionButton>
   );
}
