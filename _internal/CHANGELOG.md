## v42.12 (2026-07-01)

### 變更內容
- 修正條碼掃描（遊戲分類、有設定舊版資料庫金鑰時）圖片遺失問題：crossRefLookupPromise 合併結果的圖片欄位叫 cover_url/back_url/spine_url（候選網址），barWithGB 的 dbFields 合併清單完全沒做這層轉換，圖片資訊直接遺失
- 修正方式沿用既有 applyMultiDbResult（編碼掃描流程）已有的轉換模式：cover_url→cover_img 等，且僅補使用者沒拍的空欄，不覆蓋已拍照片
- 移除 applyMultiDbResult 裡殘留的除錯用 toast（會顯示 [DEBUG] cover_url=... 給使用者看 8 秒）
- 背景：v42.11 只修了 productBarcodeLookupPromise/applyProductBarcodeResult 這條新路徑的封面覆蓋問題，但遊戲分類且有設定舊版資料庫金鑰時，實際走的是更早就存在的 crossRefLookupPromise/barWithGB 路徑，該路徑從未處理過圖片欄位

### 影響檔案
- index.html / GameVault_v42_12_index.html
- sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: gamevault-v42-11 → gamevault-v42-12

### 對應備份
- _internal/old/v42_11/

## v42.11 (2026-07-01)

### 變更內容
- 修正照片被覆蓋的迴歸：applyProductBarcodeResult 合併資料庫結果時，Object.assign 順序讓資料庫商品圖（樂天/Barcode Lookup 的圖）覆蓋使用者已拍攝的封面/封底/側邊照片；改為合併前備份、合併後還原
- barAIFill 的 AI 補全分支（非 hasGB）同樣風險：改用 allowGrounding:false 後會強制走 responseSchema，schema 內含 back_img/spine_img 欄位，模型輸出空字串會覆蓋使用者照片，一併補上還原邏輯（先前只還原 cover_img）
- 條碼掃描畫面加上地區支援範圍提示：目前條碼資料庫查詢僅涵蓋日版（樂天）與美版（Barcode Lookup），台／港／韓／中版條碼查無資料機率高，明確告知使用者改用拍照辨識或手動輸入

### 影響檔案
- index.html / GameVault_v42_11_index.html
- sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: gamevault-v42-10 → gamevault-v42-11

### 對應備份
- _internal/old/v42_10/

## v42.10 (2026-07-01，使用者手動編輯)

### 變更內容
- 條碼辨識架構重大調整：捨棄 Gemini grounding 自由搜尋，改用真實商品資料庫（樂天 + Barcode Lookup）直查（productBarcodeLookupPromise / applyProductBarcodeResult）
- 純條碼查無資料時直接停用 AI 猜測，保留條碼並標記「需人工確認」，不再讓 AI 自由發想商品名稱
- 有資料庫結果或使用者提供名稱時才呼叫 Gemini 補全欄位，且明確關閉 grounding（allowGrounding:false），prompt 禁止聲稱已上網查證
- 新增 Google Books ISBN 直查（GS 新增 googleBooksProxy），補海外/英文攻略本資料
- barcode_lookup 查詢結果擴充擷取 publisher／ref_link／cover_url
- DB_REGISTRY 分類標籤擴充支援主機／週邊，各分類獨立顏色標示

### 影響檔案
- index.html / GameVault_v42_10_index.html
- sw.js（同時修正版本化 HTML 檔名不同步的問題）
- GameVault_AppsScript.gs（新增 google_books_search action，**需手動部署到 Apps Script**）

### GS 版本
- 新增 googleBooksProxy 函式；版本註解由使用者標為 v42.10（未依主版號慣例遞增，供参考）

### PWA 快取
- CACHE_NAME: gamevault-v42-09 → gamevault-v42-10

### 對應備份
- _internal/old/v42_09/
