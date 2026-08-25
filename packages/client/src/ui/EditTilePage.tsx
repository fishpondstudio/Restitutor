import { Select, Switch, TextInput } from "@mantine/core";
import { useForceUpdate } from "@mantine/hooks";
import { iFirstOf, mapSafePush, type Tile, tileToString } from "@project/shared/src/utils/Helper";
import { useState } from "react";
import { Provinces } from "../game/definitions/Province";
import type { ITileConfig } from "../game/definitions/Tile";
import { RefreshTiles } from "../game/Events";
import { WorldScene } from "../scenes/WorldScene";
import { idbSet } from "../utils/BrowserStorage";
import { G } from "../utils/Global";
import { SidebarComp, SidebarHeader } from "./common/SidebarComp";

export function EditTilePage({ tiles }: { tiles: Set<Tile> }): React.ReactNode {
   const [checkName, setCheckName] = useState<Map<string, Tile[]>>(new Map());
   let data: ITileConfig = {};
   let singleTile: React.ReactNode = null;
   if (tiles.size === 1) {
      const t = iFirstOf(tiles);
      if (t) {
         const d = G.tileEditor.get(t);
         if (d) {
            data = d;
         }
         singleTile = (
            <>
               <div className="h1">Tile {tileToString(t)}</div>
               <div className="h10" />
               <div className="mx10">
                  <div className="row">
                     <div>Name</div>
                     <TextInput
                        className="f1"
                        value={data.name ?? ""}
                        onChange={(e) => {
                           let oldData = G.tileEditor.get(t);
                           if (!oldData) {
                              oldData = {};
                           }
                           if (e.target.value) {
                              oldData.name = e.target.value.trim();
                           } else {
                              oldData.name = undefined;
                           }
                           G.tileEditor.set(t, oldData);
                           RefreshTiles.emit({ tiles: [t], options: { indicator: true, visual: true } });
                           idbSet("TileEditor", G.tileEditor);
                           forceUpdate();
                        }}
                     />
                  </div>
                  <div className="divider my10 mx-10" />
                  <div className="row">
                     <div className="f1">Capital</div>
                     <Switch
                        checked={data.isCapital ?? false}
                        onChange={(e) => {
                           let oldData = G.tileEditor.get(t);
                           if (!oldData) {
                              oldData = {};
                           }
                           G.tileEditor.forEach((tileData, tile) => {
                              if (tileData.province === data.province && tileData.isCapital) {
                                 tileData.isCapital = false;
                                 RefreshTiles.emit({ tiles: [tile], options: { indicator: true, visual: true } });
                              }
                           });
                           oldData.isCapital = e.target.checked;
                           G.tileEditor.set(t, oldData);
                           RefreshTiles.emit({ tiles: [t], options: { indicator: true, visual: true } });
                           idbSet("TileEditor", G.tileEditor);
                           forceUpdate();
                        }}
                     />
                  </div>
               </div>
            </>
         );
      }
   }

   const forceUpdate = useForceUpdate();
   return (
      <SidebarComp title={<SidebarHeader title={`Edit ${tiles.size} Tile`} />}>
         <div className="m10">
            <SelectComp
               value={data.province}
               data={Array.from(Provinces)}
               onChange={(value) => {
                  tiles.forEach((tile) => {
                     let oldData = G.tileEditor.get(tile);
                     if (!oldData) {
                        oldData = {};
                     }
                     oldData.province = value;
                     G.tileEditor.set(tile, oldData);
                     RefreshTiles.emit({ tiles: [tile], options: { indicator: true, visual: true } });
                  });
                  idbSet("TileEditor", G.tileEditor);
                  forceUpdate();
               }}
            />
         </div>
         {singleTile}
         <div className="h1 my10">Check Tile Names</div>
         <div className="mx10">
            <button className="btn w100 py5">Default Button</button>
            <div className="h10"></div>
            <button
               className="btn primary w100 py5"
               onClick={() => {
                  const result = new Map<string, Tile[]>();
                  const noname: Tile[] = [];
                  G.tileEditor.forEach((tileData, tile) => {
                     if (tileData.name) {
                        mapSafePush(result, tileData.name, tile);
                     }
                     if (tileData.province && !tileData.name) {
                        noname.push(tile);
                     }
                  });
                  result.forEach((tiles, name) => {
                     if (tiles.length <= 1) {
                        result.delete(name);
                     }
                  });
                  if (noname.length > 0) {
                     result.set("(No Name)", noname);
                  }
                  setCheckName(result);
               }}
            >
               Check Tile Names
            </button>
            <div className="h10" />
            {Array.from(checkName.entries()).map(([name, tiles]) => (
               <div className="row" key={name}>
                  <div className="f1">{name}</div>
                  <div
                     className="pointer"
                     onClick={() => {
                        G.scene.getCurrent(WorldScene)?.drawSelectors(new Set(tiles));
                     }}
                  >
                     {tiles.map((t) => tileToString(t)).join(", ")}
                  </div>
               </div>
            ))}
            {checkName.size === 0 && <div className="text-center text-dimmed">All Checks Passed</div>}
         </div>
      </SidebarComp>
   );
}

const NoneOption = "*None";

function SelectComp<T extends string>({
   value,
   data,
   getLabel = (value) => value,
   onChange,
}: {
   value: T | undefined;
   data: T[];
   getLabel?: (value: T) => string;
   onChange: (value: T | undefined) => void;
}): React.ReactNode {
   const options = [
      { value: NoneOption, label: NoneOption },
      ...data.map((value) => ({ value, label: getLabel(value) })),
   ];
   return (
      <Select
         checkIconPosition="right"
         data={options}
         value={value ?? NoneOption}
         allowDeselect={false}
         onChange={(value) => {
            if (value === NoneOption) {
               onChange(undefined);
            } else {
               onChange(value as T);
            }
         }}
      />
   );
}
