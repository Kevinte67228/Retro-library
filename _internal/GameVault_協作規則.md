# GameVault 協作規則

最後更新：2026-06-30

這份文件記錄 GameVault 的協作方式與部署規則，每次修改、產版、部署或整理檔案時依照這裡的規則處理。

---

## 專案定位

GameVault 是一個 PWA 收藏管理工具，前端網頁負責手機操作體驗，Google Apps Script 作為後端橋樑，Google 試算表作為私人資料庫。

主要資料類別：遊戲、書籍、主機、週邊、尋寶

---

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

---

## 版本編號規則

版本號格式為 `vXX.YY`：

- `XX` 為主版號，對應 **Google Apps Script 後端版本**。
- `YY` 為小版號，對應 **前端 HTML/PWA 版本**，每做一次前端更新遞增一次。

**主版號（XX）異動條件：**
- Apps Script 後端邏輯有實質變更時，XX 遞增，YY 歸零重從 01 開始。
- 使用者明確要求主版號升級時。
- 純前端、UI、PWA 快取、文件或手冊更新，不可變更主版號。

**小版號（YY）異動條件：**
- 每做一次前端更新（不論改動大小），YY 遞增一次。

**子版號（aN）── bug 修復／UI／錯字調整專用：**
- 格式為 `vXX.YYaN`，例如 `v40.43a1`、`v40.43a2`，依序遞增。
- 適用範圍：**bug 修復、UI 微調、錯字訂正**這類非功能性的小幅修正。
- 觸發時機：在同一個 `vXX.YY` 基準上連續修正時使用，不單獨遞增 `YY`。
- **不執行備份**：子版號更新不複製檔案到 `_internal/old/`，也不產生對應的 `_internal/old/vXX_YYaN/` 資料夾。
- **不產生版本 HTML 檔**：不需要額外建立 `GameVault_vXX_YYaN_index.html`，沿用目前的版本 HTML 檔（`sw.js` 的 `CACHE_NAME` 仍需遞增以強制更新快取）。
- **CHANGELOG 仍需更新**：簡短記錄修了什麼，但不需要完整四段格式，可用一行條列。
- 下一次正式功能更新時，`YY` 正常遞增、`aN` 歸零（不帶子版號）。

**Debug 版本（d 開頭）── Claude 除錯排查專用：**
- 格式為 `vXX.YYd`、`vXX.YYd2`、`vXX.YYd3`...，用於加入臨時 `console.log`／`toast`／`alert` 等除錯輸出，協助定位問題。
- **僅 Claude 內部排查使用**，確認問題後須移除 debug 程式碼，回到正式版本號（`vXX.YY` 或 `vXX.YYaN`）才算完成。
- **不執行備份**，不產生版本 HTML 檔，不需要完整 CHANGELOG 記錄。

**Apps Script 版本檔命名：**
- 部署用統一檔名：`GameVault_AppsScript.gs`
- 封存用：`GameVault_v40_AppsScript.gs.txt`
- 只有後端程式有修改，或使用者明確要求時才生成。

**當前版本狀態（2026-06-30）：**
- GS 後端：`v42`
- HTML 前端：`v42.03`
- GitHub repo：`Kevinte67228/Retro-library`
- Netlify：`reteogame.netlify.app`（從 `GameVault/` 資料夾部署）

---

## Repo 結構

```
Retro-library/
├── GameVault/              ← Netlify 部署根目錄（公開）
│   ├── index.html
│   ├── GameVault_vXX_YY_index.html
│   ├── GameVault_AppsScript.gs
│   ├── sw.js
│   ├── manifest.json
│   ├── manual.html
│   ├── bg.webp
│   └── icons/
│       ├── icon-*.png/webp
│       └── mkt-*.webp/jpg
└── _internal/              ← 不部署（私有，Netlify 完全不碰）
    ├── CHANGELOG.md        ← 版本更新記錄（最近 4 筆）
    ├── GameVault_協作規則.md
    ├── github_deploy.py    ← 自動部署腳本（不含 token）
    └── old/                ← 版本備份（最近 5 個，僅一般 vXX.YY 正式版；子版號/debug 版不備份）
        ├── v40_43/
        ├── v40_44/
        ├── v40_45/
        ├── v40_46/
        └── v40_47/
```

**重要：**
- `GameVault/` 只放對外公開的 PWA 部署檔案。
- `_internal/` 不在 Netlify publish directory 內，任何備份和內部文件都不公開。
- Token 絕對不進 repo，每次由使用者提供。

---

## GitHub 自動部署流程

每次產新版，Claude 透過 GitHub API 自動完成以下步驟，不需要手動下載上傳。

**子版號（`vXX.YYaN`）與 debug 版（`vXX.YYd`）例外：** 不執行下列「1. 備份」與「2. 清理舊備份」步驟，直接跳到「3. 推送新版檔案」，且不產生對應的 `GameVault_vXX_YYaN_index.html` 版本 HTML（沿用目前已存在的版本 HTML 檔案）。

**1. 備份目前版本**（一般 `vXX.YY` 正式版適用）
把 `GameVault/` 現有核心檔案複製到 `_internal/old/<目前版號>/`（含 `icons/` 子資料夾）。

**2. 清理舊備份**（一般 `vXX.YY` 正式版適用）
`_internal/old/` 最多保留 5 個版本，超過則刪最舊的。

**3. 推送新版檔案**
把新版本的以下檔案推到 `GameVault/`：
- `index.html`
- `GameVault_vXX_YY_index.html`（新版本號；子版號/debug 版不產生此檔）
- `sw.js`
- `manifest.json`
- `GameVault_AppsScript.gs`（有更新時）

並刪除舊的版本 HTML（`GameVault_vXX_YY-1_index.html`）。子版號/debug 版因不產生新版本 HTML，故也不執行此刪除步驟。

**4. 更新 CHANGELOG**
在 `_internal/CHANGELOG.md` 頂端插入新版記錄，超過 4 筆則刪最舊。子版號（`vXX.YYaN`）與 debug 版（`vXX.YYd`）用一行條列簡記即可，不需完整四段格式。

**5. Netlify 自動部署**
GitHub push 觸發 Netlify 自動重新部署，約 1～2 分鐘完成，無需手動操作。

**所需資訊（每次新對話開始時提供）：**
- GitHub Token：`ghp_...`（classic token，repo scope）
- Repo：`Kevinte67228/Retro-library`
- Netlify publish directory：`GameVault`

---

## CHANGELOG 格式

`_internal/CHANGELOG.md` 記錄每次版本的改動內容，保留最近 4 筆。一般 `vXX.YY` 正式版格式如下：

```markdown
## vXX.YY (YYYY-MM-DD)

### 變更內容
- 具體改了什麼

### 影響檔案
- 列出異動的檔案

### GS 版本
- 有變更則說明，無變更則寫「無」

### PWA 快取
- CACHE_NAME 是否遞增

### 對應備份
- _internal/old/vXX_YY/
```

子版號（`vXX.YYaN`）與 debug 版（`vXX.YYd`）簡記格式：

```markdown
## vXX.YYaN (YYYY-MM-DD)
- 一行條列說明修了什麼（bug/UI/錯字），不需四段格式，不需「對應備份」（因不執行備份）。
```

---

## 改版流程（完整）

每次產生新版時，依序執行：

1. 在 Claude 容器建立新版本資料夾，例如 `/home/claude/v40_34/`。
2. 修改 `index.html` 與 `GameVault_v40_34_index.html`（兩者內容完全一致）。
3. 更新 `APP_VERSION='v40.34'`。
4. 更新 `sw.js` 的 `CACHE_NAME`，例如 `gamevault-v40-34`。
5. 更新 `sw.js` 預先快取清單（相對路徑，不寫資料夾前綴）。
6. 確認 `manifest.json` 的 `start_url` 為 `./`。
7. 執行驗證清單。
8. 透過 GitHub API 自動部署（備份 → 清理 → 推送 → 更新 CHANGELOG）。
9. 確認 Netlify 部署完成，`reteogame.netlify.app` 正常運作。

**子版號（`vXX.YYaN`）簡化流程：**

1. 直接修改 `index.html`（沿用既有的 `GameVault_vXX_YY_index.html`，同步更新內容使兩者一致）。
2. 更新 `APP_VERSION='vXX.YYaN'`（如 `v40.43a1`）。
3. 更新 `sw.js` 的 `CACHE_NAME`（仍需遞增以強制更新快取）。
4. 執行驗證清單。
5. 透過 GitHub API 推送（**跳過備份與清理步驟**），更新 CHANGELOG（一行簡記）。
6. 確認 Netlify 部署完成。

---

## PWA 快取原則

`sw.js` 預先快取清單使用相對路徑：

```javascript
const STATIC_ASSETS = [
  './',
  './index.html',
  './GameVault_vXX_YY_index.html',
  './manifest.json',
  './manual.html',
  './bg.webp',
  './icons/icon-144.png',
  './icons/icon-192.png',
  './icons/apple-touch-icon.png'
]
```

每次版本更新必須遞增 `CACHE_NAME`，確保瀏覽器強制重新安裝 Service Worker。收藏資料靠 `localforage` 快取，不靠 Service Worker。

---

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

---

## Apps Script 原則

- Apps Script 版本採整數主版號，例如 `v40`。
- 只有後端程式有變更，或使用者明確要求時才產生新版本。
- 提供給 Apps Script 編輯器時，必須是完整檔案內容，不可只貼片段。
- `GameVault_AppsScript.gs` 放在 `GameVault/` 根目錄，讓使用者可從 App 內直接下載（連結加 `download` 屬性）。

修改 Apps Script 後需檢查：

- 語法能被 JavaScript parser 接受（`node --check`）
- 函式括號完整
- `doGet`、`doPost`、`listAll`、`listSheet` 等核心流程未被截斷

---

## 驗證清單

每次完成修改後至少檢查：

- `index.html` 前端 `<script>` 語法通過（`node --check`）
- `index.html` 與版本 HTML 內容一致（SHA-256 hash 相符）
- `sw.js` 的 `CACHE_NAME` 已遞增
- 沒有產生亂碼或 Unicode 替代字元（U+FFFD）
- `manifest.json` 的 `start_url` 仍是 `./`
- 若有 GS 異動，`node --check` 語法通過
- GitHub push 成功，Netlify 自動部署完成
- `_internal/CHANGELOG.md` 已更新
- `_internal/old/` 備份已建立

---

## 驗證方式避雷與固定路線

### 不再使用的驗證方式

- 不要在 inline Node 腳本中直接寫中文測試字串，一開始就用 Unicode escape 或讀 UTF-8 檔案。
- 不要用瀏覽器自動化直接開 `file://` 本機 HTML。
- 不要為了驗證 UI 小改動啟動整套瀏覽器流程；能靜態檢查就靜態檢查。
- 不要用 Node REPL MCP 跑 `new Function(...)` 語法檢查；該環境禁止從字串產生函式。

### 固定驗證路線

- **JS 語法**：把 script 區塊寫成暫存 `.js` 檔，用 `node --check`。
- **HTML 一致性**：SHA-256 hash 比對。
- **PWA 快取**：確認 `CACHE_NAME` 已遞增，`STATIC_ASSETS` 路徑存在。
- **中文邏輯測試**：一律用 Unicode escape 或從 UTF-8 檔案讀入。
- **UI 欄位**：靜態 source check，確認 key/label 存在或已移除。

---

## 測試腳本編碼原則

在 bash_tool 內用 Python / Node 腳本測試中文邏輯時：

- 用 Unicode escape 寫測試資料，例如 `\u5168\u65b0` 代表 `全新`。
- 或從已確認為 UTF-8 的檔案讀取測試資料。
- 使用 Python `repr()` + `.encode('utf-8').hex()` 診斷 Unicode 正規化差異。

---

## 長對話內容管理

協作對話進行中，自動監視上下文使用量，依照以下兩個閾值處理：

- **70% 警戒**：開始提高回覆精簡程度，減少不必要的重複說明與展開驗證細節。
- **80% 執行壓縮**：主動壓縮內文。具體做法：
  - 移除已完成步驟的驗證過程細節，只保留結果。
  - 將已解決且無需再引用的中間步驟大幅縮寫。
  - 將長段確認內容小結成一兩行。
  - 保留目前任務相關的關鍵資訊，不切斷可能被後續對話引用的資料。

---

## GitHub 檔案直接讀取

需要查看或修改現有程式碼時，Claude 直接從 GitHub 讀取最新版本，不需要使用者每次提供 URL。

| 檔案 | Raw URL |
|------|---------|
| `index.html` | `https://raw.githubusercontent.com/Kevinte67228/Retro-library/main/GameVault/index.html` |
| `sw.js` | `https://raw.githubusercontent.com/Kevinte67228/Retro-library/main/GameVault/sw.js` |
| `manifest.json` | `https://raw.githubusercontent.com/Kevinte67228/Retro-library/main/GameVault/manifest.json` |
| `GameVault_AppsScript.gs` | `https://raw.githubusercontent.com/Kevinte67228/Retro-library/main/GameVault/GameVault_AppsScript.gs` |
| `CHANGELOG.md` | `https://raw.githubusercontent.com/Kevinte67228/Retro-library/main/_internal/CHANGELOG.md` |
| `GameVault_協作規則.md`（最新） | `https://raw.githubusercontent.com/Kevinte67228/Retro-library/main/_internal/GameVault_%E5%8D%94%E4%BD%9C%E8%A6%8F%E5%89%87.md` |

**使用時機：**
- 修改 `index.html` 前，先用 `web_fetch` 讀取確認目前程式碼狀態。
- 需要參考目前 `sw.js` 的 `CACHE_NAME` 或預先快取清單時。
- 對話開始時若需要確認目前版本號，讀取 `index.html` 搜尋 `APP_VERSION`。
- 查看最新 CHANGELOG 確認上一版改動內容。

**注意：** `web_fetch` 讀取的是 GitHub 上的已 commit 版本，不是 Claude 容器內正在修改的暫存版本。修改進行中以容器內的檔案為準，完成後 push 到 GitHub 才會更新。

---

## 回覆與協作方式

協作時使用繁體中文。

修改前先簡短說明要動哪些地方；完成後回報：

- 改了什麼
- 產生或更新了哪些檔案
- 做過哪些驗證
- 是否有需要使用者手動處理的事項

若需求不明但可合理判斷，直接採用保守做法完成；若可能影響已部署網站或資料安全，再先詢問確認。
