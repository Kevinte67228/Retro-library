## v54.19 (2026-07-08)

### 變更內容
上一版（v54.18）修正的觸控滑動重綁問題不是真正根因，使用者回報滑動跟按箭頭都還是一樣的狀況（代表 bug 出在兩種操作共用的核心渲染邏輯，不是觸控特有）。深入追查找到真正根因並修正：
- **根因**：`_detailValHtml()` 處理「參考連結」（ref_link）欄位時，直接對值呼叫 `.startsWith()`／`.replace()`／`.slice()` 等字串方法，完全沒檢查型態。若某筆資料的 ref_link 欄位因資料異常不是字串型態，會直接拋出例外，導致 `showDetail()` 卡在標題（`$('dtitle')`，函式前段）已經設定完成、但內容區塊（`$('dgrid').innerHTML=...`，函式後段）還沒渲染完成就中斷執行——完美對應「標題動、內容不動」的症狀，切到 ref_link 正常的商品時又會恢復正常
- **修正**：改用 `String(v)` 強制轉字串後再處理；`_detailValHtml()` 整個函式包 try-catch，任何欄位資料異常都會在這裡攔截、退回顯示安全的原始值字串，不會再讓例外中斷整個 showDetail() 的渲染流程

### 影響檔案
- index.html / GameVault_v54_19_index.html
- sw.js

### GS 版本
- 無（純前端邏輯修正）

### PWA 快取
- CACHE_NAME: gamevault-v54-18 → gamevault-v54-19

### 對應備份
- _internal/old/v54_18/

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

