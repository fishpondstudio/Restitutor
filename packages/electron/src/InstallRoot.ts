import path from "node:path";
import { app } from "electron";

/**
 * Returns the directory containing the distributable application and its game folder.
 *
 * Windows and Linux executables live directly in the install root. On macOS the
 * executable lives inside Restitutor.app/Contents/MacOS, so the install root is
 * the directory containing the complete .app bundle.
 */
export function getInstallRoot(): string {
   const executablePath = app.getPath("exe");
   if (process.platform !== "darwin") {
      return path.dirname(executablePath);
   }

   let current = path.dirname(executablePath);
   while (true) {
      if (path.extname(current).toLowerCase() === ".app") {
         return path.dirname(current);
      }

      const parent = path.dirname(current);
      if (parent === current) {
         throw new Error(`The macOS executable is not inside an app bundle: ${executablePath}`);
      }
      current = parent;
   }
}
