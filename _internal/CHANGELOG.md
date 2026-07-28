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



## v02.31 (2026-07-26)

### 變更內容
GAS 後端檔名正式從 `GameVault_AppsScript.gs` 改成 `RetroVault_AppsScript.gs`，完成 App 改名的最後一塊：
- 使用者已手動更新 `.github/workflows/deploy-gas.yml` 的觸發路徑與複製指令（Claude 沒有 workflow scope），確認生效後才由 Claude 執行實際改名，避免觸發路徑跟檔名對不上、CI/CD 悄悄失效
- `.gs` 程式碼內文同步改名的地方（純顯示文字，無外部依賴）：檔頭版本註解、健康檢查回應訊息、程式註解、`market_value_source` 標籤文字
- **刻意保留不改的 4 處**（有實質功能/外部依賴，改了會出問題）：
  - `IMG_FOLDER_NAME = 'GameVault_Images'`：Google Drive 實際圖片資料夾名稱，改名會讓程式找不到使用者現有圖片
  - `softname = 'GameVault'`：ScreenScraper API 的開發者身分識別字串，是官網註冊登記的軟體名稱，改了會讓查詢功能失效
  - 同一支函式裡的 `User-Agent: 'GameVault/2.0...'`：跟 softname 屬於同一個 API 呼叫，保守起見一併不動
  - 詳細原因記錄於協作規則.md 的「GAS 檔案內部保留不改的字串」段落
- 連帶更新：`docs/index.html` 下載連結、`docs/manual.html` 教學文字、`github_deploy.py`（BACKUP_FILES／DEPLOY_FILES）、協作規則.md／部署架構說明.md 所有檔名引用

**發現但這次沒動的既有問題**：`_internal/GameVault_部署架構說明.md` 整份文件描述的是舊版 Netlify 部署流程（`GameVault/` 資料夾、Netlify Publish directory），但專案已經在 2026-07-21 改用 GitHub Pages（`docs/` 資料夾），這份文件從那時候起就沒有跟著更新、內容已經過時，這次只做了最小範圍的 GAS 檔名字串取代，沒有一併重寫整份文件，需要之後另外處理。

自我檢查：`.gs` 內容 `node --check`（改副檔名為 .js）語法通過；index.html/manual.html/github_deploy.py/rules.md 均無亂碼、Python 語法通過；逐一核對 4 處刻意保留字串在最終檔案裡確實還在、其餘引用確實都已更新。

### 影響檔案
- docs/index.html / docs/RetroVault_v02_31_index.html
- docs/RetroVault_AppsScript.gs（取代 docs/GameVault_AppsScript.gs）
- docs/manual.html
- docs/sw.js
- _internal/github_deploy.py
- _internal/GameVault_協作規則.md
- _internal/GameVault_部署架構說明.md

### GS 版本
- 檔名異動，程式邏輯無變化（純顯示文字改名，見上方說明）

### PWA 快取
- CACHE_NAME: retrovault-v02-30 → retrovault-v02-31

### 對應備份
- _internal/old/v02_30/




## v02.30 (2026-07-26)

### 變更內容
版本 HTML 檔名規則從 `GameVault_vXX_YY_index.html` 改成 `RetroVault_vXX_YY_index.html`，呼應 App 改名（v02.29）：
- `github_deploy.py` 升版到 v4：`get_current_version()`／備份步驟／刪舊檔案步驟都做了「新舊前綴都比對」的過渡期相容處理，這次（v02.29→v02.30）會正確備份、刪除舊的 `GameVault_v02_29_index.html`，並改用新前綴推送 `RetroVault_v02_30_index.html`
- `sw.js` 的 `CACHE_NAME`／`STATIC_ASSETS` 同步改用新檔名
- 協作規則.md 新增「App 改名」記錄段落，並把文件內所有版本 HTML 命名規則範例都改成新前綴（GAS 封存檔名 `GameVault_v01_AppsScript.gs.txt` 這次沒有一起改，屬於下面的 GAS 範圍）

**GAS 檔名（`GameVault_AppsScript.gs`）這次刻意沒有一起改**：`.github/workflows/deploy-gas.yml` 的觸發路徑與複製指令寫死引用這個檔名，Claude 沒有 `workflow` scope 無法直接修改該檔案，需要使用者先手動把 workflow 內容換成新檔名版本，確認生效後才能安全把實際的 `.gs` 檔案與相關文件引用一併改名，避免 GAS CI/CD 觸發路徑跟實際檔名對不上、自動部署悄悄失效卻不易察覺。

自我檢查：Python 語法通過；用真實匯入的 `github_deploy.py` 模組（非重寫邏輯）測試 `get_current_version()` 在舊前綴/新前綴/都找不到三種狀態下正確運作，以及備份尋找版本HTML、刪除判斷邏輯在混合過渡狀態下正確運作，9 項全過。

### 影響檔案
- docs/index.html / docs/RetroVault_v02_30_index.html（新命名，取代 docs/GameVault_v02_29_index.html）
- docs/sw.js
- _internal/github_deploy.py
- _internal/GameVault_協作規則.md

### GS 版本
- 無（純部署腳本/檔名規則調整，App 本身邏輯無變化）

### PWA 快取
- CACHE_NAME: gamevault-v02-29 → retrovault-v02-30

### 對應備份
- _internal/old/v02_29/
