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


## v02.26 (2026-07-25)

### 變更內容
建檔頁副標題（原本固定顯示「AI 高品質辨識 · UUID · 分類 / 地區 / 條碼」宣傳文字）改成即時顯示 Step1-3 已選擇的分類/子類型/地區/平台：
- 新增 `_updateEntrySubtitle()`，格式為「分類 [· 子類型] [· 地區] [· 平台]」（依 Step 順序：Step1分類/子類型 → Step2地區 → Step3平台），地區只取中文簡短名（例如「日本」而非「日本（Japan）」），節省手機寬度
- 掛勾在 4 個既有的狀態變更函式尾端：`selectEntryCat()`（分類/子類型）、`setRegion()`（地區）、`_applyPlatVisual()`（平台）、`_applySubtypeVisual()`（子類型），涵蓋所有會改變這幾個值的路徑（含 Step3 平台選單、續建記憶回填等），不需要在每個呼叫點個別加掛
- App 啟動時 `resetEntryStep1()` 會還原上次記憶的分類，副標題也會跟著在啟動當下就正確顯示，不會有空白或殘留舊文字的狀態

自我檢查：語法/亂碼通過；逐字比對確認測試片段與真實程式碼完全一致；6 項情境測試（純分類／分類+地區／分類+地區+平台／含子類型分類／書籍分類名稱轉換／找不到對應DOM元素時安全跳過不噴錯）全數通過。

### 影響檔案
- docs/index.html / docs/GameVault_v02_26_index.html
- docs/sw.js

### GS 版本
- 無（純前端UI調整）

### PWA 快取
- CACHE_NAME: gamevault-v02-25 → gamevault-v02-26

### 對應備份
- _internal/old/v02_25/



## v02.25 (2026-07-25)

### 變更內容
建檔圖片上傳區塊移除重複的分頁選擇器：
- 原本上排有一組「封面/封底/側邊」分頁（`.img-slot`），下方縮圖預覽格（`#thumb-wrap`）也已經有一樣的點擊切換功能＋核取框選取狀態——兩者完全重複，上排已在程式碼註解標記「僅顯示用，選取改由下方預覽格控制」但一直沒有真的拿掉
- 刪除上排分頁選擇器與「目前選取：封面」說明文字；下方縮圖預覽格本來就有 `onclick="setImgSlot(...)"`，直接點縮圖即可切換目標欄位，功能無損
- 拍照／相簿兩個按鈕搬到縮圖預覽格下方（原本在上方），順序改成：縮圖預覽 → 拍照/相簿 → 取消/AI辨識
- 清理隨刪除一併變成無用的程式碼：`setImgSlot()`／`resetSlots()` 內對已刪除元素的參照、`_slotLabels` 全域變數、`.img-slot` 系列 CSS 規則

自我檢查：語法/亂碼/CSS 花括號配對通過；靜態掃描確認沒有殘留對已刪除元素的參照；用真實抽取的 `setImgSlot`/`resetSlots` 驗證在對應 DOM 元素消失後仍正確更新狀態、不會噴錯，5 項全過。

### 影響檔案
- docs/index.html / docs/GameVault_v02_25_index.html
- docs/sw.js

### GS 版本
- 無（純前端UI調整）

### PWA 快取
- CACHE_NAME: gamevault-v02-24 → gamevault-v02-25

### 對應備份
- _internal/old/v02_24/




## v02.24 (2026-07-25)

### 變更內容
把 v02.23 只處理統計頁 4 個 select 的白底彈窗問題，擴大套用到全站剩餘的 `<select class="fsel">`：
- 新增通用包裝函式 `fselPickerize(selectHtml, title, wrapperStyle)`：對「已組好的完整 `<select id="...">` HTML 字串」做屬性注入（`pointer-events:none`）＋疊透明覆蓋層改開 `openSelectSheet` 自訂選單，呼叫端不用重寫既有的 option 產生邏輯
- 套用範圍：
  - 建檔表單 `renderFld()`：通用單選欄位／完整度逐項評級（含自訂項目）／數位帳號／保管位置／價格幣別／個人評分——這幾個是共用於所有分類的欄位渲染核心，槓桿最大
  - 尋寶表單：分類／類型／區域／收藏慾望／通路類型／報價幣別
  - 設定頁：AI 引擎偏好／Gemini 模型／OpenAI 模型／數位帳號常用平台／自訂市場查詢語言
  - 其他：建檔平台選擇、市場估值樣本幣別
- 動態表單欄位原本只有 `data-k`、沒有唯一 `id`（因為同一表單可能同時渲染多個同類型欄位），這次補上 `id="fld-sel-{欄位key}"`／`id="comp-sel-{項目}"`／`id="fld-cur-{欄位key}"` 等唯一 id，`openSelectSheet` 才能正確找到對應的 select
- 已知取捨：Gemini 模型選單原本用 `<optgroup>` 分組（免費/付費），`select.options` 本來就會跨 optgroup 攤平成單一清單，改用自訂選單後失去分組標題，這次接受此簡化，不影響功能

自我檢查：語法/亂碼/CSS 花括號配對通過；13 項測試涵蓋 `fselPickerize` 字串轉換邏輯（id/style 屬性正確注入、已有 style 時正確串接不覆蓋、無 id 時安全退回原生 select、wrapperStyle 自訂）與既有 `openSelectSheet`/`pickSelectSheetOpt` 回歸測試，全數通過；另外用靜態掃描確認全部 16 個 `fselPickerize()` 呼叫都對應到有效 id，沒有遺漏。

### 影響檔案
- docs/index.html / docs/GameVault_v02_24_index.html
- docs/sw.js

### GS 版本
- 無（純前端互動/視覺調整）

### PWA 快取
- CACHE_NAME: gamevault-v02-23 → gamevault-v02-24

### 對應備份
- _internal/old/v02_23/
