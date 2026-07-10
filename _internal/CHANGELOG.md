## v54.23 (2026-07-08)

### 變更內容
修正匯出 CSV 功能只涵蓋最早 4 個分類（遊戲/書籍/主機/週邊）的問題，後來新增的原聲帶/動漫美術/公仔/數位下載版都沒被正確處理：
- **根因一**：分類標籤對照表 `typeLabel` 用英文 key（game/book/console/peripheral/hunt），但實際分組依據 `catInternal()` 回傳的是中文標籤（遊戲/攻略/主機/週邊⋯），兩者完全對不上，這個對照表其實從未真正生效過
- **根因二（更嚴重的正確性問題）**：有子類型的分類（原聲帶/動漫美術/公仔/數位下載版）分組時只用「分類」，同一分類下不同子類型（欄位表完全不同）會被塞進同一個檔案，只採用第一筆資料的子類型決定欄位，其他子類型的資料會對不上欄位、資料錯位
- **修正**：分組改用「分類＋子類型」組合，確保同一檔案的欄位一致；分類顯示名稱改用 `catLabel()` 正確還原（書籍不會再被誤標成內部代號「攻略」）；狩獵（尋寶）類別正確標示為「尋寶」；自我檢查驗證 8 大分類＋混合子類型情境下分組數量與內容都正確

### 影響檔案
- index.html / GameVault_v54_23_index.html
- sw.js

### GS 版本
- 無（純前端邏輯修正；匯入 CSV 本身不依賴固定分類清單，不受影響）

### PWA 快取
- CACHE_NAME: gamevault-v54-22 → gamevault-v54-23

### 對應備份
- _internal/old/v54_22/

## v54.22 (2026-07-08)

### 變更內容
上一版新增的錯誤攔截機制，讓使用者第一次真正抓到明確的錯誤訊息：`(d.market_value_currency || "").toUpperCase is not a function`，找到並修正詳情頁打不開的真正根因：
- **根因**：`marketValueDisplay(d)` 函式裡的 `var cur=(d.market_value_currency||'').toUpperCase();` 少了 `''+` 字串強制轉換（同一份檔案裡另外兩處呼叫 `.toUpperCase()` 的地方都有加，唯獨這裡漏掉）。若 `market_value_currency` 欄位因試算表格式問題不是字串型態，直接呼叫 `.toUpperCase()` 會拋出例外，導致 `showDetail()` 整個中斷、詳情頁完全打不開
- **跟保管位置無關**：純粹是巧合，這幾筆卡住的資料剛好 `market_value_currency` 型態也異常
- **修正**：補上 `''+` 字串強制轉換，統一跟另外兩處寫法一致；自我檢查驗證各種型態的 `market_value_currency`（數字、空字串、缺欄位）都不會再拋出例外

### 影響檔案
- index.html / GameVault_v54_22_index.html
- sw.js

### GS 版本
- 無（純前端邏輯修正）

### PWA 快取
- CACHE_NAME: gamevault-v54-21 → gamevault-v54-22

### 對應備份
- _internal/old/v54_21/

## v