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