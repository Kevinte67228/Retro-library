## v53.01 (2026-07-07)

### 變更內容
處理稽核報告「五、互動功能與按鈕驗證清單」兩個 High 等級安全問題：
- **`fix_headers` 移出未受保護的讀取路徑**：從 `dispatchRead()`（GET/POST 皆可、無驗證）移到 `doPost` 的寫入類 action 分支，跟 add/update/delete/deleteMany 共用同一組 `APP_TOKEN` 驗證，不再能被任何知道網址的人直接觸發
- **`APP_TOKEN` 改為 fail-closed**：原本「未設定 APP_TOKEN 則放行」改成「未設定一律拒絕」，寫入類操作（含 fix_headers）現在強制要求 token 正確才能執行。**執行前已確認使用者 APP_TOKEN 已設定並通過連線自檢**，此變更不影響現有正常使用
- 前端 `fixHeaders()` 改用 `shPost` 並自動附帶 `app_token`（原本用 `shGet` 不帶任何驗證資訊）
- 自我檢查：fail-closed 邏輯與 fix_headers 保護邏輯皆已驗證通過

### 影響檔案
- index.html / GameVault_v53_01_index.html
- sw.js
- GameVault_AppsScript.gs（**GS CI/CD 自動部署**）

### GS 版本
- v52 → v53（doPost 寫入驗證邏輯變更：fix_headers 納入保護、APP_TOKEN 改 fail-closed）

### PWA 快取
- CACHE_NAME: gamevault-v52-01 → gamevault-v53-01

### 對應備份
- _internal/old/v52_01/

## v52.01 (2026-07-07)

### 變更內容
處理稽核報告「三、程式碼瘦身與死碼檢查」與「四、統計數字」兩節的可驗證問題：
- 移除死碼 `barRestartScanner()`（全檔案僅有定義，無任何呼叫點）
- GAS 快取 key `market_estimate_v39_01_` 改為 `market_estimate_`，移除寫死的過期版本號，避免未來又語意混亂
- 前端說明文字「目前估值邏輯（v39）」改為「目前估值邏輯說明」，移除過期版本標示
- 全部 218 個 `<button>` 補上缺少的 `type="button"`（原 187 個缺漏，全檔案無 `<form>` 標籤，確認補上不影響任何送出行為）
- 稽核報告提到的 `bl_search`/`gb_search`/`mb_search`/`ss_search`/`tgdb_search` 疑似未使用一節，經核對為誤判：這 5 個 action 前端皆有實際呼叫（以 `URLSearchParams` 建構，稽核工具掃描漏抓），不做變動
- 稽核報告提到的遷移/backfill 維護函式與孤兒圖片清理函式，經核對未透過 doGet/doPost 對外暴露，不構成安全風險，暫不搬移，維持現狀

### 影響檔案
- index.html / GameVault_v52_01_index.html
- sw.js
- GameVault_AppsScript.gs（**GS CI/CD 自動部署，無需手動貼上**）

### GS 版本
- v51 → v52（僅快取 key 命名清理，無邏輯變更）

### PWA 快取
- CACHE_NAME: gamevault-v51-02 → gamevault-v52-01

### 對應備份
- _internal/old/v51_02/

## v51.02 (2026-07-06)

### 變更內容
設定頁「寫入保護 Token」區新增「🩺 連線自檢」按鈕，一鍵實測後端狀態：
- GET ping 確認連線；POST ping 確認後端為新版（POST 讀取代理可用，帶密鑰搜尋走 POST 正常）
- 以「帶錯 token 的空 deleteMany」探測寫入保護：錯 token 被拒＝已生效；被接受＝APP_TOKEN 尚未設定。keys 為空、後端 deleteManyRows([]) 保證不刪任何資料，探針絕對安全
- 結果即時顯示於按鈕下方，錯誤訊息經 esc() 轉義

### 影響檔案
- index.html / GameVault_v51_02_index.html
- sw.js

### GS 版本
- 無（後端 v51 未變更）

### PWA 快取
- CACHE_NAME: gamevault-v51-01 → gamevault-v51-02

### 對應備份
- _internal/old/v51_01/

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
