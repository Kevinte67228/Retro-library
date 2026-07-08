## v54.08 (2026-07-08)

### 變更內容
近期發售瀏覽的遊戲標題改用在地化名稱，並移除韓文語言篩選：
- **標題改用在地化名稱**：串接 IGDB `alternative_names` 關聯（Localized Titles／Alternative Titles），依 繁中＞簡中＞日文＞英文 優序挑選顯示標題，查無在地化標題則退回原文 name
- comment 欄位是社群自由填寫的說明文字非嚴格列舉值，用關鍵字比對（traditional／simplified／japan）挑選最可能符合的那筆
- 移除「🇰🇷 支援韓文」篩選分頁
- 自我檢查：優序挑選邏輯（含無在地化標題時正確退回原文）已驗證通過

### 影響檔案
- index.html / GameVault_v54_08_index.html
- sw.js
- GameVault_AppsScript.gs（**GS CI/CD 自動部署**）

### GS 版本
- v59 → v60（igdb_upcoming 加入 alternative_names 查詢與在地化標題挑選邏輯）

### PWA 快取
- CACHE_NAME: gamevault-v54-07 → gamevault-v54-08

### 對應備份
- _internal/old/v54_07/

## v54.07 (2026-07-08)

### 變更內容
近期發售瀏覽的「地區篩選」改為「支援語言篩選」：
- **背景**：使用者提供 IGDB 遊戲詳情頁截圖，確認該類遊戲的 Releases 區塊完全沒有地區標籤（多平台同一天發售，看不出地區差異），且 Age Ratings 沒有日本 CERO 分級——證實地區篩選連續三次失敗的根因是 IGDB 資料本身地區欄位不完整，不是查詢語法問題
- **改用「支援語言」（language_supports 關聯）取代地區**：語意從「該地區發售」改成「支援該語言」；直接用語言名稱字串比對（如 'Japanese'、'Chinese (Traditional)'），不用再猜測任何數字 ID，資料完整度也比地區欄位高很多
- 地區 tabs 改為「全部／🇯🇵支援日文／🇺🇸支援英文／🇹🇼支援繁中／🇨🇳支援簡中／🇰🇷支援韓文」
- GAS `igdb_upcoming` 的 `region` 參數改名為 `lang`

### 影響檔案
- index.html / GameVault_v54_07_index.html
- sw.js
- GameVault_AppsScript.gs（**GS CI/CD 自動部署**）

### GS 版本
- v58 → v59（igdb_upcoming 改用語言支援篩選）

### PWA 快取
- CACHE_NAME: gamevault-v54-06 → gamevault-v54-07

### 對應備份
- _internal/old/v54_06/

## v58 GS-only (2026-07-08)

### 變更內容
近期發售瀏覽的地區篩選連續兩次 WHERE 條件寫法（純數字 region、release_region 關聯）都查空，改變策略：
- **不再依賴 WHERE 條件篩地區**：改成只用 platform／date 查詢（已確認能撈到資料），把 `region`（舊欄位）與 `release_region.region`（新欄位）都一併帶回來
- **改在 GAS 這邊自行依欄位內容篩選**：新舊兩種可能的地區欄位格式都檢查，任一符合指定地區就算，不用再賭 WHERE 語法對不對
- 自我檢查：新舊欄位並存情境下的篩選邏輯已驗證通過

### 影響檔案
- GameVault_AppsScript.gs（**GS CI/CD 自動部署**）

### GS 版本
- v57 → v58（igdb_upcoming 地區篩選邏輯改為後端自行過濾）

### PWA 快取
- 無變更（純後端修正）

### 對應備份
- 無（純邏輯修正，未異動前端檔案）

## v54.06 (2026-07-08)

### 變更內容
修正近期發售瀏覽的地區按鈕點擊後不會高亮的問題：
- **根因**：地區按鈕的 onclick 傳入的一律是字串（如 `'5'`），但高亮判斷是拿去跟 `RC_REGIONS` 陣列裡數字型態的 id（如 `5`）做嚴格比較（`===`），型態不同永遠比不中，導致點了都不會亮（平台按鈕因為 onclick 沒加引號、傳入的是數字，所以沒有這個問題）
- 改用寬鬆比較（統一轉字串再比對），點擊後正確高亮目前選中的地區

### 影響檔案
- index.html / GameVault_v54_06_index.html
- sw.js

### GS 版本
- 無（純前端修正）

### PWA 快取
- CACHE_NAME: gamevault-v54-05 → gamevault-v54-06

### 對應備份
- _internal/old/v54_05/

