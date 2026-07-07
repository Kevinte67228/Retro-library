## v54.02 (2026-07-08)

### 變更內容
篩選功能補齊新增的 4 個分類（動漫/美術設定集、公仔、原聲帶、數位下載版），並修正資料異常混入篩選選項的問題：
- **新增「類型」篩選**：可依子類型細分這 4 個分類的資料（原本完全沒有）
- **新增「盒況」「側標狀態」篩選**：分別對應公仔的獨立盒況欄位、原聲帶的側標狀態
- **修正「本體品相」篩選**：動漫/美術設定集、公仔改讀各自新增的獨立 `condition` 欄位，不再只靠舊版 `overallCond()`（靠 completeness 推算）導致這兩個分類幾乎都顯示「未評級」；`order` 排序也補上新品況列舉值
- **修正「系列」篩選**（改名「系列／作品」）：動漫/美術設定集與數位下載版的數位音源/數位影音子類型用 `related_work` 存作品名稱，跟其他分類的 `series` 欄位是同一概念、不同欄位名稱，現在合併讀取，不會再抓不到動漫分類的資料
- **新增「作曲／演出者」「發行廠牌」「作者／繪師」「製作公司」等篩選**，涵蓋原聲帶/動漫的常用篩選欄位
- **修正資料異常混入篩選選項**：新增防呆，過濾掉長得像 `2026-06-20T16:00:00.000Z` 這種 ISO 日期字串的髒值（試算表欄位若被 Sheets 誤判成日期格式，GAS 讀出來會是 Date 物件、序列化後跑進篩選選項）；這只是治標，欄位本身若真的被 Sheets 誤格式化為日期，仍建議之後找機會到試算表手動检查對應欄位格式
- 自我檢查：子類型/盒況/品況/系列合併讀取/ISO字串防呆等邏輯皆已驗證通過

### 影響檔案
- index.html / GameVault_v54_02_index.html
- sw.js

### GS 版本
- 無（純前端篩選邏輯調整）

### PWA 快取
- CACHE_NAME: gamevault-v54-01 → gamevault-v54-02

### 對應備份
- _internal/old/v54_01/

## v54.01 (2026-07-07)

### 變更內容
- 「寫入保護 Token」欄位新增「❓ 說明」按鈕（比照其他 API 欄位樣式），內容涵蓋：這是什麼、如何在 Apps Script 指令碼屬性設定 APP_TOKEN、如何驗證有沒有生效、以及連線自檢的測試方式（自檢是送錯誤token測試拒絕機制，不是讀取使用者填的值）
- Gemini API 金鑰移除無條件的「（免費）」標示與「✓ 免費方案」保證文字，改為提醒使用者自行到官網確認目前免費/付費規則，並註明已有使用者反映連結 Cloud 帳單後即使用量不大仍可能產生費用
- **PWA 更新機制改為自動套用**：移除原本「有新版本可用，重新整理頁面即可更新」的手動提示，改為監聽 `controllerchange` 事件，新版本一接管頁面就自動重新整理一次，使用者不需要手動關閉重開 App

### 影響檔案
- index.html / GameVault_v54_01_index.html
- sw.js

### GS 版本
- 無（純前端調整）

### PWA 快取
- CACHE_NAME: gamevault-v53-01 → gamevault-v54-01

### 對應備份
- _internal/old/v53_01/

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

