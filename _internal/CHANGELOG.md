# GameVault 更新紀錄

每次版本更新自動記錄，保留最近 3 筆。

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

---

## v40.34 (2026-06-28)

### 變更內容
- 收藏頁匯出改為按類型分檔：每個分類（遊戲／書籍／主機／週邊／尋寶）各產生一個 CSV，檔名含類型與日期
- 新增匯入功能：支援多檔同時匯入，自動偵測 category 欄位分類，UUID 去重避免重複匯入

### 影響檔案
- `GameVault/index.html`
- `GameVault/GameVault_v40_34_index.html`
- `GameVault/sw.js`（CACHE_NAME: gamevault-v40-34）

### GS 版本
- 無

### PWA 快取
- CACHE_NAME 已更新為 `gamevault-v40-34`

### 對應備份
- `_internal/old/v40_33/`
