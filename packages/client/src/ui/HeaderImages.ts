import BarbarianRaid from "../assets/images/headers/BarbarianRaid.webp";
import Chronicle from "../assets/images/headers/ChronicleHeader.webp";
import EcumenicalCouncil from "../assets/images/headers/EcumenicalCouncil.webp";
import Rebirth from "../assets/images/headers/Rebirth.webp";
import Senate from "../assets/images/headers/Senate.webp";
import Treasury from "../assets/images/headers/Treasury.webp";
import type { ImageWithCredit } from "../game/events/ImageWithCredit";

export const HeaderImages = {
   BarbarianRaid: { url: BarbarianRaid, credit: "Alexander and Darius at Issus, Anton Hoffmann (1920)" },
   Senate: { url: Senate, credit: "Cicero's tale about Catiline, Hans Werner Schmidt (1912)" },
   EcumenicalCouncil: {
      url: EcumenicalCouncil,
      credit: "Saint Ambrose barring Theodosius from Milan Cathedral, Anthony van Dyck (c.1620)",
   },
   Chronicle: { url: Chronicle, credit: "Das Forum Romanum, J. Bühlmann (1901)" },
   Rebirth: { url: Rebirth, credit: "Le triomphe de la Ville de Paris, François-Edouard Picot (1842)" },
   Treasury: { url: Treasury, credit: "Ancient Rome, Giovanni Paolo Panini (1757)" },
} as const satisfies Record<string, ImageWithCredit>;
