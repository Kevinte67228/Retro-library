## v54.56 (2026-07-08)

### 變更內容
上一版診斷面板進一步排除「pg-scan 頁面本身被隱藏」的推測——`pg-scan classList=pg on rect.height=765`，頁面本身完全正常。塌陷確實是從最小單位 `.sg`（單一欄位分組區塊）就已經是 0 高度，但裡面確定有內容（`form-body.innerHTML.length=31790`）。

檢查 `.sg` 的 CSS 後鎖定一個可疑對象：`.sg{overflow:hidden}` 搭配內部 `.sh2{display:flex}` 子元素，這個組合在特定行動瀏覽器引擎上是已知的高度計算相容性問題來源（`overflow:hidden` 有時無法正確累加 flex 子元素的高度）。

**實驗性修正**：移除 `.sg` 的 `overflow:hidden`（保留 `border-radius`，視覺上頂多圓角處露出方形邊角這種極小的副作用）。同時擴充診斷面板，加入 `.sh2` 子元素本身的實際高度／電腦樣式／文字內容，如果這次還是沒解決，能有更精細的資料判斷下一步。

### 影響檔案
- index.html / GameVault_v54_56_index.html
- sw.js

### GS 版本
- 無（純前端實驗性修正＋診斷工具擴充）

### PWA 快取
- CACHE_NAME: gamevault-v54-55 → gamevault-v54-56

### 對應備份
- _internal/old/v54_55/

## v54.55 (2026-07-08)

### 變更內容
上一版診斷面板抓到關鍵線索：`#shell`/`#content`/`#nav` 全部正常（765/765/60），`form-body` 確實有 31790 字元內容，但 **`form-sec` 的實際渲染高度是 0**。這排除了「版面高度計算異常」的推測（`--app-height` 本身完全正常），問題縮小到 `form-sec` 這一層或其祖先層級。

新增懷疑對象：`.pg{display:none}` 是所有分頁的預設狀態，只有加上 `.on` class 才會 `display:block`。若 `pg-scan`（建檔頁本身）不知何故遺失了 `.on` class，`form-sec` 即使自己是 `display:block`，也會因為祖先層 `display:none` 而整體塌陷成 0 高度——這會同時解釋「除了固定定位的 overlay 外全部消失」與「`form-sec` 高度算出 0」兩個現象。

擴充診斷面板：加入 `pg-scan` 的 `classList`／實際渲染高度／電腦樣式 `display`、`form-body` 自身的實際渲染尺寸、第一個 `.sg` 分組元素是否存在及其高度，用來直接驗證這個新假設。

### 影響檔案
- index.html / GameVault_v54_55_index.html
- sw.js

### GS 版本
- 無（純前端暫時性診斷工具擴充）

### PWA 快取
- CACHE_NAME: gamevault-v54-54 → gamevault-v54-55

### 對應備份
- _internal/old/v54_54/

## v54.54 (2026-07-08)

### 變更內容
使用者確認清除快取後問題依舊，排除了「舊快取殘留」的可能。目前已用 Node.js 模擬環境排除：JS 例外（showForm()/renderFld() 呼叫鏈實際測試沒有拋出例外）、欄位資料為空（實際測試 renderFld() 產生的HTML字串內容正常，單一分組有 2000~5000 字元）、id 重複衝突（檢查過關鍵 id 無重複）。三個最有可能的方向都排除後，問題依舊存在，純靠程式碼推理已經到極限。

**新增暫時性診斷面板**：`renderForm()` 完成後，在畫面上（用 `position:fixed` 直接掛在 `<body>` 上，不受任何版面問題影響）顯示關鍵狀態：`entry.category`、欄位表長度、`form-body` 實際內容長度、`form-sec`／`#shell`／`#content`／`#nav` 的實際渲染尺寸、`--app-height` 目前數值。這個面板問題排除後會移除。

### 影響檔案
- index.html / GameVault_v54_54_index.html
- sw.js

### GS 版本
- 無（純前端暫時性診斷工具）

### PWA 快取
- CACHE_NAME: gamevault-v54-53 → gamevault-v54-54

### 對應備份
- _internal/old/v54_53/

## v54.53 (2026-07-08)

### 變更內容
使用者回報 v54.52 修正後導覽列消失問題依舊，並補充關鍵線索：**除了 AI網頁查詢，所有建檔方式進入後都空白**。推理：AI網頁查詢／條碼查詢的 overlay 用 `position:fixed;inset:0` 定位（相對整個螢幕，不依賴 `#shell`），其餘所有畫面（含底部導覽列）都在 `#shell` 內——若 `#shell` 高度計算異常塌陷，裡面的東西會被擠壓到看不見，但 fixed 的 overlay 不受影響，剛好符合「只有 AI網頁查詢正常」的現象。

用 Node.js 模擬瀏覽器環境實際執行過主程式（含模擬呼叫 `initManualMode()`→`showForm()`），沒有發現腳本載入或函式呼叫時的 JS 例外，排除單純 JS 錯誤的可能，更加確認是版面高度計算的問題：
- **加強視窗高度計算防護**：`setAppHeight()` 加入數值有效性檢查（小於200px視為異常，不套用），避免任何情況下把破損的高度值寫入 `--app-height`
- **加入定時保險網**：每 3 秒檢查一次 `#shell` 實際渲染高度，異常過小時強制重新計算，作為所有事件監聽都沒被觸發到時的最後防線
- **showForm() 加上錯誤攔截**：以防萬一不是版面問題而是真的有 JS 例外，包上 try-catch 明確顯示錯誤訊息，取代目前完全無法判斷成因的靜默失敗狀況

### 影響檔案
- index.html / GameVault_v54_53_index.html
- sw.js

### GS 版本
- 無（純前端防護強化與錯誤攔截）

### PWA 快取
- CACHE_NAME: gamevault-v54-52 → gamevault-v54-53

### 對應備份
- _internal/old/v54_52/

