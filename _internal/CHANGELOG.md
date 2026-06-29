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

## v40.43 (2026-06-29)

### 變更內容
- `cleanOCRByCategory` 遊戲分支格式大幅擴充（21/21 測試通過）：
  - 新增 Nintendo 卡帶 ROM 格式：AGB-AXPJ-JPN、NTR-AXXJ-JPN（字母-英數-地區）
  - 新增 Nintendo 光碟格式：CTR-P-ARXJ、RVL-P-RMCJ、HAC-P-AAAA（字母-單字母-英數）
  - 新增 Sega 第三方格式：T-00001G（T- 開頭加數字）
  - PS/Sega 標準格式 regex 精確化，避免過寬誤判
- 遊戲 OCR prompt 同步更新，列出各平台代表性格式讓 Gemini 更準確辨識
- 涵蓋平台：PS1/2/3/4/5、PSP、PSVita、GBA、NDS、3DS、Wii、WiiU、Switch、Sega MD/SS/DC、EAN/UPC 條碼

### 影響檔案
- index.html
- GameVault_v40_43_index.html
- sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME 已遞增：gamevault-v40-43

### 對應備份
- _internal/old/v40_42/

