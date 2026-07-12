## v54.63 (2026-07-08)

### 變更內容
收藏卡片視覺調整＋新增最愛功能：

- **縮圖放大**：卡片列表縮圖從 48px 放大到 70px（中等放大，卡片高度不會大幅增加），emoji 預設圖示比照放大到 60px
- **最愛功能**：卡片右上角新增❤️/🤍愛心圖示，點擊切換最愛狀態，採樂觀更新（先更新畫面與本地快取、背景送出後端，失敗才復原並提示，避免高頻率操作每次都要等待 loading）；點擊愛心會阻止事件冒泡，不會誤觸開啟詳情頁
- **最愛篩選**：加入進階篩選的 FACETS 清單，可篩選只顯示已收藏最愛的項目

### ⚠️ 需要使用者手動處理
後端寫入邏輯是依照 Google 試算表既有的欄位標題對應寫入（`headers.map(h => fields[h])`），沒有的欄位不會被寫入。**使用者已確認會自行在 30 個分類分頁（Games/Books/Consoles/...等，不含 Hunt）手動加上 `favorite` 欄位標題**，加好之前最愛狀態只會存在 App 本地快取，重新同步後會遺失。

自我檢查：facetVals 對 favorite 的特殊分支、toggleFavorite 的樂觀更新切換邏輯均已驗證通過。

### 影響檔案
- index.html / GameVault_v54_63_index.html
- sw.js

### GS 版本
- 無變更（v65，`favorite` 欄位靠試算表既有的動態欄位對應機制自動支援，不需修改 GAS 程式碼，只需使用者手動加欄位標題）

### PWA 快取
- CACHE_NAME: gamevault-v54-62 → gamevault-v54-63

### 對應備份
- _internal/old/v54_62/

## v54.62 (2026-07-08)

### 變更內容
尋寶頁「🔎 條碼查詢」從標頭列的方形按鈕改成圓形浮動按鈕（`#hunt-barcode-fab`），疊在既有的「📷 拍照辨識遊戲」圓形按鈕（`#hunt-lens-fab`）正上方：
- 完全比照既有 `#hunt-lens-fab` 的定位方式（`position:fixed;right:18px`），只是 `bottom` 往上疊一顆按鈕的高度＋間距
- 綠色系配色（`#69f0ae`）呼應原本條碼查詢按鈕的邊框色，跟拍照按鈕的粉色區隔清楚
- 條碼造型 SVG 圖示；標頭列只留「📅 近期發售」

### 影響檔案
- index.html / GameVault_v54_62_index.html
- sw.js

### GS 版本
- 無（純前端 UI 調整）

### PWA 快取
- CACHE_NAME: gamevault-v54-61 → gamevault-v54-62

### 對應備份
- _internal/old/v54_61/

## v54.61 (2026-07-08)

### 變更內容
修正低對比文字造成的閱讀困難：找到根因是 `color:#444`（很暗的灰色，適合淺色背景用的淡化提示色），套用在 App 深色背景上幾乎看不見。這個問題不只出現在新的 AI網頁查詢頁面，也是**既有的商店連結／商品條碼／商品編碼模式共用的舊有問題**（同樣的複製貼上手誤），一併修正：
- AI網頁查詢：「系統會自動帶入目前分類所需的欄位產生查詢提示詞」、「將帶入的欄位：...」
- 商店連結模式：「例如：https://store.steampowered.com/app/...」
- 商品條碼模式：條碼格式範例文字
- 商品編碼模式：編碼格式範例文字

全部改用既有的可讀次要提示色 `#9fa8c8`（App 內已使用 113 次的established慣例色），跟主要提示文字 `#7986cb` 形成清楚的視覺層次，深色背景下清晰可讀。

### 影響檔案
- index.html / GameVault_v54_61_index.html
- sw.js

### GS 版本
- 無（純前端配色修正）

### PWA 快取
- CACHE_NAME: gamevault-v54-60 → gamevault-v54-61

### 對應備份
- _internal/old/v54_60/

## v54.60 (2026-07-08)

### 變更內容
AI 網頁查詢建檔頁新增免手動輸入的兩個功能，**完全沿用既有機制，未重造輪子**：
- **📷 掃描條碼**：新增 `aiWebScanBarcode()`，比照 `barScanFromBtn()` 的實作，呼叫既有的 `openFieldScanner({mode:'barcode'})` 即時掃描機制，掃到自動帶入查詢輸入框
- **📷 拍照辨識名稱**：直接沿用既有的 `nameFieldOCR(this,'aiweb-subject','zh')`（隱藏 file input + `capture="environment"` 的既有模式），拍照後經 Gemini 視覺辨識帶出商品中文名稱（沿用既有 prompt：只要名稱、不要型號價格店名、看不清留空禁止腦補）
- 進入模式時一併重置 file input，避免殘留上次選過的檔案
- 驗證：語法檢查通過、依賴函式（`openFieldScanner`／`nameFieldOCR`）確認存在、新增的 7 個 `aiweb-*` id 皆無重複

### 影響檔案
- index.html / GameVault_v54_60_index.html
- sw.js

### GS 版本
- 無（純前端功能新增）

### PWA 快取
- CACHE_NAME: gamevault-v54-59 → gamevault-v54-60

### 對應備份
- _internal/old/v54_59/

