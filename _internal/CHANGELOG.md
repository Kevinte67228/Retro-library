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

## v40.36 (2026-06-28)

### 變更內容
- OCR 編碼辨識改用 `callGeminiOCR`（純文字模式）取代 `callGemini`（responseSchema 結構化輸出），避免 schema 欄位干擾辨識結果
- OCR 影像壓縮品質從 300px/0.5 提升至 600px/0.75，改善細字辨識率
- 影響範圍：`fscanCapture`（取景框即時拍攝）、`_gcodeOCRShared`（舊版相機拍照路徑）

### 影響檔案
- index.html
- GameVault_v40_36_index.html
- sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME 已遞增：gamevault-v40-36

### 對應備份
- _internal/old/v40_35/

