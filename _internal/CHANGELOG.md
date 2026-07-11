## v54.35 (2026-07-08)

### 變更內容
Barcode Lookup 已無免費 API 方案，全面移除相關程式碼並新增替代方案：
- **移除**：設定頁的 Barcode Lookup API Key 欄位、測試連線、API guide 說明；DB_REGISTRY 資料來源項目；`_crossRefQuery`／欄位優先序／cover_url 候補鏈中的所有相關邏輯；`barcodeLookupSearch()`／`barcodeLookupProxy()`（GAS）等函式；`_normalizeBarcodeProduct`／`_mergeBarcodeProducts`／`productBarcodeLookupPromise` 中的相關分支；因而變成孤兒的輔助函式（`_firstStoreUrl`／`_firstProductImage`）一併清除
- **新增替代方案**：尋寶頁面新增「🔎 條碼查詢」按鈕，輸入條碼後直接開啟 Barcode Lookup 網頁版（`barcodelookup.com/{條碼}`）查詢結果，不需要 API Key，也不用手動再輸入一次條碼
- 條碼資料庫查詢說明文字更新（移除「美版 Barcode Lookup」的描述）

### 影響檔案
- index.html / GameVault_v54_35_index.html
- sw.js
- GameVault_AppsScript.gs（**GS CI/CD 自動部署**）

### GS 版本
- v64 → v65（移除 barcodeLookupProxy）

### PWA 快取
- CACHE_NAME: gamevault-v54-34 → gamevault-v54-35

### 對應備份
- _internal/old/v54_34/

## v54.34 (2026-07-08)

### 變更內容
使用者回報 DeepSeek 混合模式測試連線成功（確認瀏覽器直連 CORS 沒問題，v54.33 的風險已排除）；同時回報 Barcode Lookup 測試出現「請先填入 API Key」錯誤，追查後發現是**說明文字寫錯**：
- **根因**：設定頁說明文字與 API guide 彈窗都寫「免費用戶無需 API Key」，但實際程式碼（前端與 GAS 代理）從一開始就要求一定要有 Key 才會送出請求，兩者互相矛盾，誤導使用者以為欄位可以留空
- **修正**：更正說明文字，改為「免費方案也需要註冊帳號取得 API Key（不用付費，但一定要填）」，跟程式碼實際行為一致

### 影響檔案
- index.html / GameVault_v54_34_index.html
- sw.js

### GS 版本
- 無（純前端文案修正）

### PWA 快取
- CACHE_NAME: gamevault-v54-33 → gamevault-v54-34

### 對應備份
- _internal/old/v54_33/

## v54.33 (2026-07-08)

### 變更內容
新增 DeepSeek 混合式 AI 辨識模式，參照使用者提供的架構文件實作（Gemini Vision OCR + DeepSeek 推理校正）：
- **架構**：DeepSeek 官方 API 本身不支援圖片輸入（純文字模型），改採兩步驟接力：Step1 用 Gemini 抽取封面上所有可見文字（OCR），Step2 把抽出的破碎文字交給 DeepSeek 依 ACG／復古遊戲知識推理校正成結構化 JSON
- 新增 `callDeepSeekCorrect()`（呼叫 `api.deepseek.com/v1/chat/completions`，OpenAI 相容格式，直接前端呼叫比照現有 OpenAI 呼叫模式）與 `callHybridVision()`（管線入口）
- 「偏好 AI 引擎」新增「混合模式」選項（手動強制使用）；「自動」模式新增智慧分流：地區設為日本／亞洲時，優先嘗試混合模式，失敗才退回 GPT/Gemini 原本流程
- 設定頁新增 DeepSeek API Key 欄位＋測試連線＋說明彈窗
- 自我檢查：JSON 容錯解析邏輯（含夾帶說明文字的情況）已驗證通過

### 已知風險 / 待確認
- DeepSeek API 是否允許瀏覽器端直接 CORS 呼叫，沿用了跟 OpenAI 相同的直連模式，但**沒有實際測試過**，如果 DeepSeek 不允許跨網域直連，混合模式會直接失敗（已有自動退回 Gemini 的容錯機制，不會整個中斷，但混合模式本身就會失效）。需使用者實測「測試」按鈕確認

### 影響檔案
- index.html / GameVault_v54_33_index.html
- sw.js

### GS 版本
- 無（DeepSeek 前端直連，未經 GAS 代理）

### PWA 快取
- CACHE_NAME: gamevault-v54-32 → gamevault-v54-33

### 對應備份
- _internal/old/v54_32/

## v54.32 (2026-07-08)

### 變更內容
串接 RAWG 遊戲資料庫，補強 IGDB 對現代／獨立遊戲的封面圖缺漏：
- GAS 新增 `rawg_search` proxy（標準 REST 查詢 `api.rawg.io/api/games`）
- 加入 `DB_REGISTRY`（歐美群），跟現有 11 個資料庫一樣走「自動分流」＋「設定頁可手動強制指定單一庫」的既有機制
- 欄位優先序：主要用於封面圖補強（優先序在 IGDB 之後、樂天之前），文字欄位（名稱/平台/發售日/類型/連結）列為最低優先，僅在其他資料庫都查無時採用（RAWG 基本搜尋不含開發商/發行商資訊，不適合當文字欄位主力來源）
- 設定頁新增 RAWG API Key 欄位＋測試連線＋說明彈窗
- 自我檢查：欄位擷取邏輯（含空資料/null安全性）已驗證通過

### 已知後續
- DeepSeek 圖片辨識／OCR 串接：使用者已確認需求方向（可選引擎＋智慧分流，優先用於亞洲版/CJK文字封面辨識），但因缺少 API Key 與確認過的圖片輸入端點格式，暫緩實作，待使用者提供後再進行
- 使用者提出的「平台分級動態路由」（現代遊戲→RAWG／IGDB，復古平台→強制ScreenScraper）為更精細的路由邏輯，本版僅完成 RAWG 基礎串接，尚未實作平台判斷式的強制分流

### 影響檔案
- index.html / GameVault_v54_32_index.html
- sw.js
- GameVault_AppsScript.gs（**GS CI/CD 自動部署**）

### GS 版本
- v63 → v64（新增 rawg_search proxy）

### PWA 快取
- CACHE_NAME: gamevault-v54-31 → gamevault-v54-32

### 對應備份
- _internal/old/v54_31/

