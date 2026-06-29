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

## v40.45 (2026-06-29)

### 變更內容
- `cleanOCRByCategory` 支援兩行印刷編碼（如 ECJS / 00052 分兩行）
  - 掃描前先嘗試「純字母行 + 數字行」相鄰拼接（加連字號或直接合併）
  - 例：ECJS + 00052 → ECJS-00052；CUSA + 00001 → CUSA-00001
  - 三行情境（中間夾說明文字）也正確處理
- 抽出 `_matchGCode()` helper 供單行與兩行拼接共用，邏輯不重複
- 遊戲 OCR prompt 加說明「編碼可能分兩行印刷，請合併後回傳」
- 15/15 測試全通過（含兩行、單行、多行、fallback）

### 影響檔案
- index.html
- GameVault_v40_45_index.html
- sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME 已遞增：gamevault-v40-45

### 對應備份
- _internal/old/v40_44/

