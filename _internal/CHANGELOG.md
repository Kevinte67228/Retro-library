## v02.07 (2026-07-22)

### 變更內容
「AI 網頁查詢」建檔模式的四個 AI 助手按鈕（DeepSeek/GPT/Gemini/Claude）改為晶片樣式，並加上選中點亮效果：
- 原本用寫死的紫色（`#7c4dff`）inline style，跟 App 主色 cyan（`#00e5ff`）不一致；改為直接沿用既有的 `.genre-chip` 標準晶片 class（App 其他地方如遊戲類型多選已在用），風格統一
- 新增 `_aiWebSelectedDest` 狀態變數：點擊某個 AI 助手時記錄選中狀態並重新渲染，該晶片變成 cyan 填色點亮（`.on`），其餘晶片維持未選中樣式，互斥選擇（不是多選）
- 重新進入「AI 網頁查詢」建檔模式時重置選中狀態，避免殘留上次選過的 AI

自我檢查：晶片點亮邏輯（未選中時全暗／選中特定一個時只有該晶片亮／換選其他晶片會自動熄滅前一個）皆用檔案內實際程式碼驗證通過。

### 影響檔案
- index.html / GameVault_v02_07_index.html
- sw.js

### GS 版本
- 無（純前端 UI 樣式與狀態調整）

### PWA 快取
- CACHE_NAME: gamevault-v02-06 → gamevault-v02-07

### 對應備份
- _internal/old/v02_06/

## v02.06 (2026-07-22)

### 變更內容
修正日系資料庫（consoledictionary.com）比對功能的觸發缺口，並改善視覺明顯度：
- **bug修正**：原本 4 個觸發點（條碼查詢/AI辨識/手動編輯名稱欄位）都只涵蓋「新建立/新識別」流程，**漏了「開啟既有收藏記錄編輯」這個情境**——這種情況下日文名稱欄位早就有值，但因為沒走過任何觸發點，背景查詢從未被呼叫過，導致明明網站上搜得到、App 卻一直停在預設連結狀態。修正後 `renderForm()` 顯示表單時一併呼叫 `cdMaybeAutoSearch()`，涵蓋新建與編輯既有記錄兩種情境；既有的去重邏輯確保表單因編輯其他欄位重繪時不會重複打 API
- **視覺改善**：預設狀態（尚未查到候選）的網站圖示連結，原本顏色偏淡、字偏小不明顯，改為加上底色與邊框（膠囊形狀，跟候選按鈕視覺呼應但顏色區分），字級與圖示都放大一點

自我檢查：模擬「開啟既有記錄編輯」情境（entry 已有 jp_name 但未經過任何識別流程）驗證會正確觸發查詢，且多次 renderForm 重繪不會重複查詢，皆用檔案內實際程式碼驗證通過。

### 影響檔案
- index.html / GameVault_v02_06_index.html
- sw.js

### GS 版本
- 無（純前端觸發邏輯與樣式修正）

### PWA 快取
- CACHE_NAME: gamevault-v02-05 → gamevault-v02-06

### 對應備份
- _internal/old/v02_05/

## v02.05 (2026-07-22)

### 變更內容
日系資料庫（consoledictionary.com）比對提示區塊改為**常駐顯示**，並移到「日文名稱」欄位正下方：
- 原本只在查到候選結果時才在表單頂部跳出的提示按鈕，改成動態掛載在 `fg-jp_name` 欄位容器後面，`renderForm()` 每次重繪都會呼叫 `_cdMountHintHost()` 重新掛載（先移除舊的避免重複／殘留在錯誤分類下）
- 只有「遊戲分類＋地區日本」時才顯示這個區塊，其餘情況完全不掛載
- **常駐兩種狀態**：尚未查到候選時顯示 consoledictionary.com 的網站圖示＋連結（可直接點去官網）；查到候選後變成「🇯🇵 找到 N 筆日系資料庫比對，點此查看」的可點擊按鈕
- `cdMaybeAutoSearch()` 查詢完成後統一呼叫 `_cdRenderHintHost()` 更新畫面，不論有無結果都會重繪（取代原本只在有結果時才顯示的 `_cdShowHint()`）

自我檢查：14 種情境（含掛載條件、常駐兩種狀態渲染、重複呼叫不疊加、切換地區/分類後正確清除舊host）皆用檔案內實際程式碼以模擬 DOM 驗證通過。

### 影響檔案
- index.html / GameVault_v02_05_index.html
- sw.js

### GS 版本
- 無（純前端 UI 邏輯調整）

### PWA 快取
- CACHE_NAME: gamevault-v02-04 → gamevault-v02-05

### 對應備份
- _internal/old/v02_04/

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

