import {
   Checkbox,
   LoadingOverlay,
   Menu,
   MultiSelect,
   Overlay,
   Popover,
   Portal,
   Progress,
   ScrollArea,
   SegmentedControl,
   Select,
   Slider,
   Switch,
   TextInput,
   Tooltip,
   Transition,
} from "@mantine/core";
import * as React from "react";
import { Buildings } from "./game/definitions/Building";
import { CasusBelli } from "./game/definitions/CasusBelli";
import { Culture } from "./game/definitions/Culture";
import { CultureReligionStatus } from "./game/definitions/CultureReligionStatus";
import { Goods } from "./game/definitions/Goods";
import { GreatWork } from "./game/definitions/GreatWork";
import { LegacyUpgrades } from "./game/definitions/LegacyUpgrade";
import { Modifiers } from "./game/definitions/Modifier";
import { PersonTrait } from "./game/definitions/PersonTrait";
import { Province } from "./game/definitions/Province";
import { ProvinceUpgrades } from "./game/definitions/ProvinceUpgrades";
import { ChristianHeresy, Religion } from "./game/definitions/Religion";
import { RestorationBonus } from "./game/definitions/RestorationBonus";
import { SocialClass, SocialClassBonuses } from "./game/definitions/SocialClass";
import { SpawnedProvinces } from "./game/definitions/SpawnedProvince";
import { Tech } from "./game/definitions/Tech";
import { Terrains } from "./game/definitions/Terrain";
import { TimedActions } from "./game/definitions/TimedAction";
import { GameStateUpdated } from "./game/Events";
import { GameEvents } from "./game/events/GameEvents";
import { showError, showInfo, showSuccess, showWarning } from "./game/logic/AlertLogic";
import { Scenarios } from "./game/scenarios/Scenarios";
import { isSteam, SteamClient } from "./rpc/SteamClient";
import { showModalImmediately, showPanel } from "./ui/common/ShowPanel";
import { SidebarComp, SidebarHeader, SidebarImageHeader } from "./ui/common/SidebarComp";
import { hideSidebar } from "./ui/common/SidebarManager";
import { colorNumber, colorNumberReverse } from "./ui/components/ColorNumber";
import { FloatingTip } from "./ui/components/FloatingTip";
import { NumberSelect } from "./ui/components/NumberInput";
import { Table } from "./ui/components/Table";
import { TextureComp } from "./ui/components/TextureComp";
import { IconCatalog } from "./ui/IconCatalog";
import { G } from "./utils/Global";
import { refreshOnTypedEvent, refreshOnTypedEventWhen, useTypedEvent } from "./utils/Hook";
import { $t, L } from "./utils/i18n";
import { hideModal, hideModalImmediately, ModalComp, ModalImageHeader, ModalTitleBar } from "./utils/ModalManager";

const definitions = {
   Buildings,
   CasusBelli,
   ChristianHeresy,
   Culture,
   CultureReligionStatus,
   GameEvents,
   Scenarios,
   Goods,
   GreatWork,
   LegacyUpgrades,
   Modifiers,
   PersonTrait,
   Province,
   ProvinceUpgrades,
   Religion,
   RestorationBonus,
   SocialClass,
   SocialClassBonuses,
   SpawnedProvinces,
   Tech,
   Terrains,
   TimedActions,
};

const UI = {
   React,
   Mantine: {
      Checkbox,
      LoadingOverlay,
      Menu,
      MultiSelect,
      Overlay,
      Popover,
      Portal,
      Progress,
      ScrollArea,
      SegmentedControl,
      Select,
      Slider,
      Switch,
      TextInput,
      Tooltip,
      Transition,
   },
   showPanel,
   showModalImmediately,
   hideModal,
   hideModalImmediately,
   hideSidebar,
   ModalComp,
   ModalTitleBar,
   ModalImageHeader,
   SidebarComp,
   SidebarHeader,
   SidebarImageHeader,
   Table,
   FloatingTip,
   TextureComp,
   NumberSelect,
   colorNumber,
   colorNumberReverse,
   IconCatalog,
   useTypedEvent,
   refreshOnTypedEvent,
   refreshOnTypedEventWhen,
   $t,
   L,
   showInfo,
   showSuccess,
   showWarning,
   showError,
};

export async function loadAddonMods(): Promise<void> {
   if (isSteam()) {
      const mods = await SteamClient.loadAddonMods();
      if (mods.length > 0) {
         Object.assign(globalThis, { G, GameStateUpdated, D: definitions, UI });
      }
      for (const mod of mods) {
         const script = document.createElement("script");
         script.textContent = mod;
         document.body.appendChild(script);
      }
   }
}
