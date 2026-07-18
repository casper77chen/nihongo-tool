# nihongo-tool

個人日語溝通工具（index.html＋sw.js＋server.js 小後端），規格正本：`../日語學習工具規劃書.md`。

- 正式網址：https://nihongo.casper77chen.com（GoDaddy CNAME `nihongo` → nihongo-casper.zeabur.app）
- 備用網址：https://nihongo-casper.zeabur.app
- 已作為案例卡放進兩版 AI 課程的 Lesson 2（互動工具實例）與 Lesson 3（localStorage 對比案例）

## Zeabur Deployment
- Project ID: 6a59715c725eab1a1db81ce6（nihongo-tool，Side_Project_A 伺服器）
- Service ID: 6a597182d549337cfa26afc2
- 部署方式：direct deploy（`npx zeabur@latest deploy --project-id <PID> --service-id <SID> -i=false`，在本目錄執行）
- direct deploy 後等 60-90 秒自動滾新版，別急著 restart；驗證：curl 網域 grep 新加的字串（見全域 lessons.md Zeabur 區）
- 形態（v1.4.0 起）：Node/Express（zbpack.json 強制），serve 靜態頁＋`/api/sync`（GET/PUT 單一 JSON，Bearer SYNC_KEY 認證）
- Volume `nihongo-data` 掛 `/data`（sync.json 正本，重啟實證留存）；SYNC_KEY 在服務 env（同一把貼進各裝置設定頁）
- CLI 注意：`variable create --id <SID> -k KEY=VALUE -i=false`、`service restart --id <SID> -i=false`（不加 -i=false 會卡互動確認）

## 驗證指令
- `awk '/<script>/{f=1;next}/<\/script>/{f=0}f' index.html > /tmp/njp.js && node --check /tmp/njp.js`
- `node --check sw.js`

## 已知限制（規格內建取捨）
- 即時翻譯的常體＝規則式近似轉換（卡片有標註）；內建句庫是手寫雙版本
- 平假名行＝羅馬拼音反推近似值
- 翻譯走 Google gtx 免費非官方端點，未來可在 settings 擴充 Claude API provider
