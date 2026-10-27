# nihongo-tool

個人日語溝通工具（index.html＋sw.js＋server.js 小後端），規格正本：`../日語學習工具規劃書.md`。

- 正式網址：https://nihongo.casper77chen.com（2026-10-27 起 Railway；CF CNAME，DNS only）
- Railway 臨時網址：https://nihongo-tool-production.up.railway.app（舊 Zeabur 備用網址 nihongo-casper.zeabur.app 留到搬家第 6 階段）
- 已作為案例卡放進兩版 AI 課程的 Lesson 2（互動工具實例）與 Lesson 3（localStorage 對比案例）
- 已收錄 Casper Dashboard（2026-07-21，id `nihongo-tool`、Casper77 分類、無 pending API、含 Restart 對照）

## 部署（2026-10-27 起 Railway）
- Railway 專案 nihongo-tool（22922738-2475-49a4-819e-76958d65c1c6）、服務 86ac99de-3127-4f86-9c8b-e8c07be384d6、環境 adc3c387-07c1-41db-af69-706205abaddc，新加坡
- GitHub casper77chen/nihongo-tool push main 自動部署（不再用 direct deploy）
- Volume 掛 `/data`（sync.json＋sync-<hash>.json）；變數 SYNC_KEY、SYNC_KEYS（加朋友＝改 Railway 變數，會自動重部署）
- 改容器內檔案：`railway ssh -p <專案> -e <環境> -s <服務> -- <指令>`
- 靜態檔只公開 index.html、sw.js（server.js 白名單），新增前端檔要加路由

## （舊）Zeabur Deployment
- Project ID: 6a59715c725eab1a1db81ce6（nihongo-tool，Side_Project_A 伺服器）
- Service ID: 6a597182d549337cfa26afc2
- 部署方式：direct deploy（`npx zeabur@latest deploy --project-id <PID> --service-id <SID> -i=false`，在本目錄執行）
- direct deploy 後等 60-90 秒自動滾新版，別急著 restart；驗證：curl 網域 grep 新加的字串（見全域 lessons.md Zeabur 區）
- 形態（v1.4.0 起）：Node/Express（zbpack.json 強制），serve 靜態頁＋`/api/sync`（GET/PUT 單一 JSON，Bearer 認證）
- 多 key 同步（v1.6.0，2026-07-21）：env `SYNC_KEYS` 逗號分隔朋友 key（格式 `njp_<32hex>`），每把對應 `/data/sync-<sha256(key)前16碼>.json` 互相隔離；Casper 的 `SYNC_KEY` 不變、仍對應 `sync.json`。加朋友＝append 進 SYNC_KEYS → restart → `exec printenv SYNC_KEYS` 驗到值（variable create 後立刻 restart 會拿到舊 env，見全域 lessons）
- Volume `nihongo-data` 掛 `/data`（同步檔正本，重啟實證留存）
- 容器工作目錄是 `/src`（不是 `/app`），exec grep 驗證用 `/src/server.js`、`/src/index.html`
- CLI 注意：`variable create --id <SID> -k KEY=VALUE -i=false`、`service restart --id <SID> -i=false`（不加 -i=false 會卡互動確認）

## 驗證指令
- `awk '/<script>/{f=1;next}/<\/script>/{f=0}f' index.html > /tmp/njp.js && node --check /tmp/njp.js`
- `node --check sw.js`

## 程式內部注意
- 錯誤顯示條（body 開頭第一個 script）：window.onerror＋unhandledrejection → 紅條顯示訊息＋行號，供非工程師截圖回報；別移除
- loadVoices/renderVoiceSelect/pickVoice 有遞迴風險：語音清單補抓一律走 refreshJaVoices()（只更新資料不重繪）；iOS standalone 啟動初期 getVoices() 回空清單，Safari 測不出這條路徑（v1.5.1 教訓）
- 全域 `let history`（對話陣列）遮蔽 `window.history`——用瀏覽器 History API 必須寫 `window.history.*`（07-20 實踩）
- puppeteer 測試注意：直接改 localStorage 後 reload 會被 `pagehide` 的 flushAll 用記憶體舊 state 蓋掉（07-21 實踩，syncKey 注入失敗）——要改狀態就改頁內 `settings` 物件＋呼叫 `flushAll()`；測試腳本正本 `/tmp/njp-notes-test.js`（17 斷言含雙裝置同步模擬，會被清，要長期保留可複製進專案）
- 一次性設定連結：`/#setup=<sk-ant-key>&sync=<njp_key>`（或 ?query 形式，兩參數可單獨用）自動存 apiKey／syncKey＋replaceState 抹痕跡（applySetupLink）；正則不錨定結尾（容忍通訊軟體黏的尾端雜字元），任一參數格式壞時顯示錯誤 toast；syncKey 存入後由啟動尾端的 syncNow 自動拉首份雲端資料
- 筆記分頁（v1.6.0）：手寫學習筆記 `njp.notes`（id/name/content/tags/starred/order/ts/updatedAt），底部第 6 個 tab；手動排序＝order 欄位＋↑↓（篩選中隱藏排序鈕）；新筆記 order=min-1 排最上。**同步合併走 LWW**（updatedAt 新者勝，僅筆記；其他資料仍是只加不改）——編輯、星號、排序都會跨裝置傳；墓碑類別 `note`。sw.js 快取版本連動升（現 njp-v10），改 index.html 記得一起 bump
- 同步刪除（v1.5.0）：刪除墓碑 `njp.deletions`（{fav|hist|grammar|scene|note: {id: ts}}，留 180 天）；mergeData(data, fromSync)——同步交換墓碑、兩邊真刪；手動匯入備份＝復原意圖、會清墓碑救回資料；重新加星同 id 走 unmarkDeleted；trimHistory 自動修剪不記墓碑

## 已知限制（規格內建取捨）
- 即時翻譯的常體＝規則式近似轉換（卡片有標註）；內建句庫是手寫雙版本
- 平假名行＝羅馬拼音反推近似值
- 翻譯走 Google gtx 免費非官方端點，未來可在 settings 擴充 Claude API provider
