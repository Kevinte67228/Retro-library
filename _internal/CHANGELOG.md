# GameVault 更新紀錄

每次版本更新自動記錄，保留最近 3 筆。

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

---

## v40.35 (2026-06-28)

### 變更內容
- 收藏頁右上角工具列重構：視圖切換按鈕放大（44px），移除殭屍按鈕
- 同步、匯出 CSV、匯入 CSV 三個功能收進「⋯」浮層選單，點外部自動關閉
- 大量刪除按鈕保留在工具列（常用操作直接可見）

### 影響檔案
- `GameVault/index.html`、`GameVault/GameVault_v40_35_index.html`、`GameVault/sw.js`

### GS 版本
- 無

### PWA 快取
- CACHE_NAME 已更新為 `gamevault-v40-35`

### 對應備份
- `_internal/old/v40_34/`
