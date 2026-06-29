## v40.43 (2026-06-29)

### 變更內容
- `cleanOCRByCategory` 遊戲分支格式大幅擴充（21/21 測試通過）：
  - 新增 Nintendo 卡帶 ROM 格式：AGB-AXPJ-JPN、NTR-AXXJ-JPN（字母-英數-地區）
  - 新增 Nintendo 光碟格式：CTR-P-ARXJ、RVL-P-RMCJ、HAC-P-AAAA（字母-單字母-英數）
  - 新增 Sega 第三方格式：T-00001G（T- 開頭加數字）
  - PS/Sega 標準格式 regex 精確化，避免過寬誤判
- 遊戲 OCR prompt 同步更新，列出各平台代表性格式讓 Gemini 更準確辨識
- 涵蓋平台：PS1/2/3/4/5、PSP、PSVita、GBA、NDS、3DS、Wii、WiiU、Switch、Sega MD/SS/DC、EAN/UPC 條碼

### 影響檔案
- index.html
- GameVault_v40_43_index.html
- sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME 已遞增：gamevault-v40-43

### 對應備份
- _internal/old/v40_42/

## v40.42 (2026-06-29)

### 變更內容
- OCR prompt 改為動態：依當前選擇的分類（遊戲/主機/週邊/攻略）給 Gemini 不同的辨識指引
  - 主機/週邊：明確告知 P/N、Model No. 格式（含 810-010805 純數字型）也是有效編碼
  - 攻略：明確要求 ISBN 格式
  - 遊戲：維持現有 CUSA/SLUS/HAC 等格式提示
- `cleanOCRByCategory` 主機/週邊分支新增純數字 P/N 格式擷取（如 810-010805）
- 影響範圍：`openCodeScanFor`、`fieldScan`、`fscanCapture` fallback prompt

### 影響檔案
- index.html
- GameVault_v40_42_index.html
- sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME 已遞增：gamevault-v40-42

### 對應備份
- _internal/old/v40_41/

## v40.41 (2026-06-29)

### 變更內容
- 以 v40.35 為基底重建，移除 v40.37–40.40 的 retry bar UI（四顆選項按鈕）
- 新增 `callGeminiOCR`：純文字模式（不用 responseSchema），遇 429/503 自動等 5 秒重試一次
- OCR 壓縮品質升級：300px/0.5 → 600px/0.75
- `cleanOCRByCategory` 改為子字串擷取（而非整行驗證），Gemini 回傳含說明文字也能找到編碼
- 失敗原因細分：圖片無符合格式編碼 / 無法讀取文字 / API 錯誤（含錯誤訊息），各給不同提示
- fallback 機制：Gemini 有回傳但格式不符時帶入並提示「AI 不確定，請手動確認」

### 影響檔案
- index.html
- GameVault_v40_41_index.html
- sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME 已遞增：gamevault-v40-41

### 對應備份
- _internal/old/v40_41d/（備份 debug 版本）

