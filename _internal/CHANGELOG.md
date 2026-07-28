## v02.39 (2026-07-26)

### 變更內容
「條碼＋照片」卡片拿掉「推薦」徽章；寬窄改成依分類動態切換，解決上一版遺留的排版空格問題：
- 無子類型的 4 個分類（遊戲/書籍/主機/週邊，有顯示批次卡片）：條碼＋照片維持窄版（1格），8 張卡整除 2 排
- 有子類型的 3 個分類（原聲帶/動漫美術/公仔，批次卡片隱藏）：條碼＋照片改回寬版（2格），7 張卡片＋寬版條碼＋照片剛好整除 2 排，補上 v02.38 遺留的「7格留1格空白」瑕疵

### 影響檔案
- docs/index.html / docs/RetroVault_v02_39_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v02-38 → retrovault-v02-39

### 對應備份
- _internal/old/v02_38/


## v02.38 (2026-07-26)

### 變更內容
新增「批次書背辨識」建檔方式：一張照片辨識最多 8 件商品書背，逐件循序查資料庫＋補封面＋AI補全，列成確認清單讓使用者勾選後一次儲存。設計依使用者定案：

- **一次最多 8 件**：AI 回傳超過 8 件時前端裁切只取前 8 筆
- **循序處理**：8 件逐一查詢，非併發，避免短時間內對外部 API 連續發送過多請求；有進度顯示（正在解析第 X／8 件）
- **序號模糊處理**：AI 判斷該件商品編碼印刷不清晰時標「⚠️ 序號模糊」，但仍照常列出（含 AI 猜測的名稱供比對），由使用者自行決定是否取消勾選剃除，不自動排除
- **整批鎖死分類/平台**：批次沿用畫面上方已選定的分類＋平台＋地區，不逐件覆蓋；照片頁面加註提醒文字，告知使用者混合不同平台會建檔錯誤
- **範圍限制**：只支援遊戲／書籍／主機／週邊 4 個無子類型分類；原聲帶/動漫美術/公仔/數位下載版因子類型欄位表差異過大，本次不支援（批次卡片在這些分類自動隱藏）
- **查重複**：清單階段標示「⚠️ 已收藏過：{既有項目名稱}」，一樣由使用者決定是否剃除，不阻擋
- **查詢失敗**：標「✗ 查詢失敗」，checkbox 停用（不可勾選儲存），不影響其他 7 件繼續解析

**實作細節**：
- 新增 `mb-batch` 建檔方式卡片（單格寬，色碼 `#f06292`，不與既有 8 色重複）；`mb-combo`（條碼＋照片）配合改回單格寬，維持 2 排 4 格整除排版
- 逐件解析管線完全重用既有機制：`crossRefLookupPromise`／`_mergeDbIntoEntry`／`bookLookupPromise`／`_autoFetchCover`／`aiCompleteMissing`，透過暫時替換全域 `entry`（處理完還原）套用，與全站既有「單一可變 entry」慣例一致，不是另起爐灶
- `callGemini()` 新增 `opts.customSchema`／`opts.customSystem` 可選覆蓋（批次偵測用陣列型 schema，跟單品辨識的固定 schema 不同），不傳入時行為與原本完全相同，不影響現有 26+ 個呼叫點
- 批次儲存迴圈核心持久化步驟比照 `doSave`（壓縮→組列→`shPost`），但跳過單筆存檔的 confirm 對話框（重複/序號模糊已在確認清單階段由使用者決定，不需要再逐筆彈窗）

**已知的排版小瑕疵**：原聲帶/動漫美術/公仔這 3 個分類（非數位下載版）因為批次卡片隱藏但 combo 卡片改窄，建檔方式清單會變成 7 格（少 1 格填滿整排），第二排會空 1 格，非功能性問題，之後若需要可再調整。

自我檢查：`node --check` 語法通過；無 U+FFFD；CSS 594/594 配對；DOM 結構驗證（batch-sec div 開合平衡、確認為 method-sel 手足元素、enterMode 正確隱藏選單）；抽取真實函式（`_batchStatusBadge`／`_batchRenderList`／`_batchDetectPrompt`／`batchToggleInclude`／`BATCH_DETECT_SCHEMA`）跑 28 項自我檢查全過，含 XSS 安全檢查（清單卡片內使用者可控文字皆經 `esc()` 轉義）。

### 影響檔案
- docs/index.html / docs/RetroVault_v02_38_index.html
- docs/sw.js

### GS 版本
- 無（純前端功能，未動 GAS 後端）

### PWA 快取
- CACHE_NAME: retrovault-v02-37 → retrovault-v02-38

### 對應備份
- _internal/old/v02_37/



## v02.37 (2026-07-26)

### 變更內容
修復進入編輯表單時，上一步的掃描區塊沒被隱藏、跟表單內容疊在一起顯示的 bug：
- `showForm()` 原本只手動隱藏 `bar-sec`／`img-sec` 兩個區塊（純條碼/純圖片模式年代寫的），後來新增的 `combo-sec`／`gcode-sec`／`gcode-combo-sec`／`digital-link-sec`／`aiweb-sec` 都沒被涵蓋到，導致這些模式（例如條碼＋照片）AI 辨識完進表單時，上一步的拍照/AI辨識按鈕跟預覽圖還留在畫面上、跟表單堆疊在一起。
- 改用既有的 `hideAllSecs()`（涵蓋全部 8 個進場區塊）取代原本手動隱藏兩個區塊，再把 `form-sec` 顯示回來。已確認全部 26 個呼叫 `showForm()` 的地方都是「準備顯示完成表單」的最終步驟，沒有任何一處需要保留掃描區塊可見，此修復對全部建檔模式都適用。

### 影響檔案
- docs/index.html / docs/RetroVault_v02_37_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v02-36 → retrovault-v02-37

### 對應備份
- _internal/old/v02_36/




## v02.36 (2026-07-26)

### 變更內容
「加拍封底」標題微調：
- 拿掉沒有實質意義的「②b」前綴，只留「加拍封底」
- 備註文字縮短（「選填，封底印有條碼/編號/日期/語言，可提升欄位命中」→「選填，可提升欄位命中率」）並改用 flex 排列＋`white-space:nowrap`＋`text-overflow:ellipsis`，確保整段標題固定顯示在一行，不會在窄螢幕上換行拉長版面

### 影響檔案
- docs/index.html / docs/RetroVault_v02_36_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v02-35 → retrovault-v02-36

### 對應備份
- _internal/old/v02_35/
