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

## v44.01 (2026-07-04)

### 變更內容
原聲帶欄位大幅擴充（Audio Vault）：
- 原聲帶子類型新增 5 項：原聲帶、主題曲／單曲、角色歌曲／印象集、廣播劇CD、演唱會音源／其他（沿用 v42.22 已建好的子類型選擇流程）
- 新增欄位：商品番號（catalog_number，日盤 CD 最關鍵的版本識別依據）、版本屬性（edition_type：初回限定盤/通常盤/完全生產限定盤）、側標狀態（obi_status：有側標/無側標(遺失)/未拆封）、購入管道（purchase_channel）、台幣實付含運費（local_cost）、特典附錄（bonus_items）
- 「媒體格式」更名「載體格式」，選項更新為 CD/黑膠唱片/卡帶/數位高解析音檔/其他
- composer 欄位標籤擴大為「作曲／演出者」，涵蓋演唱者/聲優
- related_work 欄位標籤改為「作品／IP名稱」，與動漫/美術設定集一致
- AI 辨識規格同步更新，並明確要求 catalog_number 沒把握時留空、不可推測捏造
- GS 後端 OST_HEADERS 同步擴充新欄位，避免重演先前發現的欄位靜默丟棄問題（已自我檢查前端欄位 100% 對應後端）

### 影響檔案
- index.html / GameVault_v44_01_index.html
- sw.js
- GameVault_AppsScript.gs（**需使用者手動貼到 Apps Script 編輯器**）

### GS 版本
- v43 → v44（OST_HEADERS 新增 subtype/catalog_number/edition_type/obi_status/purchase_channel/local_cost/bonus_items 共 7 個欄位）

### PWA 快取
- CACHE_NAME: gamevault-v43-01 → gamevault-v44-01

### 對應備份
- _internal/old/v43_01/

## v43.01 (2026-07-04)

### 變更內容
動漫/美術設定集欄位大幅擴充 + GS 後端分表：
- 動漫/美術設定集子類型改為 8 項：漫畫／單行本、畫冊／插畫集、設定集／公式資料集、原畫集／分鏡集、雜誌／MOOK／同人誌、動畫影集、動畫電影／劇場版、周邊／其他
- 新增欄位：作品／IP名稱（沿用 related_work 改名）、集數／卷數（volume）、語言／字幕（language）、品況（condition，專屬列舉：全新未拆／近全新／良好／有瑕疵）、購入管道（purchase_channel）、台幣實付含運費（local_cost）
- 「裝訂方式」擴大為「載體格式」（binding 欄位重新定義選項：平裝書/精裝書/Blu-ray/DVD/CD/數位版），涵蓋出版品與影音媒體
- 購買狀態（collect_status）改為專屬列舉：願望清單／已預購／運送中／已入庫
- 數位下載版新增「類型」（subtype）欄位進表單（v42.22 已有選擇流程，這次補進 FIELDS 讓可編輯/顯示）
- **發現並修正資料遺失風險**：GS 後端 `resolveType()` 先前把數位下載版/原聲帶/動漫美術設定集/公仔全部路由到 Games 工作表的 `GAME_HEADERS`，分類專屬欄位（如 illustrator/binding/composer/character 等）不在該表中，儲存時會被靜默丟棄
- GS 後端新增 Digital／OST／Artbook／Figures 四個獨立工作表與對應完整欄位表，四分類皆改用各自欄位表，欄位不再被丟棄
- 新增一次性遷移工具 `migrateLegacyCategoriesToNewSheets()` / `deleteLegacyMigratedRowsFromGames()`，供使用者手動於 Apps Script 執行，把原本混在 Games 表的舊資料搬到新工作表（僅能救回原本有存到的欄位）

### 影響檔案
- index.html / GameVault_v43_01_index.html
- sw.js
- GameVault_AppsScript.gs（**需使用者手動貼到 Apps Script 編輯器**）

### GS 版本
- v42 → v43（新增 Digital/OST/Artbook/Figures 四個工作表與欄位表，resolveType/getSheet/listAll/findRowByUuid/fixSheetHeaders/backfillUuids/collectUsedImgIds_ 皆同步更新）

### PWA 快取
- CACHE_NAME: gamevault-v42-22 → gamevault-v43-01

### 對應備份
- _internal/old/v42_22/

## v42.22 (2026-07-04)

### 變更內容
分類架構改版：
- 「數位遊戲」更名為「數位下載版」；新增子類型（下載版遊戲／電子書-攻略／電子書-漫畫／電子書-畫冊／電子書-美術設定／電子書-雜誌／動畫／原聲帶／其他）
- 「畫集」更名為「動漫/美術設定集」，取代原畫集分類；新增子類型（漫畫／動畫／美術書／設定集／其他）
- 子類型視為可獨立篩選/統計的次分類，顆粒度比照四大分類（新增 SUBTYPE_META 單一事實來源，比照 CAT_META 模式）
- Step1 第二排分類卡片順序調整為：動漫/美術設定集 → 公仔/模型 → 原聲帶 → 數位下載版
- 新增「選擇類型」步驟（僅上述兩分類顯示），沿用平台選擇器（openPlatPicker）bottom-sheet 元件，新增 customSrc/title 參數支援重用
- catInternal() 新增舊分類值別名對應（數位遊戲/畫集/設定集），既有收藏資料自動歸類到新分類，不改寫試算表資料（邏輯遷移，非物理遷移）
- 欄位表單（AI 辨識 schema 等）維持沿用現有數位遊戲/畫集規格，留待下一階段依子類型細化

### 影響檔案
- index.html / GameVault_v42_22_index.html
- sw.js

### GS 版本
- 無（純前端分類架構調整，不動後端與試算表資料）

### PWA 快取
- CACHE_NAME: gamevault-v42-20a1 → gamevault-v42-22

### 對應備份
- _internal/old/v42_20a1/（同時作為使用者要求的永久備份，往後 5 版輪替清理時排除）

