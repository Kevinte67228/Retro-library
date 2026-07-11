## v54.48 (2026-07-08)

### 變更內容
使用者回報 v54.47 修完黑屏後，出現新的「無法啟動相機，請在下方手動輸入條碼」錯誤：
- **根因**：v54.47 在開完外部連結後「立刻」（250ms後）重啟相機，但此時 GameVault 分頁其實還在背景（使用者還沒切換過去），瀏覽器基於隱私考量通常會擋掉背景分頁的 `getUserMedia()` 相機權限請求，導致重啟必定失敗、觸發錯誤訊息
- **修正**：改用瀏覽器標準的 `visibilitychange` 事件，在使用者「真正切回」GameVault 分頁的當下（`document.visibilityState==='visible'`）才重啟相機，而不是開完連結就馬上嘗試；同時重啟時清除先前可能殘留的錯誤提示文字

### 影響檔案
- index.html / GameVault_v54_48_index.html
- sw.js

### GS 版本
- 無（純前端邏輯修正）

### PWA 快取
- CACHE_NAME: gamevault-v54-47 → gamevault-v54-48

### 對應備份
- _internal/old/v54_47/

## v54.47 (2026-07-08)

### 變更內容
使用者確認 v54.46（改用 `<a>` 元素模擬點擊）成功解決 Google/Gemini 桌面版問題，但回報關閉查詢網頁回到掃描頁後，掃描框仍然黑屏：
- **根因**：v54.45 讓「條碼查詢」畫面開完外部連結後不再自動關閉，但掃描偵測成功時相機本來就會自動停止（螢幕變黑是掃描器正常的停止狀態）。改版前因為整個畫面會關閉，黑畫面被藏起來看不到；改版後畫面留著，黑畫面就藏不住了——是 v54.45 跟掃描器停止機制疊加出的連鎖問題，不是掃描器本身重新出錯
- **修正**：開完外部連結（不論是直接開網頁還是複製文字後開AI網頁）後，重新啟動一次掃描器，讓使用者從外部分頁切回來時鏡頭仍是運作狀態，銜接 v54.44 已經做過的啟動延遲防護（250ms）

### 影響檔案
- index.html / GameVault_v54_47_index.html
- sw.js

### GS 版本
- 無（純前端邏輯修正）

### PWA 快取
- CACHE_NAME: gamevault-v54-46 → gamevault-v54-47

### 對應備份
- _internal/old/v54_46/

## v54.46 (2026-07-08)

### 變更內容
使用者實測確認：直接在手機瀏覽器打開 Google 搜尋網址是正常手機版，但透過 GameVault 的 `window.open()` 開啟卻變成桌面版——確認問題出在 GameVault 開新分頁的方式，不是 Google 本身。推測是 PWA 用 `window.open()` 開新分頁時走系統內嵌瀏覽器元件，跟完整瀏覽器的裝置身分字串不同。

嘗試性修正：新增 `_openExternalLink()`，改用建立 `<a>` 元素模擬點擊的方式開啟外部連結，取代 `window.open()`，這是這類問題常見的嘗試方向，套用到條碼查詢的 8 個目的地（含 Barcode Lookup/Google/Bing/Yahoo!JAPAN 與 DeepSeek/GPT/Gemini/Claude 的開啟連結）。

**⚠️ 不保證一定有效，需要使用者實測 Google／Gemini 這次開啟是否變成手機版確認。**

### 影響檔案
- index.html / GameVault_v54_46_index.html
- sw.js

### GS 版本
- 無（純前端功能調整）

### PWA 快取
- CACHE_NAME: gamevault-v54-45 → gamevault-v54-46

### 對應備份
- _internal/old/v54_45/

## v54.45 (2026-07-08)

### 變更內容
兩項修正：
- **8 顆目的地按鈕統一大小**：原本按鈕高度依標籤文字長度自然撐開（「Barcode Lookup」「Yahoo!JAPAN」較長容易換行變高），改成固定高度 44px、文字置中，長標籤不再撐大按鈕
- **關閉外部網頁後停留在條碼查詢頁面**：原本開啟外部網頁（Barcode Lookup/Google等）或複製查詢文字後會自動關閉條碼查詢畫面，導致從瀏覽器分頁切回來時發現已經跳回尋寶首頁。改成開啟外部連結後不再自動關閉，使用者可以直接换個目的地或重新掃描

### 待處理（需要更多資訊才能修）
使用者實測回報 Google、Gemini 開啟後顯示桌面版網頁而非手機版。這兩個剛好都是 Google 自家產品，推測可能與 `window.open()` 開新分頁時使用的瀏覽器 User-Agent 有關（GameVault 的程式碼無法控制這個），不是單純加網址參數能解決的問題，暫不強行嘗試不確定的修法，待進一步排查。

### 影響檔案
- index.html / GameVault_v54_45_index.html
- sw.js

### GS 版本
- 無（純前端功能調整）

### PWA 快取
- CACHE_NAME: gamevault-v54-44 → gamevault-v54-45

### 對應備份
- _internal/old/v54_44/

