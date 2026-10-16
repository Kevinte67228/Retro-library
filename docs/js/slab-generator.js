/**
 * RetroVault Digital Graded Slab Generator (v11.12)
 * 收藏家高規格數位封裝鑑定卡（Slab）純前端 Canvas 合成引擎。
 * 支援 1080x1620 高畫質海報匯出、雷射全息防偽燙金反光、黑曜石極致鈦金、安全 Blob 跨域無污染保證。
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
    version: '11.12',

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

      var theme = options.theme || 'gold'; // gold, holo, dark
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

      // 底板色調依主題定制
      if (theme === 'dark') {
        ctx.fillStyle = '#050608';
        ctx.fillRect(0, 0, W, H);

        var outerGrad = ctx.createLinearGradient(0, 0, W, H);
        outerGrad.addColorStop(0, '#1c1e26');
        outerGrad.addColorStop(0.35, '#101117');
        outerGrad.addColorStop(0.75, '#0a0b0f');
        outerGrad.addColorStop(1, '#040507');
        ctx.fillStyle = outerGrad;
      } else if (theme === 'gold') {
        ctx.fillStyle = '#0a0805';
        ctx.fillRect(0, 0, W, H);

        var outerGrad = ctx.createLinearGradient(0, 0, W, H);
        outerGrad.addColorStop(0, '#261f12');
        outerGrad.addColorStop(0.5, '#14100a');
        outerGrad.addColorStop(1, '#070503');
        ctx.fillStyle = outerGrad;
      } else {
        ctx.fillStyle = '#080b16';
        ctx.fillRect(0, 0, W, H);

        var outerGrad = ctx.createLinearGradient(0, 0, W, H);
        outerGrad.addColorStop(0, '#17223b');
        outerGrad.addColorStop(0.5, '#0c1324');
        outerGrad.addColorStop(1, '#060913');
        ctx.fillStyle = outerGrad;
      }

      roundRect(ctx, 24, 24, W - 48, H - 48, 36);
      ctx.fill();

      // 壓克力高光雙外邊框
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
      roundRect(ctx, 24, 24, W - 48, H - 48, 36);
      ctx.stroke();

      ctx.lineWidth = 1.5;
      if (theme === 'dark') {
        ctx.strokeStyle = 'rgba(226, 232, 240, 0.42)'; // 黑曜石白金金屬細框
      } else if (theme === 'gold') {
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)'; // 奢華金細框
      } else {
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)'; // 全息藍細框
      }
      roundRect(ctx, 32, 32, W - 64, H - 64, 30);
      ctx.stroke();

      // 2. 壓克力四個角落的防偽金屬六角螺栓 (Rivets)
      var rivets = [
        [54, 54], [W - 54, 54],
        [54, H - 54], [W - 54, H - 54]
      ];
      rivets.forEach(function(pt) {
        drawRivet(ctx, pt[0], pt[1], theme);
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
      drawInnerWindow(ctx, winX, winY, winW, winH, item, theme, function() {
        // 5. 底部防偽全息防偽燙金銘牌 (Bottom Hologram Bar)
        drawBottomFooter(ctx, 64, H - 90, W - 128, 44, serial, theme);
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

  // 繪製四角金屬螺栓 (依主題配色)
  function drawRivet(ctx, x, y, theme) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);

    if (theme === 'dark') {
      ctx.fillStyle = '#181922';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#475569';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#cbd5e1';
      ctx.shadowBlur = 6;
      ctx.fill();
    } else if (theme === 'gold') {
      ctx.fillStyle = '#2d2411';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#aa820a';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd700';
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 6;
      ctx.fill();
    } else {
      ctx.fillStyle = '#1c2842';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#48639c';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#00e5ff';
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 6;
      ctx.fill();
    }

    ctx.restore();
  }

  // 頂部鑑定封裝標籤
  function drawGradingLabel(ctx, x, y, w, h, data) {
    ctx.save();
    var theme = data.theme || 'gold';

    // 標籤底色（金屬全息光澤）
    var bgGrad = ctx.createLinearGradient(x, y, x + w, y + h);
    if (theme === 'gold') {
      bgGrad.addColorStop(0, '#2e2410');
      bgGrad.addColorStop(0.3, '#1c160a');
      bgGrad.addColorStop(0.7, '#2a210d');
      bgGrad.addColorStop(1, '#171206');
    } else if (theme === 'dark') {
      // 黑曜石火山琉璃深邃漸層
      bgGrad.addColorStop(0, '#1b1d27');
      bgGrad.addColorStop(0.3, '#121319');
      bgGrad.addColorStop(0.7, '#0b0c10');
      bgGrad.addColorStop(1, '#060608');
    } else {
      bgGrad.addColorStop(0, '#0a2333');
      bgGrad.addColorStop(0.5, '#1e112d');
      bgGrad.addColorStop(1, '#0c2724');
    }

    ctx.fillStyle = bgGrad;
    roundRect(ctx, x, y, w, h, 18);
    ctx.fill();

    // 燙金/白金/全息金屬外邊框
    ctx.lineWidth = 3;
    var borderGrad = ctx.createLinearGradient(x, y, x + w, y);
    if (theme === 'gold') {
      borderGrad.addColorStop(0, '#d4af37');
      borderGrad.addColorStop(0.5, '#fff2b2');
      borderGrad.addColorStop(1, '#aa820a');
      ctx.strokeStyle = borderGrad;
    } else if (theme === 'dark') {
      // 黑曜石白金拉絲鈦金屬邊框
      borderGrad.addColorStop(0, '#64748b');
      borderGrad.addColorStop(0.25, '#cbd5e1');
      borderGrad.addColorStop(0.5, '#ffffff');
      borderGrad.addColorStop(0.75, '#94a3b8');
      borderGrad.addColorStop(1, '#475569');
      ctx.strokeStyle = borderGrad;
    } else {
      borderGrad.addColorStop(0, '#00e5ff');
      borderGrad.addColorStop(0.5, '#b388ff');
      borderGrad.addColorStop(1, '#69f0ae');
      ctx.strokeStyle = borderGrad;
    }
    roundRect(ctx, x, y, w, h, 18);
    ctx.stroke();

    // 頂部認證標題列
    if (theme === 'gold') {
      ctx.fillStyle = '#d4af37';
    } else if (theme === 'dark') {
      ctx.fillStyle = '#f8fafc'; // 白金璀璨亮白
    } else {
      ctx.fillStyle = '#00e5ff';
    }
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
    ctx.fillStyle = (theme === 'dark') ? '#94a3b8' : '#9fa8c8';
    ctx.font = '18px "JetBrains Mono", monospace';
    ctx.fillText(data.developer + ' · JAPAN AUTHENTIC RELEASE', x + 24, y + 172);

    // 右側巨大分數方塊 (Grade Box)
    var boxW = 210, boxH = h - 36;
    var boxX = x + w - boxW - 18, boxY = y + 18;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    roundRect(ctx, boxX, boxY, boxW, boxH, 14);
    ctx.fill();

    var scoreColor = data.grade.color || '#ffd700';
    if (theme === 'dark' && scoreColor === '#00e5ff') {
      scoreColor = '#f1f5f9'; // 黑曜石下將預設青色昇華為白金
    }

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = scoreColor;
    roundRect(ctx, boxX, boxY, boxW, boxH, 14);
    ctx.stroke();

    // 分數
    ctx.fillStyle = scoreColor;
    ctx.textAlign = 'center';
    ctx.font = '900 68px "JetBrains Mono", monospace';
    ctx.fillText(data.grade.score, boxX + boxW / 2, boxY + 76);

    // 評級等第 (GEM MINT 等)
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 18px "JetBrains Mono", monospace';
    ctx.fillText(data.grade.rank, boxX + boxW / 2, boxY + 115);

    // 副等第
    ctx.fillStyle = (theme === 'dark') ? '#94a3b8' : '#9fa8c8';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText(data.grade.sub, boxX + boxW / 2, boxY + 148);

    // 序號
    ctx.fillStyle = (theme === 'dark') ? '#64748b' : '#5a6788';
    ctx.font = '13px "JetBrains Mono", monospace';
    ctx.fillText('# ' + data.serial, boxX + boxW / 2, boxY + 182);

    ctx.restore();
  }

  // 繪製封面圖本體與投影
  function paintImage(ctx, x, y, w, h, img, theme) {
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
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 16;
    ctx.drawImage(img, dx, dy, dw, dh);

    // 重置陰影並疊加透明壓克力玻璃反光
    ctx.shadowColor = 'transparent';
    drawGlassReflection(ctx, x, y, w, h, theme);
  }

  // 中央封面保護窗（無污染安全 Blob 跨域代理與級聯引擎）
  function drawInnerWindow(ctx, x, y, w, h, item, theme, callback) {
    ctx.save();

    // 內縮保護窗凹槽深色底
    ctx.fillStyle = (theme === 'dark') ? '#040507' : (theme === 'gold') ? '#080604' : '#060810';
    roundRect(ctx, x, y, w, h, 20);
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = (theme === 'dark') ? 'rgba(255, 255, 255, 0.12)' : (theme === 'gold') ? 'rgba(212, 175, 55, 0.15)' : 'rgba(0, 229, 255, 0.12)';
    roundRect(ctx, x, y, w, h, 20);
    ctx.stroke();

    var rawUrl = item.cover_img;
    if (!rawUrl) {
      drawFallbackCover(ctx, x, y, w, h, item, theme);
      ctx.restore();
      return callback();
    }

    // 零污染安全的圖片載入引擎（優先 Blob URL，保證 Canvas 絕不 Tainted）
    loadCleanImage(rawUrl, function(img) {
      paintImage(ctx, x, y, w, h, img, theme);
      ctx.restore();
      callback();
    }, function() {
      // 若所有圖源與代理皆失效，呈現高品質風格化純典藏卡
      drawFallbackCover(ctx, x, y, w, h, item, theme);
      ctx.restore();
      callback();
    });
  }

  /**
   * 零污染安全圖片載入器：
   * 透過 fetch 取得 Blob 並轉換為同源 blob: URL，從根本上杜絕 Canvas Tainted 跨域安全性限制。
   */
  function loadCleanImage(rawUrl, onDone, onFail) {
    if (!rawUrl) return onFail();

    // 1. 本地 Data URL 或 Blob URL 直接載入
    if (rawUrl.indexOf('data:') === 0 || rawUrl.indexOf('blob:') === 0) {
      var img = new Image();
      img.onload = function() { onDone(img); };
      img.onerror = onFail;
      img.src = rawUrl;
      return;
    }

    // 2. 構建多層級 CORS 代理候選清單（以 Cloudflare 高速邊緣快取 wsrv.nl 為首選）
    var candidates = [];

    // 高速無損 CORS 代理（強制 Access-Control-Allow-Origin: *）
    candidates.push('https://wsrv.nl/?url=' + encodeURIComponent(rawUrl) + '&output=png');
    candidates.push('https://images.weserv.nl/?url=' + encodeURIComponent(rawUrl));
    candidates.push('https://corsproxy.io/?url=' + encodeURIComponent(rawUrl));

    // GitHub raw 與 jsdelivr 雙向鏡像支援
    if (rawUrl.indexOf('cdn.jsdelivr.net') >= 0) {
      candidates.push(rawUrl.replace('cdn.jsdelivr.net/gh', 'raw.githubusercontent.com').replace('@master', '/master'));
    } else if (rawUrl.indexOf('raw.githubusercontent.com') >= 0) {
      candidates.push(rawUrl.replace('raw.githubusercontent.com', 'cdn.jsdelivr.net/gh').replace('/master/', '@master/'));
    }
    candidates.push(rawUrl);

    var idx = 0;
    function tryNextCandidate() {
      if (idx >= candidates.length) {
        return onFail();
      }
      var targetUrl = candidates[idx++];

      // 優先使用 fetch 轉為 Blob URL（同一來源同域物件，Canvas 100% 絕對乾淨不被污染）
      var abortCtrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
      var timeoutId = setTimeout(function() {
        if (abortCtrl) abortCtrl.abort();
      }, 5500);

      fetch(targetUrl, { mode: 'cors', signal: abortCtrl ? abortCtrl.signal : undefined })
        .then(function(res) {
          clearTimeout(timeoutId);
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.blob();
        })
        .then(function(blob) {
          var blobUrl = URL.createObjectURL(blob);
          var img = new Image();
          img.onload = function() {
            setTimeout(function() { URL.revokeObjectURL(blobUrl); }, 10000);
            onDone(img);
          };
          img.onerror = function() {
            URL.revokeObjectURL(blobUrl);
            tryNextCandidate();
          };
          img.src = blobUrl;
        })
        .catch(function() {
          clearTimeout(timeoutId);
          // 若 fetch 失敗，次選使用 Image(crossOrigin='anonymous') 載入
          var img = new Image();
          img.crossOrigin = 'anonymous';
          var imgTimer = setTimeout(function() {
            img.src = '';
            tryNextCandidate();
          }, 4500);
          img.onload = function() {
            clearTimeout(imgTimer);
            onDone(img);
          };
          img.onerror = function() {
            clearTimeout(imgTimer);
            tryNextCandidate();
          };
          img.src = targetUrl;
        });
    }

    tryNextCandidate();
  }

  // 壓克力玻璃斜向立體反光 (Acrylic Glass Reflection)
  function drawGlassReflection(ctx, x, y, w, h, theme) {
    ctx.save();
    var refGrad = ctx.createLinearGradient(x, y, x + w * 0.8, y + h);
    refGrad.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
    refGrad.addColorStop(0.25, 'rgba(255, 255, 255, 0.03)');

    if (theme === 'dark') {
      refGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.05)'); // 白金柔光
    } else if (theme === 'gold') {
      refGrad.addColorStop(0.4, 'rgba(212, 175, 55, 0.06)'); // 金黃溫潤光
    } else {
      refGrad.addColorStop(0.4, 'rgba(0, 229, 255, 0.06)'); // 全息青藍
    }
    refGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = refGrad;
    roundRect(ctx, x, y, w, h, 20);
    ctx.fill();
    ctx.restore();
  }

  function drawFallbackCover(ctx, x, y, w, h, item, theme) {
    ctx.fillStyle = (theme === 'dark') ? '#0c0d12' : '#101524';
    roundRect(ctx, x + 40, y + 40, w - 80, h - 80, 16);
    ctx.fill();

    ctx.lineWidth = 3;
    if (theme === 'dark') {
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.4)';
    } else if (theme === 'gold') {
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
    } else {
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
    }
    roundRect(ctx, x + 40, y + 40, w - 80, h - 80, 16);
    ctx.stroke();

    // 裝飾卡匣插槽圖示
    ctx.fillStyle = (theme === 'dark') ? '#07070a' : '#0a0e1a';
    roundRect(ctx, x + 80, y + 80, w - 160, 120, 12);
    ctx.fill();

    if (theme === 'dark') {
      ctx.fillStyle = '#f8fafc';
    } else if (theme === 'gold') {
      ctx.fillStyle = '#ffd700';
    } else {
      ctx.fillStyle = '#00e5ff';
    }
    ctx.textAlign = 'center';
    ctx.font = '900 40px "Noto Sans TC", sans-serif';
    var shortTitle = item.primary_name || '經典收藏';
    if (shortTitle.length > 12) shortTitle = shortTitle.slice(0, 11) + '...';
    ctx.fillText(shortTitle, x + w / 2, y + h / 2 - 20);

    ctx.fillStyle = (theme === 'dark') ? '#94a3b8' : '#9fa8c8';
    ctx.font = 'bold 24px "JetBrains Mono", monospace';
    ctx.fillText((item.platform || 'FC') + ' CARTRIDGE ARCHIVE', x + w / 2, y + h / 2 + 35);

    ctx.fillStyle = (theme === 'dark') ? '#64748b' : '#5a6788';
    ctx.font = '16px "JetBrains Mono", monospace';
    ctx.fillText('RETROVAULT VERIFIED RELEASE', x + w / 2, y + h / 2 + 75);
  }

  // 底部防偽全息燙金條
  function drawBottomFooter(ctx, x, y, w, h, serial, theme) {
    ctx.save();
    if (theme === 'dark') {
      ctx.fillStyle = 'rgba(12, 14, 20, 0.9)';
    } else if (theme === 'gold') {
      ctx.fillStyle = 'rgba(20, 16, 10, 0.9)';
    } else {
      ctx.fillStyle = 'rgba(15, 22, 40, 0.85)';
    }
    roundRect(ctx, x, y, w, h, 10);
    ctx.fill();

    if (theme === 'dark') {
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.35)'; // 白金邊框
    } else if (theme === 'gold') {
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)'; // 燙金邊框
    } else {
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.3)'; // 全息青藍
    }
    ctx.lineWidth = 1;
    roundRect(ctx, x, y, w, h, 10);
    ctx.stroke();

    if (theme === 'dark') {
      ctx.fillStyle = '#f8fafc';
    } else if (theme === 'gold') {
      ctx.fillStyle = '#d4af37';
    } else {
      ctx.fillStyle = '#00e5ff';
    }
    ctx.font = 'bold 13px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('◆ RETROVAULT ENCAPSULATED ARCHIVE', x + 16, y + 27);

    ctx.textAlign = 'right';
    ctx.fillStyle = (theme === 'dark') ? '#94a3b8' : '#9fa8c8';
    ctx.fillText('CERT: ' + serial + ' ◆', x + w - 16, y + 27);

    ctx.restore();
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = SlabGenerator;
  } else {
    global.SlabGenerator = SlabGenerator;
  }
})(typeof self !== 'undefined' ? self : this);
