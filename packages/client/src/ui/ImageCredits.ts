import { Buildings } from "../game/definitions/Building";
import { GreatWork } from "../game/definitions/GreatWork";
import { RestorationBonus } from "../game/definitions/RestorationBonus";
import { Terrains } from "../game/definitions/Terrain";
import { EventImage } from "../game/events/EventImages";
import { GameEvents } from "../game/events/GameEvents";
import { HeaderImages } from "./HeaderImages";

export function getImageCredits(): string[] {
   const images = [
      ...Object.values(EventImage),
      ...Object.values(HeaderImages),
      ...Object.values(GameEvents).map((event) => event.image),
      ...Object.values(Terrains).map((terrain) => terrain.image),
      ...Object.values(RestorationBonus).map((bonus) => bonus.image),
      ...Object.values(GreatWork).map((work) => work.image),
   ];
   const credits = [
      ...images.map((image) => image.credit),
      ...Object.values(Buildings).map((building) => building.imageCredit),
   ];
   return [...new Set(credits.map((credit) => credit.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, "en"));
}
