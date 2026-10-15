## v11.01 (2026-10-16)

### 變更內容
新增秒級批次寫入（`batchAdd`），解決大量資料（如全量 CSV 或批次建檔資料）匯入時逐筆寫入耗時過長的問題：

1. **GAS 後端新增 `batchAdd` 動作與 `batchAddRows()` 函式（v11）**：在 `RetroVault_AppsScript.gs` 新增批次新增端點，利用 Google 試算表原生 `setValues()` 矩陣寫入能力，單一請求即可一次性寫入數百筆資料（耗時僅約 0.5 秒）；支援 `uploadImages` 選項開關，預設快速寫入現有圖檔 ID/URL。
2. **前端 CSV 匯入機制優化（`_syncImportedRecords`）**：CSV 匯入時自動按分類與子類型分組，優先使用 `batchAdd` 進行一次性整組秒級同步；若後端為舊版或其他例外情況，自動優雅降級為逐筆循序寫入，兼顧極速效能與歷史相容性。
3. **`shPost` 白名單擴充**：將 `batchAdd` 加入寫入授權白名單，自動附帶 `app_token` 驗證。

### 自我檢查
- 後端 `RetroVault_AppsScript.gs` 升級為 v11，依協作規則觸發主版號重整，前端對應歸零為 `v11.01`。
- `node -e` 與 Node VM 對所有 `<script>` 標籤語法驗證 100% 通過。
- Service Worker 快取名稱更新為 `retrovault-v11-01`。

### 影響檔案
- docs/RetroVault_AppsScript.gs
- docs/index.html
- docs/RetroVault_v11_01_index.html
- docs/sw.js
- _internal/CHANGELOG.md

### GS 版本
- v10 → v11（新增 batchAdd 原生 setValues 批次寫入）

### PWA 快取
- CACHE_NAME: retrovault-v10-01 → retrovault-v11-01

### 對應備份
- _internal/old/v10_01/

## v10.01 (2026-10-15)

### 變更內容
修復已上傳至 Google Drive 的圖片在點擊「🔄 旋轉 90°」時因瀏覽器跨網域（CORS）安全性限制導致「圖片載入失敗，無法旋轉」的問題：

1. **GAS 後端新增圖片代理讀取（v10）**：在 `RetroVault_AppsScript.gs` 新增 `get_img_b64` 動作與 `getImgB64(val)` 函式，直接透過後端存取使用者 Google Drive 私人圖片資料夾並轉為 Base64 Data URL 回傳前端，避開瀏覽器對 Google Drive 縮圖網址的 CORS 封鎖；同時向下支援遠端 HTTP 圖片代理。
2. **前端圖片 Base64 轉換器升級（`_imgToB64`）**：判斷若為 Drive ID 或受跨網域限制之圖片，自動透過後端 GAS 代理取得完整 Base64；同一網域或具備 CORS 標頭之圖片維持前端直連 fetch，兼顧速度與可靠性。
3. **旋轉功能穩健性改善（燈箱／表單／額外照片）**：
   - 增加載入失敗防禦與狀態提示（「正在載入並旋轉圖片…」），避免空字串 fallback 造成 404 報錯。
   - `data:` / `blob:` 格式之圖片不再誤設 `crossOrigin='anonymous'`，消除部分 WebView 下的安全限制。
   - 燈箱一鍵旋轉（`lbRotate`）在更新本地資料庫與預覽圖後，若有連線設定自動在背景同步寫回雲端試算表與 Drive，確保換裝置或重新整理後轉向依然保留。

### 自我檢查
- 後端 `RetroVault_AppsScript.gs` 升級為 v10，依協作規則觸發主版號重整，前端對應歸零為 `v10.01`。
- `node --check` 與 Node VM 對所有 `<script>` 標籤語法驗證 100% 通過。
- Service Worker 快取名稱更新為 `retrovault-v10-01`。

### 影響檔案
- docs/RetroVault_AppsScript.gs
- docs/index.html
- docs/RetroVault_v10_01_index.html
- docs/sw.js
- _internal/CHANGELOG.md

### GS 版本
- v09 → v10（新增 get_img_b64 代理讀取）

### PWA 快取
- CACHE_NAME: retrovault-v09-08 → retrovault-v10-01

### 對應備份
- _internal/old/v09_08/

## v09.08 (2026-10-15)

### 變更內容
新增全域與編輯情境的「🔄 圖片旋轉 90°」功能，解決部分商品封面（如 FC 橫向卡匣盒）擺成直的或照片方向錯誤的問題：

1. **圖片燈箱一鍵旋轉（#img-lightbox-ov）**：在詳情頁或收藏庫中點擊封面或縮圖彈出大圖燈箱時，右上角新增「🔄」旋轉按鈕（位於關閉 ✕ 按鈕旁）。點擊後即時順時針旋轉 90 度，自動壓縮為標準規格並直接寫入本機 `col` / `hunt` 資料庫（更新 `localforage`）與詳情頁的主圖/背景圖/縮圖預覽，不必進入編輯模式即可一鍵轉正！
2. **單筆編輯表單支援旋轉**：在各圖片欄位（`cover_img` 封面圖檔、`back_img` 封底圖檔、`spine_img` 側邊圖檔）下方新增「🔄 旋轉 90°」按鈕，若圖片有方向偏差可直接在此點擊調整；`multiimg`（自訂圖片）的每張縮圖下方也同步加入「🔄 旋轉」按鈕。
3. **通用圖片裁切器支援旋轉（#crop-ov）**：在拍照或相簿上傳裁切時，頂部工具列（矩形 / 透視校正旁）加入「🔄 旋轉 90°」功能，在手動裁切或四角校正前即可預先將圖片方向轉正。

### 自我檢查
- `node --check` 語法驗證 100% 通過（`docs/index.html` 與 `docs/RetroVault_v09_08_index.html`）。
- Service Worker 快取名稱更新為 `retrovault-v09-08`。

### 影響檔案
- docs/index.html
- docs/RetroVault_v09_08_index.html
- docs/sw.js
- _internal/CHANGELOG.md

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v09-07 → retrovault-v09-08

### 對應備份
- _internal/old/v09_07/

## v09.07 (2026-08-23)

### 變更內容
使用者提出兩項排版調整：

**動作列（補齊/編輯/刪除/✕）改回平均分配整行空間**——上一版為了應付按鈕數量不確定，用了橫向可滑動的保守方案；現在動作列已經固定只剩 4 顆，不再需要滑動保護，改回用 flex 平均分配整行寬度，4 顆按鈕等寬排滿一整排。

**估值邏輯說明（💡）跟重新估值按鈕整合進「二手估值市場參考」標題列**——原本是分頁內容裡獨立的一列，這次改成直接嵌進市場參考區塊的標題列右側（跟收合箭頭放在一起），這樣收合這個區塊時，這兩顆按鈕會跟著一起隱藏。`_refLinks()` 新增可選的 `extraHtml` 參數插在標題文字跟收合箭頭之間，按鈕群組本身也用 `margin-left:auto` 把自己（連同箭頭）推到最右邊；按鈕群組外層加了 `event.stopPropagation()`，避免點擊按鈕時事件冒泡到標題列本身的收合點擊事件，意外把區塊收合掉。`marketReferenceHtml()` 新增可選的 `rowNum` 參數，只有詳情頁那個呼叫點會傳入（估值工作台、尋寶頁那兩個呼叫點都不傳，維持原樣不受影響）。重新估值按鈕的字級/內距比照動作列按鈕，燈泡維持原本的緊湊尺寸。

### 自我檢查
`node --check` 通過；無 U+FFFD。用 jsdom 建立實際會執行的測試環境完整驗證：確認 `_refLinks()` 沒有帶 `extraHtml` 時行為完全不變（回歸測試）；確認帶了 `extraHtml` 時正確嵌入、正確加上 `stopPropagation` 保護、箭頭間距正確調整；確認 `marketReferenceHtml()` 帶 `rowNum` 時正確產生兩顆按鈕且「重新估值」正確綁定到對應的項目編號；**確認估值工作台跟尋寶頁這兩個沒有傳 `rowNum` 的既有呼叫點完全不受影響**，不會意外多出按鈕；確認數位下載版無論有沒有傳 `rowNum` 都正確維持不顯示。

### 影響檔案
- docs/index.html / docs/RetroVault_v09_07_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v09-06 → retrovault-v09-07

### 對應備份
- _internal/old/v09_06/
