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

## v54.42 (2026-07-08)

### 變更內容
尋寶頁面「條碼查詢」從單一目的地（Barcode Lookup）改為三選項：
- 新增目的地選擇 tabs：Barcode Lookup／Google 搜尋／DeepSeek，使用者先選目的地，掃描或手動輸入條碼後自動開啟對應網頁並帶入條碼
- Barcode Lookup：`barcodelookup.com/{條碼}`；Google 搜尋：標準搜尋網址帶入條碼，兩者格式標準，預期能正常運作
- **DeepSeek：嘗試性質，沒有官方文件依據**，用猜測的網址格式（`chat.deepseek.com/?q=`）帶入查詢文字，需要實測確認是否真的有效；若無效後續會改成呼叫既有的 DeepSeek API（已確認可用）直接在 App 內顯示結果，取代開網頁的做法

### 影響檔案
- index.html / GameVault_v54_42_index.html
- sw.js

### GS 版本
- 無（純前端功能擴充）

### PWA 快取
- CACHE_NAME: gamevault-v54-41 → gamevault-v54-42

### 對應備份
- _internal/old/v54_41/

## v54.41 (2026-07-08)

### 變更內容
修正「新增關聯商品」後該區塊被收合、視覺上像跳開的問題：
- **根因（同一類問題再一次出現）**：`renderForm()` 重繪表單時，每個區塊的展開/收合狀態固定套用預設值（只有前兩區塊展開），任何觸發表單重繪的操作都會把使用者已經手動展開查看的區塊重置回收合狀態——上一版（v54.40）已修過完整度快選按鈕的同類問題，這次是同一根因在「關聯商品」新增流程再次出現
- **修正（改成通用解法，不用逐一補洞）**：`renderForm()` 改成重繪前先記住目前各區塊的展開/收合狀態，重繪後套用回去；只有該區塊是第一次渲染（沒有先前狀態可沿用）才使用預設值。這是通用修正，往後任何觸發 `renderForm()` 重繪的操作都會自動保留使用者已展開的區塊，不用再針對每個個案分別處理

### 影響檔案
- index.html / GameVault_v54_41_index.html
- sw.js

### GS 版本
- 無（純前端邏輯修正）

### PWA 快取
- CACHE_NAME: gamevault-v54-40 → gamevault-v54-41

### 對應備份
- _internal/old/v54_40/

