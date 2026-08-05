## v02.74 (2026-08-04)

### 變更內容
修正 v02.73 的誤解：使用者要的「拍照裁切預覽時四邊角落先定位」是指貼緊**被攝商品**的實際邊緣，不是貼齊整張照片的邊緣——v02.73 把這兩者理解反了，改成一律從整張圖開始，變成完全沒有預先定位。

這次改回用 `detectCropBox()` 邊緣色差偵測商品邊界當初始框（跟 v02.73 之前的行為一致），偵測失敗或框明顯異常（面積小於畫面25%）才退回內縮 6% 的保守框，使用者再從這個起始位置自行微調確認。

自我檢查：`node --check` 通過；無 U+FFFD；抽取真實函式跑 9 項自我檢查全過，含成功偵測時正確貼緊商品邊界換算成畫面座標（並明確驗證不是整張圖）、偵測失敗時正確退回保守框、偵測框過小時正確視為異常退回保守框、resize 保留使用者調整框的機制不受影響。

### 影響檔案
- docs/index.html / docs/RetroVault_v02_74_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v02-73 → retrovault-v02-74

### 對應備份
- _internal/old/v02_73/


## v02.73 (2026-08-04)

### 變更內容
依使用者要求，所有拍照模式進入裁切預覽時，初始裁切框改成一律先貼齊四邊（整張圖），不再嘗試自動偵測商品邊界去猜測初始範圍，交給使用者自己拖曳角落調整後再確認。

因為全站的拍照裁切現在都已經統一走同一個共用工具 `cropImageFile()`/`_cropOpen()`（圖片辨識模式、批次書背 Step4 都是呼叫這個），只要改這一個地方，全部拍照情境都會套用到，不用逐一修改。

原本的行為是優先用 `detectCropBox()` 做邊緣色差偵測，猜測商品邊界當初始框，猜不到才退回內縮 6% 的框。這次直接拿掉這段猜測邏輯，初始框永遠等於完整顯示區域（`_crop.view`），行為固定、不受圖片內容影響，使用者不用先搞懂「AI猜的框在哪裡、準不準」才能開始調整。

`detectCropBox()` 用在其他地方的自動裁切流程（`autoCropCanvas`／`compressImg`，沒有互動確認畫面的背景處理）不受這次變動影響，維持原樣。

自我檢查：`node --check` 通過；無 U+FFFD；抽取真實函式跑 5 項自我檢查全過，含初始框四個邊界座標都正確等於完整顯示區域、確認 `detectCropBox()` 真的沒有被呼叫到（用會拋例外的假函式驗證，測試過程沒有拋出任何例外）、既有的 resize 保留使用者調整框的機制不受影響。

### 影響檔案
- docs/index.html / docs/RetroVault_v02_73_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v02-72 → retrovault-v02-73

### 對應備份
- _internal/old/v02_72/


## v02.72 (2026-08-04)

### 變更內容
新增收藏頁第三個展示模式「畫廊」，把剛做好的 gallery.html（封面圖優先的2欄網格）風格帶進 App 本身：

- 沿用既有的模式切換機制（`currentView`／`setView()`），跟「卡片」「分類」平行存在，不影響原本兩個模式
- 卡片互動完全沿用既有的 `_colPressAttr`（短按看詳情／長按開操作選單）跟收藏愛心（`.gfav`），不重做一套新的互動邏輯
- 視覺沿用既有配色（深色背景＋既有色票），不是另外設計一套新風格

### 關於使用者回報的「載入變慢」
查證後沒有發現內嵌大型資料拖累檔案（base64圖片等）的問題。但發現一個很可能的真正原因：8/1 當天連續發布了 8 個版本（v02_61～v02_69），這幾天版本更新非常密集——**每次版本更新，Service Worker 的 CACHE_NAME 都會變，導致整個約 1MB 大小的 index.html 需要重新完整下載**，不是走本機快取。這幾天密集開發測試的過程本身，很可能就是使用者感覺變慢的主因，不是快取機制真的壞掉。等這波密集迭代告一段落、版本更新頻率降低後，這個現象應該會自然改善。這次沒有額外的快取機制改動（找不到具體可改善的地方，如實記錄，不做沒有根據的調整）。

自我檢查：`node --check` 通過；無 U+FFFD；CSS 614/614；全檔案 HTML div 巢狀完整性通過；抽取真實函式跑 16 項自我檢查全過，含三種視圖模式的按鈕/容器切換正確、畫廊卡片正確渲染品名/平台/收藏狀態/封面圖、既有手勢屬性正確套用、兩種空狀態文字正確顯示。

### 影響檔案
- docs/index.html / docs/RetroVault_v02_72_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v02-71 → retrovault-v02-72

### 對應備份
- _internal/old/v02_71/


## v02.71 (2026-07-28)

### 變更內容
依使用者要求，Step4封面照的裁切功能整個換掉：拿掉v02.68~70自己搞的一套（即時相機串流+DOM拖曳裁切UI），改用「圖片辨識」模式（`initImgMode`/`onSlotPhoto`）本來就在用、全站唯一、已經過長期驗證的裁切系統——`cropImageFile()` + `#crop-ov`（Canvas繪製的裁切工具，支援拖曳移動整個框、拖曳4個角落縮放、三分格線、「使用原圖」跳過裁切等功能）。

- 移除v02.68新增的`openFieldScanner`的`mode:'photo'`分支、`fscanCapturePhoto`
- 移除v02.70自己刻的手動裁切UI：`_fitContainBox`／`_cropHandleDown`／`_cropHandleMove`／`_cropHandleUp`／`_fscanShowCropUI`／`_fscanCropConfirm`等10餘個函式，以及對應的CSS／HTML（`#fscan-crop-wrap`等）
- `openFieldScanner`／`_fscanBuildCaptureBar`／`fscanStop`復原成只服務barcode/OCR兩種模式（v02.68之前的狀態）
- Step4改成跟「圖片辨識」模式一樣的「📷拍照／🖼相簿」兩按鈕，選圖後呼叫既有的`cropImageFile(file)`（Promise模式），開啟全站共用的裁切器，確認裁切後存入`item.entry.cover_img`、顯示縮圖預覽，使用者按「確認，下一件」才推進（原生檔案選取器每次都需要使用者主動點擊觸發相機/相簿，沒辦法做到完全自動連續拍攝，但換來裁切功能真正可靠好用）

自我檢查：`node --check` 通過；無 U+FFFD；CSS 605/605（確認清乾淨、跟v02.67修改前一致）；全檔案HTML div巢狀完整性通過；確認v02.68~70引入的photo/裁切相關函式全數移除、無殘留；抽取真實函式跑16項自我檢查全過，含Step4選圖後正確呼叫既有裁切器、裁切確認/取消(reject)都正確處理不誤設定資料、確認/跳過正確推進、最後一件正確轉場進入解析管線、以及barcode/OCR既有模式的回歸測試確認復原後完全正常。

### 影響檔案
- docs/index.html / docs/RetroVault_v02_71_index.html
- docs/sw.js

### GS 版本
- 無

### PWA 快取
- CACHE_NAME: retrovault-v02-70 → retrovault-v02-71

### 對應備份
- _internal/old/v02_70/
