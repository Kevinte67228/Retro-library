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

## v40.40 (2026-06-29)

### 變更內容
- `cleanOCRByCategory` 從「整行格式驗證」改為「子字串擷取」：Gemini 就算多回傳說明文字，也能從行內找出符合格式的編碼/型號/ISBN
  - 主機/週邊：regex 擷取 `英字母開頭-英數` 格式片段（SCPH-10000、CUH-2000A、HAC-001）
  - 遊戲：擷取純數字條碼或 `XX-數字` 格式（SLPM-62300、CUSA-00001）
  - 攻略：擷取 10/13 碼 ISBN
- 新增 fallback 機制：所有行都沒有符合格式的片段時，回傳第一行前 25 字（`?` 前綴），帶入欄位並提示「AI 不確定，請手動確認」，不再直接顯示失敗
- 同樣修正適用於 `fscanCapture`（取景框）與 `_gcodeOCRShared`（靜態拍照 OCR）兩條路徑
- 8/8 單元測試通過

### 影響檔案
- index.html
- GameVault_v40_40_index.html
- sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME 已遞增：gamevault-v40-40

### 對應備份
- _internal/old/v40_39/

