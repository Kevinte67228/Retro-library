## v42.20a1-revert (2026-07-03)

### 變更內容
使用者要求回滾 v42.21（移除原聲帶/畫集/公仔分類、數位遊戲與電子書改為第7種建檔方式）。前端還原至 v42.20a1 狀態（8 分類架構、數位遊戲為 Step1 獨立分類）。GS 後端完全未受 v42.21 影響，快取碰撞修正（v42.20a1）維持有效，不需重新部署 GS。v42.21 的完整程式碼已備份於 _internal/old/v42_21/，若之後想拿回來可還原。

### 影響檔案
- index.html / GameVault_v42_20_index.html
- sw.js

### GS 版本
- 無變動（v42.20a1 的 MD5 快取修正持續有效）

### PWA 快取
- CACHE_NAME: gamevault-v42-21 → gamevault-v42-20a1

### 對應備份
- _internal/old/v42_21/（回滾前的 v42.21 完整備份）

## v42.21 (2026-07-03)

### 變更內容
重大架構調整：移除原聲帶/畫集/公仔三個分類；「數位遊戲」從獨立 Step1 分類降階為「遊戲」分類專屬的第 7 種建檔方式；新增「電子書」作為「書籍」分類專屬的第 7 種建檔方式
- Step1 分類卡片改回 4 張（遊戲/書籍/主機/週邊），移除原聲帶/畫集/公仔/數位遊戲卡片
- Step4 建檔方式：商品條碼/商品編碼/圖片辨識/手動建檔/條碼＋照片/編碼＋照片 6 種恆常顯示（不再依分類隱藏）；「數位遊戲」卡片只在選了「遊戲」分類時出現，「電子書」卡片只在選了「書籍」分類時出現，兩者皆為滿版橫幅樣式且互斥顯示，不論哪個出現都撐滿整排、對齊其餘 6 張卡片
- 新增 ELECBOOK_FIELDS 電子書欄位五件套（作者/系列/購入平台/購入帳號/取得方式/類型/格式等），CAT_META 註冊，不含條碼/品相/保管位置/估值（比照數位遊戲無實體概念）
- 新增電子書建檔流程：initEbookLinkMode/ebookLinkFetch/_inferBookStoreFromUrl/ebookLinkToManual，共用同一支 GS fetchStorePageProxy 後端（無需異動 GS），商店推斷涵蓋 Kindle/Kobo/BookWalker/Readmoo/Google Play 圖書/Apple Books
- 點擊「數位遊戲」／「電子書」卡片時強制覆寫 _selectedType 為對應分類（不沿用 Step1 選的遊戲/書籍），確保實際儲存的分類正確
- 移除三個分類的所有相關程式碼：欄位五件套、CAT_META 登記、catInternal 別名、AI_CAT_SPEC、COMP_COMPONENTS、卡片標籤 CSS/邏輯、收藏頁統計格、統計頁下拉選單與儀表板模型、FACETS 排除清單
- 收藏頁總計列統計格數位遊戲/電子書分類正確計數；統計頁下拉選單與 catMap 同步更新

### 影響檔案
- index.html / GameVault_v42_21_index.html
- sw.js

### GS 版本
- 無（電子書流程共用既有 fetchStorePageProxy，無需異動 GS）

### PWA 快取
- CACHE_NAME: gamevault-v42-20 → gamevault-v42-21

### 對應備份
- _internal/old/v42_20/

## v42.20a1 (2026-07-03)
- 修正 GS 後端 fetchStorePageProxy 快取鍵碰撞 bug：舊版用 base64 截斷前 40 碼當快取鍵，Steam 等共同前綴超過 30 bytes 的網址會算出同一把鍵，導致貼任何 Steam 連結都回傳第一次快取的結果（使用者回報一直顯示 Watch_Dogs 2）；改用 MD5 雜湊整個網址內容，已用實際網址驗證修法有效。純 GS 修正，前端無變動，需手動部署 GS

## v42.20 (2026-07-03)

### 變更內容
盤點報告批次 3（M4-M7 / L5；L3 依既有註解決策保留不移除）：
- M7：cfg 持久化統一——新增 _persistCfg()（全量）與 _persistCfgKeys(patch)（部分合併，避免過期記憶體覆蓋其他欄位）兩個共用入口，取代 9 處分散的 localStorage 直寫（slPersist/acPersist/cmPersist/匯入設定/saveCfg/fx/region/建檔記憶）
- M4：篩選面板 facet 依分類過濾——__condition/__complete/__todo 三個永遠有 fallback 值的虛擬 facet 加 notCats:['數位遊戲']，選數位遊戲時不再顯示無意義的品相/完整度篩選；欄位型 facet 原本就會依「範圍內有無值」自動隱藏，不需額外處理
- M5：商店連結抓取失敗訊息加「✏️ 改用手動建檔（保留此網址）」按鈕，一鍵切換並將網址帶入 ref_link、自動推斷商店
- M6：14 處動態產生的 <img> 補齊 alt 屬性（預覽圖補描述文字、裝飾縮圖補空 alt）
- L5：Service Worker 註冊加 updatefound 監聽，新版本安裝完成時 toast 提示重新整理更新
- L3：GS search action 經查程式碼已有註解標明「刻意保留供手動 GET 測試」，屬既有決策，保留不移除（避免為 Low 項目強迫手動重新部署 GS）

### 影響檔案
- index.html / GameVault_v42_20_index.html
- sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: gamevault-v42-19 → gamevault-v42-20

### 對應備份
- _internal/old/v42_19/
