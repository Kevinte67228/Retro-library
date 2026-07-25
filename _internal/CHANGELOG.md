## v02.21 (2026-07-25)

### 變更內容
「統一整個程式碼渲染函式」Phase 3（儀表板/統計）。稽核 DV2 系統（`.dv2-*`）本身已經相對成熟一致（底色/邊框/字體都跟全站其他地方一致，只有卡片圓角 16px 比其他卡片 10px 大，判斷是大卡片刻意更圓潤的設計選擇，不是漂移，這次沒動），只找到 2 個選中狀態缺點亮效果：
- `.dv2-kpi-pill.active`（儀表板 KPI 選取膠囊）原本只變邊框色＋淡背景，沒有發光
- `.dv2-seg-btn.on`（購入成本/現值估值/盈虧 分頁按鈕）原本只是純色塊填底，沒有發光
- 這兩處補上發光效果，但用**內發光**而非 Phase 1/2 那種外發光：`.dv2-kpi-pill` 位在 `overflow-x:auto` 且上下 padding 很窄的橫向捲動列，`.dv2-seg-btn` 的父層 `.dv2-seg` 是 `overflow:hidden`，外發光在這兩處都會被容器裁切變形，內發光才不會被裁掉、視覺才完整
- KPI pill 的發光色沿用該 pill 本來就有的 `--kpi-color` CSS 變數（每個 KPI 各自的 accent 色），不是統一單一顏色

至此晶片／收藏卡片／尋寶卡片／儀表板選取元件的「選中點亮」語言已經統一（依容器限制彈性選外發光或內發光，但都是真正看得到的發光，不再有幾乎看不見的舊式內陰影）。

### 影響檔案
- docs/index.html / docs/GameVault_v02_21_index.html
- docs/sw.js

### GS 版本
- 無（純前端視覺調整）

### PWA 快取
- CACHE_NAME: gamevault-v02-20 → gamevault-v02-21

### 對應備份
- _internal/old/v02_20/


## v02.20 (2026-07-25)

### 變更內容
詳情頁區塊補上可收合功能，直接沿用表單既有的 `togSec()` 切換函式（該函式本來就是純 DOM 操作、不綁定特定區塊種類，完全不用改就能重用）：
- `.detail-section-title` 加上 `onclick="togSec(this)"`＋箭頭 `<span class="sc op">`，跟表單同一套視覺/互動語言
- 預設維持「全部展開」（跟改版前行為一致，只是新增可以手動收起來的能力），不像表單預設收合大部分區塊——因為詳情頁本來就只顯示有資料的區塊，資訊量已經篩選過，不需要預設收合
- CSS 新增 `.detail-section-grid.cl{display:none}`（複合選擇器，仿照原本 `.sb.cl` 的寫法，避免跟 `.detail-section-grid` 本身的 `display:grid` 產生優先權衝突而失效）
- 「關聯商品」跟一般欄位區塊都套用同一套收合機制

自我檢查：語法/亂碼/CSS 花括號配對通過；`togSec()` 本身未改動，靠直接檢視產生的 HTML 結構確認跟表單同一種「標題內含 .sc 箭頭、body 是標題的 nextElementSibling」DOM 形狀一致（`togSec` 依賴這個結構關係，已用表單驗證過是可運作的）。

### 影響檔案
- docs/index.html / docs/GameVault_v02_20_index.html
- docs/sw.js

### GS 版本
- 無（純前端功能/視覺調整）

### PWA 快取
- CACHE_NAME: gamevault-v02-19 → gamevault-v02-20

### 對應備份
- _internal/old/v02_19/



## v02.19 (2026-07-25)

### 變更內容
「統一整個程式碼渲染函式」Phase 2（建檔/編輯表單＋詳情頁）。稽核發現表單區塊(`.sg`/`.sh2`/`.sb`)跟詳情頁區塊(`.detail-section`)是同一個視覺概念（邊框卡片＋深色標題列＋內容區）分別刻出來的，統一如下：
- 詳情頁區塊背景色 `#0b1120` → `#0f1525`，跟表單 `.sb` 以及全站其他「內容底色」（`.gi`／`.abbr-legend`／`.sortc` 等）真正一致，原本是沒對齊到的顏色漂移
- 詳情頁區塊標題 padding `9px 12px` → `10px 14px`，對齊表單 `.sh2`
- `.dot`（分類色點）原本被鎖在 `.sl` 底下只給表單用，改成獨立 class；詳情頁區塊標題現在也加上同一顆色點，沿用既有 `gcolFor()` 色表，沒對應色的區塊（如少數自訂區塊）比照表單同一套 fallback 灰色，不會噴錯
- `_refLinks()`（查價連結區塊，如「關聯商品」以外的市場連結區）維持沒有色點——它不是欄位群組、`gcolFor()` 查不到對應色，刻意不強加

**這次沒動的（留待後續評估）**：表單區塊是可收合的（點擊展開/收合＋箭頭動畫），詳情頁區塊目前是靜態全展開；這是行為差異不是視覺差異，要不要讓詳情頁也可收合是進一步的功能決策，這次只處理視覺一致性，沒有一併加上去。

自我檢查：語法/亂碼/CSS 花括號配對通過；用真實抽取的 `gcolFor()`／`GCOL`／`BOOK_GCOL` 驗證色碼對照與 fallback 邏輯，5 項全過。

### 影響檔案
- docs/index.html / docs/GameVault_v02_19_index.html
- docs/sw.js

### GS 版本
- 無（純前端視覺調整）

### PWA 快取
- CACHE_NAME: gamevault-v02-18 → gamevault-v02-19

### 對應備份
- _internal/old/v02_18/




## v02.18 (2026-07-25)

### 變更內容
「統一整個程式碼渲染函式」Phase 1（收藏卡片列表＋尋寶卡片）。稽核發現收藏卡片(`.gc`)與尋寶卡片(`huntCardHtml`)色值/圓角/間距其實本來就一致（都是 #141b30 底／#1e2a45 框／10px 圓角），問題在實作方式跟選中效果：
- 尋寶卡片原本 100% inline style、沒有共用 class，因此拿不到 `.gc` 已有的 `:active` 按壓回饋；新增 `.hc` class 統一比照 `.gc` 的視覺語言，尋寶卡片改用 class 而非拼 inline style 字串
- `.gc` 與尋寶卡片的「選中」狀態原本都是 `box-shadow:...inset`（幾乎看不見，跟 v02.17 修過的 sortc 是同一種問題），統一改成 `.gc.sel`／`.hc.sel` 共用同一套外發光（沿用晶片那次的發光配方，色改用既有「選取＝玫瑰色」語意）
- 尋寶卡片的分類色條原本用獨立的 `HUNT_CATCOLOR` hex 色碼手刻 inline span，稽核發現這 4 個顏色其實跟收藏卡片的 `.bk-cat-game/book/console/periph`完全相同 → 改成新增 `_huntCatCls()` 對照表，直接沿用 `.bk`／`.bk-cat-*`，不再重複定義顏色；「已入手」badge 新增 `.bk-ok` 沿用同一套配方取代原本手刻的綠色 inline 樣式
- `HUNT_CATCOLOR` 本身保留（`huntDetail()` 詳情頁還在用，屬於 Phase 2 範圍，這次不動）
- 尋寶卡片無圖時的虛線外框（區別於收藏卡片實線外框，語意上代表「尚未入手的目標」）刻意保留不統一，是有意義的視覺區隔

自我檢查：語法/亂碼/CSS 花括號配對通過；用真實抽取程式碼驗證 `_huntCatCls()` 對照表涵蓋 `HUNT_CATCOLOR` 全部 4 個分類、未知分類 fallback 不噴錯，共 10 項全過。

### 影響檔案
- docs/index.html / docs/GameVault_v02_18_index.html
- docs/sw.js

### GS 版本
- 無（純前端視覺/渲染邏輯調整）

### PWA 快取
- CACHE_NAME: gamevault-v02-17 → gamevault-v02-18

### 對應備份
- _internal/old/v02_17/（同時為永久備份例外，不受這次 5 版輪替影響）
