# GameVault 部署架構說明

這份文件說明 Claude 如何直接存取 GitHub 更新程式碼，以及 GAS 後端、Netlify 前端各自如何自動部署。給協作對話快速理解整條鏈路用。

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

這段完全由 **GitHub Actions** 自動完成，Claude 只需要把新版 `GameVault_AppsScript.gs` push 到 GitHub，不需要手動介入部署。

**觸發條件**（`.github/workflows/deploy-gas.yml`）：
- push 到 `main` 分支，且異動路徑包含 `GameVault/GameVault_AppsScript.gs`
- 也支援手動觸發（`workflow_dispatch`）

**執行流程**：
```
1. Checkout repo
2. 安裝 Node.js 20
3. 安裝 clasp（Google 官方 Apps Script 命令列工具）
4. 還原 clasp 登入憑證
   → 從 GitHub Secrets 的 CLASPRC_JSON 寫入 ~/.clasprc.json
5. 準備 clasp 專案
   → 複製 GameVault_AppsScript.gs 為 Code.gs
   → 複製 appsscript.json
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

**限制**：Claude 的 GitHub Token 沒有 `workflow` scope，無法直接推送/修改 `.github/workflows/` 底下的檔案；這個 workflow 檔案是使用者當初手動貼到 GitHub 網頁編輯設定好的，之後就自動運作，Claude 只能生成內容給使用者手動貼上。

---

## 3. Netlify 前端如何自動部署

這段比 GAS 更單純，**不需要 GitHub Actions**，是 Netlify 自己的機制（跟 Vercel、GitHub Pages 那種「連 repo 自動部署」的服務同一類）：

```
Claude push GameVault/ 資料夾內任何檔案異動到 main 分支
        ↓
Netlify（後台已設定監看此 repo 的 main 分支）自動偵測到變動
        ↓
自動抓取最新程式碼，重新建置＋部署
        ↓（約 1-2 分鐘）
reteogame.netlify.app 顯示最新版本
```

**目前實際生效設定**：Netlify 網站後台的 **Publish directory = `GameVault`**（在 Netlify 後台設定，不是透過 repo 內的設定檔）。

⚠️ **提醒**：repo 裡 `_internal/netlify.toml` 是一份**沒有生效的草稿**——它假設 `publish = "."`（發布整個 repo 根目錄）再用 redirects 封鎖 `_internal/` 內的敏感檔案，這跟目前實際採用的「Netlify 後台直接設定 Publish directory = GameVault」是不同策略，且這個檔案沒有放在 repo 根目錄或 `GameVault/` 內，Netlify 讀不到它。如果之後想改用這份 toml 的做法（發布整個 repo＋用 redirects 封鎖），需要先搬到正確位置並跟 Netlify 後台設定同步，避免兩邊打架。

---

## 整體串接圖

```
Claude(容器) ──API呼叫──► GitHub main 分支
                              │
              ┌───────────────┴───────────────┐
              ▼                                ▼
    GameVault_AppsScript.gs 變動      GameVault/ 資料夾任何變動
              │                                │
              ▼                                ▼
   GitHub Actions(deploy-gas.yml)      Netlify 自動偵測
              │                                │
              ▼                                ▼
    clasp 推上 Apps Script 專案         重新建置＋部署靜態網頁
              │                                │
              ▼                                ▼
   Web App 網址（後端邏輯更新，網址不變）   reteogame.netlify.app（前端更新）
```

Claude 只負責「把對的程式碼 push 到 GitHub 上對的路徑」，後面兩條自動化流水線是各自獨立運作的既有設定，Claude 不會也不能手動介入 GAS 部署或 Netlify 建置的內部過程。

---

*文件建立：2026-07-17*
