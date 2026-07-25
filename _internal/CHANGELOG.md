## v02.23 (2026-07-25)

### 變更內容
統計/儀表板頁的原生 `<select>` 下拉選單改成自訂選單，解決「點開後彈出 Android 系統白底選單，跟深色主題完全不搭」的問題：
- 根因：`<select>` 的下拉彈出清單是作業系統原生元件（Android 上就是系統白底 Material 清單），關閉狀態的觸發按鈕可以用 CSS 上色，但打開後的清單本身**無法用 CSS 控制**，這是瀏覽器平台限制，不是漏改樣式
- 修法沿用既有的 `openPlatFldPicker()` 手法（建檔表單選平台時就是這樣做）：select 本身加 `pointer-events:none` 完全失去互動能力（純粹保留當「目前值」的容器，`.value` 讀取邏輯不用改），外面疊一層透明覆蓋層攔截點擊，改開自訂的深色底部選單
- 新增 `openSelectSheet()`／`pickSelectSheetOpt()`／`closeSelectSheet()`：重用既有的 `_showActionSheet()` 底部選單元件（原本用於卡片長按動作選單），直接讀取 select 既有的 `<option>` 清單當選項來源，不用另外重複定義一份；選中項目會標記 ✓ 並用強調色
- 套用範圍：`dash-filter`（篩選分類）／`dash-trend-metric`（趨勢指標）／`dash-trend-time`（趨勢區間）／`dash-donut-mode`（佔比分析方式）共 4 個
- `dash-donut-mode` 原本用 select 自己的 `display:none/''`控制顯示，現在改成外層 wrapper 一起控制（select 現在是 pointer-events:none，只切換它自己的 display 沒意義了）

**範圍說明（重要）**：這次先處理統計頁這 4 個最顯眼的。全站還有更大量的 `<select class="fsel">` 用在建檔表單／尋寶表單等地方（同樣的白底彈窗問題），數量遠比這 4 個多，牽涉到的欄位種類也更雜，要不要套用同一套手法是後續要另外評估的範圍，這次沒有動。

自我檢查：語法/亂碼/CSS 花括號配對通過；用真實抽取的 `openSelectSheet`／`pickSelectSheetOpt` 函式＋輕量 DOM mock 驗證選項讀取完整、目前值正確標記、`onchange` 正確觸發、不存在的 id 不噴錯、特殊字元正確跳脫，12 項全過。另外用結構性比對確認 4 個 `openSelectSheet()` 呼叫的 id 都對應到真實存在的 select 元素。

### 影響檔案
- docs/index.html / docs/GameVault_v02_23_index.html
- docs/sw.js

### GS 版本
- 無（純前端互動/視覺調整）

### PWA 快取
- CACHE_NAME: gamevault-v02-22 → gamevault-v02-23

### 對應備份
- _internal/old/v02_22/


## v02.22 (2026-07-25)

### 變更內容
「統一整個程式碼渲染函式」Phase 4（篩選列＋設定頁），也是這一輪的最後一階段。稽核發現：
- `.facet-opt.on`（篩選面板的選項晶片）是另一個沒被前面幾次抓到的「純色實心填滿」舊寫法（跟最早的 `.genre-chip.on` 一模一樣的問題），這次補上統一發光效果
- `.facet-side`（篩選面板左側分類欄）背景色 `#0b1120`，跟 Phase 2 修過的 `.detail-section` 是同一種顏色漂移，一併對齊成 `#0f1525`
- 修正上面這個顏色調整的連鎖影響：`.facet-side-item.on`（選中的分類項目）原本背景剛好也是 `#0f1525`，跟父層背景統一後兩者變成同一色、選中狀態會失去背景對比；改成 `#141b30`（全站慣用的「比底色亮一階」語言，跟卡片/表單標題列同一色階）維持清楚可辨識
- `.facet-side-item.on` 本身是側邊導覽的「目前選取」指示（背景+左側色條+粗體），語意上比較像導覽列表而非可複選晶片，這次沒有套用外發光語言，維持原本的左側色條指示
- 設定頁清單（市場顯示設定／自訂市場／欄位區塊顯示矩陣）稽核後本來就是原生 `<input type="checkbox">`＋accent-color，跟晶片是不同的互動模式（更接近標準設定列表），沒有「選中却看不清楚」的問題，這次沒有改動

至此 Phase 1-4 稽核到的所有「選中狀態看不清楚」個案（晶片、收藏/尋寶卡片、儀表板 KPI/分頁鈕、篩選面板選項）都已統一成看得見的點亮效果；連帶抓到並修正了 2 處跟表單/詳情頁同一種背景色漂移（`#0b1120`／`#0f1525`）。

### 影響檔案
- docs/index.html / docs/GameVault_v02_22_index.html
- docs/sw.js

### GS 版本
- 無（純前端視覺調整）

### PWA 快取
- CACHE_NAME: gamevault-v02-21 → gamevault-v02-22

### 對應備份
- _internal/old/v02_21/



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
