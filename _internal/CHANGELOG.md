# GameVault 更新紀錄

每次版本更新自動記錄，保留最近 3 筆。

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

---

# GameVault 更新紀錄

每次版本更新自動記錄，保留最近 3 筆。對應備份位於 `GameVault/old/` 資料夾。

---

## v40.33 (2026-06-28)

### 變更內容
- 設定頁「首次設定向導」步驟 3：改為直接提供後端程式檔下載連結（`GameVault_AppsScript.gs`），連結加 `download` 屬性觸發瀏覽器下載
- GS 後端清理：移除標題舊版更新注解（v29～v37）、行內版本注解，版本號統一改為 `v40`
- 建立 GitHub + Netlify 自動部署流程，取代手動拖拉上傳
- 修正 mkt market icon 路徑（`mkt-*.webp/jpg` → `icons/mkt-*.webp/jpg`）
- 修正 GitHub raw 靜態資源連結（`/main/` → `/main/GameVault/`）
- 整理 repo 結構：根目錄圖檔全數移入 `GameVault/icons/`
- 建立 `GameVault/old/` 備份機制（保留最近 3 個版本）
- 建立 `github_deploy.py` 自動部署腳本

### 影響檔案
- `GameVault/index.html`
- `GameVault/GameVault_v40_33_index.html`
- `GameVault/sw.js`（CACHE_NAME: `gamevault-v40-33`）
- `GameVault/GameVault_AppsScript.gs`
- `GameVault/icons/`（新建資料夾，含 mkt-* 與 icon-* 圖檔）
- `GameVault/github_deploy.py`（新增）
- `GameVault/CHANGELOG.md`（新增）

### GS 版本
- `v40`（無後端邏輯變更，僅清理注解）

### PWA 快取
- `CACHE_NAME` 已更新為 `gamevault-v40-33`

### 對應備份
- `GameVault/old/v40_33/`

### 備註
- `manual.html` 需手動確認是否已在 repo 內
- Token 不進 repo，每次使用時由使用者提供

---
