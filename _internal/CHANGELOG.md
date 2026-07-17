# GameVault CHANGELOG

## v01.01 (2026-07-17)

### 變更內容
**發布版本重置（Release Baseline Reset）**：正式將此版本訂為公開發布起點，版本號重新編號：
- 前端：v67.16 → **v01.01**
- 後端（GAS）：v67 → **v01**
- 純版本重新編號，不涉及任何邏輯或功能異動（GAS/前端程式碼行為與 v67.16／v67 完全一致）
- 清空所有歷史備份（`_internal/old/` 全部版本，含原永久保留的 v42_20a1、v67_01）
- 重設前已於 `_internal/pre_v01_reset_snapshot_v67_16_20260717/` 保留一份完整快照（含 GAS、前端、manual、icons、舊版 CHANGELOG 與協作規則），作為回溯依據
- CHANGELOG 清空重新記錄，此為第一筆

### 影響檔案
- index.html / GameVault_v01_01_index.html（新增，取代刪除的 GameVault_v67_16_index.html）
- sw.js（CACHE_NAME: gamevault-v67-16 → gamevault-v01-01）
- GameVault_AppsScript.gs（版本註解 v67 → v01）

### GS 版本
- v01（純版本號重新編號，無邏輯變更）

### PWA 快取
- CACHE_NAME: gamevault-v67-16 → gamevault-v01-01

### 對應備份
- 無（本次重置即清空所有備份的起點；下一版起恢復正常 5 版輪替備份機制）

