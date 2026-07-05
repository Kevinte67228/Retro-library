## v49.04 (2026-07-05)

### 變更內容
數位下載版建檔方式全新設計，捨棄原本一律套用遊戲導向邏輯的做法，改依子類型分組：
- **下載版遊戲、追加下載內容**（3顆）：圖片辨識、商店連結、手動建檔——維持原本遊戲導向邏輯不變
- **電子書（漫畫/畫冊/攻略/雜誌，4種）**（4顆，新增一顆）：圖片辨識、**ISBN查詢（新）**、商店連結、手動建檔
  - ISBN查詢借用「商品編碼」卡，直接沿用書籍分類現成的 ISBN 資料庫查詢邏輯（openBD/樂天/NDL/OpenLibrary/GoogleBooks），電子書常與紙本共用 ISBN
- **數位音源、數位影音**（各3顆）：圖片辨識、商店連結、手動建檔
- **修正「商店連結」的 AI prompt**：原本無論什麼子類型都問「這是哪一套遊戲」「developer/genre」，現依子類型分四組文案（遊戲/電子書/音源/影音各自的判斷語句與應填欄位）
- **修正 `_inferStoreFromUrl`**：原本完全沒有 BookWalker、DLsite 判斷（會一律歸類「其他」），現已加入；同時將 PSN/Xbox Store 更新為 PlayStation Store/Microsoft Store，與 v46.01 的商店清單命名一致
- 建檔方式按鈕顯示邏輯抽成 `_refreshMethodButtons()`，子類型變更時（openSubtypePicker）即時重新判斷要不要顯示 ISBN 查詢卡

### 影響檔案
- index.html / GameVault_v49_04_index.html
- sw.js

### GS 版本
- 無（純前端建檔流程與 AI prompt 調整）

### PWA 快取
- CACHE_NAME: gamevault-v49-03 → gamevault-v49-04

### 對應備份
- _internal/old/v49_03/

## v49.03 (2026-07-05)

### 變更內容
公仔/模型、原聲帶的「商品編碼」建檔模式文案與查詢邏輯修正（六顆建檔按鈕結構不變，通用輸入方式）：
- 新增依子類型分組文案：公仔的比例模型/可動模型/黏土人/組裝模型走 JAN碼／型號文案；景品/GK雕像文案改為「通常無標準編碼，建議優先用圖片辨識或手動建檔」
- 原聲帶的原聲帶/單曲/角色歌曲/廣播劇CD走商品番號文案；演唱會音源/其他改為「可能無標準編碼」提示
- **修正查詢邏輯**：動漫/美術設定集、公仔、原聲帶先前輸入編碼後會誤走遊戲的交叉比對資料庫（找不到任何結果），現改比照主機/週邊模式，直接用 AI 依編碼填欄
- 原聲帶輸入的商品番號正確寫入 `catalog_number` 專屬欄位，不再誤填進通用 `code` 欄位（純編碼模式與編碼+照片組合模式皆已修正）

### 影響檔案
- index.html / GameVault_v49_03_index.html
- sw.js

### GS 版本
- 無（純前端邏輯與文案修正）

### PWA 快取
- CACHE_NAME: gamevault-v49-02 → gamevault-v49-03

### 對應備份
- _internal/old/v49_02/

## v49.02 (2026-07-05)

### 變更內容
動漫/美術設定集 AI 圖片辨識規格改版，不再沿用遊戲的通用版本：
- 新增 ARTBOOK_AI_SPEC，依 8 子類型各自訂做 role／欄位／限制規則（如漫畫多問集數、動畫影集限定 binding 只能 Blu-ray/DVD、同人誌的社團名稱只在確定是同人誌才填、原畫集不強求條碼等）
- 新增 `_aiSpecFor(cat,subtype)` 統一取得入口，動漫/美術設定集依子類型分派，其餘分類沿用原本的 AI_CAT_SPEC，比照 `_catMeta` 模式
- 修正「商品編碼」建檔模式的文案漏洞：動漫/美術設定集原本會掉進遊戲的預設文案（顯示「查詢遊戲資料庫」「CUSA-00001」），現依子類型分兩組正確文案（漫畫/畫冊/設定集/雜誌走 ISBN 書號；動畫影集/電影走 BD/DVD 商品編碼）
- 自我檢查：8 組子類型的 AI 規格欄位皆已驗證存在於對應欄位表中

### 影響檔案
- index.html / GameVault_v49_02_index.html
- sw.js

### GS 版本
- 無（純前端 AI 規格與文案調整）

### PWA 快取
- CACHE_NAME: gamevault-v49-01 → gamevault-v49-02

### 對應備份
- _internal/old/v49_01/

## v49.01 (2026-07-05)

### 變更內容
原聲帶／動漫美術設定集／公仔 三個分類整個重新規劃，比照數位下載版模式依子類型拆表：
- **原聲帶**（5子類型）：原聲帶/主題曲單曲/角色歌曲印象集/廣播劇CD/演唱會音源其他，各自量身欄位（如角色歌曲多了角色名稱/聲優，廣播劇CD多了聲優陣容/腳本，演唱會多了會場/演出日期/演出者）
- **動漫/美術設定集**（8子類型）：漫畫單行本/畫冊插畫集/設定集公式資料集/原畫集分鏡集/雜誌MOOK同人誌/動畫影集/動畫電影劇場版/周邊其他，各自量身欄位（如漫畫多了集數，動畫影集/電影多了製作公司/集數或片長/載體格式，同人誌多了社團名稱）
- **公仔/模型**（6子類型）：比例模型/可動模型/黏土人Q版/景品一番賞/組裝模型/GK雕像，各自量身欄位（如比例模型多了比例材質原型師，景品多了賞別活動名稱，GK雕像多了限定編號）
- 三個分類的 `_catMeta` 皆改為依子類型動態分派 fields/selects/groups/gcol/defaults，比照數位下載版的 DIGITAL_SUBTYPE_META 模式
- 收藏卡片中段說明文字也改依子類型顯示對應資訊
- GS 後端新增 19 個獨立工作表，取代原本各分類只有一張表的設計，`resolveType()` 依 category+subtype 分派
- 新增 6 個一次性遷移工具（migrateOst/Artbook/FigureToSubtypeSheets + 對應 delete 函式），供使用者手動於 Apps Script 執行搬移舊資料
- 自我檢查：19 組前端欄位 100% 對應各自後端欄位表；resolveType 分派邏輯全數驗證通過；三分類子類型清單與分派表完全一致

### 影響檔案
- index.html / GameVault_v49_01_index.html
- sw.js
- GameVault_AppsScript.gs（**需使用者手動貼到 Apps Script 編輯器**）

### GS 版本
- v48 → v49（新增 19 個子類型獨立工作表與欄位表，resolveType/getSheet/listAll/findRowByUuid/fixSheetHeaders/backfillUuids/collectUsedImgIds_ 皆同步更新，並新增對應一次性遷移工具）

### PWA 快取
- CACHE_NAME: gamevault-v48-01a3 → gamevault-v49-01

### 對應備份
- _internal/old/v48_01a3/

