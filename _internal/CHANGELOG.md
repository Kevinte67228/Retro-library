## GAS 新增診斷工具：圖片健康檢查 (2026-07-26，純後端，無前端版號異動)

### 變更內容
新增 `auditMissingImages()` 診斷函式，配合前一版的圖片誤刪漏洞修復使用，幫使用者精準定位哪些記錄的圖片檔案在 Drive 上失效了：

- 掃描所有 32 張工作表每一列的 `cover_img`／`back_img`／`spine_img`／`extra_images`，對每個不重複的 Drive ID 實際查詢 Google Drive
- 分兩種異常狀態：`trashed`（還在垃圾桶內，可還原）／`notfound`（垃圾桶已清空或 ID 有誤，救不回來）
- 結果列出「哪張工作表／第幾列／商品名稱／哪個欄位／ID／狀態」，使用者可以照清單直接去 Drive 垃圾桶搜尋對應 ID 或檔名還原，不用整批用眼睛找哪張圖是破圖
- 純診斷、不會刪除或修改任何資料；沿用既有 `auditOrphanImages()` 同一套「Apps Script 編輯器函式選單手動執行、結果看執行紀錄」的操作慣例，沒有另外設計新的觸發方式

自我檢查：`node --check`（.gs 副檔名改 .js 檢查）語法通過；無 U+FFFD；確認函式內引用的所有既有常數/函式（`IMG_COLS`／`EXTRA_IMG_COL`／`isDriveId`／`extractExtraImageIds`／32 張工作表對應常數）都存在。

### 影響檔案
- docs/RetroVault_AppsScript.gs（GitHub Actions 自動部署到 Apps Script，執行成功）

### GS 版本
- 新增診斷用函式，不影響既有功能行為，純後端修正


## GAS 緊急修復：圖片遭誤刪的資料遺失漏洞 (2026-07-26，純後端，無前端版號異動)

### 變更內容
使用者回報部分很久以前建檔的商品封面圖突然消失（顯示破圖圖示）。追查確認是真正會刪除資料的邏輯漏洞，不是顯示問題：

**根因**：`updateRow`（編輯存檔）與 `deleteRow`（刪除記錄）在換圖/清圖/刪除時，會把舊的 Drive 圖片檔案移進垃圾桶（`trashImg`），但完全沒檢查這張圖片是否同時被「其他列」記錄引用。若兩筆不同記錄剛好共用同一張 Drive 圖片，編輯或刪除其中一筆時，會連帶刪掉另一筆完全沒被使用者動過的記錄正在使用的圖片，造成該記錄圖片憑空消失。

**修復**：
- `collectUsedImgIds_()` 改成回傳每個圖片 ID 的引用次數（原本只回傳布林值），既有兩個呼叫端（`findOrphanImages_` 的 `!used[id]` 判斷）行為不受影響（任何正整數的 `!` 值都是 false，跟布林 `true` 效果相同）
- `updateRow`：換圖/清圖前，先用 `collectUsedImgIds_()` 確認舊圖的引用次數，只有「只被自己這一列引用」（`count<=1`）才安全刪除；被其他列共用的圖片保留，只是這一列不再指向它
- `deleteRow`：即使前端沒有傳入 `keepImg=true`，也額外做一次共用檢查（第二道防線），避免前端判斷疏漏時誤刪別筆記錄還在用的圖
- `extra_images` 陣列欄位的圖片回收邏輯，套用同樣的共用檢查

**資料救援**：圖片是移進 Google Drive 垃圾桶（`setTrashed(true)`），不是永久刪除，30 天內可從垃圾桶救回，已提醒使用者去確認、暫時不要清空垃圾桶。

自我檢查：`node --check`（.gs 副檔名改 .js 檢查）語法通過；無 U+FFFD；用模擬多列/多工作表資料跑 8 項自我檢查全過，含跨列共用偵測、跨工作表加總統計、extra_images 共用偵測，並用「修復前的舊邏輯」當對照組跑同一組資料，證實舊邏輯確實會誤判需要刪除，驗證這次修復對症下藥。

### 影響檔案
- docs/RetroVault_AppsScript.gs（GitHub Actions 自動部署到 Apps Script，執行成功）

### GS 版本
- 有實質邏輯變更（資料完整性修復），純後端修正，未搭配前端部署


## v02.50 (2026-07-26)

### 變更內容
修正上一版誤解需求範圍：使用者要的是整個「•••」收合式 FAB 群組（含日系資料庫查詢／條碼品名查詢／拍照辨識三個功能）搬到收藏詳情頁，不是只有條碼查詢單一按鈕。同時修正位置跟翻頁浮動按鈕（`.dnav-float`，`bottom:86px`）重疊的問題：

- 收藏詳情頁新增 `#det-fab-wrap` 三按鈕收合式 FAB 群組，結構、動畫、視覺樣式完全比照尋寶頁的 `#hunt-fab-wrap`；三個子功能（`openCdWebSearch`／`openBarcodeWebSearch`／`huntLensStart`）都是既有全域函式，直接沿用不重複實作
- 位置改成 `bottom:20px`，明顯低於翻頁按鈕的 `bottom:86px`，兩者範圍（20-74px vs 86-134px）不重疊
- `closeDetail()`／`closeDetailSilent()` 關閉詳情頁時一併收合 FAB 群組，避免下次開啟時維持展開狀態

自我檢查：`node --check` 通過；無 U+FFFD；CSS 606/606；位置範圍計算確認不重疊；抽取真實函式跑 4 項自我檢查全過，含展開/收合狀態切換、子功能正確分派到對應全域函式、選擇子功能後自動收合。

### 影響檔案
- docs/index.html / docs/RetroVault_v02_50_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v02-49 → retrovault-v02-50

### 對應備份
- _internal/old/v02_49/


## v02.49 (2026-07-26)

### 變更內容
自動抓封面圖經過多輪調整命中率依然不理想，改變策略：新增手動搜尋工具，讓使用者自己找到正確圖片，不再單靠自動比對。

- **收藏詳情頁新增浮動按鈕**：跟尋寶頁「條碼查詢」FAB 同樣的位置（畫面右下角）跟外觀，點開即可用條碼或品名手動搜尋。原本這個工具只存在於尋寶頁，`openBarcodeWebSearch()` 本來就是全域函式、overlay 也是全域共用元件，這次只是多加一個進入點，沒有重複實作。
- **條碼查詢工具新增「品名」模式**：原本只能用條碼查（掃描或輸入），現在可切換成用商品品名查詢，品名輸入不再套用條碼專用的「只留英數字」清理規則（原本會把中日文品名整個清空），改成完整保留原文字。
- **品名模式支援拍照 OCR 辨識**：拍照或選圖 → 送 Gemini 只要求讀出畫面中最主要的文字（不做結構化辨識），辨識結果自動帶入輸入框，使用者可再自行修改後查詢。
- 8 個查詢目的地（Barcode Lookup／Google／Bing／Yahoo!JAPAN／DeepSeek／GPT／Gemini／Claude）兩種模式共用，AI 助手的複製文字提示語依模式調整用詞（條碼 vs 品名）。

自我檢查：`node --check` 通過；無 U+FFFD；CSS 596/596；抽取真實函式跑 18 項自我檢查全過，含模式切換時 UI 狀態（按鈕選中樣式/相機掃描框顯示隱藏/OCR區塊顯示隱藏/input的inputmode切換）、相機掃描器正確啟停、查詢字串清理規則依模式分流（條碼清成純英數字／品名完整保留中日文）、錯誤訊息依模式顯示對應文字、OCR函式的同步早退防護（無檔案/無Gemini金鑰）等情境。

### 影響檔案
- docs/index.html / docs/RetroVault_v02_49_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v02-48 → retrovault-v02-49

### 對應備份
- _internal/old/v02_48/
