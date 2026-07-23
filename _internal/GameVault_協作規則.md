# GameVault 協作規則

最後更新：2026-07-21（GameVault/→docs/ 搬遷，改用 GitHub Pages 取代 Netlify）

這份文件記錄 GameVault 的協作方式與部署規則，每次修改、產版、部署或整理檔案時依照這裡的規則處理。

---

## ⚠️ 每次對話開始務必先做的事（防止版本狀態跑掉）

**這份文件如果是透過專案檔案快照拿到的，內容可能已經過時。** 專案檔案是對話開始當下的一次性快照，之後這份文件在 GitHub 上如果被更新過，Claude 手上的版本不會自動跟著更新——尤其是跨對話、對話被壓縮摘要過的情況，更容易發生「记忆」停留在舊狀態的問題。

**在依賴這份文件裡任何版本號、CI/CD 狀態、部署流程做判斷之前，務必先用 GitHub Contents API 重新抓取這份文件、`docs/index.html` 的 `APP_VERSION`、`docs/GameVault_AppsScript.gs` 開頭版本註解的最新內容，不要只憑對話一開始拿到的快照或先前對話摘要判斷現況。**

**已知發生過的真實案例**：Claude 曾因為依賴過時的快照（快照上寫「GAS CI/CD 尚未設定成功」），誤判 CI/CD 還沒設定好，連續好幾個版本都重複提醒使用者「請手動貼到 Apps Script 編輯器」，即使 CI/CD 其實早就設定完成、每次推送都自動部署成功——浪費了使用者的確認時間，也讓使用者誤以為自己漏做了什麼事。之後每次要對「目前狀態是什麼」下判斷前，先重新查證，不要只靠記憶或摘要。

---

## 專案定位

GameVault 是一個 PWA 收藏管理工具，前端網頁負責手機操作體驗，Google Apps Script 作為後端橋樑，Google 試算表作為私人資料庫。

主要資料類別（8 大分類）：遊戲、書籍、主機、週邊、原聲帶、動漫/美術設定集、公仔、數位下載版，另有「尋寶」清單獨立追蹤未入手目標。

其中**原聲帶、動漫/美術設定集、公仔、數位下載版**四個分類採「子類型拆表」架構：使用者選擇分類後還要選子類型，每個子類型有各自量身設計的欄位表，並各自對應 Google 試算表裡一張獨立工作表（不同子類型欄位差異很大，例如漫畫需要「集數」、動畫影集需要「載體格式」，共用一張表會欄位互相打架）。詳見下方「分類與子類型架構」。

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

## 分類與子類型架構

### 8 大分類與子類型清單

| 分類 | 子類型數 | 子類型拆表 |
|------|---------|-----------|
| 遊戲 | 無 | 否（單一 Games 表） |
| 書籍／攻略 | 無 | 否（單一 Books 表） |
| 主機 | 無 | 否（單一 Consoles 表） |
| 週邊 | 無 | 否（單一 Peripherals 表） |
| 原聲帶 | 5 | 是：OstMain／OstSingle／OstChar／OstDrama／OstLive |
| 動漫/美術設定集 | 8 | 是：AnManga／AnArtbook／AnSetting／AnKeyframe／AnMag／AnTv／AnMovie／AnOther |
| 公仔 | 6 | 是：FigScale／FigAction／FigNendo／FigPrize／FigGunpla／FigGk |
| 數位下載版 | 8 | 是：DigiGame／DigiDLC／DigiComic／DigiArtbook／DigiGuide／DigiMag／DigiAudio／DigiVideo |

子類型清單（給使用者看的顯示文字）：

- **原聲帶**：原聲帶、主題曲／單曲、角色歌曲／印象集、廣播劇CD、演唱會音源／其他
- **動漫/美術設定集**：漫畫／單行本、畫冊／插畫集、設定集／公式資料集、原畫集／分鏡集、雜誌／MOOK／同人誌、動畫影集、動畫電影／劇場版、周邊／其他
- **公仔**：比例模型、可動模型、黏土人／Q版、景品／一番賞、組裝模型、GK雕像
- **數位下載版**：下載版遊戲、追加下載內容、電子書（漫畫／單行本）、電子書（畫冊／美術設定）、電子書（攻略／公式書）、電子書（雜誌／MOOK）、數位音源、數位影音

GAS 後端目前共 **32 張工作表**：Games／Books／Consoles／Peripherals／Hunt（5 張基礎表）＋上述 4 分類的 27 張子類型表。

### 前端程式模式

- `catInternal(cat)`：分類名稱正規化，含舊分類值別名對應（如「數位遊戲」「畫集」），確保既有資料自動歸類到新分類名稱。
- `SUBTYPE_META`：子類型選項的單一事實來源，key 為分類名稱，value 為 `{options:[...], other:'...'}`。Step1 建檔流程與尋寶表單都讀這份清單產生子類型選單。
- `hasSubtype(cat)`：判斷該分類是否有子類型。
- 各分類子類型各自的 `_xxHead()`／`_xxTail()` 共用欄位 + 子類型專屬中段欄位，組成 `XXX_FIELDS`／`XXX_SELECTS`／`XXX_GROUPS`／`XXX_GCOL`／`XXX_DEFAULTS`（例如 `_anHead()`/`_anTail()` 給動漫/美術設定集 8 個子類型共用）。
- `XXX_SUBTYPE_META`（如 `DIGITAL_SUBTYPE_META`／`ARTBOOK_SUBTYPE_META`／`FIGURE_SUBTYPE_META`／`OST_SUBTYPE_META`）：子類型 → 欄位集合的分派表。
- `_catMeta(cat, subtype)`：欄位分派統一入口，取代舊版單純以分類名稱查表。4 個拆表分類會依 `subtype` 參數（未傳入則退回全域 `_selectedSubtype`）查出正確的欄位集合；其餘分類直接回傳 `CAT_META[cat]`。
- `fieldsFor`／`selectsFor`／`groupsFor`／`gcolFor`／`defaultsConstFor` 皆已改為 `(cat, subtype)` 兩參數，呼叫端（存檔、編輯表單、詳情頁、CSV 匯出等）都需要明確傳入 `entry.subtype`／`d.subtype`，不要只傳分類名稱。
- 動漫/美術設定集額外有 `ARTBOOK_AI_SPEC` + `_aiSpecFor(cat, subtype)`：AI 圖片辨識規格依子類型分派（不是沿用遊戲的通用規格）。其餘 3 個拆表分類目前 AI 規格仍沿用各分類原本的通用版本，尚未依子類型細分。

### GAS 後端子類型路由

- `resolveType(category, subtype)`：依分類＋子類型決定實際要寫入哪張工作表的內部代號（如 `digigame`／`anmanga`／`figscale`／`ostmain`）。
- `getSheet(type)`：依代號回傳對應的工作表名稱與欄位表。
- `listAll(type)`：合併查詢時已涵蓋全部 32 張工作表（不含 Hunt）。
- 新增分類/子類型時的檢查清單：`resolveType`／`getSheet`／`listAll`／`findRowByUuid`／`fixSheetHeaders`／`backfillUuids`／`collectUsedImgIds_` 這 7 個函式都要同步更新，任何一個漏掉都會導致該類型的圖片孤兒檔清理、UUID 補全或搜尋功能失效。

### 一次性遷移工具（僅需執行一次）

拆表當下若舊資料還留在舊的單一工作表（如 `Digital`／`OST`／`Artbook`／`Figures`），Apps Script 內建對應的遷移函式，採兩階段設計（先複製、核對、再刪除，避免資料遺失）：

- `migrateDigitalToSubtypeSheets()` / `deleteDigitalSheetAfterMigration()`
- `migrateOstToSubtypeSheets()` / `deleteOstSheetAfterMigration()`
- `migrateArtbookToSubtypeSheets()` / `deleteArtbookSheetAfterMigration()`
- `migrateFigureToSubtypeSheets()` / `deleteFigureSheetAfterMigration()`

用法：在 Apps Script 編輯器函式選單選對應的 `migrate...` 函式執行 → 到試算表核對新分頁資料 → 確認無誤後執行對應的 `delete...` 函式清掉舊表。**已經執行過一次的專案不需要再跑。**

### 自訂圖片（extra_images）

所有分類（含 8+8+6+5 個子類型）的欄位表都有 `extra_images` 欄位：JSON 陣列 `[{label, img}]`，每張圖可自訂名稱（作為圖片燈箱的說明文字）。**張數上限依有無 back_img／spine_img 而不同，但都是湊到「封面＋額外＝8 張」的總數**：
- **收藏類別**（遊戲/書籍/主機/週邊及各子類型）：有 cover_img/back_img/spine_img 3 個固定圖檔欄位，`extra_images` 上限 **5 張**，3+5=8。
- **尋寶**：只有 cover_img 1 個固定圖檔欄位（沒有背面/側邊的概念），`extra_images` 上限 **7 張**，1+7=8。

### CSV 匯出／匯入格式（v67.09 起確立，維護時的事實來源）

- **雙標題列格式**：第一列＝內部欄位鍵值（匯入程式辨識用）、第二列＝中文顯示名稱（人閱讀用）、資料從**第三列**起。含 UTF-8 BOM（`\ufeff`）。
- **匯入相容**：偵測第一列若含 `category` 鍵即判定為新格式（資料從第三列）；否則退回舊格式（資料從第二列，有限相容）。
- **欄位來源**：收藏用 `fieldsFor(cat, subtype)` 動態決定欄位、依「分類＋子類型」分成多個檔案（避免不同子類型欄位互相錯位）；尋寶用固定的 `HUNT_HDR`、單一檔案。
- **uuid 一律納入匯出**（收藏與尋寶都是），是匯入去重的依據。輸出邏輯：有效 uid（長度 ≥30 且含 `-`）直接輸出，否則退回 `data.uuid`。
- **圖片欄位照常匯出**：cover_img/back_img/spine_img 與 extra_images 存的是 Drive 檔案 ID（短字串，非圖片二進位），匯入後圖片連結能正確保留，**不要**在匯出時排除圖片欄位。
- **匯入必須逐筆寫回雲端**：透過 `_syncImportedRecords` 對每筆呼叫 `shPost({action:'add',...})` 寫進試算表，不能只寫本機 `localforage` 快取（否則重新同步後資料會消失——這是 v67.11 修過的資料遺失 bug）。匯入完成後同時 `renderColList()` 與（若適用）`renderHuntList()`。

GAS 端有專屬的 `processExtraImages()`／`extractExtraImageIds()` 處理陣列內每張圖的 Drive 上傳與孤兒檔回收，跟單一欄位的 `IMG_COLS`（cover_img/back_img/spine_img）邏輯是分開的，不要混用。

---

## 版本編號規則

版本號格式為 `vXX.YY`：

- `XX` 為主版號，對應 **Google Apps Script 後端版本**。
- `YY` 為小版號，對應 **前端 HTML/PWA 版本**，每做一次前端更新遞增一次。

**主版號（XX）異動條件：**
- Apps Script 後端邏輯有實質變更時，XX 遞增，YY 歸零重從 01 開始。
  - **「實質變更」認定標準：只有實際影響行為的程式邏輯異動才算**（新增/修改函式邏輯、改變資料流程、新增欄位定義等）。**純註解、格式排版、無邏輯影響的文字調整不算**，不需要觸發前端版號歸零。
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
- 封存用：`GameVault_v01_AppsScript.gs.txt`
- 只有後端程式有修改，或使用者明確要求時才生成。

**當前版本狀態（2026-07-17，發布版本重置後）：**
- GS 後端：`v01`
- HTML 前端：`v01.01`
- GitHub repo：`Kevinte67228/Retro-library`
- GitHub Pages：（從 `docs/` 資料夾部署，網址視 Pages 設定／自訂網域而定；尚未對外發布，正式網址待確認後補上）
- GAS 後端：GitHub Actions 自動部署（詳見「GAS 後端 CI/CD 自動部署」章節），不再需要手動貼到 Apps Script 編輯器

**發布版本重置（Release Baseline Reset，2026-07-17）：** 使用者明確要求將當時的 v67.16／GAS v67 正式訂為公開發布起點，版本號重新編號為 **前端 v01.01／GAS v01**。這是**純版本重新編號**，前後端程式碼邏輯與行為跟重置前的 v67.16／v67 完全一致，沒有任何功能異動。同時依使用者指示：
- 清空 `_internal/old/` 所有備份，**包含原本標記永久保留的 `v42_20a1`、`v67_01`**
- `_internal/CHANGELOG.md` 清空重新開始記錄，第一筆即為 `v01.01`
- 重置前已將完整狀態（GAS、前端、manual、icons、舊版 CHANGELOG、舊版協作規則）存進 `_internal/pre_v01_reset_snapshot_v67_16_20260717/` 作為回溯依據（此快照為一次性保存，**不是**常規備份輪替的一部分，不受 5 版輪替規則約束，也不會被自動清理）
- **目前沒有永久備份例外**：`v01.01` 之後的一般版本備份，從下一版起恢復正常「5 版輪替」機制（見下方「GitHub 自動部署流程」）；除非使用者之後再次明確指定新的永久保留基準，否則不主動設定

**版號重整歷史（含本次共三次，供追溯）：**
- **2026-07-13**：前端曾長期未依主版號規則歸零（GAS 從 v62 一路到 v66，前端仍沿用舊的 `v54.x` 未重新計起），一次性追趕修正為 `v66.01`。
- **2026-07-16**：修正 `backfillUuids()` 的驗證不一致（GAS 實質邏輯變更）後，依規則前端主版號跟隨 GAS 歸零為 `v67.01`，GAS 升為 `v67`。
- **2026-07-17**：使用者明確要求的**發布版本重置**，前端 v67.16→`v01.01`、GAS v67→`v01`，同時清空所有備份與 CHANGELOG（見上）。
- 前兩次是「依規則產生的正常歸零」，第三次是「使用者明確指定版號的一次性重置」——三次都不代表往後每次 GAS 有任何異動都要重整，日常開發仍依下方「主版號（XX）異動條件」的「實質變更」定義正常遞增，不會無故再次歸零或重置。

**永久備份例外：** 目前**無**永久備份例外（發布版本重置時已依使用者指示連同原有的 `v42_20a1`、`v67_01` 一併清空）。若使用者之後要求把某個版本標記為永久保留，再依當時指定的版號新增此區塊。

---

## Repo 結構

```
Retro-library/
├── docs/                    ← GitHub Pages 部署根目錄（公開）
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
├── netlify.toml             ← 舊 Netlify 時代殘留設定檔（GitHub Pages 不會讀取，保留無害；若確認不再需要可移除）
└── _internal/                ← 不部署（私有，GitHub Pages 完全不碰）
    ├── CHANGELOG.md        ← 版本更新記錄（最近 4 筆）
    ├── GameVault_協作規則.md
    ├── GameVault_部署架構說明.md
    ├── gh_batch.py          ← Git Data API 批次操作 helper（不含 token）
    ├── github_deploy.py    ← 自動部署腳本（呼叫 gh_batch.py，不含 token）
    └── old/                ← 版本備份（最近 5 個一般版，僅一般 vXX.YY 正式版；子版號/debug 版不備份；目前無永久保留例外，見上方「永久備份例外」）
        ├── v01_02/         ← （範例：v01.01 發布重置後累積的第一批一般備份，5 版輪替）
        ├── v01_03/
        ├── v01_04/
        ├── v01_05/
        └── v01_06/
```

**重要：**
- `docs/` 只放對外公開的 PWA 部署檔案（2026-07-21 由 `GameVault/` 搬遷過來，改用 GitHub Pages 的「Deploy from a branch → main → /docs」機制，取代 Netlify）。
- `_internal/` 不在 GitHub Pages 發布範圍內，任何備份和內部文件都不公開。
- Token 絕對不進 repo，每次由使用者提供。

---

## GitHub 自動部署流程

每次產新版，Claude 透過 GitHub API 自動完成以下步驟，不需要手動下載上傳。

**子版號（`vXX.YYaN`）與 debug 版（`vXX.YYd`）例外：** 不執行下列「1. 備份」與「2. 清理舊備份」步驟，直接跳到「3. 推送新版檔案」，且不產生對應的 `GameVault_vXX_YYaN_index.html` 版本 HTML（沿用目前已存在的版本 HTML 檔案）。

**1. 備份目前版本**（一般 `vXX.YY` 正式版適用）
把 `docs/` 現有核心檔案複製到 `_internal/old/<目前版號>/`（含 `icons/` 子資料夾）。

**2. 清理舊備份**（一般 `vXX.YY` 正式版適用）
`_internal/old/` 最多保留 5 個版本，超過則刪最舊的。

**3. 推送新版檔案**
把新版本的以下檔案推到 `docs/`：
- `index.html`
- `GameVault_vXX_YY_index.html`（新版本號；子版號/debug 版不產生此檔）
- `sw.js`
- `manifest.json`
- `GameVault_AppsScript.gs`（有更新時）

並刪除舊的版本 HTML（`GameVault_vXX_YY-1_index.html`）。子版號/debug 版因不產生新版本 HTML，故也不執行此刪除步驟。

**4. 更新 CHANGELOG**
在 `_internal/CHANGELOG.md` 頂端插入新版記錄，超過 4 筆則刪最舊。子版號（`vXX.YYaN`）與 debug 版（`vXX.YYd`）用一行條列簡記即可，不需完整四段格式。

**5. GitHub Pages 自動部署**
GitHub push 觸發 GitHub Pages 自動重新部署（設定為「Deploy from a branch → main → /docs」），約 1 分鐘內完成，無需手動操作。2026-07-21 起取代 Netlify（原因：Netlify 額度耗盡導致部署被跳過）。

**5-1. GAS 後端自動部署（如有異動 `GameVault_AppsScript.gs`）**
GitHub push 觸發 GitHub Actions（clasp）自動部署到固定的 Apps Script 部署，網址不變，無需使用者手動貼到 Apps Script 編輯器。詳見「GAS 後端 CI/CD 自動部署」章節。

**所需資訊（每次新對話開始時提供）：**
- GitHub Token：`ghp_...`（classic token，repo scope）
- Repo：`Kevinte67228/Retro-library`
- GitHub Pages 發布資料夾：`docs`

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

1. 在 Claude 容器建立新版本資料夾，例如 `/home/claude/v01_02/`。
2. 修改 `index.html` 與 `GameVault_v01_02_index.html`（兩者內容完全一致）。
3. 更新 `APP_VERSION='v01.02'`。
4. 更新 `sw.js` 的 `CACHE_NAME`，例如 `gamevault-v01-02`。
5. 更新 `sw.js` 預先快取清單（相對路徑，不寫資料夾前綴）。
6. 確認 `manifest.json` 的 `start_url` 為 `./`。
7. 執行驗證清單。
8. 透過 GitHub API 自動部署（備份 → 清理 → 推送 → 更新 CHANGELOG）。
9. 確認 GitHub Pages 部署完成，正式網址正常運作（尚未對外發布，網址待補上）。

**子版號（`vXX.YYaN`）簡化流程：**

1. 直接修改 `index.html`（沿用既有的 `GameVault_vXX_YY_index.html`，同步更新內容使兩者一致）。
2. 更新 `APP_VERSION='vXX.YYaN'`（如 `v01.02a1`）。
3. 更新 `sw.js` 的 `CACHE_NAME`（仍需遞增以強制更新快取）。
4. 執行驗證清單。
5. 透過 GitHub API 推送（**跳過備份與清理步驟**），更新 CHANGELOG（一行簡記）。
6. 確認 GitHub Pages 部署完成。

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
- 改動已驗證穩定的 GitHub Pages/PWA 入口路徑
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
- 提供給 Apps Script 編輯器時，必須是完整檔案內容，不可只貼片段（**手動貼上的舊流程，CI/CD 上線後已不需要，見下方章節**）。
- `GameVault_AppsScript.gs` 放在 `docs/` 根目錄，讓使用者可從 App 內直接下載（連結加 `download` 屬性），同時也是 CI/CD 自動部署的來源檔案。

修改 Apps Script 後需檢查：

- 語法能被 JavaScript parser 接受（`node --check`）
- 函式括號完整
- `doGet`、`doPost`、`listAll`、`listSheet` 等核心流程未被截斷
- 新增/異動分類子類型時，`resolveType`／`getSheet`／`listAll`／`findRowByUuid`／`fixSheetHeaders`／`backfillUuids`／`collectUsedImgIds_` 七個函式要同步檢查（見上方「分類與子類型架構」）

---

## GAS 後端 CI/CD 自動部署（GitHub Actions + clasp）

**已於 2026-07-06 設定完成並驗證成功；2026-07-21 觸發路徑隨 `GameVault/`→`docs/` 搬遷同步更新（需使用者手動改 workflow 檔案，見下方提醒）。** 推送 `docs/GameVault_AppsScript.gs` 到 GitHub `main` 分支時，會自動觸發 GitHub Actions，用 [clasp](https://github.com/google/clasp) 把程式碼推上 Google Apps Script，並更新到**固定的 Web App 部署**（deployment），網址不會改變。**取代了先前「使用者手動貼到 Apps Script 編輯器」的流程**，Claude 推送 `.gs` 到 GitHub 後即完成後端部署，不需要再請使用者手動操作。

### 運作方式

- Workflow 檔案：`.github/workflows/deploy-gas.yml`
- 觸發條件：push 到 `main` 且異動 `docs/GameVault_AppsScript.gs`；也支援手動觸發（`workflow_dispatch`）
  ⚠️ **2026-07-21 搬遷提醒**：`.github/workflows/deploy-gas.yml` 裡寫死的觸發路徑仍是舊的 `GameVault/GameVault_AppsScript.gs`，Claude 沒有 `workflow` scope 無法直接修改，**需要使用者手動到 GitHub 網頁把該路徑改成 `docs/GameVault_AppsScript.gs`**，否則往後推送 `.gs` 更新不會觸發 GAS 自動部署。修改前這個提醒不要移除。
- 流程：checkout → 安裝 clasp → 還原 clasp 登入憑證 → 建立暫存 clasp 專案（複製 `.gs`／`appsscript.json`，寫入 `.clasp.json`）→ `clasp push --force` 推送程式碼 → `clasp deploy --deploymentId "$GAS_DEPLOYMENT_ID"` **更新既有部署的版本**（不是新增部署，這是網址保持固定的關鍵）

### 所需 GitHub Secrets（已設定，正常情況不需再碰）

| Secret 名稱 | 用途 |
|------------|------|
| `CLASPRC_JSON` | clasp 登入憑證（`~/.clasprc.json` 內容） |
| `GAS_SCRIPT_ID` | 目標 Apps Script 專案的 Script ID |
| `GAS_DEPLOYMENT_ID` | 固定要更新的部署 ID，**不能寫進任何檔案或程式碼**，只能透過 GitHub Secrets（可用 GitHub API 的 `actions/secrets` 端點以 libsodium sealed box 加密寫入，Claude 有做過這件事） |

### 重要限制

- **Claude 的 GitHub Token 沒有 `workflow` scope**，無法直接推送/修改 `.github/workflows/` 底下的檔案（GitHub 的安全限制，與 repo 權限高低無關）。若這個 workflow 檔案本身需要異動，Claude 只能產生內容給使用者，由使用者手動貼到 GitHub 網頁編輯。
- Secrets 一經寫入無法讀回明文（GitHub API 設計如此），Claude 只能覆蓋寫入，不能核對現有值是否正確；如需確認，只能請使用者到 Apps Script「管理部署作業」核對實際生效中的 deployment ID。
- `clasp deploy --deploymentId X` 若指定的 ID 不存在或不屬於該 Script 專案，行為未定義（可能報錯或另建新部署），deployment ID 一旦確立就不要輕易更換。
- 若之後在 Apps Script 編輯器手動按「新增部署作業」（New deployment），會產生新的 deployment ID／新網址，之後 CI/CD 仍然只會更新原本設定在 Secret 裡的那個 ID，兩者會分岔；如要換成新網址，需同步更新 `GAS_DEPLOYMENT_ID` Secret。

---

## 驗證清單

每次完成修改後至少檢查：

- `index.html` 前端 `<script>` 語法通過（`node --check`）
- `index.html` 與版本 HTML 內容一致（SHA-256 hash 相符）
- `sw.js` 的 `CACHE_NAME` 已遞增
- 沒有產生亂碼或 Unicode 替代字元（U+FFFD）
- `manifest.json` 的 `start_url` 仍是 `./`
- 若有 GS 異動，`node --check` 語法通過
- GitHub push 成功，GitHub Pages 自動部署完成
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

## 時間標記慣例

Claude 產生任何時間戳記（CI 測試標記、commit 訊息、CHANGELOG 日期等）一律使用**台北時間（Asia/Taipei，UTC+8）**，不要用容器預設的 UTC 或伺服器所在時區。

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
| `index.html` | `https://raw.githubusercontent.com/Kevinte67228/Retro-library/main/docs/index.html` |
| `sw.js` | `https://raw.githubusercontent.com/Kevinte67228/Retro-library/main/docs/sw.js` |
| `manifest.json` | `https://raw.githubusercontent.com/Kevinte67228/Retro-library/main/docs/manifest.json` |
| `GameVault_AppsScript.gs` | `https://raw.githubusercontent.com/Kevinte67228/Retro-library/main/docs/GameVault_AppsScript.gs` |
| `CHANGELOG.md` | `https://raw.githubusercontent.com/Kevinte67228/Retro-library/main/_internal/CHANGELOG.md` |
| `GameVault_協作規則.md`（最新） | `https://raw.githubusercontent.com/Kevinte67228/Retro-library/main/_internal/GameVault_%E5%8D%94%E4%BD%9C%E8%A6%8F%E5%89%87.md` |
| `.github/workflows/deploy-gas.yml`（GAS CI/CD） | `https://raw.githubusercontent.com/Kevinte67228/Retro-library/main/.github/workflows/deploy-gas.yml` |

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
