# Restitutor 發包交接手冊（macOS universal build）

> 給負責發包的人／bot（grokbot）。整個 `publish.mjs` 流程現在**必須在 macOS 上執行**。

## 1. 這次改了什麼、為什麼

| 項目 | 之前 | 現在 |
|---|---|---|
| macOS 產物 | `out/Restitutor-darwin-x64`（Intel 版，Apple Silicon 靠 Rosetta 跑） | `out/Restitutor-darwin-universal`（x64 + arm64 合在同一個 .app） |
| 打包指令 | `--platform=win32,linux,darwin` | 先 `clean+build` 一次，再 `electron-forge package --platform=win32,linux` + `--platform=darwin --arch=universal`（不可連跑兩次 `npm run package`，否則第二次 clean 會清掉 win/linux） |
| Steam depot | `darwin.vdf` ContentRoot 指向 `Restitutor-darwin-x64` | 指向 `Restitutor-darwin-universal`（**depot ID 4431753 不變**） |
| steamcmd | `builder_linux/steamcmd.sh` | `builder_osx/steamcmd.sh` |
| 執行平台 | Linux self-hosted runner（`/home/insraq`） | **macOS**（腳本開頭會直接檢查 `process.platform`，非 darwin 直接退出） |

改動檔案：
- `scripts/publish.mjs` — 平台檢查、universal 打包指令、路徑、`builder_osx`
- `scripts/darwin.vdf` — ContentRoot
- `forge.config.js` — 新增 `osxUniversal.x64ArchFiles: "**/steamworksjs.darwin-*.node"`。steamworks.js 在兩份 build 裡都附相同的 x64/arm64 `.node`，`@electron/universal` 會因「檔案相同但不是 universal」而報錯，這條規則叫它原樣保留（執行期由 loader 依 `process.arch` 挑）。

**為什麼一定要 macOS**：`@electron/universal` 合併 x64/arm64 用的是 Xcode 的 `lipo`，且套件本身在 `index.js` 硬性檢查 `process.platform !== 'darwin'` 就 throw。增量 build（不帶 `--full`）又依賴同一台機器上一次 full build 留下的 `out/`，所以整條流程都得搬到 macOS。

**原生 arm64 沒有其他阻礙**：`@fishpondstudio/steamworks.js` 已附 `steamworksjs.darwin-arm64.node`，`libsteam_api.dylib` 是 universal binary，loader 依 `process.arch` 自動挑；electron 其餘依賴皆純 JS；client 端是 web build 與架構無關。

**已在 Apple Silicon（macOS 26.6）本機驗證**：`npm run package -- --platform=darwin --arch=universal` 成功，`lipo -archs` 為 `x86_64 arm64`，啟動後 `lsappinfo` 顯示 `Arch=ARM64`，steamworks native module 正常載入（未開 Steam 時如預期回報 `SteamAPI_Init() failed`）。

## 2. 發包機器需求（macOS）

一次性安裝：

| 工具 | 用途 | 安裝 |
|---|---|---|
| Xcode Command Line Tools | 提供 `lipo` | `xcode-select --install` |
| **Node.js 20.x**（`nvm use 20`）、pnpm、npm | build | Node 24 會讓 `@electron/packager` 在解壓 Electron 時無聲退出（`extract-zip` 相容問題），exit code 0 但 `out/` 是空的 |
| `rcodesign` | 簽章 + 公證（Rust 寫的，macOS 可用） | `cargo install apple-codesign` 或 `brew install rcodesign` |
| `wrangler` | 部署 web 版到 Cloudflare Pages | `npm i -g wrangler` 並 `wrangler login` |
| Steam ContentBuilder | 上傳 Steam | 從 Steamworks SDK 解壓，需要 `tools/ContentBuilder/builder_osx/` |
| ssh key | `scp` OTA zip 到 `ubuntu@de.fishpondstudio.com:/opt/ota/` | 把原本 Linux runner 的 key 搬過來 |

不需要 Wine：`@electron/packager` 18.x 改 win32 icon 用純 JS 的 `resedit`。

從舊 Linux runner 搬過來的**私密檔案**（放 `packages/electron/local/`，已在 gitignore）：
- `app-sign.p12`、`p12-password` — Developer ID 簽章憑證
- `entitlements.plist`
- `app-store.json` — App Store Connect API key（公證用）

Steam ContentBuilder 目錄要有：
- `restitutor/` 資料夾（vdf 會被腳本複製進去）
- `restitutor.txt`（steamcmd runscript，含登入帳號；從舊 runner 搬）
- 先手動跑一次 `builder_osx/steamcmd.sh +login <帳號>` 完成 Steam Guard

環境變數：
```
STEAMWORKS_PATH=/path/to/steamworks/tools/ContentBuilder/
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_API_TOKEN=...
```

## 3. 發包步驟

```bash
cd Restitutor
git checkout main && git pull --rebase
git submodule update --recursive --remote --init
pnpm install

cd packages/electron
npm run publish            # 增量：只重建 client、更新 game/ 資料夾、上傳 Steam + OTA
npm run publish -- --full  # 完整：重裝 electron 依賴、重新打包三平台、簽章、公證、上傳

# 腳本會把 packages/client/src/version.json 的 build 號 +1，記得 commit
cd ../..
git add packages/client/src/version.json
git commit -m "[skip ci] New Build $(node -p "require('./packages/client/src/version.json').build")"
git push
```

**什麼時候要 `--full`**：改了 `packages/electron/` 任何東西（main process、preload、依賴、Electron 版本）、或第一次在新機器上發包。只改 client（`packages/client/`）用增量即可。

**第一次 full build** 會下載四份 Electron 二進位（darwin-x64、darwin-arm64、win32-x64、linux-x64，各約 100 MB），會比較久。

`pnpm run build`（vite）會重寫 `packages/client/public/Flag/*.png` 與 `manifest.json`，這是 build 副產物，發包前 `git checkout -- packages/client/public` 還原，不要 commit。

## 4. 驗證

打包後、上傳前：

```bash
cd packages/electron
# 1. 主程式是 universal
lipo -archs out/Restitutor-darwin-universal/Restitutor.app/Contents/MacOS/Restitutor
#    預期輸出：x86_64 arm64

# 2. 簽章 + 公證通過（full build 後）
codesign --verify --deep --strict out/Restitutor-darwin-universal/Restitutor.app
spctl --assess --type execute out/Restitutor-darwin-universal/Restitutor.app
#    預期：無錯誤 / accepted

# 3. 遊戲內容有跟著複製
ls out/Restitutor-darwin-universal/game/index.html
```

上傳 Steam 後：在 Apple Silicon Mac 從 Steam beta 分支下載，開啟「活動監視器」確認 Restitutor 的「種類」欄是 **Apple** 而非 Intel。

## 5. CI workflow 要跟著搬

`.github/workflows/build.yml` 與 `build-full.yml` 目前寫死：
- `runs-on: [self-hosted]` → 舊的 Linux runner
- `working-directory: /home/insraq/Restitutor`
- `. "$HOME/.cargo/env"`（rcodesign 路徑）

要嘛在 macOS 機器上註冊新的 self-hosted runner 並改路徑，要嘛暫時改用手動跑第 3 節的指令。在 Linux runner 上跑會在腳本第一行就退出（刻意的）。

## 6. 回滾

只有三個檔案（publish.mjs、darwin.vdf、forge.config.js），`git revert` 該 commit 即可回到 darwin-x64 + Linux runner 流程。Steam depot 沒改，不需要動 Steamworks 後台。

## 7. 疑難排解

| 症狀 | 原因 / 處理 |
|---|---|
| `npm run package` 跑完 exit 0 但沒有 `out/` | 用了 Node 24。`nvm use 20` 重跑 |
| `Detected file ... steamworksjs.darwin-arm64.node that's the same in both x64 and arm64 builds` | `forge.config.js` 的 `osxUniversal.x64ArchFiles` 被拿掉了，加回去 |
| `npm install` 在 electron 目錄失敗且 `node_modules` 整個消失 | Electron 二進位下載中斷，npm 會回滾。改跑 `npm install --ignore-scripts && node node_modules/electron/install.js`（後者失敗可重跑） |
| 啟動後跳 `Failed to Start Game` / log 有 `SteamAPI_Init() failed` | Steam 沒開，不是 build 問題 |

## 8. 已知代價

- universal .app 體積約為單架構的兩倍（Electron Framework 兩份）。
- macOS 26 起 Apple 已宣告 Rosetta 將逐步退場，所以原生 arm64 不是選配。
