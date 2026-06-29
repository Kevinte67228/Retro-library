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

## v40.44 (2026-06-29)

### 變更內容
- `cleanOCRByCategory` 遊戲分支全平台覆蓋（31/31 測試通過）：
  - 新增 FC/FDS/GB：純字母格式（HVC-NSMJ、FMC-HVC、DMG-TRAJ）
  - 新增 Sega G-XXXX：G-4049、G-6001（Sega 自製 MD/SS/DC）
  - 新增 Neo Geo / MSX：短數字格式（NGH-001、MSX-001）
  - 新增 WonderSwan：字母+數字混合（SWJ-BAN001）
  - 新增 Xbox 純數字 5-6 碼：14981、58069
- PC 平台一勞永逸策略：偵測到 PC 平台時跳過格式驗證，直接走 fallback 回傳 AI 原文供用戶確認
- 遊戲 OCR prompt 同步擴充，涵蓋 FC/NDS/3DS/GBA/Sega/Neo Geo/Xbox 等復古格式

### 影響檔案
- index.html
- GameVault_v40_44_index.html
- sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME 已遞增：gamevault-v40-44

### 對應備份
- _internal/old/v40_43/

