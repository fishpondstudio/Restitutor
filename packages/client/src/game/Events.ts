import type { IChat, IUser } from "@project/shared/src/rpc/ServerMessageTypes";
import type { Tile } from "@project/shared/src/utils/Helper";
import { TypedEvent } from "@project/shared/src/utils/TypedEvent";
import type { ReactElement } from "react";
import type { ShowModalEvent } from "../ui/common/PanelTypes";
import type { Province } from "./definitions/Province";
import type { Shortcut } from "./ShortcutDefinition";

// GameState
export const GameOptionUpdated = new TypedEvent<void>();
export const GameStateUpdated = new TypedEvent<void>();
export const GameTimeUpdated = new TypedEvent<void>();
export const GameSpeedChanged = new TypedEvent<number>();

// UI
export const RefreshTiles = new TypedEvent<{
   tiles: Iterable<Tile>;
   options: { indicator?: boolean; visual?: boolean };
}>();
export const RefreshTechTree = new TypedEvent<void>();
export const OnSceneSwitched = new TypedEvent<void>();
export const OnResize = new TypedEvent<{ width: number; height: number }>();
export const ShowModal = new TypedEvent<ShowModalEvent>();
export const UpdateSidebar = new TypedEvent<ReactElement>();
export const ToggleSidebar = new TypedEvent<boolean>();
export const OpenDiplomacyPage = new TypedEvent<{ province: Province }>();
export const OpenSettleTilePage = new TypedEvent<{ tile: Tile }>();
export const OpenTilePage = new TypedEvent<{ tile: Tile }>();
export const CloseModal = new TypedEvent<void>();
export const CloseModalImmediately = new TypedEvent<void>();
export const OnKeydown = new TypedEvent<KeyboardEvent>();
export const OnKeyup = new TypedEvent<KeyboardEvent>();
export const CurrentShortcuts = new Map<Shortcut, (event: KeyboardEvent) => void>();
export const RefreshOverlay = new TypedEvent<void>();

// Network
export const UserUpdated = new TypedEvent<IUser>();
export const OnChatMessage = new TypedEvent<IChat[]>();
export const OnConnectionChanged = new TypedEvent<boolean>();
