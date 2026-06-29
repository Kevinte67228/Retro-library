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

## v40.37 (2026-06-28)

### 變更內容
- OCR 辨識失敗後，取景框底部按鈕列動態切換為三選項：「重新對準」／「拍照 OCR」／「手動輸入」
- 選「重新對準」：還原原始按鈕，直接在取景框中重拍
- 選「拍照 OCR」：關閉取景框，觸發原生相機靜態拍照，走 _gcodeOCRShared 路徑辨識
- 選「手動輸入」：關閉取景框，對目標輸入欄位 focus + scrollIntoView
- 新增 _fscanShowRetryOptions / _fscanTriggerPhoto / fscanPhotoFallback / _fscanManualInput
- 新增 #fscan-photo-inp（hidden file input，供拍照 OCR 觸發）

### 影響檔案
- index.html
- GameVault_v40_37_index.html
- sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME 已遞增：gamevault-v40-37

### 對應備份
- _internal/old/v40_36/

