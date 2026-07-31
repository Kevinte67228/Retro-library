## v02.60 (2026-07-27)

### 變更內容
處理上一版掃描出的重複邏輯：`huntConvertAIFill()`（尋寶轉入收藏的「✨ AI 補齊資料」）原本自己重複實作了一份跟 `_mergeDbIntoEntry()` 完全相同的資料庫事實欄位合併邏輯，這正是 v02.53 genre 漏洞需要修兩處的根本原因。

改成 `huntConvertAIFill()` 直接呼叫既有的 `_mergeDbIntoEntry(db)`，刪掉自己重複的那份，兩處合併邏輯合併成一份共用。順帶效果：`huntConvertAIFill()` 原本沒有「圖片實讀來源優先、不被資料庫覆蓋」的保護（`_mergeDbIntoEntry` 本來就有），這次也一併補上，行為更一致也更安全。

自我檢查：`node --check` 通過；無 U+FFFD；確認 `factFields` 陣列定義從 2 處減少為 1 處；抽取真實函式跑 7 項自我檢查全過，含 DB 事實欄位正確合併、含中文簡介正確採用、圖片來源保護正確延伸到原本沒有這個保護的呼叫端、`db` 為空物件或 `null` 時都安全處理不報錯（因為改成直接呼叫，不再有外層 `if(db&&...)` 包住，需要函式自己扛得住這些邊界情況）。

### 影響檔案
- docs/index.html / docs/RetroVault_v02_60_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v02-59 → retrovault-v02-60

### 對應備份
- _internal/old/v02_59/


## v02.59 (2026-07-27)

### 變更內容
使用者發現錯字並要求做一次全面掃描（語法一致性、死碼、可共用的重複邏輯、錯字）。這次完成的部分：

- **錯字修正**：「剃除」（剃頭的剃）修正為「剔除」，找到 2 處（批次確認清單標籤文字、程式碼註解各 1 處）
- **死碼掃描**：比對所有 733 個 top-level 函式定義的呼叫次數，沒有找到定義了卻完全沒被呼叫的函式
- **孤兒 CSS 掃描**：檢查 CSS 選擇器引用的 id 在 HTML 中是否存在，過濾掉誤判的 hex 色碼後，找到 1 個候選（`#db-src-ov`），查證後確認是透過 `document.createElement()` 動態建立的元素（跟 `hunt-add-ov`／`hunt-lens-ov` 同樣的既有寫法慣例），不是真正的孤兒規則
- **重複邏輯掃描**：確認 `factFields=['developer','publisher','release_date','players','age_rating','series']` 這個陣列跟對應的合併邏輯，在 `_mergeDbIntoEntry()` 跟 `huntConvertAIFill()` 兩處各自獨立實作了一份完全相同的版本（這正是先前 genre 欄位漏洞需要修兩個地方的根本原因）——**這處還沒有實際合併成共用函式**，屬於掃描出的待處理項目，尚未動手改，需要使用者確認後再進行（合併共用邏輯會改動兩個既有函式的呼叫方式，想先取得使用者同意再處理，避免不必要的風險）

自我檢查：`node --check` 通過；無 U+FFFD；CSS 605/605。

### 影響檔案
- docs/index.html / docs/RetroVault_v02_59_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v02-58 → retrovault-v02-59

### 對應備份
- _internal/old/v02_58/


## v02.58 (2026-07-27)

### 變更內容
使用者實測回報：展開後的 3 個子按鈕還是跟「更新記錄」重疊。前兩版都是用猜的固定像素值（`calc(Npx+...)`）去估 save-bar 的高度，猜了兩次都跟實際渲染尺寸有落差。這次不再猜，改用 `getBoundingClientRect()` 實際量測 save-bar 當下的真實螢幕位置，直接算出「剛好貼在 save-bar 上方」的精確 bottom 值：

- 新增 `_positionDetFabWrap()`：量測 save-bar 的 `top` 座標，換算出 det-fab-wrap 該設定的 bottom 值（螢幕高度 − save-bar頂部座標 + 14px間距），不管按鈕實際渲染尺寸怎麼變都不會重疊
- `toggleDetFab()` 開合前重新量測一次，`editDetail()` 顯示 FAB 時也量測一次；加了 `resize` 事件監聽，版面變動（例如虛擬鍵盤開合）時如果 FAB 正顯示中也會重新定位
- 修正「取消／更新記錄／•••」三顆一排時的排版：「更新記錄」按鈕明確加上 `flex:1;min-width:0`，避免原本 `.bw{width:100%}` 在三顆按鈕情境下擠壓計算不準，導致第三顆按鈕消失或跑位；「•••」也明確加上 `flex-shrink:0` 確保不會被擠壓不見

**沒有做的事，附帶說明**：使用者也提到「把最下面這一排釘死」，這次沒有把 `save-bar` 從 `position:sticky` 改成 `position:fixed`——sticky 在目前 `.pg{overflow-y:auto}` 的捲動容器結構下，理論上已經能正常貼底；改成 fixed 需要額外處理跟底部導覽列（`#nav`，60px）的高度關係，貿然改動風險較高。如果實測後「更新記錄」那排真的會在捲動時消失、沒有貼住，需要再回報，屆時會用同樣的量測方式而不是用猜的處理。

自我檢查：`node --check` 通過；無 U+FFFD；CSS 605/605；抽取真實函式跑 3 項自我檢查全過，含正確量測計算 bottom 值、極端數值不會算出負數、對應元素不存在時安全處理不報錯。

### 影響檔案
- docs/index.html / docs/RetroVault_v02_58_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v02-57 → retrovault-v02-58

### 對應備份
- _internal/old/v02_57/


## v02.57 (2026-07-27)

### 變更內容
使用者回報：編輯表單頁的「•••」浮動球位置估算不準，跟「更新記錄」按鈕重疊。改用使用者建議的做法，不再用浮動定位猜測安全間距：

- 主觸發鈕（•••）改成跟「取消」同樣大小的一般按鈕，直接排進 `save-bar` 那一排（`取消／更新記錄／•••` 三顆一排），走一般 flex 版面配置，不再是 `position:fixed` 浮動元素，徹底排除位置估算不準的問題；「更新記錄」按鈕因為排版擠壓自然縮小讓出空間，不需要額外設定寬度
- 展開後的 3 個子按鈕（日系資料庫查詢／條碼品名查詢／拍照辨識）維持浮動於上方，展開/收合的視覺回饋改成直接切換主按鈕自身的樣式（原本是靠 CSS 選取器改父層底下的子元素做旋轉動畫，現在主按鈕已經搬出那個父層，要另外處理）
- `editDetail()`／`showForm()`／`resetAll()` 三處顯示/隱藏邏輯同步更新，各自控制兩個獨立元素（子按鈕容器 + 主觸發鈕）

自我檢查：`node --check` 通過；無 U+FFFD；CSS 605/605；確認元素 id 沒有重複；抽取真實函式跑 14 項自我檢查全過，含展開/收合視覺回饋、選擇子功能後自動收合、三個進出點（編輯既有記錄／新建檔／取消返回）都正確控制兩個獨立元素的顯示狀態。

### 影響檔案
- docs/index.html / docs/RetroVault_v02_57_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v02-56 → retrovault-v02-57

### 對應備份
- _internal/old/v02_56/
