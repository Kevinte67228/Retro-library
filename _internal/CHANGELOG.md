## v02.48 (2026-07-26)

### 變更內容
批次書背資料庫比對依使用者要求細分：**ScreenScraper 用平台＋序號，其他資料庫用平台＋品名**。

上一版（v02.47）為了避免 OCR 序號誤差把 ScreenScraper 也一併改成只用品名比對，但 ScreenScraper 本身就是為日版序號精確比對設計的資料庫、且 `ssSearch()` 早就會用 `_selectedPlatform` 帶入 `systemeid` 參數（本來就是平台感知的查詢），這次改回讓它吃得到序號：

- `entry.code` 改回提早帶入（DB 查詢前就設好），讓 ScreenScraper 內部的 `_codeSerial` 機制能抓到序號
- 傳給 `crossRefLookupPromise` 的查詢字串仍維持「品名＋平台」（`_nameQ`），這個字串只影響 Giant Bomb／IGDB／RAWG／楽天這幾家「用名稱查」的資料庫，不影響 ScreenScraper（它是獨立路徑，直接讀 `entry.code`）
- 兩邊分工不衝突：ScreenScraper 序號查最準，其餘資料庫用品名+平台查，拿掉了 v02.47 那個「沒有品名就跳過查詢」的防護——現在即使 AI 只讀到序號、完全沒讀到品名文字，仍會呼叫查詢，讓 ScreenScraper 有機會純靠序號命中

自我檢查：`node --check` 通過；無 U+FFFD；CSS 594/594；用 stub 模擬並記錄呼叫當下 `entry.code`／查詢字串快照，跑 6 項自我檢查全過，含 ScreenScraper 能拿到序號、其他資料庫查詢字串維持品名+平台不含序號、無品名純序號情境下仍會查詢、最終存檔序號正確等情境。

### 影響檔案
- docs/index.html / docs/RetroVault_v02_48_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v02-47 → retrovault-v02-48

### 對應備份
- _internal/old/v02_47/


## v02.47 (2026-07-26)

### 變更內容
批次書背資料庫比對完全改用「品名＋平台」，不再用序號當比對依據（使用者明確要求）：

- `entry` 初始化時先不帶入 `code`，DB 查詢完成（成功或失敗）後才補回 `entry.code=item.code`——序號只當最終存檔資料，不參與比對過程
- `crossRefLookupPromise` 的查詢字串改成 `item.title_guess+' '+平台`（如「FRONT MISSION 4 PlayStation 2」），完全不含序號
- 這個改動連帶讓 ScreenScraper 也受益：ScreenScraper 原本會從全域 `entry.code` 讀序號做精確比對（不受查詢字串本身影響），序號是書背小字 OCR，容易有個位數誤差（先前已觀察到 65686 誤讀成 65685 等案例），用它比對容易配到錯誤商品；改成呼叫當下 `entry.code` 是空的，ScreenScraper 也會自動改用品名比對
- 邊界防護：AI 完全沒讀到品名文字（只有序號）時，不送出只剩平台字串的空洞查詢，直接跳過資料庫查詢進入補封面步驟（封面步驟仍以 `entry.code` 當最後備援，找不到圖頂多留白，風險比錯誤的產品資料比對低很多）

自我檢查：`node --check` 通過；無 U+FFFD；CSS 594/594；用 stub 模擬 `crossRefLookupPromise` 並記錄呼叫當下 `entry.code` 快照，跑 9 項自我檢查全過，含查詢字串正確組合、呼叫當下序號確實為空、查詢完成後序號正確補回存檔、無平台時不留多餘空白、完全無品名時的邊界防護等情境。

### 影響檔案
- docs/index.html / docs/RetroVault_v02_47_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v02-46 → retrovault-v02-47

### 對應備份
- _internal/old/v02_46/


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
