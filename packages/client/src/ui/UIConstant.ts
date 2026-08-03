export const Grid4 = { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "0.625rem" } as const;
export const Grid3 = { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.625rem" } as const;
export const Grid2 = { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "0.625rem" } as const;
export const Grid1 = { display: "grid", gridTemplateColumns: "repeat(1, minmax(0, 1fr))", gap: "0.625rem" } as const;
export const CloseButtonClass = "close-button-shortcut";

export const DiplomacyActionWidth = "16rem";
export const DiplomacyWidth = "40rem";

export const TopRightPanelHeight = "2.1875rem";
export const TopRightPanelMargin = "0.625rem";
document.documentElement.style.setProperty("--top-right-panel-height", TopRightPanelHeight);
document.documentElement.style.setProperty("--top-right-panel-margin", TopRightPanelMargin);

export const ResourcePanelHeight = "4.375rem";
export const ResourcePanelMargin = "0.625rem";
document.documentElement.style.setProperty("--resource-panel-height", ResourcePanelHeight);
document.documentElement.style.setProperty("--resource-panel-margin", ResourcePanelMargin);

export const SidebarWidth = "25rem";
export const SidebarWiderWidth = "33rem";
export const SidebarTopMargin = `${Number.parseFloat(ResourcePanelHeight) + 2 * Number.parseFloat(ResourcePanelMargin)}rem`;
export const SidebarMargin = "0.625rem";

export const HeaderHeight = "2.25rem";
document.documentElement.style.setProperty("--header-height", HeaderHeight);

export const ModalFullHeight = "calc(80vh - var(--header-height))";

export const LegacyUpgradeNodeWidth = "10rem";
export const LegacyUpgradeNodeHeight = "5.625rem";
export const LegacyUpgradeNodeSpacingX = "5.625rem";
export const LegacyUpgradeNodeSpacingY = "5.625rem";
document.documentElement.style.setProperty("--legacy-upgrade-node-width", LegacyUpgradeNodeWidth);
document.documentElement.style.setProperty("--legacy-upgrade-node-height", LegacyUpgradeNodeHeight);

export const FamilyNodeWidth = "15.625rem";
export const FamilyNodeHeight = "6.25rem";

document.documentElement.style.setProperty("--family-node-width", FamilyNodeWidth);
document.documentElement.style.setProperty("--family-node-height", FamilyNodeHeight);

export const ProductionNodeWidth = "9.375rem";
export const ProductionNodeHeight = "9.375rem";
export const ProductionNodeSpacingX = "1.25rem";
export const ProductionNodeSpacingY = "6.25rem";
document.documentElement.style.setProperty("--production-node-width", ProductionNodeWidth);
document.documentElement.style.setProperty("--production-node-height", ProductionNodeHeight);
