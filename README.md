# 日本語ツール — 個人日語溝通工具

單一 HTML 檔的日語溝通輔助工具：中日互譯（附羅馬拼音＋平假名）、日語 TTS 朗讀、語音輸入、我的最愛與內建句庫、情境單字與對話（交通／點餐／牙科／問路／日期時間／購物）、歷史紀錄、匯出備份。手機優先，可加入主畫面當 PWA 使用。

**線上網址**：https://nihongo.casper77chen.com

- 翻譯：Google Translate 免費端點（gtx），無需 API key
- 發音：Web Speech API（ja-JP，男聲優先）
- 儲存：localStorage（可匯出 / 匯入 JSON 備份）＋可選雲端同步（`/api/sync`，Bearer 金鑰，資料存 Zeabur volume）
- 部署：Zeabur（Node/Express 小後端 serve 靜態頁＋同步 API）
