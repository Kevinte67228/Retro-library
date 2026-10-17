# RetroVault — 收藏資料目錄（data/）

本目錄統一收管專案的所有實體資料檔案、使用者收藏原始總表、爬蟲提取結果與雲端試算表對齊備查檔，避免任何資料檔案散落在專案根目錄。

---

## 目錄檔案說明

| 檔案名稱 | 格式說明 | 用途 |
| :--- | :--- | :--- |
| `收藏.xlsx` | 原始多工作表 Excel | 使用者本機的主收藏總表（包含各平台分頁：FC、MD、SS、PCE、3DO、PS5 等）。 |
| `RetroVault_遊戲_FC.csv` | 前端雙標題 CSV | Famicom（FC）共 107 款完整版遊戲資料，包含最新爬取之外盒背面圖（`back_img`）與書脊圖（`spine_img`）。 |
| `RetroVault_遊戲_MD.csv` | 前端雙標題 CSV | Sega Mega Drive（MD）共 33 款完整版遊戲資料，外盒背面圖 100% 齊全。 |
| `RetroVault_遊戲_SFC.csv` | 前端雙標題 CSV | Super Famicom（SFC）共 177 款完整版遊戲資料，封面與實機截圖 100% 齊全，包含最新爬取之背盒圖（`back_img`）與書脊圖（`spine_img`）。 |
| `RetroVault_遊戲_GB.csv` | 前端雙標題 CSV | Game Boy（GB）共 20 款完整版遊戲資料，封面與實機截圖 100% 齊全，帶標準 UTF-8 BOM。 |
| `RetroVault_遊戲_GG.csv` | 前端雙標題 CSV | Sega Game Gear（GG）共 10 款完整版遊戲資料，封面與實機截圖 100% 齊全，世嘉官方標題校準，帶標準 UTF-8 BOM。 |
| `RetroVault_遊戲_GBA.csv` | 前端雙標題 CSV | Game Boy Advance（GBA）共 19 款完整版遊戲資料，封面與實機截圖 100% 齊全，帶標準 UTF-8 BOM。 |
| `RetroVault_GS_Games_全量匯入檔.xlsx` | Google 試算表對齊 Excel | 將 FC+MD+SFC+GB+GG+GBA 六大平台共 366 款遊戲嚴格按照 Google Apps Script 後端 `GAME_HEADERS` 57 欄對齊之檔案，供人工核對或直接匯入。 |
| `RetroVault_GS_Games_全量匯入檔.csv` | Google 試算表對齊 CSV | 與上述 Excel 相同內容之 UTF-8 BOM CSV 格式。 |

---

## 未來資料維護與命名規範

1. **平台擴充命名**：
   * 未來新增其他主機平台（如 SFC, PCE, SS, PS1~PS5, Switch 等）的爬蟲或匯出資料時，一律存放在本目錄。
   * 命名統一格式：`RetroVault_遊戲_<平台簡稱>.csv`（例如 `RetroVault_遊戲_SFC.csv`）。
2. **格式原則**：
   * 前端匯出/匯入格式：採雙標題列（第 1 列為英文鍵值、第 2 列為中文顯示名、第 3 列起為資料，帶 UTF-8 BOM）。
   * 後端直接寫入格式：欄位順序須對齊 `docs/RetroVault_AppsScript.gs` 中的 `GAME_HEADERS`。
