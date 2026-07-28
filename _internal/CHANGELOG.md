## v02.35 (2026-07-26)

### 變更內容
「②b 加拍封底」區塊 UI 統一成跟「② 拍攝遊戲封面」一致：
- 標題色從 `#7986cb`（偏暗淡）改成 `#ce93d8`（本區塊 accent 色，跟①②標題一致）
- 備註文字「選填，封底印有條碼/編號/日期/語言...」從 `#555`（深灰，在深色背景下幾乎不可見）改成 `#7986cb`（可讀的次要文字色）
- 「拍封底」按鈕從淡化的虛線外框樣式，改成跟「拍照」按鈕一樣的實心強調樣式（背景色塊＋實線框＋粗體）
- 「拍封底」「相簿」按鈕的 padding（10px→12px）與字級（12px→13px）跟上排對齊

### 影響檔案
- docs/index.html / docs/RetroVault_v02_35_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v02-34 → retrovault-v02-35

### 對應備份
- _internal/old/v02_34/


## v02.34 (2026-07-26)

### 變更內容
裁切框自動對齊商品外框，降低使用者手動調整機率：
- 手動裁切器（`_cropLayout`）原本初始框寫死「影像內縮 6%」、完全沒用邊緣偵測。現在改為首次開啟時呼叫既有的 `detectCropBox()`（背景色估算＋自適應容差＋四邊向內掃描）偵測商品外框，把原圖座標換算成畫面座標當初始框，讓框一開始就貼齊商品；偵測失敗或偵測框過小（<影像 25%）時，退回原本的內縮 6%。
- 修復同時發現的漏洞：`_cropLayout` 也被 `resize` 監聽器呼叫，若無保護會在每次螢幕旋轉/鍵盤彈出時用自動偵測結果重置使用者已調好的框。加 `_autoDetected` 旗標，只在首次布局偵測；resize 時改為把既有框依新舊 view 比例換算保留，框不會跑掉。每張新圖開啟時（`_cropOpen`）重置旗標，確保每張都重新偵測。

`detectCropBox()` 本身是既有函式（`autoCropCanvas` 一直在用），這次只是讓帶手動框的裁切 UI 也共用它，沒有改動偵測演算法。

自我檢查：`node --check` 通過；無 U+FFFD；CSS 594/594；座標換算邏輯自我檢查 9 項全過（原圖↔畫面座標互算、resize 前後框對應原圖座標一致、偵測失敗退回內縮 6%、過小框被拒絕）。

### 影響檔案
- docs/index.html / docs/RetroVault_v02_34_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v02-33 → retrovault-v02-34

### 對應備份
- _internal/old/v02_33/



## v02.33 (2026-07-26)

### 變更內容
AI 辨識流程優化（A–E），目標：使用者提供圖片時，優先採信盒子上的印刷事實，讓建檔命中欄位更多更準確。核心原則優先權：使用者選的 > 圖片實讀(img) > 資料庫(db) > AI知識推斷(ai)。

- **[A] 純圖片模式補上資料庫查詢**：`doAnalyze()` 原本辨識完直接 AI 補全、完全沒查資料庫。現在改成 AI 辨識 → 資料庫交叉比對（攻略走 ISBN、其餘走 crossRef）→ AI 補剩餘空欄，跟 combo 模式同一套管線；任一步失敗都有 `_aiOnly()` fallback。
- **[B] 來源可信度分級 + 合併保護**：視覺辨識 schema 新增 `_from_image` 欄位（AI 標注「哪些欄位是實際從圖片印刷內容讀到的」，知識推斷的不列）；系統提示 `_SYS_TAIL` 加「來源標注（必填）」指示段。新增共用合併函式 `_mergeDbIntoEntry(db)`：事實類欄位（開發商/發行商/發行日/類型/人數/分級/系列）若來源是 img 且有值，資料庫不覆蓋；summary 需含中文且非 img 才採用；版本類欄位只補空。三個進入點（combo 的 applyAIResult、gcode 的 applyMultiDbResult、純圖片的 doAnalyze）統一套用。順帶修復 combo 路徑原本 `_src` 因 Object.assign 重建 entry 而遺失的既有 bug（改成先存區域變數、entry 重建後再掛回）。
- **[C] 條碼＋照片模式支援加拍封底**：combo 建檔頁新增「②b 加拍封底（選填）」拍照/相簿鈕；封底是事實密度最高的一面（條碼/編號/發行日/語言/人數都在那）。runAI 改收封面＋封底兩張圖，prompt 說明圖片順序並提示封底事實密集。封底暫存原圖，doSave 時由 `_compressAndSave` 統一壓縮三張圖到 Sheets 上限（已確認安全）。
- **[D] 商品編號當第二把查詢鑰匙**：資料庫查詢鍵改為備用鏈「條碼 > 商品編號(code) > 名稱」，條碼查不到時用封底印的型號（如 GC-CC-NP-...）。
- **[E] 封底條碼由 AI 讀取**：BarcodeDetector 掃不到條碼時，AI 可從封底照片直接讀出條碼數字，多一層備援。

自我檢查：`node --check` 語法通過；無 U+FFFD；CSS 花括號 594/594 配對；抽取真實 `_mergeDbIntoEntry` 原始碼（非重寫）跑 17 項合併規則測試全過，核心情境（韓版盒子發行日不被日版資料庫覆蓋）驗證通過。

### 影響檔案
- docs/index.html / docs/RetroVault_v02_33_index.html
- docs/sw.js

### GS 版本
- 無（純前端流程調整，未動 GAS 後端）

### PWA 快取
- CACHE_NAME: retrovault-v02-32 → retrovault-v02-33

### 對應備份
- _internal/old/v02_32/




## v02.32 (2026-07-26)

### 變更內容
純標註，無邏輯異動：在 AI 辨識相關程式碼加上區塊標記與進入點註解，方便後續交給 Fable 做優化時快速定位。標記涵蓋：
- 兩個較集中的區塊，加了 START/END banner：
  1. 提示規格與系統提示建構（`AI_CAT_SPEC`／`ARTBOOK_AI_SPEC`／`_aiSpecFor()`／`buildSYS()` 等）
  2. 核心呼叫引擎（`callGemini`／`callGeminiOCR`／`callHybridVision`／`callAIVision`／`aiCompleteMissing`／`aiKnowledgeFill`／`testGemini` 等）
- 7 個分散在各建檔模式裡的 AI 辨識進入點，各自加一行說明註解：`gcodeComboSearch`／`applyMultiDbResult`／`initAiWebMode`／`comboSearchFromInput`／`fscanCapture`／`initImgMode`／`doAnalyze`

全部用 `🤖` 開頭方便 grep 搜尋定位，不影響任何程式邏輯。

### 影響檔案
- docs/index.html / docs/RetroVault_v02_32_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v02-31 → retrovault-v02-32

### 對應備份
- _internal/old/v02_31/
