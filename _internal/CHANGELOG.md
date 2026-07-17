## v67.15 (2026-07-16)

### 變更內容
尋寶頁工具列的「•••」更多功能按鈕視覺偏大，改用單一「⋯」字元（U+22EF 水平刪節號，比照收藏頁）取代原本三個實心圓點「•••」（三個 U+2022），視覺更精簡、與收藏頁一致。移除多餘的 letter-spacing。

### 影響檔案
- index.html / GameVault_v67_15_index.html
- sw.js

### GS 版本
- 無（純視覺微調，不觸發版號歸零）

### PWA 快取
- CACHE_NAME: gamevault-v67-14 → gamevault-v67-15

### 對應備份
- _internal/old/v67_14/

## v67.14 (2026-07-16)

### 變更內容
尋寶頁比照收藏頁，新增「•••」更多功能選單，把「從雲端同步、匯出 CSV、匯入 CSV」整合進去：
- 原本尋寶工具列的「同步」icon 改成「•••」選單按鈕，點開含三項：從雲端同步（huntRefresh）、匯出 CSV、匯入 CSV；「大量刪除」icon 維持獨立（比照收藏頁把垃圾桶獨立在選單外）
- 新增 exportHuntCsv()：讀 huntFiltered()，單一檔案、HUNT_HDR 雙標題列格式（第一列內部鍵值、第二列顯示名稱）、含 BOM，uuid 欄位比照收藏頁邏輯（正常 uid 直接輸出、不合格則退回 data.uuid）
- 匯入沿用既有 triggerImportCsv()／importCsv()（本來就會自動偵測「狩獵」分類寫入 hunt 陣列並同步後端），僅補上匯入完成後也呼叫 renderHuntList()，讓尋寶頁匯入後畫面即時更新
- 新增選單開關函式 toggleHuntMenu()／closeHuntMenu()／_huntMenuOutside()（比照 toggleColMenu 系列，點外部自動關閉）

自我檢查：exportHuntCsv 的 CSV 格式（BOM、雙標題列、欄位對應、正常/不合格 uuid 處理、逗號引號跳脫）皆驗證正確。

### 影響檔案
- index.html / GameVault_v67_14_index.html
- sw.js

### GS 版本
- 無（純前端新功能，沿用既有後端 add 動作，不觸發版號歸零）

### PWA 快取
- CACHE_NAME: gamevault-v67-13 → gamevault-v67-14

### 對應備份
- _internal/old/v67_13/

## v67.13 (2026-07-16)

### 變更內容
程式碼清理（掃描全碼後的低風險精簡）：
- 移除 2 處開發用診斷 `console.log`（applyAIResult 的 AI 回傳內容、ImgSearch 的 Gemini 辨識結果），正式版不需要
- 儀表板相關函式裡各自定義 5 次的 `fmt()` 與 2 次的 `catKey()` 抽成共用頂層 helper `_dashFmt()`／`_dashCatKey()`。`fmt` 統一採較穩健的 `Number(n)||0`（字串數字也能正確格式化，對原本傳純數字的呼叫端行為完全不變）

掃描結論：整體程式碼相當乾淨，無孤立死函式、無註解掉的程式碼區塊、CSS 無未使用 class。GAS 的一次性遷移工具函式保留（無害，且移除有風險）暫不處理。

自我檢查：`_dashFmt`／`_dashCatKey` 對數字/字串數字/null/undefined/空字串/舊分類別名等各種輸入皆驗證正確。

### 影響檔案
- index.html / GameVault_v67_13_index.html
- sw.js

### GS 版本
- 無（純前端清理，不觸發版號歸零）

### PWA 快取
- CACHE_NAME: gamevault-v67-12 → gamevault-v67-13

### 對應備份
- _internal/old/v67_12/

## v67.12 (2026-07-16)

### 變更內容
澄清使用者需求：CSV 匯出不需要真的包含圖片檔案，圖片欄位（`cover_img`／`back_img`／`spine_img`）存的其實只是 Drive 檔案 ID 這種短字串（不是圖片本身），照樣匯出成文字即可——原本的排除邏輯是多慮了。

- 移除匯出時對 `imgupload` 型別欄位的排除，改成跟其他文字欄位一樣正常匯出
- 尋寶的 `cover_img` 同樣改成正常匯出
- 這樣匯入後，圖片欄位裡的 Drive 檔案 ID 會正確還原，圖片連結不會消失（因為原本的圖片檔案還在雲端，只是重新接上同一個 ID 參照）
- 更新匯入前的確認提示文字，改成準確說明「圖片連結會保留」而非先前誤導的「圖片不含在 CSV 內」

### 影響檔案
- index.html / GameVault_v67_12_index.html
- sw.js

### GS 版本
- 無（純前端 CSV 欄位篩選調整，不影響試算表本身）

### PWA 快取
- CACHE_NAME: gamevault-v67-11 → gamevault-v67-12

### 對應備份
- _internal/old/v67_11/

