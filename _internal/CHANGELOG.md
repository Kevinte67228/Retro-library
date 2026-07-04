## v47.01a1 (2026-07-04)
- 數位下載版（8 個子類型）建檔表單預設只展開「圖片紀錄」「識別資訊」，其餘區塊一律預設收折（欄位偏多，避免一次全展開）

## v47.01 (2026-07-04)

### 變更內容
數位下載版整個重新規劃：捨棄單一表格硬塞 8 種子類型的設計，改為每個子類型各自獨立欄位表＋獨立工作表：
- 新增 8 組欄位表：下載版遊戲(DIGIGAME)、追加下載內容(DIGIDLC)、電子書漫畫(DIGICOMIC)、電子書畫冊(DIGIARTBOOK)、電子書攻略(DIGIGUIDE)、電子書雜誌(DIGIMAG)、數位音源(DIGIAUDIO)、數位影音(DIGIVIDEO)，各自只保留該類型真正需要的欄位（例如電子書不再看到遊戲類型/遊戲人數，數位音源改看作曲/發行廠牌/收錄曲數，數位影音改看製作公司/集數/片長）
- 共用「識別資訊表頭」與「商店/檔案/收藏/補充資訊表尾」（store/account/drm_status/file_format/collect_status 等），避免重複定義
- `_catMeta(cat, subtype)` 新增子類型分派：數位下載版依目前選定或資料本身的 subtype 動態決定欄位/選項/群組/顏色/預設值，欄位表單選單改變 subtype 會即時重繪整張表單
- Step1 平台選擇區塊改依子類型判斷是否顯示（只有下載版遊戲／追加下載內容有平台欄位）
- GS 後端新增 DigiGame/DigiDLC/DigiComic/DigiArtbook/DigiGuide/DigiMag/DigiAudio/DigiVideo 八個獨立工作表，`resolveType()` 依 category+subtype 分派，取代原本單一 Digital 表
- 新增一次性遷移工具 `migrateDigitalToSubtypeSheets()` / `deleteDigitalSheetAfterMigration()`，供使用者手動於 Apps Script 執行，把舊 Digital 表資料依子類型搬到 8 個新工作表
- 自我檢查：8 組前端欄位 100% 對應各自後端欄位表；resolveType 分派邏輯全數驗證通過

### 影響檔案
- index.html / GameVault_v47_01_index.html
- sw.js
- GameVault_AppsScript.gs（**需使用者手動貼到 Apps Script 編輯器**）

### GS 版本
- v46 → v47（新增 8 個數位下載版子類型獨立工作表與欄位表，resolveType/getSheet/listAll/findRowByUuid/fixSheetHeaders/backfillUuids/collectUsedImgIds_ 皆同步更新，並新增一次性遷移工具）

### PWA 快取
- CACHE_NAME: gamevault-v46-01 → gamevault-v47-01

### 對應備份
- _internal/old/v46_01/

## v46.01 (2026-07-04)

### 變更內容
數位下載版欄位重新設計（授權與檔案管理導向）：
- 子類型改採「媒體大類＋內容子類」架構，捨棄硬性「電子書-」前綴，改為 8 項：下載版遊戲、追加下載內容、電子書（漫畫／單行本）、電子書（畫冊／美術設定）、電子書（攻略／公式書）、電子書（雜誌／MOOK）、數位音源、數位影音
- 新增欄位：數位識別碼（digital_id，商店URL後綴或平台ID如Steam AppID）、版權限制（drm_status：綁定平台App/DRM-Free）、檔案格式（file_format）、存放位置（file_storage_location：雲端硬碟/本地NAS/主機內建/SD卡/未備份）、兌換碼／序號（redemption_key）
- 新增「檔案資訊」欄位群組，「下載容量」更名「檔案大小」並移入此群組
- 所屬平台／商店清單更新為 Nintendo eShop／PlayStation Store／Microsoft Store／Steam／Epic Games／BookWalker／DLsite／其他（取代 PSN/Xbox Store 舊稱，並新增 BookWalker/DLsite）
- 詳情頁 KPI 新增「版權限制」顯示；收藏卡片 DRM-Free 商品會顯示綠色標籤
- AI 辨識規格同步更新商店清單，並要求 digital_id 沒把握就留空、不可推測捏造
- GS 後端 DIGITAL_HEADERS 同步擴充新欄位，自我檢查前端欄位 100% 對應後端

### 影響檔案
- index.html / GameVault_v46_01_index.html
- sw.js
- GameVault_AppsScript.gs（**需使用者手動貼到 Apps Script 編輯器**）

### GS 版本
- v45 → v46（DIGITAL_HEADERS 新增 digital_id/drm_status/file_format/file_storage_location/redemption_key 共 5 個欄位）

### PWA 快取
- CACHE_NAME: gamevault-v45-01 → gamevault-v46-01

### 對應備份
- _internal/old/v45_01/

## v45.01 (2026-07-04)

### 變更內容
公仔/模型欄位大幅擴充（立體收藏規範）：
- 公仔子類型新增 6 項：比例模型、可動模型、黏土人／Q版、景品／一番賞、組裝模型、GK雕像
- 新增欄位：原型師／塗裝師（sculptor）、商品尺寸（dimensions）、購入管道（purchase_channel）、台幣實付含運費（local_cost）
- **盒況與本體狀態分開評級**：新增盒況（box_condition：全新未拆封/有壓痕微損/嚴重盒損/無盒已丟棄）與本體狀態（condition：全新未拆MISB/拆封擺設BIB/把玩有輕微痕跡/有缺件斷件）兩個獨立欄位，各自專屬色彩顯示於收藏卡片
- series 欄位標籤改為「作品／IP名稱」，與其他分類一致；storage_location 標籤改為「存放／展示位置」
- brand 標籤明確化為「製造商／發行商」，manufacturer（發售商）維持獨立保留，兩者概念不同不合併
- AI 辨識規格同步新增 sculptor／dimensions 欄位引導
- GS 後端 FIGURE_HEADERS 同步擴充新欄位，自我檢查前端欄位 100% 對應後端

### 影響檔案
- index.html / GameVault_v45_01_index.html
- sw.js
- GameVault_AppsScript.gs（**需使用者手動貼到 Apps Script 編輯器**）

### GS 版本
- v44 → v45（FIGURE_HEADERS 新增 subtype/sculptor/dimensions/box_condition/condition/purchase_channel/local_cost 共 7 個欄位）

### PWA 快取
- CACHE_NAME: gamevault-v44-01 → gamevault-v45-01

### 對應備份
- _internal/old/v44_01/

