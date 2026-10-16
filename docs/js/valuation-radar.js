/**
 * RetroVault Valuation Radar & Market Analytics Engine (v11.07)
 * 收藏品市場歷史成交行情曲線、資產漲跌幅矩陣與二手行情評估引擎。
 */
(function(global) {
  'use strict';

  // 平台稀有度與歷史抗跌係數
  var PLATFORM_RARITY_WEIGHTS = {
    'FC': 1.15,
    'SFC': 1.20,
    'MD': 1.25,
    'GB': 1.10,
    'GBA': 1.18,
    'PS1': 1.05,
    'SS': 1.22,
    'N64': 1.15,
    'PCE': 1.30,
    'NEOGEO': 1.50
  };

  var ValuationRadar = {
    version: '11.07',

    /**
     * 根據藏品目前估值、發行年份與品相，推導近 24 個月的歷史成交走勢曲線
     * @param {Object} item 藏品資料
     * @returns {Object} 走勢數據點與統計
     */
    generatePriceHistory: function(item) {
      var currentVal = Number(item.market_value) || 1200;
      var plat = (item.platform || 'FC').toUpperCase();
      var weight = PLATFORM_RARITY_WEIGHTS[plat] || 1.10;
      var comp = (item.completeness || '盒裝完整');

      // 品相加乘
      var compMultiplier = 1.0;
      if (comp.indexOf('全新') >= 0 || comp.indexOf('未開封') >= 0) compMultiplier = 1.6;
      else if (comp.indexOf('美品') >= 0) compMultiplier = 1.3;
      else if (comp.indexOf('裸卡') >= 0) compMultiplier = 0.55;

      var basePrice = currentVal;
      var months = 24;
      var points = [];
      var now = new Date();

      // 以偽隨機數保證同一遊戲走勢曲線穩定可重複
      var seed = 0;
      for (var s = 0; s < (item.primary_name || '').length; s++) {
        seed = (seed * 31 + item.primary_name.charCodeAt(s)) % 10000;
      }

      var startTrend = 0.72 + (seed % 15) / 100; // 2 年前約為現價的 70%~85%
      for (var m = months - 1; m >= 0; m--) {
        var d = new Date(now.getFullYear(), now.getMonth() - m, 1);
        var label = d.getFullYear() + '/' + (d.getMonth() + 1 < 10 ? '0' : '') + (d.getMonth() + 1);

        // 逐漸增長的時間權重
        var progress = (months - 1 - m) / (months - 1);
        var trendFactor = startTrend + (1.0 - startTrend) * Math.pow(progress, 0.85);

        // 每月微波動 (+- 4%)
        var noise = Math.sin((m + seed) * 1.7) * 0.04;
        var estPrice = Math.round((basePrice * trendFactor * (1 + noise)) / 50) * 50;

        // 市場來源隨機模擬標註
        var sources = ['Mercari JP', 'Yahoo 拍賣', '駿河屋', 'eBay'];
        var src = sources[(m + seed) % sources.length];

        points.push({
          date: label,
          price: Math.max(100, estPrice),
          source: src
        });
      }

      // 確保最後一點精確等於目前估值
      if (points.length > 0) {
        points[points.length - 1].price = currentVal;
      }

      var minPrice = Math.min.apply(null, points.map(function(p){ return p.price; }));
      var maxPrice = Math.max.apply(null, points.map(function(p){ return p.price; }));
      var growthRate = Math.round(((currentVal - points[0].price) / points[0].price) * 1000) / 10;

      return {
        points: points,
        currentVal: currentVal,
        startVal: points[0].price,
        minPrice: minPrice,
        maxPrice: maxPrice,
        growthRate: growthRate, // 增長百分比 e.g. +38.5%
        rarityRating: weight >= 1.25 ? 'SSR (稀有絕版)' : (weight >= 1.15 ? 'SR (熱門保值)' : 'R (普品)')
      };
    },

    /**
     * 計算整體收藏庫的資產大盤指標
     * @param {Array} collection 
     */
    calculatePortfolioStats: function(collection) {
      if (!Array.isArray(collection) || !collection.length) {
        return {
          totalCount: 0,
          totalMarketValue: 0,
          totalCost: 0,
          totalGain: 0,
          gainRate: 0,
          topGems: []
        };
      }

      var totalVal = 0;
      var totalCost = 0;
      var itemsWithVal = [];

      collection.forEach(function(item) {
        var d = item.data || item;
        var mv = Number(d.market_value) || 0;
        var bp = Number(d.buy_price) || (mv * 0.7); // 若未填購入價則預設為估值70%
        totalVal += mv;
        totalCost += bp;

        itemsWithVal.push({
          name: d.primary_name || d.name || '未命名',
          platform: (d.platform || 'FC').toUpperCase(),
          marketValue: mv,
          buyPrice: bp,
          gain: (mv - bp),
          gainRate: bp > 0 ? Math.round(((mv - bp) / bp) * 1000) / 10 : 0,
          cover_img: d.cover_img || ''
        });
      });

      // 依漲幅排序找出 Top 5 最具增值潛力藏品
      itemsWithVal.sort(function(a, b) { return b.gainRate - a.gainRate; });

      var netGain = totalVal - totalCost;
      var gainRate = totalCost > 0 ? Math.round((netGain / totalCost) * 1000) / 10 : 0;

      return {
        totalCount: collection.length,
        totalMarketValue: totalVal,
        totalCost: Math.round(totalCost),
        totalGain: Math.round(netGain),
        gainRate: gainRate,
        topGems: itemsWithVal.slice(0, 5)
      };
    }
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ValuationRadar;
  } else {
    global.ValuationRadar = ValuationRadar;
  }
})(typeof self !== 'undefined' ? self : this);
