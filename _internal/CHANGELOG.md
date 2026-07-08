## v54.18 (2026-07-08)

### 變更內容
修正詳情頁快速翻頁（左右滑動）幾頁後標題會動但內容不動、之後又恢復正常的 bug：
- **根因**：左右滑動翻頁的觸控處理函式（`ontouchstart`/`ontouchend`）原本寫在 `showDetail()` 內，代表**每次翻頁都會重新綁定一次**。如果使用者連續快速滑動、前一次觸控的 touchstart/touchend 還沒配對完成，下一次翻頁就把處理函式整組換掉，新綁定的閉包裡 `_tx`（觸控起始位置）預設值是 0，不是這次手指實際按下的位置，算出來的滑動距離會是錯的，可能誤觸發多餘的翻頁——標題是直接設值一定跟得上，但內容渲染跟著 `detailRow` 的變化速度對不上，就會看到標題動、內容沒跟上的錯亂畫面
- **修正**：觸控滑動手勢改成只在第一次開啟詳情頁時綁定一次（用旗標防止重複綁定），不再每次翻頁都重建，消除這個時序競爭窗口

### 影響檔案
- index.html / GameVault_v54_18_index.html
- sw.js

### GS 版本
- 無（純前端邏輯修正）

### PWA 快取
- CACHE_NAME: gamevault-v54-17 → gamevault-v54-18

### 對應備份
- _internal/old/v54_17/

## v54.17 (2026-07-08)

### 變更內容
修正說明彈窗一進入建檔頁就直接顯示的 bug：
- **根因**：v54.16 改版時 `#help-panel` 的 inline style 不小心寫了兩次 `display` 屬性（`display:none` 後面又接 `display:flex`），CSS 遇到重複屬性後面蓋過前面，導致面板一開始就被強制顯示成 flex，內容還沒被任何按鈕觸發顯示所以看起來是空的
- **修正**：移除多餘的 `display:flex`，只保留 `display:none` 作為初始狀態，開啟/關閉交給 JS 動態控制

### 影響檔案
- index.html / GameVault_v54_17_index.html
- sw.js

### GS 版本
- 無（純前端修正）

### PWA 快取
- CACHE_NAME: gamevault-v54-16 → gamevault-v54-17

### 對應備份
- _internal/old/v54_16/

## v54.16 (2026-07-08)

### 變更內容
三項優化：
- **「近期發售」按鈕放大**：字級/padding/圖示都加大，邊框改用更醒目的青色
- **說明彈窗標頭固定**：原本標頭（含 ✕ 關閉鈕）會跟著內容一起被滑走，改成 sticky 固定在頂部，內容區獨立捲動，關閉鈕任何時候都看得到、按得到
- **Step 1～4 都各自有專屬說明按鈕**：原本只有 Step 4「建檔方式」有說明，現在 Step 1「選擇分類」、Step 2「商品區域」、Step 3「平台選擇」也都各自有「💡 說明」按鈕，內容對應各自的步驟（8大分類與子類型概念、地區選擇的影響、平台選填的用途）

### 影響檔案
- index.html / GameVault_v54_16_index.html
- sw.js

### GS 版本
- 無（純前端調整）

### PWA 快取
- CACHE_NAME: gamevault-v54-15 → gamevault-v54-16

### 對應備份
- _internal/old/v54_15/

## v54.15 (2026-07-08)

### 變更內容
「說明」按鈕位置調整：原本放在 Step 1「選擇分類」標題旁，但按鈕內容其實是解說 Step 4「建檔方式」，位置跟內容對不上。改移到 Step 4「建檔方式」標題旁，位置跟說明內容一致。

### 影響檔案
- index.html / GameVault_v54_15_index.html
- sw.js

### GS 版本
- 無（純前端排版調整）

### PWA 快取
- CACHE_NAME: gamevault-v54-14 → gamevault-v54-15

### 對應備份
- _internal/old/v54_14/

