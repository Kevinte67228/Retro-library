## v03.14 (2026-08-09)

### 變更內容
使用者要求新增離線新增佇列——這個 App 常見的使用情境是「在二手店/駿河屋現場邊逛邊掃描建檔」，這類地方訊號常常不穩，原本 `doSave()` 遇到網路失敗只會顯示「儲存失敗」，使用者要嘛留在原地等訊號恢復、要嘛放棄這筆資料重新輸入，體驗不佳且有資料遺失風險。

**核心設計**：新增離線佇列機制，`doSave()` 遇到失敗時先判斷是「疑似網路連線問題」還是「伺服器回報的邏輯錯誤」（例如驗證失敗）——只有前者才適合排入佇列稍後重試，後者排隊重試大機率還是會失敗，維持原本直接顯示錯誤訊息的行為，避免誤導使用者以為之後會自動補送。網路錯誤的判斷同時比對 `TypeError`（`fetch()` 對完全連不上的標準拋出型別）跟不同瀏覽器對「連不上」的常見錯誤訊息文字（Chrome「Failed to fetch」、Firefox「NetworkError...」、Safari「Load failed」），提高跨瀏覽器偵測的可靠度。

判定為網路問題時，資料連同已經處理好的圖片壓縮結果一起存進本機的離線佇列（`localforage`），不會遺失。同步機制有三種觸發時機：連線恢復時（監聽 `online` 事件）自動靜默嘗試、App 重新啟動時自動嘗試一次、使用者也可以在收藏頁「⋯」選單手動點「同步離線佇列」。同步時逐筆呼叫既有的 `shPost({action:'add',...})`，成功的從佇列移除並加入本機收藏列表，失敗的（還是連不上）留在佇列裡不會遺失，等下次再試。

**UI**：收藏頁的「⋯」選單按鈕上，只要佇列有待同步項目就會顯示一個小紅點提示（不用點開選單也看得到）；選單裡的「同步離線佇列」項目本身平常隱藏，有待同步項目時才顯示，並帶一個顯示筆數的徽章。

### 自我檢查
`node --check` 通過；無 U+FFFD。用 jsdom 建立實際會執行的測試環境完整驗證：網路錯誤判斷邏輯逐一測試了 3 種瀏覽器的錯誤訊息格式都能正確識別、伺服器邏輯錯誤確認不會被誤判成網路問題；佇列的加入跟計數功能確認正確；核心測試——模擬佇列裡有多筆待同步項目，呼叫同步後確認全部成功寫入本機收藏列表且佇列正確清空；特別驗證了資料不會遺失的保護機制——模擬同步時依然連不上網路的情境，確認失敗的項目會留在佇列裡等待下次重試，不會被誤刪。

### 影響檔案
- docs/index.html / docs/RetroVault_v03_14_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v03-13 → retrovault-v03-14

### 對應備份
- _internal/old/v03_13/


## v03.13 (2026-08-09)

### 變更內容
使用者要求既然已經有台灣版本，就拿掉香港版本。「近期發售」選單從 11 個選項縮回 8 個，移除 Nintendo／PlayStation／Xbox 三個平台的香港版連結，保留日本／台灣版本、Steam、游民星空。

### 自我檢查
`node --check` 通過；無 U+FFFD。用 jsdom 建立實際會執行的測試環境驗證：選單確認正確顯示 8 個選項、香港相關標籤確認完全移除；確認移除後的香港選項 ID 不會誤觸發任何連結；保留下來的台灣、日本、Steam 選項都確認正常運作，沒有被這次移除連帶影響。

### 影響檔案
- docs/index.html / docs/RetroVault_v03_13_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v03-12 → retrovault-v03-13

### 對應備份
- _internal/old/v03_12/




## v03.12 (2026-08-09)

### 變更內容
延續上一版「近期發售」平台選單，使用者要求除了日版之外補上台灣／香港版本，讓使用者自己選要看哪個地區。

查證了 Nintendo／PlayStation／Xbox 三個平台的台灣、香港官方頁面：
- Nintendo：`nintendo.com/tw/schedule`（台灣）、`nintendo.com/hk/schedule`（香港）
- PlayStation：PS Store 台灣／香港版的「預購」分類頁（跟日版的「今後發售預定」性質類似，台灣/香港官方商店用的分類名稱是「預購」）
- Xbox：官網 zh-TW／zh-HK 語系版的「近日發售預定」頁

保留原本的日版選項（沒有要求移除），選單從原本 5 個選項擴充到 11 個（PC 遊戲、Nintendo×3 地區、PlayStation×3 地區、Xbox×3 地區、Steam）。Steam 跟游民星空本身是全球/中文彙整站性質，不分地區版本，維持不變。

### 自我檢查
`node --check` 通過；無 U+FFFD。用 jsdom 建立實際會執行的測試環境完整驗證：選單確認正確顯示 11 個選項，Nintendo／PlayStation／Xbox 的台灣、香港版本都確認存在；逐一驗證 6 個新增的地區選項（Nintendo TW/HK、PlayStation TW/HK、Xbox TW/HK）選定後都正確開啟對應的官方網址；回歸測試確認原本的日版選項與 Steam 選項都沒有受到這次擴充影響，維持正常運作。

### 影響檔案
- docs/index.html / docs/RetroVault_v03_12_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v03-11 → retrovault-v03-12

### 對應備份
- _internal/old/v03_11/






## v03.11 (2026-08-09)

### 變更內容
使用者要求「近期發售」補上主流遊戲主機平台與 Steam 的官方發售表連結，不是只有游民星空這個第三方中文彙整站。

查證了 4 個平台的官方發售頁面網址：Nintendo（`nintendo.com/jp/schedule`）、PlayStation（PS Store 日本版「今後發售預定」分類頁）、Xbox（官網「近日發售預定」頁）、Steam（官方「即將推出」探索佇列）。這些都是官方平台自己維護的頁面，比第三方彙整站更即時、更權威。

「📅 近期發售」按鈕行為改成：點下去先彈出一個小選單，列出 5 個選項（PC 遊戲/游民星空、Nintendo、PlayStation、Xbox、Steam）讓使用者選要看哪個平台，選定後才用既有的 `_openExternal()` 開啟——這些都只是連結，不涉及抓取網站內容，不是爬蟲，跟先前評估「這些官網能不能爬」是完全不同的兩件事，純粹的外部連結沒有那些技術/法律風險。

### 自我檢查
`node --check` 通過；無 U+FFFD。用 jsdom 建立實際會執行的測試環境完整驗證：選單正確顯示 5 個選項且包含 Nintendo／PlayStation／Xbox／Steam 字樣；逐一驗證 4 個新增平台選定後都正確開啟對應的官方網址；原本的游民星空選項確認仍然正常運作、依當前年月動態組出正確網址，沒有因為這次改動而受影響。

### 影響檔案
- docs/index.html / docs/RetroVault_v03_11_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v03-10 → retrovault-v03-11

### 對應備份
- _internal/old/v03_10/






