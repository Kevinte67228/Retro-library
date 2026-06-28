# GameVault 協作規則

最後更新：2026-06-28

這份文件用來記錄目前 GameVault 的協作方式，之後每次修改、產生版本檔、整理舊檔或檢查 PWA 快取時，都依照這裡的規則處理。

## 專案定位

GameVault 是一個 PWA 收藏管理工具，前端網頁負責手機操作體驗，Google Apps Script 作為後端橋樑，Google 試算表作為私人資料庫。

主要資料類別：

- 遊戲
- 書籍
- 主機
- 週邊
- 尋寶

## 開發工作哲學

採用「懶惰的資深開發者」模式：懶惰代表有效率，不代表草率。最好的程式碼，是不需要寫的程式碼。

動手寫程式前，先依序確認：

1. 這件事真的需要做嗎？避免 YAGNI。
2. 標準語法或瀏覽器內建 API 是否已經能處理？能用就用。
3. PWA、HTML、CSS、Google Apps Script 或 Google 試算表的原生能力是否已足夠？優先使用。
4. 現有專案內是否已經有可重用的函式或模式？優先沿用。
5. 能否用很小的改動完成？就不要擴大修改面。
6. 只有以上都不成立時，才寫最少但能穩定運作的新程式。

實作時遵守：

- 不新增未被需求支持的抽象層。
- 能避免就不新增相依套件。
- 不寫沒人要求的樣板程式。
- 可刪除就不要新增；可直白就不要炫技。
- 盡量用最少檔案完成需求。
- 複雜需求要先判斷是否有更簡單的替代方案。
- 若兩種做法一樣簡短，選邊界條件更正確的做法。
- 若刻意採用簡化做法，用 `ponytail:` 註解標記，並說明已知上限（例如 O(n²) 掃描、全域鎖、naive heuristic）與未來升級路徑。複雜請求先質疑：「真的需要 X，還是 Y 就夠了？」

不能偷懶的地方：

- 信任邊界的輸入驗證。
- 會避免資料遺失的錯誤處理。
- 安全性與隱私。
- 手機實機校正與 PWA 快取行為（平台永遠不等於規格理想值）。
- 可及性與基本操作可用性。
- 使用者明確指定的需求。

**Self-check 規則**：非單行、非純樣式的邏輯修改，完成後必須留下或執行**一個**最小可執行檢查——最小的、邏輯壞掉就會失敗的驗證（assert、自我檢查腳本或單一測試檔）；不用測試框架，不用 fixtures。單純的單行程式不需要測試。

**邏輯漏洞自檢規則**：每次完成實作後，必須主動檢查所有邏輯漏洞、邏輯矛盾與邏輯斷層，自行審查更正後再提出新方案。不要等待使用者發現問題再回頭討論。

## 版本編號規則

版本號格式為 `vXX.YY`，其中：

- `XX` 為主版號，對應 **Google Apps Script 後端版本**。
- `YY` 為小版號，對應 **前端 HTML/PWA 版本**，每做一次前端更新遞增一次。

**主版號（XX）異動條件：**
- Apps Script 後端邏輯有實質變更時，XX 遞增，YY 歸零重從 01 開始。
- 使用者明確要求主版號升級時。
- 純前端、UI、PWA 快取、文件或手冊更新，不可變更主版號。

**小版號（YY）異動條件：**
- 每做一次前端更新（不論改動大小），YY 遞增一次。
- 例如目前是 `v40.33`，下一次純前端更新為 `v40.34`。

**Apps Script 版本檔命名：**
- 後端版本只取主版號，例如 `GameVault_AppsScript.gs`（部署用統一檔名）或 `GameVault_v40_AppsScript.gs.txt`（封存用）。
- Apps Script 版本檔只有在後端程式有修改，或使用者明確要求時才生成。

**當前版本狀態（2026-06-28）：**
- GS 後端：`v40`
- HTML 前端：`v40.33`
- 版本資料夾：`v40_33/`
- Google Drive 協作資料夾：GameVault（ID: `1KR6yuL9ZHPaNzZ8bCFuBRNRl7kGjzXOp`）
- Drive 連結：https://drive.google.com/drive/folders/1KR6yuL9ZHPaNzZ8bCFuBRNRl7kGjzXOp

## 檔案結構原則

`Codex` 根目錄採「乾淨根目錄」模式，正常情況只保留：

- 最新版本資料夾，例如 `Codex/v40_33/`
- 協作文件 `Codex/GameVault_協作規則.md`
- 更新紀錄 `Codex/GameVault_更新紀錄.md`
- UI / 資料規劃文件，例如 `Codex/GameVault_UI資料規劃.md`
- 當前需要貼到 Apps Script 的版本檔（僅後端有變更時才存在），例如 `Codex/GameVault_v40_AppsScript.gs.txt`
- 舊版資料夾 `Codex/old/`

每個版本資料夾都必須是一個可直接整包上傳部署的 PWA 目錄。部署相關檔案都要複製一份到版本資料夾內，協作文件不放進版本資料夾。

最新版本資料夾是前端上傳包，不放 Apps Script 檔案。Apps Script 版本檔只放在 `Codex` 根目錄，供手動貼到 Google Apps Script 編輯器，避免整包上傳時把後端程式碼公開成靜態文字檔。

版本資料夾命名採用版本號底線格式：

- `Codex/v40_31/`
- `Codex/v40_32/`
- `Codex/v40_33/`

## 改版流程

每次產生新版時：

1. 先建立新版本資料夾，例如 `Codex/v40_34/`。
2. 從目前最新版本資料夾複製出完整部署包。
3. 將新資料夾內的版本 HTML 重新命名，例如 `GameVault_v40_34_index.html`。
4. 修改新版本資料夾內的 `index.html` 與版本 HTML，兩者內容需保持一致。
5. 更新前端版本號，例如 `APP_VERSION='v40.34'`。
6. 更新新版本資料夾內 `sw.js` 的 `CACHE_NAME`，例如 `gamevault-v40-34`。
7. 更新新版本資料夾內 `sw.js` 的預先快取清單。路徑使用相對路徑（`./index.html`、`./GameVault_v40_34_index.html` 等），不要寫成 `./v40_34/...`。
8. 保留 `manifest.json` 的 `start_url` 為 `./`，避免 Netlify 404。
9. `manual.html` 維持原本檔名，並納入預先快取。
10. `icons/`、`bg.webp`、`manifest.json`、`sw.js`、`GameVault_AppsScript.gs` 都要存在於新版本資料夾內。
11. Apps Script 只有在後端有變更或使用者要求時，才生成對應版本檔；檔案放在 `Codex` 根目錄，例如 `Codex/GameVault_v41_AppsScript.gs.txt`，不要放進最新版本資料夾。
12. 產生下一個版本時，如果上一版有對應的 Apps Script 檔案仍放在 `Codex` 根目錄，先把該 `.gs.txt` 放入上一版資料夾，再把上一版資料夾整個搬到 `Codex/old/`。
13. 追加一筆更新紀錄到 `Codex/GameVault_更新紀錄.md`。
14. 清理 `Codex` 根目錄，正常只留下最新版本資料夾、協作文件、更新紀錄、必要的 UI / 資料規劃文件、當前 Apps Script 版本檔與 `old/`。

## 更新紀錄原則

`Codex/GameVault_更新紀錄.md` 用來記錄每個版本改動，屬於協作文件，不放入任何 `vXX_XX` 部署資料夾。

每次產生新版資料夾後，必須追加一筆版本紀錄，至少包含：

- 版本號與日期
- 變更摘要
- 修正項目
- PWA / 快取異動
- Apps Script 是否有變更
- 影響檔案
- 驗證結果
- 備註或實機測試提醒

若某一類沒有變更，明確寫「無」或「無變更」，避免之後回查時無法判斷是忘記寫還是真的沒改。

更新紀錄只描述已完成的事，不寫尚未實作的想法；待辦事項應放在對話或另行整理，不混入版本紀錄。

## PWA 快取原則

每個版本資料夾內的 `sw.js` 只處理該部署包內的靜態資源快取，例如：

- `./`
- `./index.html`
- `./GameVault_v40_33_index.html`
- `./manifest.json`
- `./manual.html`
- `./bg.webp`
- `./icons/icon-144.png`
- `./icons/icon-192.png`
- `./icons/apple-touch-icon.png`

收藏資料不靠 service worker 快取，而是靠前端的 `localforage`。

收藏載入策略應維持：

- 先顯示本機快取資料
- 再背景同步 Google 試算表
- 背景同步不要用遮罩卡住畫面
- App 啟動時不要預先渲染整個收藏列表，等使用者進入收藏頁再渲染

每次版本更新必須遞增 `CACHE_NAME`（例如 `gamevault-v40-33` → `gamevault-v40-34`），確保瀏覽器強制重新安裝 Service Worker，載入新版 HTML。

## 部署檔案規則

版本資料夾內至少應包含：

- `index.html`
- `sw.js`
- `manifest.json`
- `manual.html`
- `bg.webp`
- `icons/`
- `GameVault_vXX_YY_index.html`（版本備份 HTML，與 index.html 內容完全一致）
- `GameVault_AppsScript.gs`（部署用統一檔名，方便使用者下載後貼入 Apps Script）

版本資料夾內**不放** `GameVault_vXX_AppsScript.gs.txt` 或其他後端封存檔。

`GameVault_AppsScript.gs` 提供給使用者從應用程式內下載，連結採 `download` 屬性觸發瀏覽器下載行為（而非開啟顯示）。

## 修改範圍原則

**預設規則：現有 UI 設計風格視為已鎖定，所有新增或調整都必須沿用現有設計語言，不得自行引入新風格、新元件樣式或重新詮釋視覺。**

只有在使用者明確提出修改視覺風格的需求時，才可變更設計。若需求敍述中沒有提到視覺或外觀，預設整體外觀維持不變。

除非使用者明確要求，絕對不做：

- 更改整體色彩主題或風格走向
- 替換、重設計或大幅調整 icon
- 改動元件的視覺層級與排版結構
- 引入新的 CSS 設計系統或 class 命名慣例
- 搬動 `manual.html` 檔名
- 改動已驗證穩定的 Netlify/PWA 入口路徑
- 一次性重構與需求無關的大量程式

現行 UI 設計規範（新增元件必須遵守）：

- 整體採深色背景搭配霓虹色調（`dv2-*` CSS 設計系統）
- 新增卡片或區塊：使用 `dv2-*` card 樣式，深色底色加彩色頂部色條
- 各頁面有各自的 accent 色，新元件沿用同頁面的 accent 色變數
- 四分類（遊戲／書籍／主機／週邊）TAG 顏色需彼此可辨識，不可混用
- 收藏頁 TAG 不要重複顯示同類型資訊
- 手機版文字不可溢出或互相遮擋
- 按鈕佈局：取消在左、確認動作在右，並排 flexbox 排列


## Apps Script 原則

Apps Script 版本檔不必每次跟著 HTML 改版產生；只有後端程式有變更，或使用者明確要求時才產生。

Apps Script 的後端邏輯版本採整數主版號，例如 `v40`。若需要輸出版本檔，封存用檔名依主版號編列，例如 `GameVault_v40_AppsScript.gs.txt`；部署用統一檔名為 `GameVault_AppsScript.gs`。

當前 Apps Script 版本檔必須放在 `Codex` 根目錄，不放在最新 `vXX_YY` 部署資料夾內。

當下一版產生、上一版資料夾準備搬入 `Codex/old/` 時，才把上一版對應的 Apps Script 版本檔放回上一版資料夾，作為歷史版本封存。封存後 `Codex` 根目錄只保留目前最新版需要使用的 Apps Script 檔。

需要提供給 Apps Script 編輯器時，必須是完整檔案內容，不可只貼片段，避免出現 `Unexpected end of input` 之類的語法錯誤。

修改 Apps Script 後需檢查：

- 語法能被 JavaScript parser 接受
- 函式括號完整
- `doGet`、`doPost`、`listAll`、`listSheet` 等核心流程未被截斷

## 驗證清單

每次完成修改後至少檢查：

- `index.html` 前端 `<script>` 語法通過
- 版本 HTML 前端 `<script>` 語法通過
- 若本次有生成 Apps Script 版本檔，Apps Script 版本檔語法通過
- `index.html` 與版本 HTML 內容一致（SHA-256 hash 相符）
- 最新版本資料夾內的 `sw.js` 的 `CACHE_NAME` 已遞增
- 最新版本資料夾內不得包含 `GameVault_vXX_AppsScript.gs.txt`
- 沒有產生亂碼或 Unicode 替代字元（U+FFFD）
- `manifest.json` 的 `start_url` 仍是 `./`
- `Codex/GameVault_更新紀錄.md` 已追加本次版本紀錄
- `Codex` 根目錄只留下最新版本資料夾、協作文件、更新紀錄、必要規劃文件、當前 Apps Script 版本檔、`old/`

## 驗證方式避雷與固定路線

為避免反覆浪費時間在已知會失敗或結果不可信的檢查方式，之後驗證直接採用可行路線，不再先嘗試問題路線。

### 不再使用的驗證方式

- 不要在 PowerShell here-string / inline Node 腳本中直接寫中文測試字串，再拿輸出結果判斷功能是否正確。
- 不要先跑一次含中文 inline 測試、發現亂碼後再改跑 Unicode escape；一開始就用 Unicode escape 或讀 UTF-8 檔案。
- 不要用瀏覽器自動化直接開 `file://` 本機 HTML。
- 不要用 PowerShell `Start-Process` 或 `Start-Job` 臨時啟動 localhost 預覽伺服器作為預設驗證方式。
- 不要在 Browser 的只讀頁面環境中動態建立 DOM 元素來測 CSS，或讀取外部 stylesheet 的 `cssRules`。
- 不要為了驗證 UI 小改動而啟動一整套瀏覽器流程；能用靜態檢查、語法檢查、DOM 既有節點檢查完成時，就不要升級到瀏覽器。
- 不要假設 PowerShell 已經能直接呼叫 `node`。
- 不要用 Node REPL MCP 來跑 `new Function(...)` 類型的語法檢查；該環境禁止從字串產生函式。
- 不要把長段 Node 檢查直接塞進 PowerShell `-e "..."` 並混用引號；容易被截斷造成假的語法錯誤。

### 固定驗證路線

依修改類型選擇最短可靠路線：

- **純 HTML / JavaScript 邏輯**：把 script 區塊寫成暫存 `.js` 檔，用 `node --check` 驗證語法。
- **版本 HTML 一致性**：比較 `index.html` 與 `GameVault_vXX_YY_index.html` 的 SHA-256 hash。
- **PWA 快取**：解析 `sw.js` 的 `STATIC_ASSETS`，逐一確認檔案存在；確認 `CACHE_NAME` 已遞增。
- **Apps Script**：只有本次有生成 `.gs` 時才用 `node --check` 檢查語法與核心函式名稱。
- **中文邏輯測試**：一律用 Unicode escape 寫測試資料，或從 UTF-8 檔案讀入。
- **UI 欄位存在 / 移除**：優先做靜態 source check，例如檢查欄位 key、label 片段是否存在或已移除。
- **瀏覽器驗證真的必要時**：由 Node 啟動臨時 HTTP server，再用 `http://127.0.0.1:<port>/` 開啟；驗證後立刻關閉。

### 驗證回報方式

回報時只列實際採用且成功的驗證，不敘述已知失敗路線。若某項驗證因環境限制無法做，直接說明改採哪個可靠替代檢查。

## 測試腳本編碼原則

在 bash_tool 內用 Python / Node 腳本測試中文邏輯時：

- 用 Unicode escape 寫測試資料，例如 `\u5168\u65b0` 代表 `全新`。
- 或從已確認為 UTF-8 的檔案讀取測試資料，再交給腳本處理。
- 若測試結果涉及中文比對，測試資料與預期值都應使用 Unicode escape 或檔案讀取。
- 使用 Python `repr()` + `.encode('utf-8').hex()` 診斷 Unicode 正規化差異（例如相似漢字用了不同 code point）。

## 舊檔整理原則

版本更新後，上一版的版本資料夾整個搬到 `Codex/old/`。不要只搬資料夾內的單一檔案。

搬移前先確認：

- 不搬目前最新版本資料夾
- 不搬 `GameVault_協作規則.md`
- 不搬 `GameVault_更新紀錄.md`
- 若上一版有對應 Apps Script 封存檔，先從 `Codex` 根目錄放入上一版資料夾，再搬到 `Codex/old/`
- `Codex/old/` 內可以保留歷史版本資料夾與舊散落檔案備份

## 長對話內容管理

協作對話進行中，自動監視上下文使用量，依照以下兩個閾值處理：

- **70% 警戒**：上下文使用量達到 70%，開始檢視回覆內容是否過度冗長、有無可刪除的內容。提高每次回覆的精簡程度，減少不必要的重複說明。
- **80% 執行壓縮**：上下文使用量達到 80%，主動壓縮內文。具體做法：

  - 移除展開的驗證過程細節，只保留結果。
  - 將已解決且無需再引用的中間步驟大幅縮寫。
  - 將長段確認內容小結成一兩行。
  - 保留目前任務相關的關鍵資訊，不切斷可能被後續對話引用的資料。

## 檔案產出與上傳路徑

每次產出版本檔案後，透過 Google Drive MCP 直接上傳到協作資料夾，不需要手動下載再上傳。

- **目標資料夾**：GameVault（`1KR6yuL9ZHPaNzZ8bCFuBRNRl7kGjzXOp`）
- **連結**：https://drive.google.com/drive/folders/1KR6yuL9ZHPaNzZ8bCFuBRNRl7kGjzXOp

標準上傳項目（每次產版完成後）：

| 檔案 | 說明 |
|------|---------|
| `index.html` | 最新前端 |
| `GameVault_vXX_YY_index.html` | 版本備份 HTML |
| `sw.js` | Service Worker |
| `GameVault_協作規則.md` | 協作規則（有更新時） |
| `GameVault_AppsScript.gs` | 後端程式（有更新時） |

`manifest.json` 只有內容有變更時才上傳。Drive 上已存在的同名檔案會被覆蓋，保持資料夾不鬼亂。

## 回覆與協作方式

協作時使用繁體中文。

修改前先簡短說明要動哪些地方；完成後回報：

- 改了什麼
- 產生或更新了哪些檔案
- 做過哪些驗證
- 是否有需要使用者手動處理的事項

若需求不明但可合理判斷，直接採用保守做法完成；若可能影響已部署網站或資料安全，再先詢問確認。
