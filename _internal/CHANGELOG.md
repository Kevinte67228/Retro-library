## v54.14 (2026-07-08)

### 變更內容
更新 Step 1「建檔方式說明」彈窗，內容還停留在改版前「6種方式全分類通用」的舊版描述，沒反映數位下載版拆表後的實際狀況：
- 新增提示區塊，說明各分類可用的建檔方式不完全相同
- 新增「🔗 商店連結」說明（數位下載版專用，原本完全沒被列出）
- 「商品編碼」說明更新為依分類自動對應 ISBN／JAN 碼
- 「編碼＋照片」補充說明電子書子類型走的是 ISBN＋照片組合

### 影響檔案
- index.html / GameVault_v54_14_index.html
- sw.js

### GS 版本
- 無（純前端文案更新）

### PWA 快取
- CACHE_NAME: gamevault-v54-13 → gamevault-v54-14

### 對應備份
- _internal/old/v54_13/

## v54.13 (2026-07-08)

### 變更內容
「立即更新」提示橫幅視覺優化，原本深色背景（#141b30）跟版面其他深色卡片太像不夠明顯：
- 改用青紫漸層亮色背景（#00e5ff → #7c4dff），文字改深色確保對比度
- 新增滑入進場動畫＋持續發光脈動動畫，吸引注意力
- 按鈕改深色底、亮色文字，跟背景形成更清楚的層次

### 影響檔案
- index.html / GameVault_v54_13_index.html
- sw.js

### GS 版本
- 無（純前端視覺調整）

### PWA 快取
- CACHE_NAME: gamevault-v54-12 → gamevault-v54-13

### 對應備份
- _internal/old/v54_12/

## v54.12 (2026-07-08)

### 變更內容
使用者提供 IGDB 遊戲頁面截圖，確認「Localized Titles」與「Alternative Titles」是兩個不同資料來源（前者 game_localizations 關聯，後者 alternative_names），部分遊戲的日文標題只存在前者：
- **加入 game_localizations 查詢**：同時檢查兩個資料來源，任一符合語言/地區條件就採用（繁中：alternative_names traditional 或 game_localizations 的 Taiwan/Hong Kong；簡中：alternative_names simplified 或 game_localizations 的 China；日文同理）
- **加上防呆退回機制**：`game_localizations` 是推測的欄位名稱，若導致 IGDB 查詢失敗，自動退回不含它的欄位組合重試一次，不會讓整個功能掛掉
- 快取 key 升級 v4
- **排版修正**：說明文字（發售日/開發商/類型）改為對齊圖片右側的品名文字，不再從圖片正下方開始
- 自我檢查：兩資料來源整合的優序邏輯（含無在地化資料時正確退回原文）已驗證通過

### 影響檔案
- index.html / GameVault_v54_12_index.html
- sw.js
- GameVault_AppsScript.gs（**GS CI/CD 自動部署**）

### GS 版本
- v62 → v63（igdb_upcoming 加入 game_localizations 來源＋防呆退回機制）

### PWA 快取
- CACHE_NAME: gamevault-v54-11 → gamevault-v54-12

### 對應備份
- _internal/old/v54_11/

## v54.11 (2026-07-08)

### 變更內容
近期發售瀏覽兩項優化：
- **放寬日文標題比對關鍵字**：原本只比對 comment 含「japan」，改為同時比對 japan／japanese／jp 幾種可能寫法，涵蓋更多社群標記習慣不一致的情況；快取 key 升級 v3 避免舊快取殘留
- **排版重新設計**：圖片＋遊戲名稱同一行，發售日/開發商/類型等說明文字改成獨立整行放在下面，不再擠在圖片旁的窄欄位裡

### 影響檔案
- index.html / GameVault_v54_11_index.html
- sw.js
- GameVault_AppsScript.gs（**GS CI/CD 自動部署**）

### GS 版本
- v61 → v62（igdb_upcoming 放寬日文比對關鍵字＋快取版本升級）

### PWA 快取
- CACHE_NAME: gamevault-v54-10 → gamevault-v54-11

### 對應備份
- _internal/old/v54_10/

