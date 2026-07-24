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

