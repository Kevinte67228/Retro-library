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

## v57 GS-only (2026-07-08)

### 變更內容
修正近期發售瀏覽的地區篩選仍然查空的問題：
- 使用者提供 IGDB 官方文件截圖確認：地區代碼本身沒錯（歐洲=1/北美=2/日本=5...），但 IGDB v4 已把 `release_dates.region` 舊版純數字欄位改成透過 `release_region` 關聯指到獨立的 `release_date_regions` 表，直接 `where region = X` 查不到東西
- 改用 `release_region.region` 關聯欄位過濾與取值，純 GAS 後端修正，前端無需更新

### 影響檔案
- GameVault_AppsScript.gs（**GS CI/CD 自動部署**）

### GS 版本
- v56 → v57（igdb_upcoming 改用 release_region 關聯過濾地區）

### PWA 快取
- 無變更（純後端修正）

### 對應備份
- 無（純邏輯修正，未異動前端檔案）

## v56 GS-only (2026-07-08)

### 變更內容
修正近期發售瀏覽的地區篩選查出空結果的問題：
- **根因**：原本在 IGDB `games` 端點上對巢狀子關聯 `release_dates.region` 做過濾，這種巢狀條件語法不可靠，容易查出空結果
- **修正**：改查 IGDB 專門的 `release_dates` 端點（IGDB 官方建議的發售日瀏覽查詢方式），platform/region/date 在這個端點都是直接欄位，不是巢狀子關聯，透過 `game.*` 欄位一次帶出遊戲詳細資訊；同一款遊戲若有多筆發售日紀錄用 game.id 去重
- 純 GAS 後端修正，前端無需更新（呼叫方式不變）

### 影響檔案
- GameVault_AppsScript.gs（**GS CI/CD 自動部署**）

### GS 版本
- v55 → v56（igdb_upcoming 改用 release_dates 端點查詢）

### PWA 快取
- 無變更（純後端修正）

### 對應備份
- 無（純邏輯修正，未異動前端檔案）

