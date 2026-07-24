## v02.05 (2026-07-22)

### 變更內容
日系資料庫（consoledictionary.com）比對提示區塊改為**常駐顯示**，並移到「日文名稱」欄位正下方：
- 原本只在查到候選結果時才在表單頂部跳出的提示按鈕，改成動態掛載在 `fg-jp_name` 欄位容器後面，`renderForm()` 每次重繪都會呼叫 `_cdMountHintHost()` 重新掛載（先移除舊的避免重複／殘留在錯誤分類下）
- 只有「遊戲分類＋地區日本」時才顯示這個區塊，其餘情況完全不掛載
- **常駐兩種狀態**：尚未查到候選時顯示 consoledictionary.com 的網站圖示＋連結（可直接點去官網）；查到候選後變成「🇯🇵 找到 N 筆日系資料庫比對，點此查看」的可點擊按鈕
- `cdMaybeAutoSearch()` 查詢完成後統一呼叫 `_cdRenderHintHost()` 更新畫面，不論有無結果都會重繪（取代原本只在有結果時才顯示的 `_cdShowHint()`）

自我檢查：14 種情境（含掛載條件、常駐兩種狀態渲染、重複呼叫不疊加、切換地區/分類後正確清除舊host）皆用檔案內實際程式碼以模擬 DOM 驗證通過。

### 影響檔案
- index.html / GameVault_v02_05_index.html
- sw.js

### GS 版本
- 無（純前端 UI 邏輯調整）

### PWA 快取
- CACHE_NAME: gamevault-v02-04 → gamevault-v02-05

### 對應備份
- _internal/old/v02_04/

## v02.04 (2026-07-22)

### 變更內容
日系資料庫（consoledictionary.com）比對結果套用後，接上既有的 AI 補全機制：
- `cdApplyCandidate()` 套用候選資料、渲染表單、跳出成功提示之後，新增呼叫 `aiCompleteMissing()`，把套用完仍空著的欄位交給 AI 補齊——做法完全比照其他建檔流程（如條碼/編碼查詢＋交叉比對）結尾的既有模式，不是重新寫一套新邏輯
- `aiCompleteMissing()` 本身不需額外傳參數，會自動讀取目前分類該檢查的欄位清單、過濾出仍缺的欄位、呼叫 AI 補齊，完成後跳「✓ AI 補全 N 欄」提示

### 影響檔案
- index.html / GameVault_v02_04_index.html
- sw.js

### GS 版本
- 無（純前端串接既有函式，未新增後端邏輯）

### PWA 快取
- CACHE_NAME: gamevault-v02-03 → gamevault-v02-04

### 對應備份
- _internal/old/v02_03/

## v02.03 (2026-07-22)

### 變更內容
日系資料庫（consoledictionary.com）背景比對：提升命中率。
- `cdMaybeAutoSearch()` 改為**優先使用「日文名稱」欄位查詢**，沒有填日文名稱才退回原本的「主要名稱」——因為原本只用主要名稱（常是中文/英文）去比對日文網站，命中率偏低
- 觸發點新增：使用者手動編輯「日文名稱」欄位且有值時，也會觸發背景比對（原本只有編輯「主要名稱」會觸發）
- 去重邏輯同步調整：改成依「實際送出查詢的字串＋平台」判斷是否重複查詢，使用者事後補上/修改日文名稱時會產生新的判斷依據、自動重新觸發查詢，不會被舊的查詢記錄擋掉

自我檢查：5 種情境（純主要名稱查詢／同時有兩者時優先日文／事後補上日文名稱重新觸發／同名重複去重／日文名稱清空退回主要名稱）皆用檔案內實際程式碼驗證通過。

### 影響檔案
- index.html / GameVault_v02_03_index.html
- sw.js

### GS 版本
- 無（純前端查詢邏輯調整，後端 proxy 函式不變）

### PWA 快取
- CACHE_NAME: gamevault-v02-02 → gamevault-v02-03

### 對應備份
- _internal/old/v02_02/

## v02.02 (2026-07-22)

### 變更內容
修正 `GameVault/` → `docs/` 搬遷時遺漏的 4 處寫死路徑，導致二手估值市場圖示（Amazon/Mercari/日本樂天/ヤフオク等）全部載入失敗：
- `GH_ASSET_BASE` 常數（市場圖示 icon 的組合網址基準）：`.../main/GameVault/` → `.../main/docs/`
- `<head>` 裡 3 個 favicon／apple-touch-icon 連結同步修正
- 順手修正 `github_deploy.py` 完成訊息殘留的「Netlify」字樣，改為「GitHub Pages」

### 影響檔案
- index.html / GameVault_v02_02_index.html
- sw.js
- _internal/github_deploy.py（訊息文字修正，不影響部署邏輯）

### GS 版本
- 無（純前端資源路徑修正）

### PWA 快取
- CACHE_NAME: gamevault-v02-01 → gamevault-v02-02

### 對應備份
- _internal/old/v02_01/

