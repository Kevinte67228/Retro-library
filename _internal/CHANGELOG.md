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

## v42.09 (2026-07-01)

### 變更內容
- grounding 模式改用 API 回傳的 groundingMetadata（groundingChunks）客觀驗證是否真的有網路搜尋來源，不再只信任模型自我回報「查無資料」
- 若要求 grounding 但回應無任何真實搜尋來源（_groundCount===0），不論模型輸出什麼名稱一律強制清空 primary_name 並標記「需人工確認（AI 未取得可信搜尋來源）」
- 背景：4713014358376 條碼即使加了搜尋策略指引、分類鎖定解套敘述，v42.08 仍給出錯誤答案（Nintendo Switch 主機），確認純靠 prompt 指令要求模型「誠實自評」不可靠，模型會用自信語氣講出編造內容，需改用可驗證的 API 資料把關

### 影響檔案
- index.html / GameVault_v42_09_index.html
- sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: gamevault-v42-08 → gamevault-v42-09

### 對應備份
- _internal/old/v42_08/

## v42.08 (2026-07-01)

### 變更內容
- grounding 模式不再強制關閉 thinking（原本統一設 thinkingBudget:0），讓模型能交叉比對搜尋結果；maxOutputTokens 拉高到 16384 避免思考吃光輸出
- grounding 模式逾時從 25 秒延長到 45 秒，因搜尋+思考需要更長時間
- prompt 明確要求用條碼數字本身當搜尋關鍵字、嘗試多種查詢組合，並在來源衝突時以多數/權威來源為準
- prompt 加入分類鎖定解套敘述：system prompt 原本硬性要求「category 固定填遊戲、不要改判」，容易誘導模型硬湊遊戲名稱；新增說明此分類只是使用者掃描前的初步假設，查證結果不符時應如實回報

### 影響檔案
- index.html / GameVault_v42_08_index.html
- sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: gamevault-v42-07 → gamevault-v42-08

### 對應備份
- _internal/old/v42_07/
