/**
 * RetroVault Sync Engine (v11.05)
 * 獨立資料同步模組，支援 Google Apps Script 後端雙向通訊與秒級 batchAdd。
 * 可在主執行緒（Window）或背景 Web Worker 中無縫執行（零 DOM 相依）。
 */
(function(global) {
  'use strict';

  var VaultSyncEngine = {
    version: '11.05',
    gasUrl: '',
    appToken: '',
    timeoutMs: 15000,

    init: function(opts) {
      opts = opts || {};
      this.gasUrl = opts.gasUrl || '';
      this.appToken = opts.appToken || '';
      if (opts.timeoutMs) this.timeoutMs = opts.timeoutMs;
      return this;
    },

    // 取得目前設定
    getConfig: function() {
      return {
        gasUrl: this.gasUrl,
        appToken: this.appToken,
        timeoutMs: this.timeoutMs
      };
    },

    // 基礎 HTTP POST 封裝（自帶 AbortSignal 超時熔斷防護）
    _request: function(action, payload) {
      var self = this;
      if (!self.gasUrl) {
        return Promise.reject(new Error('未設定 Google Apps Script Web App 網址'));
      }

      var bodyData = Object.assign({
        action: action,
        app_token: self.appToken,
        _client_ver: self.version,
        _ts: Date.now()
      }, payload || {});

      var controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
      var timer = null;
      if (controller) {
        timer = setTimeout(function() { controller.abort(); }, self.timeoutMs);
      }

      return fetch(self.gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(bodyData),
        signal: controller ? controller.signal : undefined
      }).then(function(res) {
        if (timer) clearTimeout(timer);
        if (!res.ok) throw new Error('HTTP 錯誤代碼：' + res.status);
        return res.json();
      }).then(function(json) {
        if (!json || json.status === 'error') {
          throw new Error((json && json.message) || '伺服器回傳未明錯誤');
        }
        return json;
      }).catch(function(err) {
        if (timer) clearTimeout(timer);
        if (err.name === 'AbortError') {
          throw new Error('請求逾時（超過 ' + (self.timeoutMs / 1000) + ' 秒未回應），請檢查網路或試算表狀態');
        }
        throw err;
      });
    },

    // 1. 後端連線與健康度測試
    ping: function() {
      return this._request('ping').then(function(res) {
        return {
          ok: true,
          serverVersion: res.version || res.app_version || '未知',
          spreadsheetName: res.sheet_name || '已連線',
          latencyMs: res._latency || 0
        };
      });
    },

    // 2. 秒級矩陣批次寫入（GAS v11 batchAdd）
    batchAdd: function(category, rows, options) {
      if (!category) return Promise.reject(new Error('缺少分類參數'));
      if (!Array.isArray(rows) || !rows.length) return Promise.resolve({ count: 0, added: [] });

      options = options || {};
      var payload = {
        category: category,
        subtype: options.subtype || '',
        rows: rows,
        uploadImages: options.uploadImages === true
      };

      return this._request('batchAdd', payload).then(function(res) {
        return {
          success: true,
          count: res.count || rows.length,
          startRow: res.startRow || 0,
          endRow: res.endRow || 0
        };
      });
    },

    // 3. 全量抓取指定分類或全部藏品
    fetchAll: function(category, subtype) {
      var payload = {
        category: category || '遊戲'
      };
      if (subtype) payload.subtype = subtype;

      return this._request('getRows', payload).then(function(res) {
        var items = res.rows || res.data || [];
        return {
          category: category,
          total: items.length,
          items: items
        };
      });
    },

    // 4. 單筆新增或更新
    saveSingle: function(record, isEdit) {
      var action = isEdit ? 'updateRow' : 'addRow';
      return this._request(action, { row: record });
    },

    // 5. 刪除單筆
    deleteRow: function(category, rowNum) {
      return this._request('deleteRow', { category: category, rowNum: rowNum });
    }
  };

  // 模組匯出（相容 Window, Worker, CommonJS）
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = VaultSyncEngine;
  } else {
    global.VaultSyncEngine = VaultSyncEngine;
  }
})(typeof self !== 'undefined' ? self : this);
