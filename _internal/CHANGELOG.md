## v42.14a2 (2026-07-02)
- 前端錯誤訊息改顯示後端實際回傳的 error/hint，不再只顯示通用文字；GS 端 Steam API 失敗時退回 meta 標籤擷取當備援，不直接放棄（需手動部署 GS）

## v42.14a1 (2026-07-02)
- 修正商店連結抓取：Steam 商品頁改走官方 appdetails API（繞開年齡驗證頁擋住 meta 標籤的問題），一般商店頁 meta 擷取加上年齡驗證 cookie 重試備援；GS 後端同步更新（需手動部署）

## v42.14 (2026-07-02)

### 變更內容
- 新增「數位遊戲」第 5 個分類，獨立欄位架構（DIGITAL_FIELDS/SELECTS/GROUPS/GCOL/DEFAULTS），拿掉條碼/品相/保管位置等實體專屬欄位，新增商店資訊（購入商店/購入帳號/取得方式）與追加內容（額外購入的 DLC，文字記錄非狀態列舉）
- 「購入帳號」比照保管位置清單模式，設定頁新增「🎮 數位帳號清單」可自建常用帳號，下拉選單型別 acctsel
- 不保留「目前估值」追蹤（數位版通常不可轉售）
- 新增建檔方式「🔗 商店連結」：貼上 PSN／Nintendo eShop／Steam／Xbox Store／Epic Games 等商店頁網址，後端擷取 Open Graph meta 標籤（標題/描述/封面圖），前端呼叫 Gemini（不開 grounding）從擷取內容判斷遊戲名稱與基本欄位並自動帶入表單
- GS 後端新增 fetchStorePageProxy，僅擷取 meta 標籤不解析整頁 DOM；JS 動態渲染頁面（如 PSN 網頁版）可能抓不到資料，已在畫面加註提示
- Step1 分類卡片、建檔方式卡片（依分類隱藏條碼/編碼相關卡片、顯示商店連結卡片）、收藏頁篩選、統計圖表配色等既有 4 分類寫死清單全數同步更新

### 影響檔案
- index.html / GameVault_v42_14_index.html
- sw.js
- GameVault_AppsScript.gs（**新增 action，需手動部署到 Apps Script**）

### GS 版本
- 新增 fetchStorePageProxy 函式與 fetch_store_page action

### PWA 快取
- CACHE_NAME: gamevault-v42-13 → gamevault-v42-14

### 對應備份
- _internal/old/v42_13/

### 已知限制（下次可再優化）
- 統計頁的分類專屬 KPI 儀表板尚未做「數位遊戲」專屬版型，目前會落到「全部」通用視圖
- AI_CAT_SPEC（圖片辨識用）未新增數位遊戲條目，因數位分類主要走商店連結／手動建檔，非拍照辨識
- Step1 分類卡片為 5 個在 4 欄網格中，第 5 張會單獨換行，非致命但版面不算工整

## v42.13 (2026-07-01)

### 變更內容
- 欄位改名：「套組 / 附件說明」→「特典/附件說明」（遊戲/主機/週邊三個分類，書籍分類原本就是獨立文案「附件說明」不變）
- 欄位改名＋改型別＋搬移位置：「特典碼狀態」→「DLC狀態」，固定下拉選項改為【已使用／未使用／已過期／未確認／N/A】，位置從「遊戲規格」搬到「收藏狀態」群組、緊接在「特典/附件說明」欄位後面
- 同步更新 AI 辨識提示文字（AI_CAT_SPEC）與收藏頁篩選面板（FACETS）的標籤/選項，保持一致
- 「保管位置」欄位新增動態下拉選單支援：設定頁新增「📋 保管位置清單」區塊，可自建常用位置清單（存 cfg.storageLocations，僅本機）；建檔表單的保管位置改為從清單選擇，既有資料若不在清單中會保留為「（自訂/未在清單中）」選項，不會被靜默清空或覆蓋

### 影響檔案
- index.html / GameVault_v42_13_index.html
- sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: gamevault-v42-12 → gamevault-v42-13

### 對應備份
- _internal/old/v42_12/
