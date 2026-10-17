# RetroVault 圖資地區嚴格一致性協作規範 (Asset Region Integrity Rules)

## 核心準則：全景圖資嚴格配合發售地區 (Strict Region Alignment)

所有遊戲的圖片資源——包括但不限於**封面 (cover_img)**、**封底 (back_img)**、**書脊 (spine_img)**、**卡匣 (cart_img)** 與 **實機截圖 (gameplay_img)**，都必須**嚴格且百分之百配合遊戲的發售地區 (Region)**，絕不允許僅封面匹配而封底或截圖誤用美規或其他地區版本。

---

### 一、 日版遊戲圖資純度標準
若遊戲的發售地區為「日本 (Japan / 日版)」：
1. **外盒與封底**：
   - 必須採用日本國內發售的原裝紙盒/膠盒（日版標準直式或橫式彩盒）。
   - 必須包含日語文案、日本發行商資訊（如「株式会社光栄」、「任天堂株式会社」）、日本 JAN/EAN 條碼（49... 開頭）或標準定價標記。
2. **嚴格禁止的美規/歐版特徵**：
   - ❌ 嚴禁帶有左側銀色 GAME BOY 條紋、ESRB 分級標籤（"E"、"K-A"、"T" 等）。
   - ❌ 嚴禁北美 SNES 特有的橫式黑底條紋外盒（帶有 "SUPER NINTENDO ENTERTAINMENT SYSTEM" 標記、"FOR SALE AND USE IN USA, CANADA AND MEXICO ONLY"、美國 UPC 條碼）。
   - ❌ 嚴禁北美英文標題或美版代理發行商名稱（例如 Activision America、KOEI Corporation Burlingame CA）。
   - ❌ 嚴禁歐版 PAL 專用標記、德法英多國語言說明，以及任何非官方社群臆造的「Mockup / Fanart」盒繪。

---

### 二、 寧缺毋濫原則 (No Placeholders or Erroneous Replacements)
1. **主動搜尋真實典藏**：
   - 遇到缺少封底或圖資不全時，優先從公認正規典藏管道（如 Internet Archive 日本原裝高解析掃描庫、LaunchBox GamesDB 帶有 `(Japan)` 標籤之官方掃描檔）檢索。
2. **絕對禁止臆造與錯誤帶入**：
   - 若經過深度搜尋確認網路上目前無官方正統日版真實掃描檔，**該欄位（如 back_img 或 spine_img）必須嚴格保持留空（""）**。
   - **寧願留空，絕對不要自行帶入美版、歐版或錯誤圖檔濫竽充數**。

---

### 三、 執行檢核清單 (Audit Checklist)
在每次建立、匯入或同步資料庫（CSV/XLSX/Google Sheets）前，必須執行以下校驗：
- [ ] 遊戲區域為日本時，檢查封面、封底、書脊 URL 是否含有 `(USA`, `(Europe`, `Genesis`, `SNES`。
- [ ] 檢查封底尺寸與版型是否與日版規格一致（例如 SFC 日版直式為 ~154x281、日版橫式為 ~400x221；橫式美版 384x281 黑底條紋盒一律剔除）。
- [ ] 復刻版、限定版、名作系列必須專圖專用，不得與初版混用。
