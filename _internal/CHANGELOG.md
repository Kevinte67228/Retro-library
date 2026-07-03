## v42.20a1 (2026-07-03)
- 修正 GS 後端 fetchStorePageProxy 快取鍵碰撞 bug：舊版用 base64 截斷前 40 碼當快取鍵，Steam 等共同前綴超過 30 bytes 的網址會算出同一把鍵，導致貼任何 Steam 連結都回傳第一次快取的結果（使用者回報一直顯示 Watch_Dogs 2）；改用 MD5 雜湊整個網址內容，已用實際網址驗證修法有效。純 GS 修正，前端無變動，需手動部署 GS

## v42.20 (2026-07-03)

### 變更內容
盤點報告批次 3（M4-M7 / L5；L3 依既有註解決策保留不移除）：
- M7：cfg 持久化統一——新增 _persistCfg()（全量）與 _persistCfgKeys(patch)（部分合併，避免過期記憶體覆蓋其他欄位）兩個共用入口，取代 9 處分散的 localStorage 直寫（slPersist/acPersist/cmPersist/匯入設定/saveCfg/fx/region/建檔記憶）
- M4：篩選面板 facet 依分類過濾——__condition/__complete/__todo 三個永遠有 fallback 值的虛擬 facet 加 notCats:['數位遊戲']，選數位遊戲時不再顯示無意義的品相/完整度篩選；欄位型 facet 原本就會依「範圍內有無值」自動隱藏，不需額外處理
- M5：商店連結抓取失敗訊息加「✏️ 改用手動建檔（保留此網址）」按鈕，一鍵切換並將網址帶入 ref_link、自動推斷商店
- M6：14 處動態產生的 <img> 補齊 alt 屬性（預覽圖補描述文字、裝飾縮圖補空 alt）
- L5：Service Worker 註冊加 updatefound 監聽，新版本安裝完成時 toast 提示重新整理更新
- L3：GS search action 經查程式碼已有註解標明「刻意保留供手動 GET 測試」，屬既有決策，保留不移除（避免為 Low 項目強迫手動重新部署 GS）

### 影響檔案
- index.html / GameVault_v42_20_index.html
- sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: gamevault-v42-19 → gamevault-v42-20

### 對應備份
- _internal/old/v42_19/

## v42.19 (2026-07-03)

### 變更內容
盤點報告批次 2（M2+M3，投資報酬率最高的重構）：
- 建立 CAT_META 分類中繼資料單一事實來源：8 分類的欄位五件套（fields/selects/groups/gcol/defaults）、配色、圖示、詳情副標欄位全部一處註冊
- fieldsFor/selectsFor/groupsFor/gcolFor/defaultsConstFor 五個分派函式從 if-chain 改為查表（各 9 行 → 1 行）
- _relCatColor、儀表板 catColors、detailHeroHtml 七層巢狀三元圖示/副標、收藏卡片圖示鏈全部改查 CAT_META
- 分類 if-chain 判斷從 113 處降至 58 處；剩餘為各分類邏輯真正不同的合理分支（儀表板模型/卡片標籤/AI prompt），刻意保留不硬塞查表
- 根治 v42.15~17 連續三版「新增分類後某處漏更新」的系統性問題：未來新增分類只需在 CAT_META 註冊一筆＋定義五件套常數

### 影響檔案
- index.html / GameVault_v42_19_index.html
- sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: gamevault-v42-18 → gamevault-v42-19

### 對應備份
- _internal/old/v42_18/

## v42.18 (2026-07-03)

### 變更內容
盤點報告批次 1（H1-H3 / L1 / L2 / L4 / M1 部分）：
- 新增共用防連點守衛 _btnGuard/_btnRelease，套用至 digitalLinkFetch（商店連結抓取）、updateFxLive（匯率更新）、clearAll（清除資料）、loadSamples（樣本匯入）四個實際有風險的按鈕；盤點清單中 saveCfg/huntLensToHunt/downloadManual/toggleHelp 經人工複核為純本地操作誤判，不需防護
- AI_CAT_SPEC 補上「數位遊戲」條目（v42.14a6 開放圖片辨識入口後的規格缺口），數位遊戲截圖辨識欄位（store/platform 等）現在對得上
- 收藏頁總計列加右緣 fade 遮罩提示可橫向捲動，捲到底自動消失
- 移除死函式 barShowManual、孤兒 CSS .ec-card-full 系列
- 3 個 <40px 觸控目標按鈕統一調至 40px

### 影響檔案
- index.html / GameVault_v42_18_index.html
- sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: gamevault-v42-17 → gamevault-v42-18

### 對應備份
- _internal/old/v42_17/
