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






## v03.10 (2026-08-09)

### 變更內容
使用者要求批次編輯的「品項完整度」拿掉「清空」這個選項，只保留全新／盒書完整／裸卡／缺件 4 個實際會用到的預設。

### 自我檢查
`node --check` 通過；無 U+FFFD。用 jsdom 建立實際會執行的測試環境驗證：完整度下拉選單確認只剩 4 個選項、清空選項確認已移除、其餘 4 個既有預設確認維持不變。

### 影響檔案
- docs/index.html / docs/RetroVault_v03_10_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v03-09 → retrovault-v03-10

### 對應備份
- _internal/old/v03_09/






