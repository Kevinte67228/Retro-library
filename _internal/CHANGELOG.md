## v02.37 (2026-07-26)

### 變更內容
修復進入編輯表單時，上一步的掃描區塊沒被隱藏、跟表單內容疊在一起顯示的 bug：
- `showForm()` 原本只手動隱藏 `bar-sec`／`img-sec` 兩個區塊（純條碼/純圖片模式年代寫的），後來新增的 `combo-sec`／`gcode-sec`／`gcode-combo-sec`／`digital-link-sec`／`aiweb-sec` 都沒被涵蓋到，導致這些模式（例如條碼＋照片）AI 辨識完進表單時，上一步的拍照/AI辨識按鈕跟預覽圖還留在畫面上、跟表單堆疊在一起。
- 改用既有的 `hideAllSecs()`（涵蓋全部 8 個進場區塊）取代原本手動隱藏兩個區塊，再把 `form-sec` 顯示回來。已確認全部 26 個呼叫 `showForm()` 的地方都是「準備顯示完成表單」的最終步驟，沒有任何一處需要保留掃描區塊可見，此修復對全部建檔模式都適用。

### 影響檔案
- docs/index.html / docs/RetroVault_v02_37_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v02-36 → retrovault-v02-37

### 對應備份
- _internal/old/v02_36/


## v02.36 (2026-07-26)

### 變更內容
「加拍封底」標題微調：
- 拿掉沒有實質意義的「②b」前綴，只留「加拍封底」
- 備註文字縮短（「選填，封底印有條碼/編號/日期/語言，可提升欄位命中」→「選填，可提升欄位命中率」）並改用 flex 排列＋`white-space:nowrap`＋`text-overflow:ellipsis`，確保整段標題固定顯示在一行，不會在窄螢幕上換行拉長版面

### 影響檔案
- docs/index.html / docs/RetroVault_v02_36_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v02-35 → retrovault-v02-36

### 對應備份
- _internal/old/v02_35/



## v02.35 (2026-07-26)

### 變更內容
「②b 加拍封底」區塊 UI 統一成跟「② 拍攝遊戲封面」一致：
- 標題色從 `#7986cb`（偏暗淡）改成 `#ce93d8`（本區塊 accent 色，跟①②標題一致）
- 備註文字「選填，封底印有條碼/編號/日期/語言...」從 `#555`（深灰，在深色背景下幾乎不可見）改成 `#7986cb`（可讀的次要文字色）
- 「拍封底」按鈕從淡化的虛線外框樣式，改成跟「拍照」按鈕一樣的實心強調樣式（背景色塊＋實線框＋粗體）
- 「拍封底」「相簿」按鈕的 padding（10px→12px）與字級（12px→13px）跟上排對齊

### 影響檔案
- docs/index.html / docs/RetroVault_v02_35_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v02-34 → retrovault-v02-35

### 對應備份
- _internal/old/v02_34/




## v02.34 (2026-07-26)

### 變更內容
裁切框自動對齊商品外框，降低使用者手動調整機率：
- 手動裁切器（`_cropLayout`）原本初始框寫死「影像內縮 6%」、完全沒用邊緣偵測。現在改為首次開啟時呼叫既有的 `detectCropBox()`（背景色估算＋自適應容差＋四邊向內掃描）偵測商品外框，把原圖座標換算成畫面座標當初始框，讓框一開始就貼齊商品；偵測失敗或偵測框過小（<影像 25%）時，退回原本的內縮 6%。
- 修復同時發現的漏洞：`_cropLayout` 也被 `resize` 監聽器呼叫，若無保護會在每次螢幕旋轉/鍵盤彈出時用自動偵測結果重置使用者已調好的框。加 `_autoDetected` 旗標，只在首次布局偵測；resize 時改為把既有框依新舊 view 比例換算保留，框不會跑掉。每張新圖開啟時（`_cropOpen`）重置旗標，確保每張都重新偵測。

`detectCropBox()` 本身是既有函式（`autoCropCanvas` 一直在用），這次只是讓帶手動框的裁切 UI 也共用它，沒有改動偵測演算法。

自我檢查：`node --check` 通過；無 U+FFFD；CSS 594/594；座標換算邏輯自我檢查 9 項全過（原圖↔畫面座標互算、resize 前後框對應原圖座標一致、偵測失敗退回內縮 6%、過小框被拒絕）。

### 影響檔案
- docs/index.html / docs/RetroVault_v02_34_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v02-33 → retrovault-v02-34

### 對應備份
- _internal/old/v02_33/
