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


## v02.17 (2026-07-25)

### 變更內容
「晶片（chip）」選中效果統一：稽核後發現 `.genre-chip.on`（遊戲類型/語言/平台複選）、`.genre-tab.on`（類型分組頁籤）、`.sortc.on`（排序列）三種可點選晶片各自有不同的選中樣式（前兩種是純色實心填滿、後者是幾乎看不見的 1px 內陰影），統一改成同一套「淡色底＋色框＋外發光」語言：
- 三者都改成 `background:rgba(色,.15)` 淡色底＋同色系邊框＋同色系文字＋雙層 `box-shadow` 外發光（真正的「點亮」效果，取代原本純色塊或幾不可見的內陰影）
- 各自沿用原本的識別色（genre-chip／sortc 維持青色 `#00e5ff`，genre-tab 維持紫色 `#7c4dff`），不引入新色系
- `genre-tab.on b`（頁籤內的粗體計數文字）同步從白色改成跟隨紫色，未選中時維持青色標示（`:not(.on) b`），與新配色一致
- `.sortc` 補上 `transition`，讓點亮效果有淡入動畫，跟另外兩種晶片一致
- 純顯示用的標籤（`.bk`／`.bk-cat-*` 收藏卡片分類色條）不是可點選項目，這次不動

### 影響檔案
- docs/index.html / docs/GameVault_v02_17_index.html
- docs/sw.js

### GS 版本
- 無（純前端視覺調整）

### PWA 快取
- CACHE_NAME: gamevault-v02-16 → gamevault-v02-17

### 對應備份
- _internal/old/v02_16/



## v02.16 (2026-07-25)

### 變更內容
「📋 欄位區塊顯示設定」畫面改成矩陣勾選表，取代 v02.15 的分類手風琴（依使用者參考 Steam「成人內容偏好設定」矩陣版面的要求調整）：
- 橫排＝8 大分類（用既有 `CAT_META[cat].icon` 當欄頭圖示，節省手機寬度，長按/title 可看分類全名），直排＝欄位區塊
- 分類沒有的區塊該格留空、不放核取方塊（例如遊戲那欄的「出版資訊」格是空的）
- 新增 `_allGroupsMasterOrder()` 動態算出直排的區塊順序（依 8 分類掃過去、聯集去重），不手動維護清單
- 資料層（`cfg.groupHiddenByCat`／`isGroupHidden`／`grpVisToggle`／舊格式遷移）完全沿用 v02.15，這次純粹是渲染方式改變，各分類獨立設定的行為不變
- 移除 v02.15 新增但這次改版後不再使用的 `.grpvis-cat` 手風琴 CSS（自己造成的孤兒樣式一併清掉）

自我檢查：資料層重跑既有驗證（分類獨立性等）確認未被這次改動波及；新增 11 項驗證聚焦矩陣渲染邏輯本身，包含 master order 無重複／完整涵蓋所有分類實際區塊／不含幽靈項目，以及「留空 vs 放核取方塊」判斷（遊戲欄的出版資訊格應留空、書籍欄應有勾選框）等關鍵情境，全數通過。

### 影響檔案
- docs/index.html / docs/GameVault_v02_16_index.html
- docs/sw.js

### GS 版本
- 無（純前端畫面調整）

### PWA 快取
- CACHE_NAME: gamevault-v02-15 → gamevault-v02-16

### 對應備份
- _internal/old/v02_15/




## v02.15 (2026-07-25)

### 變更內容
「📋 欄位區塊顯示設定」改為依 8 大分類各自獨立設定，取代原本「所有分類共用同一開關」的扁平清單：
- UI 改成依分類分組的手風琴（`<details>`／`<summary>`，沿用既有 `.abbr-legend` 樣式模式），點分類名稱展開才看到該分類實際有的欄位區塊，沒有的區塊不會出現核取方塊
- 每個分類的欄位區塊清單改用現有 `groupsFor()`／`SUBTYPE_META` 動態取得（4 個拆表分類取所有子類型聯集），不再手動維護扁平清單
- 儲存格式從 `cfg.groupHidden`（扁平陣列）改為 `cfg.groupHiddenByCat`（依分類分開存），各分類的同名區塊（例如「識別資訊」）開關互相獨立——遊戲的識別資訊可以只隱藏遊戲的，書籍不受影響
- 新增 `_migrateGroupHiddenLegacy()` 一次性遷移：v01.01～v02.14 期間存的舊格式資料，依「該分類是否真的有這個區塊」拆分轉入新格式，避免升級當下使用者已隱藏的區塊突然變回顯示；遷移邏輯放在 `_groupHiddenSet()` 內觸發（冪等），不管使用者升級後先開表單、詳情頁或設定頁都會正確套用，不依賴一定要先打開設定頁

自我檢查：直接從正式原始碼抽取真實函式與資料（非另外重寫邏輯）跑了 31 項驗證，涵蓋子類型聯集正確性（含刻意驗證書籍分類是「書籍資訊」而非「識別資訊」、數位下載版子類型沒有「估值資訊」等細節）、分類間互不干擾、多筆累積隱藏、舊格式遷移＋冪等性、resetAll 清空等情境，全數通過。

### 影響檔案
- docs/index.html / docs/GameVault_v02_15_index.html
- docs/sw.js

### GS 版本
- 無（純前端邏輯調整）

### PWA 快取
- CACHE_NAME: gamevault-v02-14 → gamevault-v02-15

### 對應備份
- _internal/old/v02_14/
