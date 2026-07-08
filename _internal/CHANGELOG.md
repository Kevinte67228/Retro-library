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

## v54.05 (2026-07-08)

### 變更內容
近期發售瀏覽小工具新增地區篩選與點擊跳轉：
- **新增地區篩選 tabs**（全部地區／🇯🇵日本／🇺🇸北美／🇪🇺歐洲／🌏亞洲）：改用 IGDB 的 `release_dates` 子關聯依地區過濾，篩日本時會抓該遊戲在日本地區的專屬發售日（不是全球首發日），可以篩出「這個月在日本發行的遊戲」
- **列表項目可點擊跳轉**：新增 `igdb_url` 欄位，點擊遊戲項目會開新分頁前往該遊戲的 IGDB 對應頁面
- GAS 快取 key 加入地區參數，不同地區篩選各自快取，互不影響
- **已知限制**：IGDB region_enum 對照（1歐洲/2北美/3澳洲/4紐西蘭/5日本/6中國/7亞洲/8全球）是依訓練資料認知，若篩選結果異常可能需要調整

### 影響檔案
- index.html / GameVault_v54_05_index.html
- sw.js
- GameVault_AppsScript.gs（**GS CI/CD 自動部署**）

### GS 版本
- v54 → v55（igdb_upcoming 支援 region 參數）

### PWA 快取
- CACHE_NAME: gamevault-v54-04 → gamevault-v54-05

### 對應備份
- _internal/old/v54_04/

