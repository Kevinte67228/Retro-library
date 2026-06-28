# GameVault 更新紀錄

每次版本更新自動記錄，保留最近 3 筆。

---

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

## v40.36 (2026-06-28)

### 變更內容
- 收藏頁視圖切換按鈕改為「圖示 + 文字」膠囊樣式（卡片 / 書架）
- 修正選中狀態亮色背景未填滿按鈕的問題（改用完整 inline style 控制高度）

### 影響檔案
- `GameVault/index.html`、`GameVault/GameVault_v40_36_index.html`、`GameVault/sw.js`

### GS 版本
- 無

### PWA 快取
- CACHE_NAME 已更新為 `gamevault-v40-36`

### 對應備份
- `_internal/old/v40_35/`
