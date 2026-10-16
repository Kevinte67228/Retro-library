/**
 * RetroVault Local-First High-Speed DB & Full-Text Search Engine (v11.05)
 * 極速本地倒排索引（Inverted Index）與多語系模糊查詢引擎。
 * 支援中日英混排、平假名/片假名正規化、N-Gram 分詞與毫秒級多維度過濾。
 */
(function(global) {
  'use strict';

  // ── 平假名轉片假名正規化表 ──
  function kanaNormalize(str) {
    if (!str) return '';
    return String(str)
      // 平假名轉片假名 (0x3041-0x3096 -> 0x30A1-0x30F6)
      .replace(/[\u3041-\u3096]/g, function(ch) {
        return String.fromCharCode(ch.charCodeAt(0) + 0x60);
      })
      // 半角假名轉全角假名
      .replace(/[\uFF66-\uFF9D]/g, function(ch) {
        var map = {
          'ｱ':'ア','ｲ':'イ','ｳ':'ウ','ｴ':'エ','ｵ':'オ',
          'ｶ':'カ','ｷ':'キ','ｸ':'ク','ｹ':'ケ','ｺ':'コ',
          'ｻ':'サ','ｼ':'シ','ｽ':'ス','ｾ':'セ','ｿ':'ソ',
          'ﾀ':'タ','ﾁ':'チ','ﾂ':'ツ','ﾃ':'テ','ﾄ':'ト',
          'ﾅ':'ナ','ﾆ':'ニ','ﾇ':'ヌ','ﾈ':'ネ','ﾉ':'ノ',
          'ﾊ':'ハ','ﾋ':'ヒ','ﾌ':'フ','ﾍ':'ヘ','ﾎ':'ホ',
          'ﾏ':'マ','ﾐ':'ミ','ﾑ':'ム','ﾒ':'メ','ﾓ':'モ',
          'ﾔ':'ヤ','ﾕ':'ユ','ﾖ':'ヨ','ﾗ':'ラ','ﾘ':'リ','ﾙ':'ル','ﾚ':'レ','ﾛ':'ロ',
          'ﾜ':'ワ','ｦ':'ヲ','ﾝ':'ン'
        };
        return map[ch] || ch;
      })
      .toLowerCase();
  }

  // ── N-Gram 分詞器（支援 CJK 雙字元切分與英文單字）──
  function tokenize(text) {
    if (!text) return [];
    var clean = kanaNormalize(text).replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\[\]<>?"'\\|]/g, ' ');
    var words = clean.split(/\s+/).filter(Boolean);
    var tokens = new Set();

    words.forEach(function(w) {
      tokens.add(w); // 完整詞
      // CJK 字元（漢字、假名）採用 2-gram 切分
      if (/[\u4e00-\u9fa5\u3040-\u30ff]/.test(w)) {
        for (var i = 0; i < w.length - 1; i++) {
          tokens.add(w.substring(i, i + 2));
        }
      }
    });

    return Array.from(tokens);
  }

  var VaultDB = {
    version: '11.05',
    items: [],
    index: new Map(), // token -> Set(itemIndex)
    isReady: false,
    itemCount: 0,

    // 清空重設
    clear: function() {
      this.items = [];
      this.index.clear();
      this.isReady = false;
      this.itemCount = 0;
    },

    // 建立索引（傳入藏品陣列）
    buildIndex: function(collection) {
      var t0 = (typeof performance !== 'undefined') ? performance.now() : Date.now();
      this.clear();

      if (!Array.isArray(collection)) return { count: 0, timeMs: 0 };

      this.items = collection.map(function(item, idx) {
        var d = item.data || item;
        return {
          id: idx,
          raw: item,
          primary_name: d.primary_name || d.zh_name || d.jp_name || d.en_name || '',
          platform: (d.platform || 'FC').toUpperCase(),
          category: d.category || '遊戲',
          developer: d.developer || d.publisher || '',
          barcode: d.barcode || d.code || '',
          release_date: d.release_date || '',
          completeness: d.completeness || '',
          market_value: Number(d.market_value) || 0,
          storage_location: d.storage_location || '',
          cover_img: d.cover_img || '',
          back_img: d.back_img || '',
          spine_img: d.spine_img || ''
        };
      });

      var self = this;
      this.items.forEach(function(item, id) {
        // 索引欄位：品名、平台、開發商、條碼、保管位置
        var combinedText = [
          item.primary_name,
          item.platform,
          item.developer,
          item.barcode,
          item.storage_location
        ].join(' ');

        var tokens = tokenize(combinedText);
        tokens.forEach(function(tok) {
          if (!self.index.has(tok)) {
            self.index.set(tok, new Set());
          }
          self.index.get(tok).add(id);
        });
      });

      this.isReady = true;
      this.itemCount = this.items.length;
      var t1 = (typeof performance !== 'undefined') ? performance.now() : Date.now();

      return {
        count: this.itemCount,
        tokenCount: this.index.size,
        timeMs: Math.round((t1 - t0) * 100) / 100
      };
    },

    // 極速模糊檢索與多條件過濾
    search: function(query, filters) {
      var t0 = (typeof performance !== 'undefined') ? performance.now() : Date.now();
      filters = filters || {};
      query = (query || '').trim();

      var candidateIds = null;

      // 1. 全文檢索
      if (query) {
        var queryTokens = tokenize(query);
        if (queryTokens.length > 0) {
          var matchedSets = [];
          for (var i = 0; i < queryTokens.length; i++) {
            var tok = queryTokens[i];
            var set = this.index.get(tok);
            if (set) {
              matchedSets.push(set);
            } else {
              // 若完全沒有精確 token，嘗試前綴模糊比對
              var prefixSet = new Set();
              this.index.forEach(function(ids, key) {
                if (key.indexOf(tok) >= 0) {
                  ids.forEach(function(id) { prefixSet.add(id); });
                }
              });
              if (prefixSet.size > 0) matchedSets.push(prefixSet);
            }
          }

          if (matchedSets.length > 0) {
            // 取交集（AND 邏輯）
            candidateIds = new Set(matchedSets[0]);
            for (var j = 1; j < matchedSets.length; j++) {
              var nextSet = matchedSets[j];
              candidateIds.forEach(function(id) {
                if (!nextSet.has(id)) candidateIds.delete(id);
              });
            }
          } else {
            candidateIds = new Set(); // 查無結果
          }
        }
      }

      // 若無搜尋詞，候選集為全量
      var idList = candidateIds ? Array.from(candidateIds) : this.items.map(function(it) { return it.id; });
      var self = this;

      // 2. 結構化過濾條件（平台、品相、最低價格等）
      var results = [];
      for (var k = 0; k < idList.length; k++) {
        var it = self.items[idList[k]];
        if (!it) continue;

        // 平台過濾
        if (filters.platform && filters.platform !== 'ALL') {
          if (it.platform.indexOf(filters.platform) < 0) continue;
        }

        // 僅看有書背圖者
        if (filters.hasSpineOnly && !it.spine_img) continue;

        // 品相過濾
        if (filters.completeness && it.completeness !== filters.completeness) continue;

        // 最低估值
        if (filters.minVal && it.market_value < filters.minVal) continue;

        results.push(it);
      }

      // 3. 排序
      var sortBy = filters.sortBy || 'name';
      if (sortBy === 'name') {
        results.sort(function(a, b) { return a.primary_name.localeCompare(b.primary_name, 'zh-Hant'); });
      } else if (sortBy === 'value_desc') {
        results.sort(function(a, b) { return b.market_value - a.market_value; });
      } else if (sortBy === 'date_desc') {
        results.sort(function(a, b) { return (b.release_date || '').localeCompare(a.release_date || ''); });
      }

      var t1 = (typeof performance !== 'undefined') ? performance.now() : Date.now();
      return {
        total: results.length,
        items: results,
        latencyMs: Math.round((t1 - t0) * 100) / 100
      };
    },

    // ── 產生壓測用模擬資料集（供效能基準測試）──
    generateStressDataset: function(count) {
      count = count || 5000;
      var platforms = ['FC', 'SFC', 'MD', 'GB', 'GBA', 'PS1', 'SS', 'N64'];
      var prefixes = ['超合金', '真·女神', '魔界村', '惡魔城', '洛克人', '音速小子', 'Final Fantasy', '勇者鬥惡龍', '三國志', '超級瑪利歐', '熱血硬派', '魂斗羅'];
      var suffixes = ['外傳', '編年史', '合集', '典藏版', '重製版', 'DX', 'Plus', 'II', 'III', 'IV', '2026', 'Final'];
      var developers = ['Nintendo', 'SEGA', 'CAPCOM', 'KONAMI', 'SQUARE ENIX', 'NAMCO', 'SNK', 'TAITO', 'BANDAI'];

      var dummy = [];
      for (var i = 0; i < count; i++) {
        var p = platforms[i % platforms.length];
        var pre = prefixes[i % prefixes.length];
        var suf = suffixes[i % suffixes.length];
        var dev = developers[i % developers.length];
        var num = (i + 1);

        dummy.push({
          primary_name: pre + ' ' + suf + ' (' + num + ')',
          platform: p,
          category: '遊戲',
          developer: dev,
          release_date: String(1985 + (i % 25)),
          completeness: (i % 3 === 0 ? '盒裝完整' : (i % 3 === 1 ? '裸卡' : '美品')),
          market_value: String(300 + (i % 80) * 50),
          barcode: '49' + String(10000000000 + i).slice(0, 11),
          storage_location: '防潮箱 ' + String.fromCharCode(65 + (i % 6)) + (i % 4 + 1),
          cover_img: 'https://cdn.jsdelivr.net/gh/libretro-thumbnails/Nintendo_-_Nintendo_Entertainment_System/Named_Boxarts/Super%20Mario%20Bros.%20(World).png',
          spine_img: 'https://images.launchbox-app.com/95c5c000-460d-469d-943a-ba86e8812c3f.jpg'
        });
      }
      return dummy;
    }
  };

  // 匯出
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = VaultDB;
  } else {
    global.VaultDB = VaultDB;
  }
})(typeof self !== 'undefined' ? self : this);
