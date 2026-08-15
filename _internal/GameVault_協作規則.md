# GameVault 協作規則

最後更新：2026-07-26（清除已無作用的 netlify.toml；修正部署架構說明.md 裡該檔案的路徑錯誤）

這份文件記錄 GameVault 的協作方式與部署規則，每次修改、產版、部署或整理檔案時依照這裡的規則處理。

> 📌 **這份文件是活的，隨時可以請 Claude 更新**——不管是誰在跟 Claude 協作這個專案：發現新規則、踩到新的坑、想調整既有流程，直接跟 Claude 說（例如「幫我把這個記到協作規則」「這次踩的坑要記下來」），Claude 就會把新內容寫進這份文件並推送到 GitHub。下一次對話開工前，Claude 會依 skill 規則自動重新抓取這份文件的最新版本，不會停留在舊快照——不需要手動同步，也不需要重新告訴 Claude 一次。
>
> 🔧 **遇到踩坑，Claude 會主動更新，不用特別交代**——只要一次除錯／實作過程中查出「原本猜錯的假設」「容易搞混的細節」「行為出乎意料的既有機制」這類值得記錄的教訓，Claude 完成當次任務後會主動把它寫進這份文件（跟 `retrovault-deploy`／`github-batch-deploy` 兩個 skill 裡適合的地方），不需要使用者每次都特別要求才做。單純的功能開發／bug 修復不會自動觸發更新，只有「查出根因、值得未來避免重蹈覆轍」的情況才算。

---

## ⚠️ 每次對話開始務必先做的事（防止版本狀態跑掉）

**這份文件如果是透過專案檔案快照拿到的，內容可能已經過時。** 專案檔案是對話開始當下的一次性快照，之後這份文件在 GitHub 上如果被更新過，Claude 手上的版本不會自動跟著更新——尤其是跨對話、對話被壓縮摘要過的情況，更容易發生「记忆」停留在舊狀態的問題。

**在依賴這份文件裡任何版本號、CI/CD 狀態、部署流程做判斷之前，務必先用 GitHub Contents API 重新抓取這份文件、`docs/index.html` 的 `APP_VERSION`、`docs/RetroVault_AppsScript.gs` 開頭版本註解的最新內容，不要只憑對話一開始拿到的快照或先前對話摘要判斷現況。**

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
4. 現有專案內是否已經有可重用的函式或模式？優先沿用。**動手寫任何互動 UI（拍照、選圖、裁切、掃描條碼、OCR、彈出視窗）前，先用關鍵字（如「crop」「scan」「裁切」「拍照」）在整個 `index.html` 裡搜過一輪，確認沒有現成的可以直接呼叫，再考慮新寫。**
   **已知發生過的真實案例**：批次書背建檔 Step4 需要「拍照補封面」功能，Claude 一開始沒有搜尋既有機制，自己刻了一整套「即時相機串流＋DOM拖曳裁切UI」（v02.68～70，含 `openFieldScanner` 新增 `mode:'photo'`、10 餘個自訂裁切函式），跑了 40 幾項自我檢查確保程式邏輯正確，但實機測試後使用者回報「新的這套問題很多」。後來才發現全站早就有現成的 `cropImageFile(file)` + `#crop-ov`——這是「圖片辨識」建檔模式（`initImgMode`/`onSlotPhoto`）從很早以前就在用、經過長期實機驗證的裁切工具（Canvas 繪製、支援拖曳整框移動／拖角縮放／三分格線／使用原圖跳過裁切）。結果是整套自訂系統全部作廢重寫，改成呼叫現成的 `cropImageFile()`。教訓：**自我檢查測試再詳盡，也只能證明「邏輯內部一致」，不能取代「有沒有先確認這件事已經有更成熟的現成做法」**——後者要在動手寫程式前就做，不是寫完再補。
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

## 全站共用機制速查表（動手前先查這裡）

這份清單是「開發工作哲學」第4點的具體落地——收錄目前已知、值得優先沿用的核心共用函式，避免重複造輪子。**這份清單本身也可能過時**（新功能持續在加），只是動手前的第一線快速檢查，真正動手前仍建議在 `index.html` 裡搜尋關鍵字確認最新狀態。

| 需求 | 先查這個 | 說明 |
|---|---|---|
| 圖片裁切（互動式，使用者可調整範圍） | `cropImageFile(file)` | 回傳 `Promise<Blob>`，開啟 `#crop-ov`（Canvas 繪製的裁切器：拖曳整框移動／拖角縮放／三分格線／「使用原圖」跳過裁切／取消）。`resolve` 拿到裁切後的 Blob，`reject` 代表使用者取消。「圖片辨識」建檔模式（`onSlotPhoto`）就是這樣用的。 |
| 圖片壓縮＋自動去背景邊緣 | `compressImg(dataUrl,maxPx,quality,cb,hint)` | 內部會自動呼叫 `autoCropCanvas`（依照片邊緣的背景色差異，自動裁掉多餘背景），不需要另外處理。`hint` 影響輸出比例（`'spine'` 會強制 1:3），其他情境傳既有慣例值即可（例如 `'batch'`）。 |
| 掃描條碼／OCR 拍照辨識編碼（單一欄位輸入） | `openFieldScanner(opt)` | 統一的欄位掃描 overlay。`mode:'barcode'` 用 `BarcodeDetector` 即時偵測；`mode:'ocr'` 開相機、使用者按拍攝後送 Gemini 辨識（依 `_selectedType` 自動套用對應分類的編碼格式提示詞）。`opt.secondary` 可加次要按鈕（如「跳過」），`opt.onResult`/`opt.onCapture` 拿結果。 |
| 純即時條碼偵測（不需要完整的欄位輸入 UI） | `createScanner(opt)` | `BarcodeDetector` 為主、ZXing 為 iOS 退回方案的掃描器 factory，`openFieldScanner` 內部用的就是這個，也可以單獨呼叫。 |
| 批次建檔（逐件狀態管理／確認清單／DB查詢＋AI補全／批次儲存） | `_batchItems`／`_batchRenderList`／`batchEditItem`／`_batchResolveNext`／`batchSaveAll` | 批次書背 4 步驟精靈共用的核心基礎設施，新增批次相關功能前先看這幾個函式能不能直接沿用或擴充，不要另開一條平行的資料流。 |
| 非阻斷式確認對話框（取代原生 `confirm()`） | `_customConfirm(title,message)` | 回傳 `Promise<boolean>`，彈出符合 App 深色風格的自訂對話框（「取消」／「確定」兩顆按鈕）。原生 `confirm()` 是同步阻斷的，跟 App 其他地方的視覺風格不一致；凡是需要使用者做「繼續／取消」分支判斷的情境（不是純提示型的「知道了」），都應該用這個，不要再寫原生 `confirm()`。純提示型（不需要分支判斷、只是告知後繼續）則直接拿掉阻斷框，改用 `toast()`。 |
| 可靠地跳出 PWA 開啟外部連結（取代 `window.open()`） | `_openExternal(url)` | PWA 以 standalone 模式安裝後，`window.open()` 對外部網域的處理在部分手機/瀏覽器組合上不夠可靠，可能停留在 PWA 自己的瀏覽情境裡。這個函式改用動態建立帶 `rel="noopener noreferrer"` 的 `<a>` 元素、程式模擬點擊，更可靠地讓連結真正跳出 PWA、交給系統預設瀏覽器處理。「近期發售」「AI 網頁查詢」等所有開外部連結的地方都已經改用這個，新增類似功能直接沿用，不要再呼叫 `window.open()`。 |
| 依分類動態決定要顯示的欄位（例如批次編輯這類「跨分類共用同一個操作介面」的情境） | `_bulkEditFieldsFor(cat)`／`_bulkEditFieldsForCats(cats)`／`BULK_EDIT_CAT_FIELDS` | 8 大分類的欄位結構差異很大（例如「平台」只有遊戲/數位下載版有），單一分類選取時顯示該分類專屬欄位組合，混合分類選取時只顯示全部分類都適用的共通欄位。這個「先算出涉及的分類交集、再決定顯示什麼」的模式，未來任何「跨分類共用同一介面」的新功能都可以參考這個做法，不用重新設計一套判斷邏輯。 |
| 搜尋資料庫（IGDB）、列出候選讓使用者自己挑，而不是自動選第一筆 | `manualSearchDB()`／`huntSearchDB()` 這組模式 | 手動建檔、尋寶新增流程都有這個「輔助功能，選填」的搜尋框。查詢邏輯共用既有的 `extractField('igdb',...)` 欄位對照表跟 `_mergeDbIntoEntry(db)` 共用合併規則（只補空欄，不覆蓋使用者已輸入的內容），不要重新寫一套對照/合併邏輯。**注意**：呼叫 `extractField('igdb',...)` 時要對照 GAS 後端 `igdbProxy()` 實際回傳的扁平化欄位格式（`platform`/`developer`/`release_date` 等直接是字串），不是 IGDB 原始 API 那種巢狀結構——這裡曾經對錯格式導致欄位悄悄抓空（v02.146 修過），修改這塊前先確認資料格式對不對。 |

### 已知踩坑（跟共用機制搭配使用時要注意）

- **`fscanStop()` 不等於 `fscanClose()`**：前者只停止相機媒體串流，後者才會真正移除 `#fscan-ov` 的 `.on` class（讓 overlay 消失）。**已知發生過的真實案例**：批次書背 Step4（v02.68/69 舊版設計）在全部項目處理完時只呼叫了 `fscanStop()`，導致相機視窗（串流已停、變黑畫面）卡在畫面最上層，擋住了背後其實正常在跑的 AI 解析進度，使用者回報「最後一件拍完卡住不會跳到 AI 辨識」——實際上沒有卡住，只是視窗沒關。凡是「處理完全部項目、要轉場到下一個畫面」的情境，記得用 `fscanClose()`，不要只 `fscanStop()`。
- **`code`／`barcode`／`serial_no` 是三個獨立欄位**：`code`＝商品編碼（如 SLPM-65338，遊戲類的識別碼，同型號商品共用）；`barcode`＝條碼（包裝上的 EAN/UPC，掃描器讀的通常是這個）；`serial_no`＝機身序號（主機類專用，每台實體單位獨立不同）。三者容易搞混，寫欄位對應邏輯時先確認分類跟目標欄位是否正確配對。
- **AI 給的框選座標「數字上合法」不保證「內容正確」**：座標落在合理範圍、沒有顛倒、佔比夠大，都只能排除明顯異常，排除不了「精準框到了錯誤的區域（如陰影/背景紋理）」這種情況。真的要防禦這種狀況，需要額外對裁切結果本身做內容抽樣檢查（如取樣像素算平均亮度/變異數，太暗或太單一視為可疑），單靠座標驗證不夠。
- **批次流程裡「全部跳過此步驟」類的操作，語意容易被誤解**：這類操作通常只會影響「從目前處理到的索引開始」的剩餘項目，不會回溯已經確認過的前面幾件。這個語意如果沒有在 UI 上講清楚，使用者容易誤觸、事後才發現某幾件的資料是空的。新增這類「批次跳過」操作時，一律加確認對話框並在文字裡明講「只影響第 X 件起剩下 N 件」。
- **簡化／移除一個欄位或 schema 時，要全面搜尋所有讀取端，不能只改寫入端**：這個模式連續踩過兩次。第一次是批次書背 Step1 的 AI schema 簡化（v02.67 移除 `code_clear` 欄位，因為改由 Step3 實際掃描取得編碼），但 `_batchStatusBadge()` 判斷「序號模糊」警示的邏輯還在讀取這個已經不存在的欄位，導致警示永遠顯示、跟實際辨識品質完全無關，直到使用者實測才發現。第二次是 OCR 提示詞的兩行式編碼修復（v02.76），一開始只改了其中一個入口，後來才發現全站有 5 個各自獨立維護提示詞的 OCR 呼叫點，大部分都沒涵蓋到。**動手改一個欄位/邏輯前，先用 `grep` 搜一次這個欄位名稱／這類功能的所有出現位置，確認有沒有其他地方也在讀取或依賴，不要只滿足於「我要改的那個地方改完了」。**
- **GAS `listSheet()`／`listAll()` 回傳的資料是扁平結構**：每一列直接是 `{rowNum, _type, uuid, primary_name, category, ...}`，欄位直接掛在物件上，**不是**包在 `row.data` 底下。App 前端內部另外用 `normalizeColRows()` 把它正規化成 `{uid, rowNum, data:{...}}` 這種巢狀格式（`col`/`filtered` 陣列用的就是這個正規化後的格式），這是前端自己疊加的一層，不是 GAS 原始回傳的樣子。**已知發生過的真實案例**：寫獨立於主 App 之外的新頁面（`docs/gallery.html`）直接呼叫 GAS 端點時，照抄了前端內部 `entry.data.xxx` 的存取方式，實際上 GAS 原始回傳沒有這層 `.data`，導致篩選條件永遠比對不到、畫面顯示「共 0 筆」。**只要是新寫的程式碼要直接呼叫 GAS 端點（不是在既有 App 內部延用 `col`/`filtered` 這些已經正規化過的變數），一律先用瀏覽器或 `curl` 實際打一次 API、看清楚原始 JSON 長什麼樣，不要照抄 App 前端內部資料結構的假設。**

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
- **不產生版本 HTML 檔**：不需要額外建立 `RetroVault_vXX_YYaN_index.html`，沿用目前的版本 HTML 檔（`sw.js` 的 `CACHE_NAME` 仍需遞增以強制更新快取）。
- **CHANGELOG 仍需更新**：簡短記錄修了什麼，但不需要完整四段格式，可用一行條列。
- 下一次正式功能更新時，`YY` 正常遞增、`aN` 歸零（不帶子版號）。

**Debug 版本（d 開頭）── Claude 除錯排查專用：**
- 格式為 `vXX.YYd`、`vXX.YYd2`、`vXX.YYd3`...，用於加入臨時 `console.log`／`toast`／`alert` 等除錯輸出，協助定位問題。
- **僅 Claude 內部排查使用**，確認問題後須移除 debug 程式碼，回到正式版本號（`vXX.YY` 或 `vXX.YYaN`）才算完成。
- **不執行備份**，不產生版本 HTML 檔，不需要完整 CHANGELOG 記錄。

**Apps Script 版本檔命名：**
- 部署用統一檔名：`RetroVault_AppsScript.gs`
- 封存用：`GameVault_v01_AppsScript.gs.txt`
- 只有後端程式有修改，或使用者明確要求時才生成。

**App 改名（GameVault → RetroVault，2026-07-25／26）：** 使用者確認專案範圍已不再侷限遊戲單一品類（涵蓋書籍/主機/週邊/原聲帶/動漫美術/公仔/數位下載版），App 顯示名稱全面改為 RetroVault（`v02.29`，2026-07-25）。版本 HTML 檔名規則同步從 `GameVault_vXX_YY_index.html` 改成 `RetroVault_vXX_YY_index.html`（`v02.30`，2026-07-26），`github_deploy.py` 已同步更新且做了新舊前綴的過渡期相容判斷。GAS 檔名（`GameVault_AppsScript.gs` → `RetroVault_AppsScript.gs`）分兩步完成：先請使用者手動把 `.github/workflows/deploy-gas.yml` 的觸發路徑與複製指令改成新檔名（Claude 沒有 `workflow` scope 無法直接改），確認生效後才實際把 `.gs` 檔案改名＋同步更新所有文件引用，避免 CI/CD 觸發路徑跟實際檔名對不上、自動部署悄悄失效卻不易察覺。repo 名稱 `Retro-library` 本身沒有改，語意上跟 RetroVault 已經算搭。

**GAS 檔案內部保留不改的字串（重要，避免資料遺失/外部服務中斷）：** `.gs` 程式碼裡有 4 處字串刻意沒有跟著改名，都是有實質功能依賴、不是單純顯示文字：
- `IMG_FOLDER_NAME = 'GameVault_Images'`（及緊鄰的說明註解）：這是 Google Drive 裡實際存放圖片的資料夾名稱，使用者現有的圖片都存在這個資料夾裡，改名會讓程式找不到既有圖片、造成圖片孤兒化或重複建立新資料夾。
- `softname = 'GameVault'`：這是 ScreenScraper API 的開發者身分識別字串（`softname` 參數），是在 ScreenScraper 官網註冊開發者帳號時登記的軟體名稱，改掉會讓 ScreenScraper 查詢功能失效（伺服器端會拒絕未註冊的 softname）。要改的話得先去 ScreenScraper 官網把註冊資訊也改掉，不是單純改程式碼字串就好。
- 同一支 `screenScraperProxy()` 函式裡的 `'User-Agent': 'GameVault/2.0 (Google Apps Script)'`：跟上面 softname 屬於同一個 API 呼叫的一部分，保守起見一併保留不動。
- 若之後要動這 4 處，務必先確認 Google Drive 資料夾遷移／ScreenScraper 開發者帳號更名都處理好，再回頭改程式碼，不要單獨改字串。

**當前版本狀態（2026-08-09，v02→v03 版號重整後）：**
- GS 後端：`v03`
- HTML 前端：`v03.01`
- GitHub repo：`Kevinte67228/Retro-library`
- GitHub Pages：`https://kevinte67228.github.io/Retro-library/`（從 `docs/` 資料夾部署，2026-07-26 確認）
- GAS 後端：GitHub Actions 自動部署（詳見「GAS 後端 CI/CD 自動部署」章節），不再需要手動貼到 Apps Script 編輯器

**發布版本重置（Release Baseline Reset，2026-07-17）：** 使用者明確要求將當時的 v67.16／GAS v67 正式訂為公開發布起點，版本號重新編號為 **前端 v01.01／GAS v01**。這是**純版本重新編號**，前後端程式碼邏輯與行為跟重置前的 v67.16／v67 完全一致，沒有任何功能異動。同時依使用者指示：
- 清空 `_internal/old/` 所有備份，**包含原本標記永久保留的 `v42_20a1`、`v67_01`**
- `_internal/CHANGELOG.md` 清空重新開始記錄，第一筆即為 `v01.01`
- 重置前已將完整狀態（GAS、前端、manual、icons、舊版 CHANGELOG、舊版協作規則）存進 `_internal/pre_v01_reset_snapshot_v67_16_20260717/` 作為回溯依據（此快照原本是一次性保存，不受 5 版輪替規則約束、不會被自動清理；**2026-08-09 使用者確認已隔了近一個月、幾十次改動，不再需要保留這份回溯依據，已手動刪除**，之後的協作對話裡若再看到這條路徑的引用，代表已經不存在，不用嘗試讀取）
- **目前沒有永久備份例外**：`v01.01` 之後的一般版本備份，從下一版起恢復正常「5 版輪替」機制（見下方「GitHub 自動部署流程」）；除非使用者之後再次明確指定新的永久保留基準，否則不主動設定

**版號重整歷史（含本次共四次，供追溯）：**
- **2026-07-13**：前端曾長期未依主版號規則歸零（GAS 從 v62 一路到 v66，前端仍沿用舊的 `v54.x` 未重新計起），一次性追趕修正為 `v66.01`。
- **2026-07-16**：修正 `backfillUuids()` 的驗證不一致（GAS 實質邏輯變更）後，依規則前端主版號跟隨 GAS 歸零為 `v67.01`，GAS 升為 `v67`。
- **2026-07-17**：使用者明確要求的**發布版本重置**，前端 v67.16→`v01.01`、GAS v67→`v01`，同時清空所有備份與 CHANGELOG（見上）。
- **2026-08-09**：Claude 在 `addRow()` 加上 `LockService`（GAS 實質邏輯變更——影響行為的函式邏輯異動，不是純註解/排版）時，**忘記依規則觸發版號重整**，繼續沿用舊的前端小版號往下編（誤編成 `v02.154`），使用者事後發現並提醒。事後補做重整：前端 `v02.155`→`v03.01`、GAS `v02`→`v03`（含 GAS 檔案內的版本註解一併更新）。**教訓**：往後每次異動 GAS 邏輯前，Claude 應該先明確判斷「這算不算實質變更」，判斷結果要主動講出來、並在同一次改動就決定要不要歸零，不要等改完部署了才想起來——尤其是像 `LockService` 這種容易被當成「只是加個保護、不算邏輯變更」而輕忽的異動，加鎖本身就是會影響函式行為（例如可能的等待/逾時）的實質邏輯改動，要算數。
- 前三次是「依規則產生的正常歸零」或「使用者明確指定版號的一次性重置」，第四次是「Claude 忘記套用規則、事後補救」——不代表往後每次 GAS 有任何異動都要重整，日常開發仍依上方「主版號（XX）異動條件」的「實質變更」定義正常遞增，不會無故再次歸零或重置。

**永久備份例外：** 目前**無**永久備份例外（`v02_17` 原為「統一整個程式碼渲染函式」大改版前的基準，Phase 1-4 於 2026-07-25 完成後經使用者確認解除，恢復正常 5 版輪替）。若使用者之後要求把某個版本標記為永久保留，再依當時指定的版號新增此區塊。

---

## Repo 結構

```
Retro-library/
├── docs/                    ← GitHub Pages 部署根目錄（公開）
│   ├── index.html
│   ├── RetroVault_vXX_YY_index.html
│   ├── RetroVault_AppsScript.gs
│   ├── sw.js
│   ├── manifest.json
│   ├── manual.html
│   ├── bg.webp
│   └── icons/
│       ├── icon-*.png/webp
│       └── mkt-*.webp/jpg
├── ~~netlify.toml~~          ← 舊 Netlify 時代殘留設定檔，已於 2026-07-26 確認無作用後刪除
└── _internal/                ← 不部署（私有，GitHub Pages 完全不碰）
    ├── CHANGELOG.md        ← 版本更新記錄（最近 4 筆）
    ├── GameVault_協作規則.md
    ├── GameVault_部署架構說明.md
    ├── gh_batch.py          ← Git Data API 批次操作 helper（不含 token）
    ├── github_deploy.py    ← 自動部署腳本（呼叫 gh_batch.py，不含 token）
    └── old/                ← 版本備份（最近 5 個一般版，僅一般 vXX.YY 正式版；子版號/debug 版不備份；永久保留例外見上方「永久備份例外」）
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

**子版號（`vXX.YYaN`）與 debug 版（`vXX.YYd`）例外：** 不執行下列「1. 備份」與「2. 清理舊備份」步驟，直接跳到「3. 推送新版檔案」，且不產生對應的 `RetroVault_vXX_YYaN_index.html` 版本 HTML（沿用目前已存在的版本 HTML 檔案）。

**1. 備份目前版本**（一般 `vXX.YY` 正式版適用）
把 `docs/` 現有核心檔案複製到 `_internal/old/<目前版號>/`（含 `icons/` 子資料夾）。

**2. 清理舊備份**（一般 `vXX.YY` 正式版適用）
`_internal/old/` 最多保留 5 個版本，超過則刪最舊的。

**3. 推送新版檔案**
把新版本的以下檔案推到 `docs/`：
- `index.html`
- `RetroVault_vXX_YY_index.html`（新版本號；子版號/debug 版不產生此檔）
- `sw.js`
- `manifest.json`
- `RetroVault_AppsScript.gs`（有更新時）

並刪除舊的版本 HTML（`RetroVault_vXX_YY-1_index.html`）。子版號/debug 版因不產生新版本 HTML，故也不執行此刪除步驟。

**4. 更新 CHANGELOG（併入同一次 commit，不要另外 push）**
在 `_internal/CHANGELOG.md` 頂端插入新版記錄，超過 4 筆則刪最舊。子版號（`vXX.YYaN`）與 debug 版（`vXX.YYd`）用一行條列簡記即可，不需完整四段格式。

⚠️ **重要（2026-07-25 起）**：`github_deploy.py` 支援第三個參數直接帶入 CHANGELOG 內容檔路徑，讓 CHANGELOG 更新跟步驟 1-3 包在**同一次 commit**裡，不要再像過去那樣部署完 docs/ 後另外開一次 commit 只推 CHANGELOG.md。**已知發生過的真實案例**：`_internal/CHANGELOG.md` 雖然不在 `docs/` 發布範圍內，但 GitHub Pages 的「Deploy from a branch」是整個 main 分支只要有任何 push 就觸發重建，不會篩選路徑；先前 docs/ 部署完後緊接著另外 push CHANGELOG，等於短時間內連續觸發兩次 Pages 自動建置，兩次互相干擾，其中一次的 `deploy` job 被中斷回報失敗（即使最終內容仍正確部署成功，使用者也會收到 GitHub 寄來的建置失敗通知信，造成不必要的困惑）。用法：`python3 github_deploy.py <新版本號> <版本資料夾路徑> <CHANGELOG.md新內容檔路徑>`。

**5. GitHub Pages 自動部署**
GitHub push 觸發 GitHub Pages 自動重新部署（設定為「Deploy from a branch → main → /docs」），約 1 分鐘內完成，無需手動操作。2026-07-21 起取代 Netlify（原因：Netlify 額度耗盡導致部署被跳過）。

**5-1. GAS 後端自動部署（如有異動 `RetroVault_AppsScript.gs`）**
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
2. 修改 `index.html` 與 `RetroVault_v01_02_index.html`（兩者內容完全一致）。
3. 更新 `APP_VERSION='v01.02'`。
4. 更新 `sw.js` 的 `CACHE_NAME`，例如 `gamevault-v01-02`。
5. 更新 `sw.js` 預先快取清單（相對路徑，不寫資料夾前綴）。
6. 確認 `manifest.json` 的 `start_url` 為 `./`。
7. 執行驗證清單。
8. 透過 GitHub API 自動部署（備份 → 清理 → 推送 → 更新 CHANGELOG）。
9. 確認 GitHub Pages 部署完成，正式網址（`https://kevinte67228.github.io/Retro-library/`）正常運作。

**子版號（`vXX.YYaN`）簡化流程：**

1. 直接修改 `index.html`（沿用既有的 `RetroVault_vXX_YY_index.html`，同步更新內容使兩者一致）。
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
  './RetroVault_vXX_YY_index.html',
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
- `RetroVault_AppsScript.gs` 放在 `docs/` 根目錄，讓使用者可從 App 內直接下載（連結加 `download` 屬性），同時也是 CI/CD 自動部署的來源檔案。

修改 Apps Script 後需檢查：

- 語法能被 JavaScript parser 接受（`node --check`）
- 函式括號完整
- `doGet`、`doPost`、`listAll`、`listSheet` 等核心流程未被截斷
- 新增/異動分類子類型時，`resolveType`／`getSheet`／`listAll`／`findRowByUuid`／`fixSheetHeaders`／`backfillUuids`／`collectUsedImgIds_` 七個函式要同步檢查（見上方「分類與子類型架構」）

---

## GAS 後端 CI/CD 自動部署（GitHub Actions + clasp）

**已於 2026-07-06 設定完成並驗證成功；2026-07-21 觸發路徑隨 `GameVault/`→`docs/` 搬遷同步更新；2026-07-26 隨 App 改名同步把觸發路徑與檔名從 `GameVault_AppsScript.gs` 改成 `RetroVault_AppsScript.gs`（使用者手動更新 workflow 檔案後，Claude 才把實際 .gs 檔案改名，避免路徑跟檔名對不上）。** 推送 `docs/RetroVault_AppsScript.gs` 到 GitHub `main` 分支時，會自動觸發 GitHub Actions，用 [clasp](https://github.com/google/clasp) 把程式碼推上 Google Apps Script，並更新到**固定的 Web App 部署**（deployment），網址不會改變。**取代了先前「使用者手動貼到 Apps Script 編輯器」的流程**，Claude 推送 `.gs` 到 GitHub 後即完成後端部署，不需要再請使用者手動操作。

### 運作方式

- Workflow 檔案：`.github/workflows/deploy-gas.yml`
- 觸發條件：push 到 `main` 且異動 `docs/RetroVault_AppsScript.gs`；也支援手動觸發（`workflow_dispatch`）
  ⚠️ **2026-07-21 搬遷提醒（已於 2026-07-26 解決，保留備查）**：當時觸發路徑曾一度寫死舊的 `GameVault/GameVault_AppsScript.gs`，經使用者手動更新 workflow 檔案改成 `docs/GameVault_AppsScript.gs` 解決；2026-07-26 又隨 App 改名再次更新為 `docs/RetroVault_AppsScript.gs`（同樣是請使用者手動改 workflow，Claude 沒有 `workflow` scope 無法直接修改該檔案）。
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
| `RetroVault_AppsScript.gs` | `https://raw.githubusercontent.com/Kevinte67228/Retro-library/main/docs/RetroVault_AppsScript.gs` |
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
