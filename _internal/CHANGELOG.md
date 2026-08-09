## v02.125 (2026-08-09)

### 變更內容
使用者回報「圖片裁切這裡，已經選好裁切範圍，但最後出來的結果並非剛剛選定的範圍」，並準確猜測「是不是自動裁切在選定範圍後又介入」。

追查後證實猜測完全正確，且找到具體機制：互動式裁切工具（`cropImageFile()`，使用者手動拖曳四角調整範圍）本身運作正常，回傳的就是使用者精確選定的範圍。但**很多呼叫端在拿到使用者的裁切結果後，會再把它丟進 `compressImg()` 做壓縮**——而 `compressImg()` 內部固定會呼叫 `autoCropCanvas()`（依照片邊緣的背景色差異，自動偵測商品邊界並裁切），對一張「使用者已經手動精確裁切過」的圖再跑一次背景色自動裁切，等於把使用者剛剛的選擇又覆蓋掉一次——這正是「結果跟選的不一樣」的真正原因。全站排查後找到 11 處呼叫端有這個問題（單筆收藏編輯的封面/背面/側標上傳、自訂圖片新增、批次書背 Step4 補拍封面、尋寶目標的封面/照片/自訂圖片上傳、OCR 辨識前置壓縮等），另外存檔前的最終尺寸壓縮（`_compressAndSave`）也有同樣問題。

修正：`compressImg()` 新增選用的 `skipAutoCrop` 參數，開啟時只做「縮小尺寸／壓低品質」，不再呼叫 `autoCropCanvas()`。為了不用逐一深入每個呼叫端內部巢狀很深的 callback去找確切的右括號位置（風險較高，容易算錯），改成新增一個薄包裝函式 `compressImgNoRecrop()`，11 處呼叫端只需要把函式名稱從 `compressImg` 換成 `compressImgNoRecrop`，呼叫的其餘參數完全不用動。另外 4 處確認過的合法自動裁切情境（相簿一次選多張圖時「跳過裁切」的批次路徑、條碼掃描器即時擷取畫面、獨立的品名 OCR 拍照）維持使用原本的 `compressImg()`，這些情境本來就沒有經過使用者手動裁切，自動裁切依然是預期行為，故意不動。

### 自我檢查
`node --check` 通過；無 U+FFFD。用 jsdom 建立實際會執行的測試環境驗證核心邏輯：`compressImgNoRecrop()` 確認完全不會呼叫 `autoCropCanvas`／`detectCropBox`；同一組輸入改用原本的 `compressImg()`（模擬未修正的合法情境）則確認正常會呼叫這兩個函式，證明兩條路徑正確分流、互不影響；另外驗證 `_resizeOnlyCanvas` 內部的 `drawImage` 呼叫確實是用「完整原圖」當來源（沒有任何裁切區域參數），輸出尺寸也正確依比例縮放（1200×900 縮到 1000 寬時，高度正確等比例算出 750，不是被裁切成別的比例）。

### 影響檔案
- docs/index.html / docs/RetroVault_v02_125_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v02-124 → retrovault-v02-125

### 對應備份
- _internal/old/v02_124/


## v02.124 (2026-08-09)

### 變更內容
使用者回報圖片載入速度變慢很多。查證 `sw.js` 後找到根本原因：收藏封面用的是 Google Drive 縮圖（`drive.google.com/thumbnail?id=...`），這是跨網域請求；`fetch` 監聽器一開頭就有 `if (url.origin !== location.origin) return;`，等於完全略過這類請求——Service Worker 從來沒有快取過任何一張收藏封面圖。每次瀏覽同一張圖（捲動離開又捲回來、切換卡片/畫廊檢視、開依系列瀏覽等）都要重新向 Drive 要一次，收藏量越大、來回瀏覽次數越多，感受上就是「圖片載入越來越慢」，完全是網路請求的累積延遲，跟裝置效能無關。

修正：在跨網域判斷之前，額外攔截 Drive 縮圖請求，走獨立的快取優先策略——先查快取，有就直接回傳，沒有才打網路、拿到後存進快取。新增一個獨立的圖片快取（`retrovault-img-v1`），刻意跟應用程式版本號（`CACHE_NAME`）脫鉤，換版本部署時不會被清空，已經快取過的圖不需要重新下載。因為 Cache API 本身沒有內建的自動淘汰機制，加了一個簡單的數量上限（240 筆）＋FIFO 汰換（超過上限時砍最早加入的），避免快取無止盡成長佔用裝置容量——縮圖快取本來時效性就不高，做到真正的 LRU（需要額外記錄每筆的存取時間）不成比例，FIFO 已經夠用。

### 自我檢查
`node --check` 通過（`sw.js` 本身也做了語法檢查）；無 U+FFFD。這次額外寫了一個小型的 Service Worker 環境模擬器（`vm` 模組＋自製的 Cache API mock），**直接執行 `sw.js` 的真實程式碼**而不是只看程式碼字面，驗證了 7 種情境：Drive 縮圖第一次請求會打網路並存進快取；第二次請求同一張圖確實從快取取得、**不會**再打網路（這是這次修正的核心效果）；不同的圖片各自獨立快取；同源的靜態資源（`manifest.json` 等）行為不受影響；非 Drive 的跨網域請求（如 Google Fonts）依然正確略過、不受影響；洪水測試 250 張圖後快取確實被裁到上限 240 筆以內、且是最早加入的先被淘汰、最新的仍保留；版本更新時的快取清理邏輯確認不會誤刪這個獨立的圖片快取。

### 影響檔案
- docs/index.html / docs/RetroVault_v02_124_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v02-123 → retrovault-v02-124
- 新增獨立圖片快取：retrovault-img-v1（不隨應用程式版本更新而清空，上限 240 筆、FIFO 汰換）

### 對應備份
- _internal/old/v02_123/




## v02.123 (2026-08-09)

### 變更內容
使用者回報「新增報價」表單排版整個壞掉——每個欄位（地點/店名/平台、網址、通路類型、Google價格、品況、備註、看到日期）都被擠成一排排極窄的直排文字，儲存按鈕變成佔滿右側的大長條。這是 v02.122 接上 `hunt-sheet-ov` 抽屜動畫時引入的真實回歸。

根本原因：`.sheet-panel` 這個共用 class 原本連 `display:flex` 都一併管，但不是每個用到這個 class 的面板都要 flex 排版。像「新增報價」這種表單面板，設計上是靠瀏覽器預設的 block 排列（label 在上、input 在下逐行往下疊），v02.122 把 `.sheet-panel` 加到這個面板上時，`display:flex`（預設 `flex-direction:row`）把所有欄位擠成同一橫排、每欄配到的寬度極窄，文字被迫逐字換行——就是使用者看到的畫面。真正需要 flex 直排的地方（長按選單、DB 來源選單、批次編輯、依系列瀏覽、自訂市場編輯這 5 個按鈕/清單類面板）當初都額外自己標了 `flex-direction:column`，只是沒有自己補 `display:flex`、指望共用 class 幫忙加，這次抽換時沒有意識到這個隱性依賴，才會在幫「新增報價」這種不需要 flex 的面板套用同一個 class 時連帶出事。

修正：`.sheet-panel` 改成只管滑入/滑出動畫本身（`transform`／`transition`），不再管 `display`。真正需要 flex 直排的 5 個面板（`_showActionSheet` 動態面板、`showDbSrcSheet` 動態面板、`bulk-edit-panel`、`series-panel`、`cm-panel`），改成在各自的 inline style 自己明確補上 `display:flex`，不再依賴共用 class 幫忙加。這樣兩種排版需求（有些要 flex 直排、有些要一般 block）都能各自正確運作，互不干擾。

### 自我檢查
`node --check` 通過；無 U+FFFD。用 jsdom 建立實際會執行的測試環境，這次直接檢查每個受影響面板「實際拿到的 `style.display` 值」而不是只看 class 名稱有沒有掛上：確認 `hunt-sheet-ov`／`type-picker-overlay`／`cd-ov` 這三類面板（原本被錯誤強制 flex 的）現在都正確維持 `display` 為空（沿用瀏覽器預設 block）；同時確認真正需要 flex 直排的 5 個面板（長按選單、DB 來源選單、批次編輯、依系列瀏覽、自訂市場編輯）都正確拿到 `display:flex` 加 `flex-direction:column`，沒有被這次修正誤傷；另外確認 `game-picker-overlay`（本來就自帶 `display:flex;flex-direction:column`，不依賴共用 class）完全不受影響。

### 影響檔案
- docs/index.html / docs/RetroVault_v02_123_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v02-122 → retrovault-v02-123

### 對應備份
- _internal/old/v02_122/






## v02.122 (2026-08-09)

### 變更內容
延續 v02.119 動畫盤點報告時「額外發現但沒動」的範圍，這次接上剩餘的幾個底部彈出覆蓋層，統一成跟 `#filter-sheet`／已修好的長按選單同一套抽屜動畫語彙。這次特別記取 v02.121 的教訓（`.on` 必須同時加在外層背板跟內層面板兩個元素上），每一處轉換都用 jsdom 直接驗證「面板本身有沒有拿到 `.on`」，不只看外層背板。

**1. `hunt-sheet-ov`（尋寶報價表單）**：這個底部抽屜有 6 個不同呼叫端，各自組出的面板最外層結構、class 都不一樣（有的用共用的 `.mvw-sheet`、有的是各自的 inline style），逐一在 6 處呼叫端的 HTML 字串裡加 class 風險較高也容易漏改。改成通用做法：不管呼叫端塞什麼進來，一律用 `ov.firstElementChild` 抓面板，動態補上 `sheet-panel`／`on` 兩個 class，6 處呼叫端完全不用動一行。

**2. `type-picker-overlay`／`game-picker-overlay`**：同樣套用 `.sheet-ov`／`.sheet-panel` 抽屜語彙。**過程中發現一個需要一併處理的風險**：手機硬體返回鍵的統一處理邏輯（`_topLayerClose()`）原本是靠檢查這兩個覆蓋層的 `style.display` 值判斷「目前是否開啟」，改成 class 驅動後不會再有 `display:none`／`flex` 的切換，如果沒同步修正，返回鍵會誤判這兩層「永遠是開著的」，可能影響整個 App 的返回鍵行為。已同步把 `_topLayerClose()` 裡這兩筆登記從檢查 `style.display` 改成檢查 `.on` class，並用測試驗證返回鍵在開啟/關閉兩種狀態下都能正確判斷。

**3. `cd-ov`（日系資料庫比對結果）**：這個原本是整個 `.remove()` 掉、沒有退場動畫。改成先移除 `.on`（觸發背板淡出＋面板往下滑出），等轉場時間（300ms）過後才真正把元素從 DOM 移除，畫面不會瞬間消失看不到退場動作。

**4. `hunt-add-ov`（尋寶新增精靈流程）**：這個排查後發現不是「背板＋底部抽屜面板」的結構，是整頁不透明內容的多步驟精靈流程，套用滑入語彙不合適（沒有面板要滑，本身就是整頁內容）。改成新增的 `.fade-ov` class，單純淡入淡出，延續同樣 0.25s 的節奏但不強加不適合的滑動效果。精靈流程內部每個步驟都會呼叫同一個容器函式，`classList.add` 對已有 `.on` 的元素是 no-op，所以只有第一次進入精靈才會真的淡入，步驟間切換維持原本的瞬間切換速度，不會被拖慢。

### 自我檢查
`node --check` 通過；無 U+FFFD。用 jsdom 建立實際會執行的測試環境完整驗證：5 處新轉換的覆蓋層都個別確認「外層背板」與「內層面板」**各自**拿到 `.on`（不是只驗證其中一個）；`hunt-add-ov` 確認多步驟切換時 `.on` 已存在的情況下不會重複觸發、維持瞬間切換；`cd-ov` 確認關閉當下元素仍在 DOM（退場動畫播放中），等待轉場時間後才真正被移除；`_topLayerClose()` 修正後確認能正確偵測 `type-picker-overlay` 的開啟/關閉狀態、不會誤判為永遠開啟。另外對 v02.121 已修好的長按選單、批次編輯 modal 做了回歸測試，確認這次改動沒有連帶影響。

### 影響檔案
- docs/index.html / docs/RetroVault_v02_122_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v02-121 → retrovault-v02-122

### 對應備份
- _internal/old/v02_121/






