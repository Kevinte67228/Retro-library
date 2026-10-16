/**
 * RetroVault Background Worker (v11.05)
 * 在獨立執行緒（Worker）中運行倒排索引、大量資料篩選與 Google Sheets 靜默同步。
 * 徹底避免主畫面 UI 掉幀或卡頓。
 */
importScripts('./vault-db.js', './vault-sync-engine.js');

self.onmessage = function(e) {
  var msg = e.data || {};
  var type = msg.type;
  var payload = msg.payload || {};
  var reqId = msg.reqId;

  try {
    switch (type) {
      case 'BUILD_INDEX':
        var indexStats = VaultDB.buildIndex(payload.collection);
        self.postMessage({
          reqId: reqId,
          type: 'INDEX_BUILT',
          success: true,
          stats: indexStats
        });
        break;

      case 'SEARCH':
        var searchRes = VaultDB.search(payload.query, payload.filters);
        self.postMessage({
          reqId: reqId,
          type: 'SEARCH_RESULTS',
          success: true,
          data: searchRes
        });
        break;

      case 'INIT_SYNC':
        VaultSyncEngine.init({
          gasUrl: payload.gasUrl,
          appToken: payload.appToken
        });
        self.postMessage({
          reqId: reqId,
          type: 'SYNC_READY',
          success: true
        });
        break;

      case 'BATCH_ADD_BG':
        VaultSyncEngine.batchAdd(payload.category, payload.rows, payload.options)
          .then(function(res) {
            self.postMessage({
              reqId: reqId,
              type: 'BATCH_ADD_DONE',
              success: true,
              result: res
            });
          })
          .catch(function(err) {
            self.postMessage({
              reqId: reqId,
              type: 'BATCH_ADD_ERROR',
              success: false,
              error: err.message
            });
          });
        break;

      default:
        self.postMessage({
          reqId: reqId,
          type: 'UNKNOWN_MSG',
          success: false,
          error: '不支援的訊息型態：' + type
        });
    }
  } catch (err) {
    self.postMessage({
      reqId: reqId,
      type: 'WORKER_ERROR',
      success: false,
      error: err.message
    });
  }
};
