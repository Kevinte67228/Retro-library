## v67.16 (2026-07-16)

### 變更內容
把「預設樣本藏品」改成使用者實際匯出的兩份 CSV 內容：
- SAMPLE_ITEMS 換成遊戲 CSV 的 5 筆收藏（超級瑪利歐銀河1+2、天穗之咲稻姬、FF7 Rebirth 等），改用正確的內部欄位鍵名（原本樣本用的是 media_type/version/voice_lang 等舊鍵名，與實際欄位不符；新資料直接採 CSV 匯出的真實鍵名 media/edition/voice_language 等）
- 新增 SAMPLE_HUNT_ITEMS：尋寶 CSV 的 6 筆狩獵目標（軒轅劍柒、FRONT MISSION 3rd Remake 等，含完整報價 sightings）
- loadSamples() 改為同時載入收藏（col）與尋寶（hunt）：保留原始 uuid（讓關聯商品連結有效）、加入 uuid 去重防護（重複點擊會略過不重複匯入）、尋寶寫入 hunt 陣列並呼叫 renderHuntList()
- 按鈕文字「匯入 5 筆樣本藏品」→「匯入樣本藏品（收藏＋尋寶）」；首次啟動提示文字同步更新

自我檢查：樣本筆數（收藏5+尋寶6）、每筆 primary_name/uuid、尋寶 category=狩獵、首次匯入11筆、重複點擊略過、關聯連結保留等皆驗證通過。

### 影響檔案
- index.html / GameVault_v67_16_index.html
- sw.js

### GS 版本
- 無（純前端樣本資料與載入邏輯，本機操作不動試算表）

### PWA 快取
- CACHE_NAME: gamevault-v67-15 → gamevault-v67-16

### 對應備份
- _internal/old/v67_15/

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

