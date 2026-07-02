## v42.13 (2026-07-01)

### 變更內容
- 欄位改名：「套組 / 附件說明」→「特典/附件說明」（遊戲/主機/週邊三個分類，書籍分類原本就是獨立文案「附件說明」不變）
- 欄位改名＋改型別＋搬移位置：「特典碼狀態」→「DLC狀態」，固定下拉選項改為【已使用／未使用／已過期／未確認／N/A】，位置從「遊戲規格」搬到「收藏狀態」群組、緊接在「特典/附件說明」欄位後面
- 同步更新 AI 辨識提示文字（AI_CAT_SPEC）與收藏頁篩選面板（FACETS）的標籤/選項，保持一致
- 「保管位置」欄位新增動態下拉選單支援：設定頁新增「📋 保管位置清單」區塊，可自建常用位置清單（存 cfg.storageLocations，僅本機）；建檔表單的保管位置改為從清單選擇，既有資料若不在清單中會保留為「（自訂/未在清單中）」選項，不會被靜默清空或覆蓋

### 影響檔案
- index.html / GameVault_v42_13_index.html
- sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: gamevault-v42-12 → gamevault-v42-13

### 對應備份
- _internal/old/v42_12/

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
