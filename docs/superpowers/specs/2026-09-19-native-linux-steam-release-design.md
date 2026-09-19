# Native Linux Steam Release

## Goal

Ship and validate a native Linux build of Restitutor for SteamOS and Omarchy. The release must avoid Proton for Linux users and address the Wayland compositor path used by the game.

## Current state

Steam currently installs depot `4431751` on Omarchy. Its payload is the Windows executable `Restitutor.exe`, and Steam runs it with `proton_experimental`.

The project already defines Linux depot `4431752` in `packages/electron/scripts/linux.vdf`. The existing release script packages `Restitutor-linux-x64`, copies the client bundle into it, and uploads the Windows, Linux, and macOS depots through SteamCMD.

## Application changes

The Linux Electron startup path will:

- use Chromium's `ozone-platform-hint=auto`, choosing Wayland when it is available and retaining X11 compatibility otherwise;
- keep DevTools available in development only, never opening it in a packaged release.

No gameplay or save-format behavior changes.

## Release flow

1. Build the client bundle and package the Linux Electron application as `Restitutor-linux-x64`.
2. Upload the package to depot `4431752` through the existing SteamCMD release flow.
3. Map that depot only to a Steam beta branch. Do not alter the default/public branch yet.
4. Install that beta on each target system. Steam must select the native Linux payload rather than the Windows depot and Proton.
5. Promote the tested depot mapping to the default branch only after both targets pass.

Steamworks credentials and the builder's `STEAMWORKS_PATH` are external prerequisites. A GitHub fork can contain and review the application change but cannot upload or map Steam depots.

## Test matrix

| Target | Required package proof | Runtime checks |
| --- | --- | --- |
| SteamOS | Installed executable is a native x86-64 ELF, with no Proton compatibility tool selected | Launch from Steam, full screen, no flashing white line, load/save works |
| Omarchy | Installed executable is a native x86-64 ELF, with no Proton compatibility tool selected | Launch from Steam, full screen, no flashing white line, load/save works |

Capture a Steam screenshot and a short direct-display recording on each system. The screenshot distinguishes a rendered artifact from a display/compositor artifact.

## Rollback

Keep the default branch mapped to its current depots until beta validation is complete. If a beta test fails, leave or restore the affected user to the default branch; it will receive the existing Windows/Proton build. Do not overwrite the Windows depot.

## Acceptance criteria

- A beta install on SteamOS and Omarchy uses the native Linux executable.
- Both systems complete all runtime checks in the test matrix.
- The default Steam branch remains unchanged until the beta evidence is reviewed.
