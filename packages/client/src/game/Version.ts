import version from "../version.json";
import { Version } from "./definitions/Constant";

export function getVersion(): string {
   return `${Version}.${version.build}`;
}

export function getBuildNumber(): number {
   return version.build;
}
