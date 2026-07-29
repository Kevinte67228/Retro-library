## v02.46 (2026-07-26)

### 變更內容
使用者實測回報批次書背「ラチェット＆クランク」（PS2）抓到楽天市場的 PS5 版商品照。追查確認：`crossRefLookupPromise` 送給楽天市場的查詢字串（`rakuten_search` 的 `q` 參數）完全沒有帶平台資訊，只有純商品名稱／條碼。楽天是一般商城搜尋，同系列跨平台作品（PS2/PS3/PS4/PS5 都有推出的續作系列很常見）沒有平台字串很容易搜到別平台的商品照。

新增 `nameQRakuten`：有平台資訊時在查詢字串後面加上平台名稱（如「ラチェット＆クランク PlayStation 2」），只套用在楽天這一條查詢，不影響其他共用 `nameQ` 的遊戲資料庫查詢（ScreenScraper／IGDB／RAWG 等多半有自己的平台篩選機制，不需要這樣處理）。

自我檢查：`node --check` 通過；無 U+FFFD；CSS 594/594；4 項查詢字串組合邏輯自我檢查全過（entry.platform 優先／退回 _selectedPlatform／都沒有時維持純品名／邊界情況安全處理）。同樣無法在沙箱實際驗證真實命中率改善程度，需使用者實測。

**附帶觀察（這次沒有處理）**：同一批截圖裡也看到維基百科查詢在「ドラムマニア」這筆變得更差（從機台照片變成單純 PlayStation 標誌圖示），懷疑是上一版加入平台字串後，「PlayStation 2」這個較廣泛的詞可能讓維基搜尋比對到別的、跟 PlayStation 平台本身相關但非該遊戲條目的文章。這個問題比較難在沒有實際連線驗證的情況下再繼續猜測調整，先如實記錄，之後有更多實測資料再回頭處理。

### 影響檔案
- docs/index.html / docs/RetroVault_v02_46_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v02-45 → retrovault-v02-46

### 對應備份
- _internal/old/v02_45/


## v02.45 (2026-07-26)

### 變更內容
維基百科封面搜尋加入平台參數，改善系列總覽頁/消歧義頁誤中問題（使用者實測回報「ドラムマニア」查到街機機台照片而非該平台版本封面，懷疑是查詢沒帶平台字串）：

- `_wikipediaCoverSearch(name, platform, cb)` 新增 platform 參數，查詢依序嘗試：日文維基「品名+平台」→ 日文維基「純品名」→ 英文維基「品名+平台」→ 英文維基「純品名」，任一次命中就停止不繼續嘗試。純品名容易撞到系列總覽頁（例如整個 GITADORA／ドラムマニア 系列介紹頁，圖片是機台照而非特定平台版本封面），帶平台字串有機會命中該平台專屬條目。
- 使用者也建議加入「編碼」查詢，這次沒有做：維基百科文章不會用商品序號（SLPM-65338 這種）索引，拿編碼去搜幾乎不會有結果，已跟使用者說明原因。

自我檢查：`node --check` 通過；無 U+FFFD；CSS 594/594；用 stub 記錄實際呼叫順序跑 12 項自我檢查全過，含4種查詢組合的順序正確性、提早命中不繼續嘗試後續組合、無平台時退化成只查純品名2次等情境。同樣受限於沙箱網路白名單不含 wikipedia.org，無法實際連線驗證真實回應格式與改善後的命中率，需使用者實機測試。

### 影響檔案
- docs/index.html / docs/RetroVault_v02_45_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v02-44 → retrovault-v02-45

### 對應備份
- _internal/old/v02_44/


## v02.44 (2026-07-26)

### 變更內容
Google CSE 圖片搜尋始終回報 403（金鑰/憑證/計費都確認正確，懷疑是 Google 新政策限制個人搜尋引擎全網搜尋），改走維基百科作為封面候選的新來源：

- 新增 `_wikipediaCoverSearch(name, cb)`：查詢維基百科文章頁面圖片（通常是資訊框裡的正式封面/box art）。不需要 API 金鑰，MediaWiki API 本身支援跨網域請求（`origin=*`），直接前端呼叫，不用經過 GAS 後端代理。先查日文維基（對日版老遊戲命中率較高），沒結果才退回英文維基。
- `_batchFetchCoverCandidates` 候選優先順序調整為：**資料庫（若有）→ 維基百科 → Google CSE**。CSE 呼叫仍保留沒拿掉（沒設定金鑰或持續失敗都只是安靜跳過，不影響前面已蒐集到的候選），如果 CSE 之後真的恢復正常也還能用。
- 確認清單來源標籤新增「圖片來源：維基百科」。

自我檢查：`node --check` 通過；無 U+FFFD；CSS 594/594；用 stub 模擬 fetch 回應跑 8 項自我檢查全過，含日文維基優先/無圖退回英文維基/兩邊都查無結果安全回傳/API失敗安全處理/與資料庫候選正確共存等情境。**無法在沙箱環境實際連線 Wikipedia API 驗證（網路白名單不含 wikipedia.org），解析邏輯依 MediaWiki API 文件設計，需要實機測試確認真實回應格式與命中率。**

### 影響檔案
- docs/index.html / docs/RetroVault_v02_44_index.html
- docs/sw.js

### GS 版本
- 無（維基百科查詢不需要 GAS 代理，前端直接呼叫）

### PWA 快取
- CACHE_NAME: retrovault-v02-43 → retrovault-v02-44

### 對應備份
- _internal/old/v02_43/


## GAS 後端修正 (2026-07-26，純後端，無前端版號異動)

### 變更內容
使用者回報 Google 圖片搜尋一直是 HTTP 403，懷疑是 Google 政策限制個人帳號搜尋整個網路。追查後發現實際問題：`googleImageSearchProxy()` 收到非 200 回應時，原本**直接丟棄 Google API 回應本文**、只回傳籠統的「Google CSE HTTP 403」訊息，導致真正的錯誤原因（金鑰未啟用計費／額度用完／cx 設定問題等 Google 實際回報的細節）完全看不到。修正後會解析回應本文的 `error.message`／`error.errors[0].reason`，把 Google 真正說的原因帶出來顯示在前端的測試結果與提示訊息裡（`testGCSE()`／批次書背的封面候選流程都會受益，因為兩者都是直接顯示 `error` 欄位，不需要額外改前端）。

同時發現「搜尋整個網路」（Search the entire web）開關在使用者的 Programmable Search Engine 設定裡是關閉的，且限定了 19 個西方數位商店/報價網站，這解釋了封面搜尋命中率低的另一半原因——這是使用者帳號的既有設定問題，不是政策限制，已請使用者自行開啟該開關。

自我檢查：`node --check`（.gs 副檔名改 .js 檢查）語法通過；無 U+FFFD。

### 影響檔案
- docs/RetroVault_AppsScript.gs（GitHub Actions 自動部署到 Apps Script，執行成功）

### GS 版本
- 有實質邏輯變更（錯誤訊息解析），但這次是獨立於前端版號之外的後端修正，未搭配前端部署，沿用目前 Apps Script 版本號慣例
