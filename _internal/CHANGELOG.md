## v40.49 (2026-06-29)

### 變更內容
- 修正主機/週邊用商品編碼查詢後「所有資料庫均無結果」的問題
- 根本原因：`_crossRefQuery` 的路由守衛刻意讓非遊戲分類繞過所有遊戲資料庫（正確設計），但缺少替代路徑
- 解法：`gcodeSearch` 加入主機/週邊獨立分支，走「ScreenScraper 試查 + AI 直接填欄」並行策略：
  - ScreenScraper：用型號當名稱查詢，有結果就帶入（需已設定 SS 帳密）
  - AI：直接用型號 + 平台呼叫 `aiKnowledgeFill`，不再需要 primary_name 已存在才執行
  - 兩者並行 Promise.all，SS 填主要欄位，AI 補缺漏欄位
- 週邊的 gcode-combo 路徑（gcodeComboSearch）保持不變，已有 AI 視覺辨識涵蓋

### 影響檔案
- index.html
- GameVault_v40_49_index.html
- sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME 已遞增：gamevault-v40-49

### 對應備份
- _internal/old/v40_48/

## v40.48 (2026-06-29)

### 變更內容
- 完整研究所有建檔平台（PS/Nintendo/Sega/Xbox/PCE/Neo Geo/WonderSwan 等）各地區編碼格式
- `_isValidGCode` 白名單更新（37/37 測試通過）：
  - A: 純數字 4-13 碼（原 5-13），新增支援 Sega Master System 短碼（7015、1228 等）
  - B2: 新增純數字連字號格式（610-6272-50、610-6275 等 Sega 日本地區碼）
  - B1 + C: 維持原有廣域覆蓋
- 覆蓋率從 104/109（95.4%）提升至 109/109（100%）
  - 補上：Sega MD 610 系列、Sega Saturn 610 系列、Sega CD 610 系列、Sega MS 純數字短碼

### 影響檔案
- index.html
- GameVault_v40_48_index.html
- sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME 已遞增：gamevault-v40-48

### 對應備份
- _internal/old/v40_47/

## v40.47 (2026-06-29)

### 變更內容
- 新增 Switch 2 卡帶格式支援：LN-BQ2ZZB-JPN-O（2字母-英數5-7-地區2-4-可選版本碼）
- 遊戲編碼驗證改為統一寬鬆白名單（`_isValidGCode`），取代多個零散 regex：
  - A: 純數字 5-13 碼（條碼/Xbox）
  - B: 含連字號 + 含字母 + 全英數連字號組合，3-25 字元
  - C: 字母開頭英數混合無連字號，4-12 碼
- 抽出 `_extractGCode`（單行擷取）, `_isValidGCode`（白名單驗證）兩個 helper
- `_matchGCode` 簡化為包裝層（純數字條碼優先，再走 `_extractGCode`）
- 遊戲「商品編碼」與「拍攝編碼＋照片」模式各加紅字提醒：⚠️ 請先選擇正確「平台」與「區域」
- 20/20 回歸測試通過

### 影響檔案
- index.html
- GameVault_v40_47_index.html
- sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME 已遞增：gamevault-v40-47

### 對應備份
- _internal/old/v40_46/

