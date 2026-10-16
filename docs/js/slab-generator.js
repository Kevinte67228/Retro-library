/**
 * RetroVault Digital Graded Slab Generator (v11.06)
 * 收藏家高規格數位封裝鑑定卡（Slab）純前端 Canvas 合成引擎。
 * 支援 1080x1920 (IG/Threads/X 規格) 高畫質海報匯出、雷射全息防偽燙金反光與品相智能評級。
 */
(function(global) {
  'use strict';

  // 根據 completeness 或品相字串自動計算鑑定卡評級
  function calculateGrade(compText) {
    var txt = (compText || '').toLowerCase();
    if (txt.indexOf('全新') >= 0 || txt.indexOf('未開封') >= 0 || txt.indexOf('10') >= 0) {
      return { score: '10.0', rank: 'GEM MINT', sub: 'PERFECT 10', color: '#ffd700' };
    }
    if (txt.indexOf('美品') >= 0 || txt.indexOf('近全新') >= 0 || txt.indexOf('9.8') >= 0) {
      return { score: '9.8', rank: 'MINT+', sub: 'BOX 9.8 / CART 9.8', color: '#00e5ff' };
    }
    if (txt.indexOf('盒裝完整') >= 0 || txt.indexOf('盒書齊全') >= 0 || txt.indexOf('9.6') >= 0) {
      return { score: '9.6', rank: 'MINT', sub: 'BOX 9.4 / CART 9.8', color: '#69f0ae' };
    }
    if (txt.indexOf('良好') >= 0 || txt.indexOf('8.5') >= 0) {
      return { score: '8.5', rank: 'EX/NM', sub: 'COMPLETE 8.5', color: '#ffb74d' };
    }
    if (txt.indexOf('裸卡') >= 0 || txt.indexOf('卡本體') >= 0) {
      return { score: 'CART ONLY', rank: 'AUTHENTIC', sub: 'GENUINE CARTRIDGE', color: '#ce93d8' };
    }
    return { score: '9.4', rank: 'NEAR MINT+', sub: 'VERIFIED ARCHIVE', color: '#00e5ff' };
  }

  var SlabGenerator = {
    version: '11.06',

    // 取得評級資訊
    getGradeInfo: function(compText) {
      return calculateGrade(compText);
    },

    /**
     * 在 Canvas 上繪製高解析度鑑定卡 (預設 1080 x 1620 像素)
     * @param {HTMLCanvasElement} canvas 
     * @param {Object} item 藏品資料
     * @param {Object} options 樣式選項 (theme, customGrade, customSerial)
     */
    renderSlab: function(canvas, item, options) {
      options = options || {};
      var ctx = canvas.getContext('2d');
      var W = canvas.width || 1080;
      var H = canvas.height || 1620;

      var theme = options.theme || 'gold'; // gold, holo, ruby, dark
      var grade = options.customGrade || calculateGrade(item.completeness);
      var serial = options.customSerial || ('RV-' + Math.floor(10000000 + Math.random() * 90000000));
      var title = item.primary_name || item.name || '經典收藏';
      var platform = (item.platform || 'FC').toUpperCase();
      var year = item.release_date ? String(item.release_date).slice(0, 4) : 'RETRO';
      var developer = item.developer || item.publisher || 'ARCHIVE';

      // 1. 清空畫布與外圍透明壓克力保護盒背景
      ctx.clearRect(0, 0, W, H);

      // 壓克力外盒微倒角外框
      ctx.save();
      ctx.fillStyle = '#0a0d18';
      ctx.fillRect(0, 0, W, H);

      // 外盒金屬光澤微漸層
      var outerGrad = ctx.createLinearGradient(0, 0, W, H);
      outerGrad.addColorStop(0, '#1c2438');
      outerGrad.addColorStop(0.5, '#0e1424');
      outerGrad.addColorStop(1, '#070a14');
      ctx.fillStyle = outerGrad;
      roundRect(ctx, 24, 24, W - 48, H - 48, 36);
      ctx.fill();

      // 壓克力高光雙外邊框
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      roundRect(ctx, 24, 24, W - 48, H - 48, 36);
      ctx.stroke();

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
      roundRect(ctx, 32, 32, W - 64, H - 64, 30);
      ctx.stroke();

      // 2. 壓克力四個角落的防偽金屬六角螺栓 (Rivets)
      var rivets = [
        [54, 54], [W - 54, 54],
        [54, H - 54], [W - 54, H - 54]
      ];
      rivets.forEach(function(pt) {
        drawRivet(ctx, pt[0], pt[1]);
      });

      // 3. 頂部鑑定封裝標籤槽 (Header Grading Pedestal)
      var labelX = 54, labelY = 60, labelW = W - 108, labelH = 260;
      drawGradingLabel(ctx, labelX, labelY, labelW, labelH, {
        title: title,
        platform: platform,
        year: year,
        developer: developer,
        grade: grade,
        serial: serial,
        theme: theme
      });

      // 4. 中央透明保護窗與封面主圖 (Inner Display Window)
      var winX = 64, winY = 350, winW = W - 128, winH = H - 460;
      drawInnerWindow(ctx, winX, winY, winW, winH, item, function() {
        // 5. 底部防偽全息防偽燙金銘牌 (Bottom Hologram Bar)
        drawBottomFooter(ctx, 64, H - 90, W - 128, 44, serial);
        if (options.onComplete) options.onComplete();
      });

      ctx.restore();
    }
  };

  // 繪製圓角矩形輔助
  function roundRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // 繪製四角金屬螺栓
  function drawRivet(ctx, x, y) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#2a334d';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#5a6788';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#00e5ff';
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.restore();
  }

  // 頂部鑑定封裝標籤
  function drawGradingLabel(ctx, x, y, w, h, data) {
    ctx.save();
    // 標籤底色（金屬全息光澤）
    var bgGrad = ctx.createLinearGradient(x, y, x + w, y + h);
    if (data.theme === 'gold') {
      bgGrad.addColorStop(0, '#2e2410');
      bgGrad.addColorStop(0.3, '#1c160a');
      bgGrad.addColorStop(0.7, '#2a210d');
      bgGrad.addColorStop(1, '#171206');
    } else if (data.theme === 'holo') {
      bgGrad.addColorStop(0, '#0a2333');
      bgGrad.addColorStop(0.5, '#1e112d');
      bgGrad.addColorStop(1, '#0c2724');
    } else {
      bgGrad.addColorStop(0, '#131b2e');
      bgGrad.addColorStop(1, '#090d18');
    }

    ctx.fillStyle = bgGrad;
    roundRect(ctx, x, y, w, h, 18);
    ctx.fill();

    // 燙金/全息金屬外邊框
    ctx.lineWidth = 3;
    var borderGrad = ctx.createLinearGradient(x, y, x + w, y);
    borderGrad.addColorStop(0, '#d4af37');
    borderGrad.addColorStop(0.5, '#fff2b2');
    borderGrad.addColorStop(1, '#aa820a');
    ctx.strokeStyle = (data.theme === 'gold') ? borderGrad : '#00e5ff';
    roundRect(ctx, x, y, w, h, 18);
    ctx.stroke();

    // 頂部認證標題列
    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 16px "JetBrains Mono", monospace';
    ctx.fillText('★ RETROVAULT ARCHIVAL GRADING SERVICE ★', x + 24, y + 36);

    // 遊戲年份與平台
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 28px "Noto Sans TC", sans-serif';
    ctx.fillText(data.year + ' ' + data.platform, x + 24, y + 80);

    // 遊戲品名
    ctx.font = 'bold 32px "Noto Sans TC", sans-serif';
    var dispTitle = data.title;
    if (ctx.measureText(dispTitle).width > w - 340) {
      dispTitle = dispTitle.slice(0, 16) + '...';
    }
    ctx.fillText(dispTitle, x + 24, y + 130);

    // 發行廠商與細節規格
    ctx.fillStyle = '#9fa8c8';
    ctx.font = '18px "JetBrains Mono", monospace';
    ctx.fillText(data.developer + ' · JAPAN AUTHENTIC RELEASE', x + 24, y + 172);

    // 右側巨大分數方塊 (Grade Box)
    var boxW = 210, boxH = h - 36;
    var boxX = x + w - boxW - 18, boxY = y + 18;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    roundRect(ctx, boxX, boxY, boxW, boxH, 14);
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = data.grade.color || '#ffd700';
    roundRect(ctx, boxX, boxY, boxW, boxH, 14);
    ctx.stroke();

    // 分數
    ctx.fillStyle = data.grade.color || '#ffd700';
    ctx.textAlign = 'center';
    ctx.font = '900 68px "JetBrains Mono", monospace';
    ctx.fillText(data.grade.score, boxX + boxW / 2, boxY + 76);

    // 評級等第 (GEM MINT 等)
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 18px "JetBrains Mono", monospace';
    ctx.fillText(data.grade.rank, boxX + boxW / 2, boxY + 115);

    // 副等第
    ctx.fillStyle = '#9fa8c8';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText(data.grade.sub, boxX + boxW / 2, boxY + 148);

    // 序號
    ctx.fillStyle = '#5a6788';
    ctx.font = '13px "JetBrains Mono", monospace';
    ctx.fillText('# ' + data.serial, boxX + boxW / 2, boxY + 182);

    ctx.restore();
  }

  // 中央封面保護窗
  // 繪製封面圖本體與投影
  function paintImage(ctx, x, y, w, h, img) {
    var pad = 40;
    var maxW = w - pad * 2;
    var maxH = h - pad * 2;

    var aspect = (img.width && img.height) ? (img.width / img.height) : 1;
    var dw = maxW;
    var dh = maxW / aspect;
    if (dh > maxH) {
      dh = maxH;
      dw = maxH * aspect;
    }

    var dx = x + (w - dw) / 2;
    var dy = y + (h - dh) / 2;

    // 封面本體大投影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 16;
    ctx.drawImage(img, dx, dy, dw, dh);

    // 重置陰影並疊加透明壓克力玻璃反光
    ctx.shadowColor = 'transparent';
    drawGlassReflection(ctx, x, y, w, h);
  }

  // 中央封面保護窗（三重降級載入：原生CORS -> weserv代理CORS -> 原生顯示）
  function drawInnerWindow(ctx, x, y, w, h, item, callback) {
    ctx.save();

    // 內縮保護窗凹槽深色底
    ctx.fillStyle = '#060810';
    roundRect(ctx, x, y, w, h, 20);
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    roundRect(ctx, x, y, w, h, 20);
    ctx.stroke();

    var rawUrl = item.cover_img;
    if (!rawUrl) {
      drawFallbackCover(ctx, x, y, w, h, item);
      ctx.restore();
      return callback();
    }

    function tryLoad(url, useCors, onDone, onFail) {
      var img = new Image();
      if (useCors) img.crossOrigin = 'anonymous';
      img.onload = function() { onDone(img); };
      img.onerror = function() { onFail(); };
      img.src = url;
    }

    // 1. Data URL 或 Blob URL 直接載入
    if (rawUrl.indexOf('data:') === 0 || rawUrl.indexOf('blob:') === 0) {
      tryLoad(rawUrl, false, function(img) {
        paintImage(ctx, x, y, w, h, img);
        ctx.restore();
        callback();
      }, function() {
        drawFallbackCover(ctx, x, y, w, h, item);
        ctx.restore();
        callback();
      });
      return;
    }

    // 2. 外部網址：先嘗試原生帶 CORS
    tryLoad(rawUrl, true, function(img) {
      paintImage(ctx, x, y, w, h, img);
      ctx.restore();
      callback();
    }, function() {
      // 3. 原生 CORS 失敗時（如 LaunchBox / 外部圖床未設定 CORS 標頭），透過 weserv proxy 代理加上 Access-Control-Allow-Origin: *
      var proxied = 'https://images.weserv.nl/?url=' + encodeURIComponent(rawUrl);
      tryLoad(proxied, true, function(img) {
        paintImage(ctx, x, y, w, h, img);
        ctx.restore();
        callback();
      }, function() {
        // 4. 若 proxy 仍不可用，以一般 Image (無 CORS) 繪製，保證卡面上絕對看得到封面！
        tryLoad(rawUrl, false, function(img) {
          paintImage(ctx, x, y, w, h, img);
          ctx.restore();
          callback();
        }, function() {
          // 5. 終極降級：文字封面
          drawFallbackCover(ctx, x, y, w, h, item);
          ctx.restore();
          callback();
        });
      });
    });
  }

  // 壓克力玻璃斜向立體反光 (Acrylic Glass Reflection)
  function drawGlassReflection(ctx, x, y, w, h) {
    ctx.save();
    var refGrad = ctx.createLinearGradient(x, y, x + w * 0.8, y + h);
    refGrad.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
    refGrad.addColorStop(0.25, 'rgba(255, 255, 255, 0.03)');
    refGrad.addColorStop(0.4, 'rgba(0, 229, 255, 0.06)');
    refGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = refGrad;
    roundRect(ctx, x, y, w, h, 20);
    ctx.fill();
    ctx.restore();
  }

  function drawFallbackCover(ctx, x, y, w, h, item) {
    ctx.fillStyle = '#141b2d';
    roundRect(ctx, x + 60, y + 60, w - 120, h - 120, 16);
    ctx.fill();

    ctx.fillStyle = '#00e5ff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 36px "Noto Sans TC", sans-serif';
    ctx.fillText(item.primary_name || '經典收藏', x + w / 2, y + h / 2 - 20);

    ctx.fillStyle = '#7986cb';
    ctx.font = '22px "JetBrains Mono", monospace';
    ctx.fillText((item.platform || 'FC') + ' CARTRIDGE ARCHIVE', x + w / 2, y + h / 2 + 30);
  }

  // 底部防偽全息燙金條
  function drawBottomFooter(ctx, x, y, w, h, serial) {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 22, 40, 0.85)';
    roundRect(ctx, x, y, w, h, 10);
    ctx.fill();

    ctx.strokeStyle = 'rgba(0, 229, 255, 0.3)';
    ctx.lineWidth = 1;
    roundRect(ctx, x, y, w, h, 10);
    ctx.stroke();

    ctx.fillStyle = '#00e5ff';
    ctx.font = 'bold 13px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('◆ RETROVAULT ENCAPSULATED ARCHIVE', x + 16, y + 27);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#9fa8c8';
    ctx.fillText('CERT: ' + serial + ' ◆', x + w - 16, y + 27);

    ctx.restore();
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = SlabGenerator;
  } else {
    global.SlabGenerator = SlabGenerator;
  }
})(typeof self !== 'undefined' ? self : this);
