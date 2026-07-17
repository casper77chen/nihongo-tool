# nihongo-tool

個人日語溝通工具（單檔 HTML＋sw.js），規格正本：`../日語學習工具規劃書.md`。

## Zeabur Deployment
- Project ID: 6a59715c725eab1a1db81ce6（nihongo-tool，Side_Project_A 伺服器）
- Service ID: 6a597182d549337cfa26afc2
- 部署方式：direct deploy（`npx zeabur@latest deploy --project-id <PID> --service-id <SID> -i=false`，在本目錄執行）
- direct deploy 後等 60-90 秒自動滾新版，別急著 restart；驗證：curl 網域 grep 新加的字串（見全域 lessons.md Zeabur 區）

## 驗證指令
- `awk '/<script>/{f=1;next}/<\/script>/{f=0}f' index.html > /tmp/njp.js && node --check /tmp/njp.js`
- `node --check sw.js`

## 已知限制（規格內建取捨）
- 即時翻譯的常體＝規則式近似轉換（卡片有標註）；內建句庫是手寫雙版本
- 平假名行＝羅馬拼音反推近似值
- 翻譯走 Google gtx 免費非官方端點，未來可在 settings 擴充 Claude API provider
