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






## v03.09 (2026-08-09)

### 變更內容
使用者回報遊戲的批次編輯沒有看到「裸卡」這個選項。查證後發現上一版的「品項完整度」批次編輯做法根本是錯的——這個欄位不是簡單的下拉選單，而是逐項配件（本體/外盒/說明書等，依分類各自不同）各自獨立評級、序列化成一個字串存進 `entry.completeness` 的複合欄位（見 `COMP_COMPONENTS`／`serializeComp`／`parseComp`），而且「裸卡」是本體這一項專屬的特殊選項，不是一個獨立的完整度等級。上一版用一組憑印象猜測的固定選項（全新/完整/缺件/部分登錄/未評級），完全對不上實際的資料格式，是錯的。

修正：改成沿用單筆編輯表單 `quickCompPreset()` 那 5 個快速預設（全新／盒書完整／裸卡／缺件／清空），跟單筆表單看到的選項完全一致。新增 `_compPresetMap(preset,cat)` 複製 `quickCompPreset()` 的邏輯，但改成純函式回傳組件對照表（不直接操作表單 DOM，因為批次編輯可能同時處理多筆、各自可能不同分類的項目）。套用時，`bulkEditSave()` 會依「這一件自己的分類」算出正確的組件清單再呼叫 `serializeComp()` 序列化——例如遊戲的本體叫「本體」、攻略的本體叫「書本體」，兩者的組件清單也不一樣（遊戲有「側標」，攻略有「書腰」），不能套用同一個固定字串給所有分類不同的項目。

### 自我檢查
`node --check` 通過；無 U+FFFD。用 jsdom 建立實際會執行的測試環境完整驗證：確認完整度下拉選單正確顯示 5 個預設選項且包含「裸卡」；`_compPresetMap()` 逐一驗證了 4 種情境——遊戲的裸卡預設正確讓「本體」變裸卡、其餘變缺少；攻略的裸卡預設正確使用「書本體」而不是「本體」；公仔的全新預設正確讓所有組件都變全新；週邊的清空預設正確讓所有組件都變無。核心測試——模擬同時批次編輯一筆遊戲跟一筆攻略，套用「裸卡」預設後，確認遊戲項目正確產生含「本體:裸卡」的序列化字串、攻略項目正確產生含「書本體:裸卡」的序列化字串（欄位名稱依各自分類正確區分），且攻略項目確認不會出現遊戲專屬的「側標」組件。

### 影響檔案
- docs/index.html / docs/RetroVault_v03_09_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v03-08 → retrovault-v03-09

### 對應備份
- _internal/old/v03_08/






