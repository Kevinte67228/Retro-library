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

## v40.46 (2026-06-29)

### 變更內容
- 修正 Switch 含地區碼編碼被截斷的問題（LA-H-A585C-CHT 只帶入 LA-H-A585C）
- `_matchGCode` 的 Nintendo 光碟 regex 加入可選尾端地區碼：`(?:-[A-Z]{2,4})?`
- 影響格式：LA-H-XXXXX-CHT / LA-H-XXXXX-JPN 等 Switch 亞洲版四段碼
- 長度上限從 20 調整為 22（容納地區碼段）
- 11/11 測試通過

### 影響檔案
- index.html
- GameVault_v40_46_index.html
- sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME 已遞增：gamevault-v40-46

### 對應備份
- _internal/old/v40_45/

