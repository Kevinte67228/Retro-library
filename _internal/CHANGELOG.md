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

## v40.38 (2026-06-28)

### 變更內容
- 建檔／編輯頁掃描邏輯調整：
  - `barcode`（條碼、ISBN/條碼）和 `code`（書碼、產品編碼）欄位：維持 BarcodeDetector 即時掃描框
  - `serial_no`（序號）及其他欄位：改為拍照→OCR 辨識

### 影響檔案
- `GameVault/index.html`、`GameVault/GameVault_v40_38_index.html`、`GameVault/sw.js`

### GS 版本
- 無

### PWA 快取
- CACHE_NAME 已更新為 `gamevault-v40-38`

### 對應備份
- `_internal/old/v40_37/`

---

## v40.37 (2026-06-28)

### 變更內容
- 建檔／編輯頁條碼欄（barcode）掃描改為「拍照 OCR 辨識」：對準條碼按拍攝，交由 Gemini AI 辨識數字，取代辨識率差的 BarcodeDetector 即時掃描框

### 影響檔案
- `GameVault/index.html`、`GameVault/GameVault_v40_37_index.html`、`GameVault/sw.js`

### GS 版本
- 無

### PWA 快取
- CACHE_NAME 已更新為 `gamevault-v40-37`

### 對應備份
- `_internal/old/v40_36/`

---

