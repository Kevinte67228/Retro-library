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

## v42.17 (2026-07-02)

### 變更內容
- 統計頁分類篩選下拉選單（dash-filter）只有舊 4 分類選項，新分類完全選不到，已補上數位遊戲/原聲帶/畫集/公仔
- catMap 同步補上四個新分類的對應鍵值；catOf() 改用 catInternal() 正規化，避免分類字串不一致導致誤判
- 新增四個新分類各自的專屬儀表板模型（_dashModel）：
  - 數位遊戲：商店/帳號/含DLC數，購入商店分佈環圖，平台分佈
  - 原聲帶：作曲家/廠牌數，媒體格式環圖，廠牌分佈
  - 畫集：繪師/出版社數，裝訂方式環圖，出版社分佈
  - 公仔：廠牌/角色數，比例分佈環圖，廠牌分佈
  （先前這四類會落到「全部」通用視圖，等於選了也看不到專屬統計）
- 修正 dashCostSummary／dashMarketValueSummary（購入成本／估值總覽卡片）的貨幣分類計數 bug：counts 初始化物件只有舊 4 分類 key，新分類品項的金額有算進總額，但分類明細 chips 被靜默漏掉不顯示

### 影響檔案
- index.html / GameVault_v42_17_index.html
- sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: gamevault-v42-16 → gamevault-v42-17

### 對應備份
- _internal/old/v42_16/

## v42.16 (2026-07-02)

### 變更內容
- 修正收藏頁總計列 bug：updateStats 的 counts 物件只初始化了舊 4 分類的 key，新分類（數位遊戲/原聲帶/畫集/公仔）收藏品完全沒被計入任何分類數字（總計數字正確但分類明細對不上），現已補齊全部 8 分類計數
- 修正分類快速篩選 bug：點擊新分類統計格會被誤判成「平台名稱」篩選（因只認舊 4 分類字串），導致篩選結果永遠空白，已改為 8 分類清單比對
- 總計列改為橫向可捲動（9 個項目已無法用等寬 flex 排下），沿用既有 #sort-bar 的捲動模式
- 收藏卡片列表：新分類補上專屬圖示、中間說明行（數位遊戲顯示商店/平台，原聲帶顯示作曲者/相關作品，畫集顯示繪師/相關作品，公仔顯示角色/系列）、專屬分類標籤與配色；數位遊戲卡片不再顯示不適用的「未評級」品相標籤

### 影響檔案
- index.html / GameVault_v42_16_index.html
- sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: gamevault-v42-15a1 → gamevault-v42-16

### 對應備份
- _internal/old/v42_15/

### 已知待辦
- 統計頁（📊 統計分頁）尚未包含新加入的四個分類，使用者已指出，下次處理
