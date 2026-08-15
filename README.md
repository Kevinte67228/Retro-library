# RetroVault

**電玩／動漫迷的收藏基地**——單一網頁運作的 PWA（Progressive Web App），幫你把遊戲、書籍、主機、週邊、原聲帶、動漫美術設定集、公仔模型、數位下載版這 8 大類實體/數位收藏整理成一個可持續維護的個人資料庫，另有獨立的「尋寶清單」追蹤還沒入手、正在比價中的目標商品。

**👉 直接使用（不需要安裝任何東西）**：<https://kevinte67228.github.io/Retro-library/>

## 資料完全歸你所有

這是這個專案最核心的設計原則：前端 App 是大家共用的操作介面，但**你的收藏資料只存在你自己的 Google 帳號裡**——不經過任何第三方伺服器，開發者本人也看不到、動不了你的資料。

- 收藏記錄存在**你自己的 Google 試算表**
- 照片存在**你自己的 Google Drive**
- 前後端原始碼全部公開，想自己檢查邏輯或自行部署都可以

## 怎麼開始用

1. 打開 <https://kevinte67228.github.io/Retro-library/>（或「加到主畫面」當原生 App 用）
2. 跟著 App 內「設定」頁的「首次設定向導」，花約 5 分鐘建立你自己的資料庫後端（一份 Google 試算表 + Apps Script，全部是 Google 帳號免費內建功能）
3. 完成後你的收藏資料就完全獨立、只屬於你

完整圖文教學見 **[使用手冊](https://kevinte67228.github.io/Retro-library/manual.html)**，或直接看 [`docs/README.md`](docs/README.md) 了解專案的完整功能與技術架構。

## 這個 Repo 的結構

| 路徑 | 內容 |
|---|---|
| [`docs/`](docs/) | **GitHub Pages 部署目錄**——這是實際上線的前後端原始碼所在位置，包含前端 `index.html`、後端 `RetroVault_AppsScript.gs`、使用手冊等。想看程式碼、想了解專案細節，從這裡開始 |
| [`_internal/`](_internal/) | 開發者自用的內部文件、部署腳本、版本備份，不影響、也不屬於對外發布的部分 |
| `.github/` | GitHub Actions 設定，用於後端程式碼的自動部署 |

## 授權

非授權禁止商用。歡迎參考架構自行修改部署自己的版本。
