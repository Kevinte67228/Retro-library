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

## v40.39 (2026-06-29)

### 變更內容
- retry bar 四顆按鈕加入選中狀態（`.sel`）：點哪顆哪顆高亮（亮藍邊框＋輕背景）
- 切回取景框重新對準後，retry bar 重新顯示時保留上次選擇的高亮狀態
- 「返回」改為 `_fscanBack()`：先顯示選中效果 120ms 後再關閉，讓用戶感知點擊
- 新開取景框（`fscanStop`）時清除所有 `.sel`，不保留跨 session 狀態
- 加入 `_fscanSelBtn()` 共用 helper 管理選中狀態

### 影響檔案
- index.html
- GameVault_v40_39_index.html
- sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME 已遞增：gamevault-v40-39

### 對應備份
- _internal/old/v40_38/

## v40.38 (2026-06-28)

### 變更內容
- OCR 失敗後的選項 UI 重新設計：改用獨立 `#fscan-retry-bar`（display 切換），不再覆寫 `#fscan-bar` innerHTML
- 「重新對準」修正為具名函式 `_fscanRetryRescan()`，正確還原 fscan-bar 顯示並重設按鈕狀態（closure 失效問題修正）
- 新增「返回」按鈕（`fscanCancel()`），可完全離開取景框
- 三選項改兩列排版：「重新對準（主色）/ 拍照 OCR」+ 「手動輸入 / 返回」
- 按鈕全數套用 `#fscan-retry-bar button` CSS（有 border、active 縮放動效）
- `fscanStop()` 加入 retry bar 狀態重置，避免下次開啟殘留

### 影響檔案
- index.html
- GameVault_v40_38_index.html
- sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME 已遞增：gamevault-v40-38

### 對應備份
- _internal/old/v40_37/

