## v42.06 (2026-07-01)

### 變更內容
- 移除 UPC ItemDB 免費試用庫的自動條碼查詢（DB_REGISTRY 移除項目 + _crossRefQuery 拿掉任務）
- 修正純條碼掃描誤配問題：該資料庫偏美版商品，對台/日 JAN 條碼常誤配到不相干商品（例：4713014358376 誤判蠟筆小新）
- 清理相關死代碼：extractField 的 upcitemdb case、primary_name 優先順序陣列
- 更新過時的 ponytail 註解，反映此次才是真正完成移除

### 影響檔案
- index.html / GameVault_v42_06_index.html
- sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: gamevault-v42-05 → gamevault-v42-06

### 對應備份
- _internal/old/v42_05/

## v42.04 (2026-07-01)

### 變更內容
- 收藏頁視圖切換按鈕（卡片／書架）放大，由 34×34px 改為 56×48px
- 改為上圖示下文字版型，加上「卡片」「書架」文字說明
- 選中狀態高亮背景填滿整個放大後的按鈕
- 修正 setView() 切換顏色不一致（#000 → #001018）

### 影響檔案
- index.html / GameVault_v42_04_index.html
- sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: gamevault-v42-03 → gamevault-v42-04

### 對應備份
- _internal/old/v42_03/

## v42.03 (2026-06-30)

### 變更內容
全面掃描程式碼中的繁體中文錯字（UI 文字、toast 訊息、程式註解、placeholder、欄位標籤），確認並修正以下 3 處明確錯字：

- **「遂戲」→「遊戲」**（共 14 處）：含使用者可見 UI（「🔍 查詢遂戲資料庫」按鈕文字）、`_selectedType` 字串比對邏輯、`GROUPS` 分類陣列定義、Gemini OCR prompt 文字。已逐一核對改字後分類比對邏輯仍保持一致（`_selectedType||'遊戲'`、`cat==='遊戲'` 等共 22 處引用全部統一）
- **「侩用」→「供用」**（1 處）：函式說明註解
- **「卿測」→「猜測」**（2 處）：toast 訊息「已帶入 AI 卿測結果」

### 掃描範圍與方法
- 全文逐字頻率分析，列出所有罕見字逐一核對上下文
- 280 條 toast/alert 訊息逐條檢視，語句通順無誤
- 25 條設定頁說明文字逐條檢視，語句通順無誤
- FIELDS／GENRES／GROUPS 等所有陣列定義逐一核對
- 確認「廠商發行」→「發行廠商」改名（v42.02）已正確套用，無遺漏

### 影響檔案
- index.html
- GameVault_v42_03_index.html
- sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME 已遞增：gamevault-v42-03

### 對應備份
- _internal/old/v42_02/
