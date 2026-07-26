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




## v02.29 (2026-07-25)

### 變更內容
App 名稱從「GameVault」改成「RetroVault」，因為專案範圍已經不再只限遊戲（涵蓋書籍/主機/週邊/原聲帶/動漫美術/公仔/數位下載版），新名稱不再侷限單一品類。全站使用者可見文字都已改名：
- 開啟畫面（`<title>`／splash boot畫面）、App 內上方標題列
- `manifest.json` 的 `name`／`short_name`（決定手機安裝到主畫面時顯示的名稱與圖示標籤）
- 各種對話框/提示文字：首次使用引導、返回鍵離開提示、Google試算表設定教學、AI辨識角色設定提示詞、API金鑰設定頁的使用說明
- 匯出檔名：收藏/尋寶 CSV 匯出、設定值匯出 JSON、使用說明書 HTML
- 範例資料（首次使用載入的樣本收藏）內文字說明
- `docs/manual.html` 使用手冊全文

**刻意保留不動**：`GameVault_AppsScript.gs` 這個實際檔名（含 App 內下載連結、使用手冊裡的教學文字提及）——這次只處理「App 名稱」的顯示文字，實際檔名／repo 名稱／部署腳本內的檔名慣例是更大範圍的變動（牽涉 CI/CD workflow、協作規則文件、備份輪替邏輯等多處），需要另外評估後才處理，這次沒有連動改。

自我檢查：語法/亂碼/CSS花括號配對/JSON語法皆通過；用保護性字串取代（先保護 `GameVault_AppsScript.gs` 這個檔名字串，取代完再還原），確認全文取代後除了 2 個刻意保留的檔名引用，沒有殘留任何「GameVault」字樣；大小寫變體（如小寫 gamevault URL/識別字）也逐一核對過沒有誤觸。

### 影響檔案
- docs/index.html / docs/GameVault_v02_29_index.html
- docs/manifest.json
- docs/manual.html（另外用單檔 commit 推送，不在版本輪替範圍內）
- docs/sw.js

### GS 版本
- 無（純前端文字調整）

### PWA 快取
- CACHE_NAME: gamevault-v02-28 → gamevault-v02-29

### 對應備份
- _internal/old/v02_28/
