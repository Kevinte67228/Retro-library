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

## v42.20a1-revert (2026-07-03)

### 變更內容
使用者要求回滾 v42.21（移除原聲帶/畫集/公仔分類、數位遊戲與電子書改為第7種建檔方式）。前端還原至 v42.20a1 狀態（8 分類架構、數位遊戲為 Step1 獨立分類）。GS 後端完全未受 v42.21 影響，快取碰撞修正（v42.20a1）維持有效，不需重新部署 GS。v42.21 的完整程式碼已備份於 _internal/old/v42_21/，若之後想拿回來可還原。

### 影響檔案
- index.html / GameVault_v42_20_index.html
- sw.js

### GS 版本
- 無變動（v42.20a1 的 MD5 快取修正持續有效）

### PWA 快取
- CACHE_NAME: gamevault-v42-21 → gamevault-v42-20a1

### 對應備份
- _internal/old/v42_21/（回滾前的 v42.21 完整備份）

## v42.21 (2026-07-03)

### 變更內容
重大架構調整：移除原聲帶/畫集/公仔三個分類；「數位遊戲」從獨立 Step1 分類降階為「遊戲」分類專屬的第 7 種建檔方式；新增「電子書」作為「書籍」分類專屬的第 7 種建檔方式
- Step1 分類卡片改回 4 張（遊戲/書籍/主機/週邊），移除原聲帶/畫集/公仔/數位遊戲卡片
- Step4 建檔方式：商品條碼/商品編碼/圖片辨識/手動建檔/條碼＋照片/編碼＋照片 6 種恆常顯示（不再依分類隱藏）；「數位遊戲」卡片只在選了「遊戲」分類時出現，「電子書」卡片只在選了「書籍」分類時出現，兩者皆為滿版橫幅樣式且互斥顯示，不論哪個出現都撐滿整排、對齊其餘 6 張卡片
- 新增 ELECBOOK_FIELDS 電子書欄位五件套（作者/系列/購入平台/購入帳號/取得方式/類型/格式等），CAT_META 註冊，不含條碼/品相/保管位置/估值（比照數位遊戲無實體概念）
- 新增電子書建檔流程：initEbookLinkMode/ebookLinkFetch/_inferBookStoreFromUrl/ebookLinkToManual，共用同一支 GS fetchStorePageProxy 後端（無需異動 GS），商店推斷涵蓋 Kindle/Kobo/BookWalker/Readmoo/Google Play 圖書/Apple Books
- 點擊「數位遊戲」／「電子書」卡片時強制覆寫 _selectedType 為對應分類（不沿用 Step1 選的遊戲/書籍），確保實際儲存的分類正確
- 移除三個分類的所有相關程式碼：欄位五件套、CAT_META 登記、catInternal 別名、AI_CAT_SPEC、COMP_COMPONENTS、卡片標籤 CSS/邏輯、收藏頁統計格、統計頁下拉選單與儀表板模型、FACETS 排除清單
- 收藏頁總計列統計格數位遊戲/電子書分類正確計數；統計頁下拉選單與 catMap 同步更新

### 影響檔案
- index.html / GameVault_v42_21_index.html
- sw.js

### GS 版本
- 無（電子書流程共用既有 fetchStorePageProxy，無需異動 GS）

### PWA 快取
- CACHE_NAME: gamevault-v42-20 → gamevault-v42-21

### 對應備份
- _internal/old/v42_20/

