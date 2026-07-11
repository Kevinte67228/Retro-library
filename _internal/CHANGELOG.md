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

## v54.44 (2026-07-08)

### 變更內容
兩項變更：
- **條碼查詢改為 8 個目的地，分兩排**：使用者實測發現 DeepSeek API 直接查條碼會嚴重瞎猜（同一條碼查三次得到三個完全不同答案，例如任天堂主機/胃腸藥/棒球遊戲），純文字 AI 沒有真正商品資料庫可查不可靠。移除 API 直查，改為：
  - **第一排搜尋引擎**（Barcode Lookup／Google／Bing／Yahoo!JAPAN）：標準網址查詢格式，直接開網頁帶入條碼
  - **第二排 AI 助手**（DeepSeek／GPT／Gemini／Claude）：改用既有已驗證可用的「複製查詢文字＋開啟AI網頁，使用者自行貼上送出」模式（沿用 API 金鑰申請說明頁的 `copyAndPromptGemini()` 做法）
  - 頁面上加註兩排的用途說明
- **修正掃描框第二次開啟出現黑屏的 bug**：推測是上一次的相機串流還沒完全釋放，緊接著重新啟動容易拿到尚未就緒的串流。開啟時加入短暫延遲（250ms）再啟動相機，讓硬體確實釋放

### 影響檔案
- index.html / GameVault_v54_44_index.html
- sw.js

### GS 版本
- 無（純前端功能調整）

### PWA 快取
- CACHE_NAME: gamevault-v54-43 → gamevault-v54-44

### 對應備份
- _internal/old/v54_43/

## v54.43 (2026-07-08)

### 變更內容
使用者實測確認 DeepSeek 網頁版不支援用網址參數帶入文字（`?q=` 直接被忽略，網址能開但輸入框空白），改用既有的 DeepSeek API 直接查詢：
- DeepSeek 選項改為呼叫 `api.deepseek.com` 直接查詢條碼對應的商品資訊，結果以文字卡片顯示在條碼查詢 overlay 內，不再嘗試開網頁
- 查詢按鈕文字依選擇的目的地動態調整（DeepSeek 顯示「查詢」，其他維持「前往查詢 ↗」）
- Barcode Lookup／Google 搜尋維持開網頁＋帶入條碼的做法，不受影響

### 影響檔案
- index.html / GameVault_v54_43_index.html
- sw.js

### GS 版本
- 無（DeepSeek 前端直連，未經 GAS 代理）

### PWA 快取
- CACHE_NAME: gamevault-v54-42 → gamevault-v54-43

### 對應備份
- _internal/old/v54_42/

