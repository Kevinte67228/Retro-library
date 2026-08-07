## v02.92 (2026-08-06)

### 變更內容
使用者要求：儀表板（統計頁）「最近入手」清單，原本每一列只顯示分類 emoji 圖示（例如遊戲全部都是 🎮），改成有封面照片就顯示封面縮圖，沒有才退回原本的分類圖示。

沿用收藏列表（`renderColList`）既有的 `hasImgVal(d.cover_img)` 判斷＋`imgUrl(d.cover_img,80)` 縮圖網址邏輯，沒有另外寫一套判斷。`.dv2-ri-ic` 容器加上 `overflow:hidden`，圖片用 `object-fit:cover` 填滿正方形圖示位置，維持原本 36×36px、9px 圓角的外觀。

### 影響檔案
- docs/index.html / docs/RetroVault_v02_92_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v02-91 → retrovault-v02-92

### 對應備份
- _internal/old/v02_91/


## v02.91 (2026-08-06)

### 變更內容
使用者實測回報，圖片裁切器（`cropImageFile()`／`#crop-ov`，全站共用的裁切工具）預設框常常直接貼齊照片最外緣，導致四個角落的拖曳把手緊貼畫面邊界，手指很難精準抓到、也很難再往外拉調整。

查證後定位：`_cropLayout()` 裡偵測商品邊界（`detectCropBox`）成功時直接採用偵測結果當初始框，沒有額外留邊；只有偵測失敗時的保守 fallback 框才有內縮 6%。由於商品照片常常整個畫面都被拍攝物填滿，偵測框因此經常等於整張照片的邊界。

修正：偵測成功採用的框，額外往內收一點安全間距（`min(視窗寬,視窗高) × 2.5%`），讓四個把手離畫面邊界有空間可以操作；「盡量貼緊商品邊緣」的原意不變，只是留一點緩衝，使用者原本就可以自行拖曳微調到剛好貼齊。偵測失敗時的 fallback 框本來就已經內縮 6%，不需要再加。

自我檢查：`node --check` 通過（2 個 inline script 皆過）；無 U+FFFD；確認新增的內縮邏輯只套用在偵測成功的路徑，fallback 路徑的既有 6% 內縮不受影響；用 Python 模擬邊界情境（框貼齊整個畫面、極小圖片兩種情況）驗證內縮後框仍在合理範圍內、不會出現負值或退化成過小尺寸。

### 影響檔案
- docs/index.html / docs/RetroVault_v02_91_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v02-90 → retrovault-v02-91

### 對應備份
- _internal/old/v02_90/




## v02.90 (2026-08-06)

### 變更內容
批次書背建檔三項改善（使用者實測回報）：

**1. Step5（逐件查資料庫＋AI補全）全程保持螢幕喚醒**：原本只有內部真的呼叫 AI 補全欄位時才透過既有的 `loading()` 間接拿到螢幕喚醒鎖，查資料庫的空檔沒有鎖，手機可能自動熄屏中斷處理。改成整個 Step5（`_batchFinishSteps`→`_batchResolveNext` 全部項目跑完）期間持續持有喚醒鎖，直到全部解析完成或使用者取消才釋放。

**2. 確認清單（勾選那一步）編輯後，狀態徽章會正確更新**：查證後定位根本原因——「未輸入編碼」「⚠️ 已收藏過」這兩個徽章分別依賴 `item.code`（Step2-4 收集當下的值）跟 `item.dup`（`_batchResolveNext` 當下算出來的重複判斷），使用者之後不管是點「✎」開完整表單補上編碼／改名稱，還是直接在清單裡改名稱，這兩個值都沒有跟著重新計算，徽章會一直卡在舊的警示狀態，即使已經修正好了。改成：完整表單編輯存回時同步 `item.code` 並重新呼叫 `findDuplicate()`；清單直接改名稱則在輸入框失焦（onblur）時重新檢查是否仍重複，避免每次按鍵都整批重繪打斷輸入。

**3. 說明「切到別的 App」為何會暫停處理（無法完全解決）**：確認這是手機瀏覽器/作業系統本身的省電機制——分頁被切到背景時，系統會暫停或大幅降速執行網頁程式碼，這不是喚醒鎖能解決的範圍（喚醒鎖只防止「螢幕自動熄滅」，防不了「使用者切去別的 App」），一般網頁應用程式沒有可靠的 API 能繞過這個限制。Step5 處理中的提示文字加了一行提醒「請保持本頁面在前景，切去其他 App 會暫停處理」，讓使用者清楚知道原因，不用誤以為是程式壞掉。

自我檢查：`node --check` 通過（2 個 inline script 皆過）；無 U+FFFD；確認 `_batchNameBlur` 恰好定義 1 次且已接到 input 的 `onblur`；確認 `item.dup=findDuplicate(item.entry)` 三處出現（原有 1 處 + 新增的 `batchApplyItemEdit`／`_batchNameBlur` 各 1 處）都在正確位置；確認 `keepAwake()`／`releaseAwake()` 正確成對出現在 Step5 起訖與取消路徑。

### 影響檔案
- docs/index.html / docs/RetroVault_v02_90_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v02-89 → retrovault-v02-90

### 對應備份
- _internal/old/v02_89/






## v02.89 (2026-08-06)

### 變更內容
使用者實測回報，批次書背建檔第①步（AI 辨識書背照片）常常把日文封面的商品辨識成英文名稱。查證後定位根本原因：`_batchDetectPrompt()` 只要求 AI「填書背上看到的標題文字」，沒有明確禁止 AI 用自己知道的官方英文／國際譯名取代實際印刷文字；而這個 `title_guess` 之後會直接被 `_batchResolveNext()` 當成 `entry.primary_name` 使用，後續的 AI 補全只填「空白」欄位、不會覆蓋已有值，所以 Step1 一旦猜成英文，就會直接污染最終存檔名稱，不會被之後任何步驟修正。

修正：加強 Step1 辨識提示詞，明確要求逐字照抄書背上實際印刷的文字、保留原本印出來的語言與文字（日文就是日文、英文就是英文），禁止翻譯、禁止音譯、禁止用 AI 自己知道的官方譯名或其他地區/語言版本標題取代——即使認出是哪款遊戲，也只能填書背上真正看得到的文字。看不清楚或看不到文字則留空，維持原本「不需要完整或保證正確」的容錯空間不變。

（前一版 v02.88 新增的「確認清單可直接改名稱」功能仍是修正辨識錯誤名稱的後備手段，這次是從源頭降低錯誤發生率。）

自我檢查：`node --check` 通過（2 個 inline script 皆過）；無 U+FFFD；確認 `_batchDetectPrompt` 只有這一處定義；確認新提示詞未變更既有的 JSON schema（`BATCH_DETECT_SCHEMA`）與呼叫方式，不影響其他呼叫端。

### 影響檔案
- docs/index.html / docs/RetroVault_v02_89_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v02-88 → retrovault-v02-89

### 對應備份
- _internal/old/v02_88/






