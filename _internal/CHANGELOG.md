## v51.01 (2026-07-05)

### 變更內容
上線前資安補強（依盤點報告，僅採納實際成立的項目）：
- GS 寫入驗證：doPost 的 add/update/delete/deleteMany 新增 APP_TOKEN 驗證。後端「指令碼屬性」設定 APP_TOKEN 後啟用；前端設定頁「寫入保護 Token」填相同字串（只存本機、不進公開網頁），未設定則放行以相容。
- 代理密鑰改走 POST body：igdb/gb/mb/tgdb/bl/ss/rakuten×2/market_estimate/google_image 等帶密鑰呼叫原以 GET query 傳送（會進 GAS 執行紀錄），改為 POST body。GS 讀取/代理類 action 抽為共用 dispatchRead，doGet/doPost 皆可分派。
- 前端 shPost 對寫入集中注入 app_token；新增 shGetSecP 相容原串接。
- 未採納誤報項（index/manual/icons「缺檔」實際存在）與過度工程項（單檔模組化重構）。

### 影響檔案
- index.html / GameVault_v51_01_index.html
- sw.js
- GameVault_AppsScript.gs（後端 v50 → v51）

### GS 版本
- v50 → v51（doGet/doPost 重構 + APP_TOKEN 驗證），需重新貼上並部署後端。

### PWA 快取
- CACHE_NAME: gamevault-v50-02a1 → gamevault-v51-01

### 對應備份
- _internal/old/v50_02a1/

## v50.02a1 (2026-07-05)
- 修正 manifest icon 路徑（原指向 repo 根目錄 404 → 改為同源 ./icons/）；清除殘留的 v39.05 版本佔位字串與過時錯誤文案（改為版本無關說法）；_btnGuard 加 typeof event 保護避免非事件情境誤判
## v50.02 (2026-07-05)

### 變更內容
分類由 4 種擴增到 8 種後重新檢視統計呈現，修正「全部」總覽會漏算分類的問題：
- **buildMap 防呆**：中段分佈圖的空值 key（如無平台／無商店的品項）原本會被靜默丟棄，改為歸入「其他」，確保任何分佈圖數字加總都等於總件數
- **「全部」中段圖改為「收藏狀態分佈」**：原本固定顯示「平台分佈」，但原聲帶／設定集／公仔等無平台欄位的品項會整批消失、數字對不上；改用跨分類都適用的收藏狀態（收藏中／願望清單／借出中…），且不與「分類佔比」donut 重複
- **收藏頁統計列「總計」sticky 固定**：8+ 分類橫向捲動時「總計」釘在最左不隨捲動消失
- 單一分類檢視（各自平台／出版社／品牌分佈）維持不變

### 影響檔案
- index.html / GameVault_v50_02_index.html
- sw.js

### GS 版本
- 無（純前端）

### PWA 快取
- CACHE_NAME: gamevault-v50-01 → gamevault-v50-02

### 對應備份
- _internal/old/v50_01/
## v50.01 (2026-07-05)

### 變更內容
尋寶（Hunt）頁面套用新分類子類型，取代原本不管什麼分類都用遊戲主機平台選擇的通用邏輯：
- 尋寶表單新增「類型」欄位，動漫/美術設定集、公仔、原聲帶、數位下載版四個分類改顯示對應 SUBTYPE_META 子類型選單，取代「平台」欄位（遊戲/攻略/主機/週邊維持原本平台選擇不變）
- 分類下拉選單變更時，即時切換顯示「平台」或「類型」欄位並重新產生對應選項
- 尋寶清單卡片、詳情頁、關鍵字搜尋皆同步顯示/比對子類型資訊
- 「購入→轉入收藏庫」流程一併帶入子類型，避免轉入收藏後子類型資訊遺失

### 影響檔案
- index.html / GameVault_v50_01_index.html
- sw.js
- GameVault_AppsScript.gs（**需使用者手動貼到 Apps Script 編輯器**）

### GS 版本
- v49 → v50（HUNT_HEADERS 新增 subtype 欄位）

### PWA 快取
- CACHE_NAME: gamevault-v49-07 → gamevault-v50-01

### 對應備份
- _internal/old/v49_07/
