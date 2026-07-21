## v02.01 (2026-07-21)

### 變更內容
新增「コンシューマーゲーム大辞典」(consoledictionary.com) 日系遊戲資料庫背景比對功能：
- **觸發時機**：建檔地區選日本、且分類為遊戲、且已取得遊戲名稱時（條碼查詢／AI辨識／手動輸入名稱皆會觸發），背景靜默查詢，不影響原有建檔流程
- **候選確認機制**：查到結果不會直接套用，會先在表單頂部顯示一個小提示按鈕（🇯🇵 找到 N 筆日系資料庫比對），點擊才展開候選清單（含縮圖/名稱/平台/開發商/駿河屋參考價），使用者選定其中一筆才套用
- **套用規則**：選定候選後，開發商/發行商/類型/發售日/日文名稱/估值資訊（駿河屋參考價+更新日期+來源標註）全部套用；封面圖沿用既有跨資料庫比對慣例不強制覆蓋、參考連結採附加不覆蓋既有連結
- **後端**：新增 `cdSearchProxy()`／`cdDetailProxy()` 兩支 proxy 函式，比照既有 IGDB/GiantBomb/MobyGames 等proxy風格；`cdSearchProxy` 用 POST 表單搜尋解析結果清單，`cdDetailProxy` 解析 schema.org JSON-LD 取得結構化資料（不解析/儲存站方的介紹文字段落，只取名稱/廠商/類型/發售日/價格等事實欄位）
- **平台對照表**：38 個 GameVault 內部平台名稱對應到該站的 console 數字 ID，查無對應時退回純文字搜尋（安全降級）
- **合規考量**：來源網址一律存入「參考連結」欄位標明出處，符合該站服務條款「彙整資料歡迎標明出處引用」的規範；僅在條件命中時查詢，非批量爬取重製

自我檢查：後端解析邏輯（搜尋結果清單解析、JSON-LD詳情解析、平台對照）與前端觸發邏輯（地區/分類/去重判斷共6種情境）均已用檔案內實際程式碼配合真實樣本HTML完整驗證通過。

### 影響檔案
- index.html / GameVault_v02_01_index.html
- GameVault_AppsScript.gs
- sw.js

### GS 版本
- v01 → v02（新增外部資料庫proxy邏輯，屬實質變更，主版號遞增）

### PWA 快取
- CACHE_NAME: gamevault-v01-01 → gamevault-v02-01

### 對應備份
- _internal/old/v01_01/

## v01.01 (2026-07-17)

### 變更內容
**發布版本重置（Release Baseline Reset）**：正式將此版本訂為公開發布起點，版本號重新編號：
- 前端：v67.16 → **v01.01**
- 後端（GAS）：v67 → **v01**
- 純版本重新編號，不涉及任何邏輯或功能異動（GAS/前端程式碼行為與 v67.16／v67 完全一致）
- 清空所有歷史備份（`_internal/old/` 全部版本，含原永久保留的 v42_20a1、v67_01）
- 重設前已於 `_internal/pre_v01_reset_snapshot_v67_16_20260717/` 保留一份完整快照（含 GAS、前端、manual、icons、舊版 CHANGELOG 與協作規則），作為回溯依據
- CHANGELOG 清空重新記錄，此為第一筆

### 影響檔案
- index.html / GameVault_v01_01_index.html（新增，取代刪除的 GameVault_v67_16_index.html）
- sw.js（CACHE_NAME: gamevault-v67-16 → gamevault-v01-01）
- GameVault_AppsScript.gs（版本註解 v67 → v01）

### GS 版本
- v01（純版本號重新編號，無邏輯變更）

### PWA 快取
- CACHE_NAME: gamevault-v67-16 → gamevault-v01-01

### 對應備份
- 無（本次重置即清空所有備份的起點；下一版起恢復正常 5 版輪替備份機制）

