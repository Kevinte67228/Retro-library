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

## v42.07 (2026-07-01)

### 變更內容
- barAIFill 純條碼猜測 prompt 加上反腦補鐵律：查無明確可信來源時，primary_name 等欄位一律留空，notes 填「條碼查無資料，需人工確認」，禁止用訓練記憶臆測
- 結果處理加上偵測：AI 主動回報查無資料時顯示警告 toast，不再誤報為辨識成功
- 有辨識結果時 toast 加註「純條碼推測，建議核對包裝盒」提醒使用者覆核
- 背景：4713014358376 條碼即使開啟 grounding 仍被誤判為蠟筆小新周邊，確認是網路搜尋結果本身不可靠、模型仍用訓練記憶自信作答，非程式邏輯錯誤

### 影響檔案
- index.html / GameVault_v42_07_index.html
- sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: gamevault-v42-06 → gamevault-v42-07

### 對應備份
- _internal/old/v42_06/
