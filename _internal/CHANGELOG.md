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


## v02.43 (2026-07-26)

### 變更內容
使用者回報批次書背命中率仍低、圖片來源全部顯示「資料庫」、完全沒有 Google 搜尋候選。追查發現兩個問題：

- **來源標籤太籠統，蓋掉了真正的問題**：原本「資料庫」是把 ScreenScraper／IGDB／RAWG／楽天市場全部混在一起顯示同一個標籤。楽天市場的 `image` 欄位實際上是**賣場商品照**（賣家自己拍的照片，可能含價格標籤/店家浮水印），不是官方封面美術圖，這正是使用者截圖裡「ときめきメモリアル3」「ぼくらの家族」封面看起來像購物網站截圖的原因。`mergeMultiDbResults` 現在額外記錄 `_coverSrc`（哪個資料庫實際提供了封面），確認清單標籤改成精確顯示「ScreenScraper／IGDB／RAWG／楽天市場」，楽天市場額外加註「⚠️賣場商品照，非官方封面」警示文字。
- **候選圖只有 1 張的根本原因**：Google 圖片搜尋需要在「設定」頁填入 Google API Key + Search Engine ID 才會啟用；未設定時 `_batchFetchCoverCandidates` 會直接略過 CSE 補位，只剩資料庫查到的 1 張候選（沒查到就 0 張）。這解釋了使用者「網路完全沒有抓到任何一筆」的現象——不是查詢失敗，是這個功能本來就還沒設定。批次頁面現在會在沒設定金鑰時顯示明顯提醒，附上設定路徑指引。

### 影響檔案
- docs/index.html / docs/RetroVault_v02_43_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v02-42 → retrovault-v02-43

### 對應備份
- _internal/old/v02_42/
