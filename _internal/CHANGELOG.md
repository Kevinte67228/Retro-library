## v54.37 (2026-07-08)

### 變更內容
修正尋寶「拍照辨識→轉入尋寶」流程：中文品名欄位會被直接塞進辨識到的原文（例如純日文封面辨識出的品名，中文品名跟日文品名填了同一段日文，沒有真的翻譯）：
- 新增 `_huntTranslateToZh()`：偵測辨識到的品名是否含中文字，不含中文字時（純日文/英文/羅馬拼音）才觸發上網查詢中文譯名（沿用既有 Gemini grounding 機制，跟隨使用者的「AI 上網查證」設定）
- 「轉入尋寶」按鈕改為先查詢再帶入表單，原文會保留到日文品名欄位，不會遺失
- 查無公認中文譯名時中文品名留空，不會自行編造翻譯；無 Gemini 金鑰時直接跳過查詢，交由使用者手動填寫

### 影響檔案
- index.html / GameVault_v54_37_index.html
- sw.js

### GS 版本
- 無（純前端邏輯調整）

### PWA 快取
- CACHE_NAME: gamevault-v54-36 → gamevault-v54-37

### 對應備份
- _internal/old/v54_36/

## v54.36 (2026-07-08)

### 變更內容
「🔎 條碼查詢」改用即時掃描框（沿用既有 `createScanner` 機制，跟收藏頁/尋寶頁掃描條碼是同一套：原生 BarcodeDetector，不支援時退回 ZXing）：
- 開啟時自動啟動相機掃描，對準條碼即自動偵測並帶入輸入框，立即開啟 Barcode Lookup 網頁版查詢後自動關閉掃描畫面
- 保留手動輸入條碼作為備援（裝置不支援掃描、或條碼損毀無法辨識時使用），偵測到裝置不支援或相機啟動失敗會顯示對應提示文字

### 影響檔案
- index.html / GameVault_v54_36_index.html
- sw.js

### GS 版本
- 無（純前端功能調整）

### PWA 快取
- CACHE_NAME: gamevault-v54-35 → gamevault-v54-36

### 對應備份
- _internal/old/v54_35/

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

