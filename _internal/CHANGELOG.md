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

## v54.14 (2026-07-08)

### 變更內容
更新 Step 1「建檔方式說明」彈窗，內容還停留在改版前「6種方式全分類通用」的舊版描述，沒反映數位下載版拆表後的實際狀況：
- 新增提示區塊，說明各分類可用的建檔方式不完全相同
- 新增「🔗 商店連結」說明（數位下載版專用，原本完全沒被列出）
- 「商品編碼」說明更新為依分類自動對應 ISBN／JAN 碼
- 「編碼＋照片」補充說明電子書子類型走的是 ISBN＋照片組合

### 影響檔案
- index.html / GameVault_v54_14_index.html
- sw.js

### GS 版本
- 無（純前端文案更新）

### PWA 快取
- CACHE_NAME: gamevault-v54-13 → gamevault-v54-14

### 對應備份
- _internal/old/v54_13/

