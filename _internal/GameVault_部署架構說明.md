# RetroVault 部署架構說明

這份文件說明 Claude 如何直接存取 GitHub 更新程式碼，以及 GAS 後端、前端各自如何自動部署。給協作對話快速理解整條鏈路用。

---

## 1. Claude 如何直接存取 GitHub

Claude 沒有專用的「GitHub 工具」，是在容器內用 `bash` 執行 Python 腳本，透過 `urllib.request` 直接呼叫 **GitHub REST API**（網路白名單已開放 `api.github.com`）。

每次對話由使用者提供 GitHub Personal Access Token（`ghp_...`，classic token，repo scope），放進請求的 `Authorization: token ...` header 驗證權限。

依場景使用兩套 API：

### A) Contents API（單一檔案異動）
```
GET    /repos/{repo}/contents/{path}   讀取檔案內容＋sha
PUT    /repos/{repo}/contents/{path}   新增／覆寫（需帶上目前的 sha）
DELETE /repos/{repo}/contents/{path}   刪除
```
缺點：一個檔案對應一次 API 呼叫＝一次 Git commit，實測每次約 2-3 秒。檔案數一多，總耗時線性疊加。

### B) Git Data API（多檔案批次異動，2026-07-17 起的標準做法）
```
GET   /git/ref/heads/main       拿目前分支指向的 commit sha
GET   /git/commits/{sha}        拿該 commit 的 tree sha
POST  /git/blobs                上傳檔案內容，取得 blob sha（新增/修改才需要）
POST  /git/trees                帶 base_tree ＋ tree 陣列，定義所有新增/修改/刪除
POST  /git/commits              用新 tree 建一個新 commit
PATCH /git/refs/heads/main      把 main 分支指標指到新 commit
```
不管異動幾個檔案，固定約 4 次 API 呼叫完成，全部包在**單一 commit** 裡。實測 3-8 個檔案的批次操作約 1.3-2.5 秒。

⚠️ **已知陷阱**：`tree` 陣列裡要**刪除**的項目，只能給 `path`／`mode`／`sha: null`，**絕對不能帶 `type` 欄位**，帶了會得到 `422 GitRPC::BadObjectState`。新增/修改的項目則要帶 `type: "blob"`。

可重用的工具腳本：`_internal/gh_batch.py`（token 由使用者每次對話提供，不寫死在檔案內）。

**使用原則**：多檔案異動（備份輪替、清理舊版、多檔部署）一律用 Git Data API 批次處理；單一檔案的小修改用 Contents API 即可，不必為了單檔案特地走批次流程。

不管用哪套 API，本質上都跟在 GitHub 網頁上編輯檔案、按「Commit changes」是同一件事，只是用程式呼叫取代手動點擊。

---

## 2. GAS（Google Apps Script）後端如何自動部署

這段完全由 **GitHub Actions** 自動完成，Claude 只需要把新版 `RetroVault_AppsScript.gs` push 到 GitHub，不需要手動介入部署。

**觸發條件**（`.github/workflows/deploy-gas.yml`）：
- push 到 `main` 分支，且異動路徑為 `docs/RetroVault_AppsScript.gs`
- 也支援手動觸發（`workflow_dispatch`）

**執行流程**：
```
1. Checkout repo
2. 安裝 Node.js 20
3. 安裝 clasp（Google 官方 Apps Script 命令列工具）
4. 還原 clasp 登入憑證
   → 從 GitHub Secrets 的 CLASPRC_JSON 寫入 ~/.clasprc.json
5. 準備 clasp 專案
   → 複製 docs/RetroVault_AppsScript.gs 為 Code.gs
   → 複製 docs/appsscript.json
   → 用 GitHub Secrets 的 GAS_SCRIPT_ID 寫入 .clasp.json
6. clasp push --force
   → 把程式碼推上 Google Apps Script 專案
7. clasp deploy --deploymentId "$GAS_DEPLOYMENT_ID"
   → 更新「既有」的部署版本（不是新增部署）
```

**關鍵**：最後一步用 `--deploymentId` 指定既有部署去更新，Web App 網址因此**永遠不變**，使用者不需要每次都回設定頁改連線網址。

**所需 GitHub Secrets**（已設定，正常情況不需要再碰）：

| Secret | 用途 |
|---|---|
| `CLASPRC_JSON` | clasp 登入憑證 |
| `GAS_SCRIPT_ID` | 目標 Apps Script 專案的 Script ID |
| `GAS_DEPLOYMENT_ID` | 固定要更新的部署 ID（網址保持固定的關鍵） |

**限制**：Claude 的 GitHub Token 沒有 `workflow` scope，無法直接推送/修改 `.github/workflows/` 底下的檔案；這個 workflow 檔案是使用者當初手動貼到 GitHub 網頁編輯設定好的，之後就自動運作。若之後這個檔案本身需要異動（例如 2026-07-26 GAS 檔名從 `GameVault_AppsScript.gs` 改成 `RetroVault_AppsScript.gs` 時），Claude 只能生成新內容，請使用者手動貼到 GitHub 網頁替換、Commit，確認生效後 Claude 才能安全推送對應改名的實際檔案（避免觸發路徑跟實際檔名對不上、CI/CD 悄悄失效）。

---

## 3. 前端如何自動部署（GitHub Pages）

**2026-07-21 起改用 GitHub Pages，取代先前的 Netlify**（原因：Netlify 額度耗盡導致部署被跳過）。這段**不需要額外的 GitHub Actions 設定檔**——GitHub 偵測到 repo 有啟用 Pages 時，會自動用內建的 `pages build and deployment` 工作流程處理，Claude 或使用者都不用另外寫 workflow yaml。

```
Claude push docs/ 資料夾內任何檔案異動到 main 分支
        ↓
GitHub Pages（後台已設定 Source = Deploy from a branch → main → /docs）自動偵測到變動
        ↓
自動建置（Jekyll）＋部署
        ↓（通常 1 分鐘內完成）
https://kevinte67228.github.io/Retro-library/ 顯示最新版本
```

**目前實際生效設定**：GitHub repo 的 **Settings → Pages → Build and deployment → Source = Deploy from a branch**，Branch 選 `main` 、資料夾選 `/docs`（在 GitHub 網頁後台設定，不是透過 repo 內的設定檔）。

⚠️ **重要：GitHub Pages 是「整個 main 分支只要有任何 push 就觸發重建」，不會篩選路徑**——即使異動的檔案不在 `docs/`（例如只改 `_internal/CHANGELOG.md`），一樣會觸發一次 Pages 重新建置。**已知發生過的真實案例**：先前把 `docs/` 部署完後，緊接著另外開一次 commit 單獨 push `CHANGELOG.md`，等於短時間內連續觸發兩次 Pages 自動建置，兩次建置管線互相干擾，其中一次的 `deploy` job 被中斷回報失敗（即使最終內容仍正確部署成功，使用者還是會收到 GitHub 寄來的建置失敗通知信，造成困惑）。**解法**：`github_deploy.py` 支援第三個參數直接帶入 CHANGELOG 內容，讓 CHANGELOG 更新跟 docs/ 部署包在同一次 commit 裡，只觸發一次建置（見協作規則.md「GitHub 自動部署流程」章節）。

⚠️ **另一個已知真實案例（2026-07-25）**：GitHub 的 `pages-build-deployment` 工作流程需要 `GITHUB_TOKEN` 有寫入權限（`pages: write`／`id-token: write`）才能完成 `deploy` 這個步驟；若 repo 的 **Settings → Actions → General → Workflow permissions** 設成「Read repository contents permission」（唯讀），`build` 步驟會成功但 `deploy` 步驟會固定失敗，每次都收到失敗通知信，即使最終內容有沒有正確發布都要另外用 `pages/builds` API 確認。已於 2026-07-25 把這個設定改成「Read and write permissions」解決。這個設定是 repo 層級的，理論上不會自己跑掉，但如果之後又開始收到 `deploy` 失敗信，先檢查這個設定有沒有被改回唯讀。

✅ **2026-07-26 更新**：repo 根目錄（不是 `_internal/`，先前這裡寫錯路徑）的 `netlify.toml` 是 Netlify 時代的殘留設定檔，GitHub Pages 不會讀取它，經確認已無作用，使用者已要求清除，目前已刪除。

---

## 整體串接圖

```
Claude(容器) ──API呼叫──► GitHub main 分支
                              │
              ┌───────────────┴───────────────┐
              ▼                                ▼
    docs/RetroVault_AppsScript.gs 變動   docs/ 資料夾任何變動（含非 docs/ 的其他 push）
              │                                │
              ▼                                ▼
   GitHub Actions(deploy-gas.yml)      GitHub Pages 自動偵測
              │                                │
              ▼                                ▼
    clasp 推上 Apps Script 專案         pages-build-deployment 自動建置＋部署
              │                                │
              ▼                                ▼
   Web App 網址（後端邏輯更新，網址不變）   https://kevinte67228.github.io/Retro-library/（前端更新）
```

Claude 只負責「把對的程式碼 push 到 GitHub 上對的路徑」，後面兩條自動化流水線是各自獨立運作的既有設定，Claude 不會也不能手動介入 GAS 部署或 GitHub Pages 建置的內部過程；GitHub Pages 那條連 `.github/workflows/` 設定檔都不需要（GitHub 內建處理），跟 GAS 那條需要自訂 workflow yaml 不同。

---

*文件建立：2026-07-17*
*重寫：2026-07-26（Netlify → GitHub Pages 全文更新；GAS 檔名同步改為 RetroVault_AppsScript.gs；補充兩個已知真實故障案例）*
