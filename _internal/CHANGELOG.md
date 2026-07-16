## v66.12 (2026-07-13)

### 變更內容
修正收藏詳情頁「圖片紀錄」區塊誤把 `extra_images` 的原始 JSON 字串（含 Drive 檔案 ID）直接顯示成文字內容的問題，使用者看到的是一串看不懂的 `[{"label":"","img":"1fI8Ckf..."},...]`。

根因：詳情頁的通用欄位列表迴圈會把「沒有被排除」的欄位都印出來，`extra_images` 之前沒有被加進排除清單（`skip`），但它本來就有專屬的圖片管理／燈箱瀏覽 UI，不該被當一般文字欄位顯示。加進排除清單即可，跟 `uuid`／`category` 等既有排除欄位同一套機制。

### 影響檔案
- index.html / GameVault_v66_12_index.html
- sw.js

### GS 版本
- 無（純前端顯示邏輯修正，非實質後端變更，不觸發版號歸零）

### PWA 快取
- CACHE_NAME: gamevault-v66-11 → gamevault-v66-12

### 對應備份
- _internal/old/v66_11/

## v66.11 (2026-07-13)

### 變更內容
修正尋寶額外照片儲存後重整就消失的問題。

**根因**：比對收藏跟尋寶的存檔邏輯，發現收藏的存檔流程（`onFld`儲存路徑）在後端回應後，會把 `res.imgs.extra_images`（後端已把 base64 原始資料上傳到 Drive、轉換成檔案 ID 後的正確結果）讀回本地端的 `entry.extra_images`；但尋寶的 `huntSaveTarget()`／`huntUpdateRow()` 兩個存檔函式**只處理了 `res.imgs.cover_img`，完全漏掉 `res.imgs.extra_images`**。

**已排除的可能性**：確認 GAS 後端的 `processExtraImages()` 呼叫邏輯是通用的（用 `headers.indexOf('extra_images')` 判斷，不分類別），Hunt 分頁只要有這個欄位標題（使用者已確認執行過「修復工作表標題列」），後端就會正確處理圖片上傳並回傳結果——問題完全出在前端沒接住這個回傳值。

**實際影響**：存檔當下本地端仍留著上傳前的原始 base64 資料（未讀取後端回傳的 Drive ID 版本），跟試算表實際存的內容不一致，下次重新整理（重新從後端同步）時就會跟正確資料對不上，看起來像是照片消失了。

**修正**：`huntSaveTarget()`（新增）與 `huntUpdateRow()`（編輯儲存）都補上 `res.imgs.extra_images` 的回寫，比照收藏既有的正確做法。

### 影響檔案
- index.html / GameVault_v66_11_index.html
- sw.js

### GS 版本
- 無（純前端修正，後端邏輯本來就是對的）

### PWA 快取
- CACHE_NAME: gamevault-v66-10 → gamevault-v66-11

### 對應備份
- _internal/old/v66_10/

## v66.10 (2026-07-13)

### 變更內容
兩項修正：

**1. 尋寶詳情頁未重置捲動位置**：確認 `huntDetail()` 完全沒有捲動重置邏輯（收藏頁的 `showDetail()` 有 `#dp.scrollTop=0`，尋寶漏了對應的處理）。加上 `#pg-hunt.scrollTop=0`，切換到新項目的詳情頁時會從最上面開始顯示，不會停留在清單或上一個項目的舊捲動位置。

**2. 主畫面加入淡入動畫**：`#shell` 新增 `shellReveal` 淡入動畫，時間點刻意跟開機畫面淡出（1.5秒開始，0.55秒淡出）重疊——`#shell` 從 1.2 秒開始淡入、0.8 秒完成，兩層動畫在 1.5～2.0 秒之間互相交疊，形成柔和的交叉淡入淡出，即使畫面內容還沒完全就緒，視覺上也不會有突然跳出的生硬感。

### 待確認
圖片載入變慢的問題目前找不到明確的程式碼異動可以對應（Service Worker 只處理同源請求，不會影響 Google Drive 圖片載入；尋寶清單縮圖請求尺寸 150px 對應 104px 顯示大小屬合理範圍），需要使用者提供更多細節（是哪個畫面、什麼時候開始變慢）才能進一步排查。

### 影響檔案
- index.html / GameVault_v66_10_index.html
- sw.js

### GS 版本
- 無（純前端修正，非實質後端變更，不觸發版號歸零）

### PWA 快取
- CACHE_NAME: gamevault-v66-09 → gamevault-v66-10

### 對應備份
- _internal/old/v66_09/

## v66.09 (2026-07-13)

### 變更內容
修正「實體店面（不顯示地圖）」的判斷範圍：使用者指出這個選項只是不要顯示**大地圖縮圖**（會呼叫 Google Static Maps API），清單上小小的「📍 地圖」**可點擊連結**（純 URL，不呼叫 API）應該不管哪種實體店面都要保留。

- **大地圖縮圖**：維持只在 `chan==='store'` 才顯示（呼叫 API 的部分）
- **📍 地圖連結**：改成 `store`／`store_nomap` 都顯示（只要有地點/地圖網址資料就能點），只有真的沒填地點資料時才退回「🏪 實體店面」文字

### 影響檔案
- index.html / GameVault_v66_09_index.html
- sw.js

### GS 版本
- 無（純前端邏輯修正，非實質後端變更，不觸發版號歸零）

### PWA 快取
- CACHE_NAME: gamevault-v66-08 → gamevault-v66-09

### 對應備份
- _internal/old/v66_08/

