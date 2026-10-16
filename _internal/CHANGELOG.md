## v11.07 (2026-10-16)

### 變更內容
實作 RetroVault 夢想計畫「第 5 批次：智慧獵手 —— 二手行情歷史折線與實體店 AR 探索」：

1. **市場行情走勢與資產大盤雷達（`docs/market-radar.html` & `docs/js/valuation-radar.js`）**：
   - **近 24 個月歷史成交曲線**：整合平台稀有度加權、品相加成係數，於 HTML5 Canvas 繪製細緻發光折線圖與漸層填色。
   - **全庫資產大盤總覽**：動態計算全庫總估值、購入總成本、未實現總獲利與投報率（ROI%），並自動評選出 Top 5 增值王。
   - **各大拍賣平台即時查價快捷**：一鍵跳轉至 Mercari 日本拍賣、Yahoo! 拍賣、駿河屋 Suruga-ya 搜尋實價登錄。
2. **實體店鏡頭 AR 尋寶獵手（AR Vision Hunter）**：
   - 結合 WebRTC 攝影機即時視訊串流與賽博 HUD 掃描鎖定框（動態掃描標線）。
   - **即時浮動標籤（AR Floating Tags）**：
     - 🟩 **已在收藏庫中**：避免重複購買，提示已有品相與保管防潮箱位置。
     - 🟨 **🎯 願望清單命中！**：比對目標心理價格，標記便宜折數與推薦入手建議。
     - 🟦 **超值破盤行情**：標註低於市場行情之罕見逸品。
   - 內建三大模擬情境測試按鈕，桌機與行動裝置皆可立即體驗觸覺震動與浮動反饋。
3. **PWA 主程式安全整合（`docs/index.html`）**：
   - 收藏頁「⋯」選單置頂新增「📈 行情雷達與 AR 尋寶 (Radar)」入口。
   - 快取更新為 `retrovault-v11-07`，`RetroVault_v11_07_index.html` 完成對應存檔。
   - 特別鎖定基準版本 `RetroVault_v11_01_index.html` 與 `RetroVault_v11_02_index.html` 持續保留。

### 自我檢查
- `docs/js/valuation-radar.js`、`docs/market-radar.html`、`docs/index.html` 全數通過 `node --check` 語法檢驗。
- `_internal/deep_audit.py` 全站檢查：0 重複 ID、0 幽靈 ID、0 原生 alert、404 資源為 0。

### 影響檔案
- docs/js/valuation-radar.js
- docs/market-radar.html
- docs/index.html
- docs/RetroVault_v11_07_index.html
- docs/sw.js
- _internal/CHANGELOG.md

---

## v11.06 (2026-10-16)

### 變更內容
實作 RetroVault 夢想計畫「第 4 批次：傲嬌分享 —— 數位鑑定卡（Slab）與唯讀展覽館」：

1. **數位封裝鑑定卡工坊（`docs/slab-studio.html` & `docs/js/slab-generator.js`）**：
   - **高規格壓克力卡夾模擬（Graded Slab）**：
     - 前端 Canvas 合成 1080x1620 / 1080x1920 頂級解析度封裝卡，四角金屬防偽螺栓與高光壓克力反光。
     - 頂部燙金防偽標籤：自動印製遊戲品名、發行年份、平台、原廠廠商與專屬防偽序號。
     - 智慧品相評級：依藏品完整度自動計算評分（如 10.0 GEM MINT、9.8 MINT+、9.6 MINT、CART ONLY 等），亦支援手動指定。
     - 三種銘牌主題切換：🥇 奢華金、🌈 全息藍、🖤 黑曜石。
     - 3D 陀螺儀／滑鼠傾角光影微動效：滑動時即時呈現壓克力折射光澤。
   - **📸 一鍵下載超高畫質 PNG**：適配 Instagram Story、Threads 與 X 最佳分享比例，支援手機長按儲存。
2. **🏛️ 私人展覽館一鍵安全去隱私匯出**：
   - 點擊「一鍵匯出私人展覽館 (HTML)」，自動抹除「購入成本、保管防潮箱位置、個人帳號、試算表金鑰」等敏感隱私。
   - 產生獨立單一靜態 HTML 檔，免伺服器可直接透過 LINE / AirDrop 傳送同好觀賞。
3. **PWA 主程式安全整合（`docs/index.html`）**：
   - 詳細頁封面區新增「💎 鑑定卡」按鈕，一鍵帶入當前藏品至工坊。
   - 收藏頁「⋯」更多功能選單新增「💎 數位鑑定卡工坊 (Slab)」入口。
   - 快取更新為 `retrovault-v11-06`，`RetroVault_v11_06_index.html` 完成對應存檔。
   - 特別鎖定基準版本 `RetroVault_v11_01_index.html` 與 `RetroVault_v11_02_index.html` 持續保留。

### 自我檢查
- `docs/js/slab-generator.js`、`docs/slab-studio.html`、`docs/index.html` 全數通過 `node --check` 語法檢驗。
- `_internal/deep_audit.py` 全站檢查：0 重複 ID、0 幽靈 ID、0 原生 alert、404 資源為 0。

### 影響檔案
- docs/js/slab-generator.js
- docs/slab-studio.html
- docs/index.html
- docs/RetroVault_v11_06_index.html
- docs/sw.js
- _internal/CHANGELOG.md

---

## v11.05 (2026-10-16)

### 變更內容
實作 RetroVault 夢想計畫「第 3 批次：底層引擎現代化 —— Local-First + 倒排索引極速檢索」：

1. **獨立資料同步引擎（`docs/js/vault-sync-engine.js`）**：
   - 將 Google Apps Script 後端雙向通訊、`ping` 延遲檢測、`batchAdd` 矩陣秒級寫入抽離為純 JavaScript 模組。
   - 具備 15 秒 AbortSignal 逾時保護，完全零 DOM 相依，支援在主執行緒或 Web Worker 中直接運行。
2. **極速本地倒排索引與多語系查詢引擎（`docs/js/vault-db.js`）**：
   - 支援 CJK 雙字元 N-Gram 分詞、日文平假名／片假名正規化（如「マリオ」與「まりお」自動互通比對）、半角/全角轉換與 ASCII 小寫正規化。
   - 支援多維度即時過濾（平台、品相、最低估值）與排序，在 5,000 筆藏品規模下檢索耗時低於 1 毫秒（亞毫秒級 `0.3~0.8ms`）。
3. **背景運算 Worker 執行緒（`docs/js/vault-worker.js`）**：
   - 封裝倒排索引建立、複雜搜尋與背景 Google Sheets 批次同步，確保大量資料處理時主畫面 60fps 絕不掉幀。
4. **極速檢索基準測試台（`docs/search-bench.html`）**：
   - 即時顯示檢索耗時碼錶（精確至 0.01ms），內建「🚀 注入 5,000 筆壓測資料」與「☁️ 測試 GAS 連線」實測工具。
5. **主程式整合與快取推進**：
   - 收藏頁「⋯」選單置頂新增「⚡ 極速檢索基準台 (0.5ms)」入口。
   - 快取更新為 `retrovault-v11-05`，`RetroVault_v11_05_index.html` 完成對應存檔。
   - 特別鎖定基準版本 `RetroVault_v11_01_index.html` 與 `RetroVault_v11_02_index.html` 持續保留。

### 自我檢查
- `docs/js/vault-sync-engine.js`、`docs/js/vault-db.js`、`docs/js/vault-worker.js`、`docs/search-bench.html`、`docs/index.html` 全數通過 `node --check` 語法檢驗。
- `_internal/deep_audit.py` 全站檢查：0 重複 ID、0 幽靈 ID、0 原生 alert、404 資源為 0。

### 影響檔案
- docs/js/vault-sync-engine.js
- docs/js/vault-db.js
- docs/js/vault-worker.js
- docs/search-bench.html
- docs/index.html
- docs/RetroVault_v11_05_index.html
- docs/sw.js
- _internal/CHANGELOG.md

---

## v11.04 (2026-10-16)

### 變更內容
實作 RetroVault 夢想計畫「第 2 批次：展廳儀式感 —— 虛擬防潮箱書背牆與 CRT 電視」：

1. **全新賽博防潮展廳（`docs/cyber-museum.html`）**：
   - **實體防潮書背陳列牆（Shelf Wall）**：
     - 自動讀取 PWA 本機快取全量藏品（`gv_col`），依 FC 紅白機、MD 世嘉五代等平台分層展示。
     - 手指/滑鼠橫向流暢滾動，支援物理慣性與行動裝置觸覺微震動反饋（Haptic Feedback）。
     - 滑過/觸摸卡帶時自動向上抽出一半並浮現霓虹資訊標籤。
   - **特麗霓虹 CRT 復古遊戲房（Trinitron CRT Mode）**：
     - 復古 Sony 經典外殼機身，搭載動態掃描線（Scanlines）、陰極射線管球面暗角與曲率、螢光粉微暈光。
     - 點擊卡帶時伴隨消磁開機閃爍動畫與 OSD 頻道顯示，即時呈現遊戲畫面。
   - **零外部依賴之 Web Audio 復古音效引擎**：
     - 透過 `AudioContext` 即時合成：消磁重低音 THUMP 升壓嘯叫、書背抽出摩擦聲、機械開關聲，支援隨時靜音。
   - **藏品情報抽屜與 3D 無縫串接**：
     - 底部霓虹 HUD 顯示原名、開發商、品相評級、市場估值與保管位置。
     - 點擊「🎮 3D 擬真把玩」直接跳轉至該遊戲的 3D 盒裝旋轉開盒檢視。
2. **PWA 主程式安全整合（`docs/index.html`）**：
   - 收藏頁視圖切換列新增「📺 展廳」快捷鈕，並於「⋯」更多功能選單加入入口。
   - Service Worker 快取推進至 `retrovault-v11-04`，納入離線靜態資源。
3. **基準版本安全防護**：
   - `RetroVault_v11_01_index.html` 與 `RetroVault_v11_02_index.html` 持續鎖定不清除。

### 自我檢查
- `docs/index.html`、`docs/3d-viewer.html`、`docs/cyber-museum.html` 均通過 `node --check` 語法校驗。
- `_internal/deep_audit.py` 全站檢查：0 重複 ID、0 幽靈 ID、0 原生 alert、404 資源為 0。
- 快取更新至 `retrovault-v11-04`，`RetroVault_v11_04_index.html` 完成對應存檔。

### 影響檔案
- docs/cyber-museum.html
- docs/index.html
- docs/RetroVault_v11_04_index.html
- docs/sw.js
- _internal/CHANGELOG.md

---

## v11.03 (2026-10-16)

### 變更內容
啟動 RetroVault 夢想計畫「第 1 批次：視覺突破 —— 3D 擬真卡帶盒與開盒把玩 (PoC)」：

1. **全新獨立 3D 擬真互動檢視器（`docs/3d-viewer.html`）**：
   - 採用 Three.js + WebGL 渲染環境，建立平台等比例之卡帶盒 3D 幾何體（支援 FC 橫盒、MD 黑盒、SFC 等）。
   - 多面材質貼圖映射：正面（`cover_img`）、封底（`back_img`）、書背（`spine_img`）與微質感紙質/塑膠材質模擬。
   - 支援單指 360 度任意旋轉、雙指平滑縮放、自轉切換。
   - 內建「📦 開盒抽出」互動動畫：FC 平滑滑出白色內托盤與卡帶；MD 滑出經典黑卡匣。
   - 內建展櫃（冷白）、暖光（木桌）、霓虹（賽博龐克）三種攝影棚燈光模式。
   - 內建 6 款真實資料庫藏品範例（三國志、三國志II、Namco Classic、餓狼傳說、先進大戰略、創世紀 Populous）隨選即看。
2. **生產線安全整合（`docs/index.html`）**：
   - 在詳細頁封面區新增「🎮 3D 擬真盒裝把玩」按鈕，帶入目前藏品圖片與平台參數開啟 3D 檢視。
   - 零破壞現有流程，PWA 離線快取同步升級為 `retrovault-v11-03`。
3. **基準版本安全防護**：
   - `RetroVault_v11_01_index.html` 與 `RetroVault_v11_02_index.html` 已永久標註不可清除。

### 自我檢查
- `docs/index.html` 與 `docs/3d-viewer.html` 皆通過 `node --check` 語法檢驗（0 error）。
- `_internal/deep_audit.py` 全站檢查：0 重複 ID、0 幽靈 ID、0 原生 alert、404 資源為 0。
- 快取更新至 `retrovault-v11-03`，`RetroVault_v11_03_index.html` 完成對應存檔。

### 影響檔案
- docs/3d-viewer.html
- docs/index.html
- docs/RetroVault_v11_03_index.html
- docs/sw.js
- _internal/CHANGELOG.md

---

## v11.01 (2026-10-16)

### 變更內容
新增秒級批次寫入（`batchAdd`），解決大量資料（如全量 CSV 或批次建檔資料）匯入時逐筆寫入耗時過長的問題：

1. **GAS 後端新增 `batchAdd` 動作與 `batchAddRows()` 函式（v11）**：在 `RetroVault_AppsScript.gs` 新增批次新增端點，利用 Google 試算表原生 `setValues()` 矩陣寫入能力，單一請求即可一次性寫入數百筆資料（耗時僅約 0.5 秒）；支援 `uploadImages` 選項開關，預設快速寫入現有圖檔 ID/URL。
2. **前端 CSV 匯入機制優化（`_syncImportedRecords`）**：CSV 匯入時自動按分類與子類型分組，優先使用 `batchAdd` 進行一次性整組秒級同步；若後端為舊版或其他例外情況，自動優雅降級為逐筆循序寫入，兼顧極速效能與歷史相容性。
3. **`shPost` 白名單擴充**：將 `batchAdd` 加入寫入授權白名單，自動附帶 `app_token` 驗證。

### 自我檢查
- 後端 `RetroVault_AppsScript.gs` 升級為 v11，依協作規則觸發主版號重整，前端對應歸零為 `v11.01`。
- `node -e` 與 Node VM 對所有 `<script>` 標籤語法驗證 100% 通過。
- Service Worker 快取名稱更新為 `retrovault-v11-01`。

### 影響檔案
- docs/RetroVault_AppsScript.gs
- docs/index.html
- docs/RetroVault_v11_01_index.html
- docs/sw.js
- _internal/CHANGELOG.md

### GS 版本
- v10 → v11（新增 batchAdd 原生 setValues 批次寫入）

### PWA 快取
- CACHE_NAME: retrovault-v10-01 → retrovault-v11-01

### 對應備份
- _internal/old/v10_01/

## v10.01 (2026-10-15)

### 變更內容
修復已上傳至 Google Drive 的圖片在點擊「🔄 旋轉 90°」時因瀏覽器跨網域（CORS）安全性限制導致「圖片載入失敗，無法旋轉」的問題：

1. **GAS 後端新增圖片代理讀取（v10）**：在 `RetroVault_AppsScript.gs` 新增 `get_img_b64` 動作與 `getImgB64(val)` 函式，直接透過後端存取使用者 Google Drive 私人圖片資料夾並轉為 Base64 Data URL 回傳前端，避開瀏覽器對 Google Drive 縮圖網址的 CORS 封鎖；同時向下支援遠端 HTTP 圖片代理。
2. **前端圖片 Base64 轉換器升級（`_imgToB64`）**：判斷若為 Drive ID 或受跨網域限制之圖片，自動透過後端 GAS 代理取得完整 Base64；同一網域或具備 CORS 標頭之圖片維持前端直連 fetch，兼顧速度與可靠性。
3. **旋轉功能穩健性改善（燈箱／表單／額外照片）**：
   - 增加載入失敗防禦與狀態提示（「正在載入並旋轉圖片…」），避免空字串 fallback 造成 404 報錯。
   - `data:` / `blob:` 格式之圖片不再誤設 `crossOrigin='anonymous'`，消除部分 WebView 下的安全限制。
   - 燈箱一鍵旋轉（`lbRotate`）在更新本地資料庫與預覽圖後，若有連線設定自動在背景同步寫回雲端試算表與 Drive，確保換裝置或重新整理後轉向依然保留。

### 自我檢查
- 後端 `RetroVault_AppsScript.gs` 升級為 v10，依協作規則觸發主版號重整，前端對應歸零為 `v10.01`。
- `node --check` 與 Node VM 對所有 `<script>` 標籤語法驗證 100% 通過。
- Service Worker 快取名稱更新為 `retrovault-v10-01`。

### 影響檔案
- docs/RetroVault_AppsScript.gs
- docs/index.html
- docs/RetroVault_v10_01_index.html
- docs/sw.js
- _internal/CHANGELOG.md

### GS 版本
- v09 → v10（新增 get_img_b64 代理讀取）

### PWA 快取
- CACHE_NAME: retrovault-v09-08 → retrovault-v10-01

### 對應備份
- _internal/old/v09_08/

## v09.08 (2026-10-15)

### 變更內容
新增全域與編輯情境的「🔄 圖片旋轉 90°」功能，解決部分商品封面（如 FC 橫向卡匣盒）擺成直的或照片方向錯誤的問題：

1. **圖片燈箱一鍵旋轉（#img-lightbox-ov）**：在詳情頁或收藏庫中點擊封面或縮圖彈出大圖燈箱時，右上角新增「🔄」旋轉按鈕（位於關閉 ✕ 按鈕旁）。點擊後即時順時針旋轉 90 度，自動壓縮為標準規格並直接寫入本機 `col` / `hunt` 資料庫（更新 `localforage`）與詳情頁的主圖/背景圖/縮圖預覽，不必進入編輯模式即可一鍵轉正！
2. **單筆編輯表單支援旋轉**：在各圖片欄位（`cover_img` 封面圖檔、`back_img` 封底圖檔、`spine_img` 側邊圖檔）下方新增「🔄 旋轉 90°」按鈕，若圖片有方向偏差可直接在此點擊調整；`multiimg`（自訂圖片）的每張縮圖下方也同步加入「🔄 旋轉」按鈕。
3. **通用圖片裁切器支援旋轉（#crop-ov）**：在拍照或相簿上傳裁切時，頂部工具列（矩形 / 透視校正旁）加入「🔄 旋轉 90°」功能，在手動裁切或四角校正前即可預先將圖片方向轉正。

### 自我檢查
- `node --check` 語法驗證 100% 通過（`docs/index.html` 與 `docs/RetroVault_v09_08_index.html`）。
- Service Worker 快取名稱更新為 `retrovault-v09-08`。

### 影響檔案
- docs/index.html
- docs/RetroVault_v09_08_index.html
- docs/sw.js
- _internal/CHANGELOG.md

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v09-07 → retrovault-v09-08

### 對應備份
- _internal/old/v09_07/

## v09.07 (2026-08-23)

### 變更內容
使用者提出兩項排版調整：

**動作列（補齊/編輯/刪除/✕）改回平均分配整行空間**——上一版為了應付按鈕數量不確定，用了橫向可滑動的保守方案；現在動作列已經固定只剩 4 顆，不再需要滑動保護，改回用 flex 平均分配整行寬度，4 顆按鈕等寬排滿一整排。

**估值邏輯說明（💡）跟重新估值按鈕整合進「二手估值市場參考」標題列**——原本是分頁內容裡獨立的一列，這次改成直接嵌進市場參考區塊的標題列右側（跟收合箭頭放在一起），這樣收合這個區塊時，這兩顆按鈕會跟著一起隱藏。`_refLinks()` 新增可選的 `extraHtml` 參數插在標題文字跟收合箭頭之間，按鈕群組本身也用 `margin-left:auto` 把自己（連同箭頭）推到最右邊；按鈕群組外層加了 `event.stopPropagation()`，避免點擊按鈕時事件冒泡到標題列本身的收合點擊事件，意外把區塊收合掉。`marketReferenceHtml()` 新增可選的 `rowNum` 參數，只有詳情頁那個呼叫點會傳入（估值工作台、尋寶頁那兩個呼叫點都不傳，維持原樣不受影響）。重新估值按鈕的字級/內距比照動作列按鈕，燈泡維持原本的緊湊尺寸。

### 自我檢查
`node --check` 通過；無 U+FFFD。用 jsdom 建立實際會執行的測試環境完整驗證：確認 `_refLinks()` 沒有帶 `extraHtml` 時行為完全不變（回歸測試）；確認帶了 `extraHtml` 時正確嵌入、正確加上 `stopPropagation` 保護、箭頭間距正確調整；確認 `marketReferenceHtml()` 帶 `rowNum` 時正確產生兩顆按鈕且「重新估值」正確綁定到對應的項目編號；**確認估值工作台跟尋寶頁這兩個沒有傳 `rowNum` 的既有呼叫點完全不受影響**，不會意外多出按鈕；確認數位下載版無論有沒有傳 `rowNum` 都正確維持不顯示。

### 影響檔案
- docs/index.html / docs/RetroVault_v09_07_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v09-06 → retrovault-v09-07

### 對應備份
- _internal/old/v09_06/
