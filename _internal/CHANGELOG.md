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



## v02.28 (2026-07-25)

### 變更內容
修正統計頁「最近入手」點擊後關閉詳情頁會停留在收藏頁、需要使用者自己切回統計頁的問題：
- 根因：原本的點擊行為是 `showPg('col')`（把底層頁面切到收藏）再開詳情頁；詳情頁（`#dsheet`）本身是 `position:fixed` 的全螢幕覆蓋層，關閉時只是移除 `.on` class（`closeDetail()`），不會做任何頁面導航——所以關閉後停留在「切換當下的底層頁面」，也就是被切過去的收藏頁，不是原本的統計頁
- 修法：拿掉 `showPg('col')`，改成只呼叫 `filterCol()`（純資料運算：重新計算 `filtered` 陣列＋渲染收藏頁 DOM，但不切換頁面可見性）。之所以不能只是單純拿掉整段、直接開詳情頁，是因為詳情頁的上一筆/下一筆導覽與「X/107」位置指示器依賴全域 `filtered` 陣列，而這個陣列只在使用者「造訪過」收藏頁時才會算過一次（`refreshColAfterLoad()` 有 `if(收藏頁是目前頁面)` 的守門），若使用者這次 session 都還沒去過收藏頁就直接從統計頁點最近入手，`filtered` 會是空陣列，位置指示器與上一頁/下一頁按鈕會失效
- 效果：詳情頁疊在統計頁上方開啟，關閉後自然留在原本的統計頁、同一個捲動位置，可以繼續點下一筆；上一筆/下一筆導覽與位置指示器維持正常運作

驗證：語法/亂碼通過；用 Node 直接執行字串組裝邏輯確認產生的 onclick 屬性字串結構正確、引號沒有互相破壞。

### 影響檔案
- docs/index.html / docs/GameVault_v02_28_index.html
- docs/sw.js

### GS 版本
- 無（純前端UI/導覽邏輯調整）

### PWA 快取
- CACHE_NAME: gamevault-v02-27 → gamevault-v02-28

### 對應備份
- _internal/old/v02_27/




## v02.27 (2026-07-25)

### 變更內容
v02.26 的建檔頁副標題（分類/子類型/地區/平台）再加上建檔方式與查詢資料來源分流狀態，主要供未來除錯用：
- 新增 `_METHOD_LABELS` 對照表（8 種建檔方式的顯示名稱），掛勾在 `pagePickMethod()` 尾端更新
- 分流狀態（`_dbOverride`：自動分流／強制指定單一資料庫）掛勾在 `setDbOverride()` 尾端更新，**一律顯示**（含預設的「自動分流」），除錯時才不會漏看目前實際生效的路由是自動還是被強制指定
- 完整格式：「分類 · 子類型 · 地區 · 平台 · 建檔方式 · 分流狀態」，依序對應 Step1-4 的選擇加上查詢路由

自我檢查：語法/亂碼通過；5 項情境測試（含建檔方式插入位置、分流強制指定顯示資料庫名稱、未知建檔方式代號不顯示、分流id查無資料庫時安全fallback不噴錯）全數通過。

### 影響檔案
- docs/index.html / docs/GameVault_v02_27_index.html
- docs/sw.js

### GS 版本
- 無（純前端UI調整）

### PWA 快取
- CACHE_NAME: gamevault-v02-26 → gamevault-v02-27

### 對應備份
- _internal/old/v02_26/
