// ╔══════════════════════════════════════════════════════╗
// ║  GameVault — Google Apps Script 後端  v48.01         ║
// ║  部署設定：執行身分 = 我，存取權 = 所有人             ║
// ╚══════════════════════════════════════════════════════╝
//
//  Games 工作表 → 遊戲軟體
//  Books 工作表 → 書籍 / 攻略本
//  Consoles 工作表 → 主機
//  Peripherals 工作表 → 週邊
//  Digital 工作表 → 數位下載版（v43.01 新增，原混在 Games 表）
//  OST 工作表 → 原聲帶（v43.01 新增，原混在 Games 表）
//  Artbook 工作表 → 動漫/美術設定集（v43.01 新增，原混在 Games 表）
//  Figures 工作表 → 公仔／模型（v43.01 新增，原混在 Games 表）
//  DigiGame/DigiDLC/DigiComic/DigiArtbook/DigiGuide/DigiMag/DigiAudio/DigiVideo
//    → v47.01 新增：數位下載版依 8 個子類型拆為獨立工作表，取代單一 Digital 表
//
//  GET  ?action=ping              → 連線測試
//  GET  ?action=list              → 取回全部記錄（Games + Books + Consoles + Peripherals 合併）
//  GET  ?action=list&type=game    → 只取遊戲
//  GET  ?action=list&type=book    → 只取書籍
//  GET  ?action=search&q=xxx      → 搜尋記錄
//  GET  ?action=igdb_search&...   → IGDB 代理
//  POST {action:"add",    row:[...], category:"遊戲"|"攻略"|"主機"|"週邊"}
//  POST {action:"update", rowNum:N, row:[...], category:"遊戲"|"攻略"|"主機"|"週邊"}
//  POST {action:"delete", rowNum:N, category:"遊戲"|"攻略"|"主機"|"週邊"}
 
// ── 工作表名稱設定 ──────────────────────────────────
const GAMES_SHEET   = 'Games';
const BOOKS_SHEET   = 'Books';
const CONSOLE_SHEET = 'Consoles';
const PERIPH_SHEET  = 'Peripherals';
const HUNT_SHEET    = 'Hunt';
// v43.01：數位下載版／原聲帶／動漫美術設定集／公仔 改用各自獨立工作表（原本落在 Games 表，
// 分類專屬欄位未在 GAME_HEADERS 中會被靜默丟棄，故獨立建表＋各自完整欄位表）
// v47.01：數位下載版原本 8 個子類型全部擠在同一張 Digital 表，欄位互不相干、表單四不像，
// 改為每個子類型各自獨立工作表（遊戲/DLC/電子書x4/音源/影音）
const DIGIGAME_SHEET    = 'DigiGame';
const DIGIDLC_SHEET     = 'DigiDLC';
const DIGICOMIC_SHEET   = 'DigiComic';
const DIGIARTBOOK_SHEET = 'DigiArtbook';
const DIGIGUIDE_SHEET   = 'DigiGuide';
const DIGIMAG_SHEET     = 'DigiMag';
const DIGIAUDIO_SHEET   = 'DigiAudio';
const DIGIVIDEO_SHEET   = 'DigiVideo';
const OST_SHEET     = 'OST';
const ARTBOOK_SHEET = 'Artbook';
const FIGURE_SHEET  = 'Figures';
 
// ── 遊戲欄位──────────────────────────────
const GAME_HEADERS = [
  'category','primary_name','jp_name','zh_name','en_name','series',
  'platform','media','region','edition','language','age_rating',
  'code','barcode',
  'developer','publisher','release_date','suggest_price',
  'genre','players','features',
  'collect_status','completeness','bundle',
  'buy_date','buy_price','buy_source',
  'play_status','rating',
  'summary','ref_link','cover_img','back_img','spine_img','extra_images','related_code','notes','uuid','created_at',
  'storage_location','market_value','resale_price','resale_date','dlc_status','bonus_code_status',
  'voice_language','subtitle_language',
  'market_value_updated_at','market_value_source','market_value_confidence','market_value_notes',
  'market_value_currency','market_value_foreign_amount'
];
 
// ── 攻略本/書籍欄位──
const BOOK_HEADERS = [
  'category','primary_name','jp_name','zh_name','en_name',
  'book_type','related_game','series',
  'publisher','developer','release_date','suggest_price',
  'region','edition','language',
  'code','barcode',
  'collect_status','completeness','bundle',
  'buy_date','buy_price','buy_source',
  'rating',
  'summary','ref_link','cover_img','back_img','spine_img','extra_images','related_code','notes','uuid','created_at',
  'applicable_platform',
  'storage_location','market_value','resale_price','resale_date',
  'page_count','book_size','binding','print_run',
  'market_value_updated_at','market_value_source','market_value_confidence','market_value_notes',
  'market_value_currency','market_value_foreign_amount'
];
 
// ── 主機欄位 ─────────────────────────────────
const CONSOLE_HEADERS = [
  'category','primary_name','jp_name','zh_name','en_name','series',
  'brand','model_no','platform_family','generation',
  'color','storage','region','edition','serial_no','barcode',
  'release_date','suggest_price',
  'collect_status','completeness','bundle',
  'buy_date','buy_price','buy_source',
  'working_status','firmware',
  'summary','ref_link','cover_img','back_img','spine_img','extra_images','related_code','notes','uuid','created_at',
  'storage_location','market_value','resale_price','resale_date',
  'warranty_status','test_date','fault_notes',
  'market_value_updated_at','market_value_source','market_value_confidence','market_value_notes',
  'market_value_currency','market_value_foreign_amount'
];
 
// ── 週邊欄位 ─────────────────────────────────
const PERIPH_HEADERS = [
  'category','primary_name','jp_name','zh_name','en_name','series',
  'brand','model_no','peripheral_type','compat_platform',
  'color','connection','region','edition','barcode',
  'release_date','suggest_price',
  'collect_status','completeness','bundle',
  'buy_date','buy_price','buy_source',
  'working_status',
  'summary','ref_link','cover_img','back_img','spine_img','extra_images','related_code','notes','uuid','created_at',
  'code',
  'storage_location','market_value','resale_price','resale_date',
  'warranty_status','test_date','fault_notes',
  'market_value_updated_at','market_value_source','market_value_confidence','market_value_notes',
  'market_value_currency','market_value_foreign_amount'
];
 
// ── 狩獵清單欄位 ──
//  category   固定為 '狩獵'（決定寫入 Hunt 表）
//  target_cat 此目標未來轉入收藏時的分類：遊戲/書籍/主機/週邊
//  sightings  JSON 字串，多通路目擊記錄陣列
//             [{loc,url,price,cond,date}, ...]
//  hunt_status 追蹤中 / 已收手
const HUNT_HEADERS = [
  'category','target_cat','primary_name','platform','barcode',
  'notes','cover_img','sightings','hunt_status','uuid','created_at','jp_name','region','summary'
];

// ── 數位下載版（v43.01 新增，v46.01 擴充授權/檔案專屬欄位，v47.01 依子類型拆為 8 張表，比照前端 8 組 FIELDS）──
// 共用表頭：category/subtype/primary_name/jp_name/zh_name/en_name
// 共用表尾：store/account/purchase_method/digital_id/drm_status/file_format/download_size/file_storage_location/
//          release_date/suggest_price/region/edition/collect_status/buy_date/buy_price/redemption_key/
//          summary/ref_link/cover_img/related_code/notes/uuid/created_at
const _DIGI_HEAD = ['category','subtype','primary_name','jp_name','zh_name','en_name'];
const _DIGI_TAIL = [
  'store','account','purchase_method','digital_id','drm_status',
  'file_format','download_size','file_storage_location',
  'release_date','suggest_price','region','edition',
  'collect_status','buy_date','buy_price','redemption_key',
  'summary','ref_link','cover_img','extra_images','related_code','notes','uuid','created_at'
];
// 1. 下載版遊戲
const DIGIGAME_HEADERS = _DIGI_HEAD.concat([
  'series','platform','voice_language','subtitle_language',
  'genre','players','features','age_rating','developer','publisher','dlc_owned'
]).concat(_DIGI_TAIL);
// 2. 追加下載內容（DLC／季票／擴充包）
const DIGIDLC_HEADERS = _DIGI_HEAD.concat([
  'series','platform','dlc_type','developer','publisher'
]).concat(_DIGI_TAIL);
// 3. 電子書（漫畫／單行本）
const DIGICOMIC_HEADERS = _DIGI_HEAD.concat([
  'series','volume','illustrator','publisher'
]).concat(_DIGI_TAIL);
// 4. 電子書（畫冊／美術設定）
const DIGIARTBOOK_HEADERS = _DIGI_HEAD.concat([
  'series','illustrator','page_count','publisher'
]).concat(_DIGI_TAIL);
// 5. 電子書（攻略／公式書）
const DIGIGUIDE_HEADERS = _DIGI_HEAD.concat([
  'series','publisher'
]).concat(_DIGI_TAIL);
// 6. 電子書（雜誌／MOOK）
const DIGIMAG_HEADERS = _DIGI_HEAD.concat([
  'series','issue_number','publisher'
]).concat(_DIGI_TAIL);
// 7. 數位音源
const DIGIAUDIO_HEADERS = _DIGI_HEAD.concat([
  'related_work','composer','label','track_count','publisher'
]).concat(_DIGI_TAIL);
// 8. 數位影音
const DIGIVIDEO_HEADERS = _DIGI_HEAD.concat([
  'related_work','studio','episode_count','runtime','voice_language','subtitle_language','publisher'
]).concat(_DIGI_TAIL);

// ── 原聲帶欄位（v43.01 新增，v44.01 擴充音樂專屬欄位，比照前端 OST_FIELDS）──
const OST_HEADERS = [
  'category','subtype','related_work','primary_name','jp_name','zh_name','en_name',
  'composer','label','catalog_number','format','edition_type','disc_count','track_count',
  'release_date','suggest_price','region','edition',
  'barcode','code','collect_status','obi_status','completeness','storage_location',
  'buy_date','purchase_channel','buy_source','buy_price','local_cost','bonus_items',
  'market_value','market_value_confidence',
  'summary','ref_link','cover_img','back_img','spine_img','extra_images','related_code','notes','uuid','created_at'
];

// ── 動漫/美術設定集欄位（v43.01 新增，比照前端 ARTBOOK_FIELDS）──
const ARTBOOK_HEADERS = [
  'category','subtype','related_work','primary_name','volume','jp_name','zh_name','en_name',
  'illustrator','binding','language','page_count',
  'publisher','release_date','suggest_price','region','edition',
  'barcode','code','collect_status','condition','completeness','storage_location',
  'buy_date','purchase_channel','buy_source','buy_price','local_cost',
  'market_value','market_value_confidence',
  'summary','ref_link','cover_img','back_img','spine_img','extra_images','related_code','notes','uuid','created_at'
];

// ── 公仔／模型欄位（v43.01 新增，v45.01 擴充立體收藏專屬欄位，比照前端 FIGURE_FIELDS）──
const FIGURE_HEADERS = [
  'category','subtype','series','primary_name','character','jp_name','zh_name','en_name',
  'brand','sculptor','scale','material','dimensions',
  'manufacturer','release_date','suggest_price','region','edition',
  'barcode','code','collect_status','box_condition','condition','completeness','storage_location',
  'buy_date','purchase_channel','buy_source','buy_price','local_cost',
  'market_value','market_value_confidence',
  'summary','ref_link','cover_img','back_img','spine_img','extra_images','related_code','notes','uuid','created_at'
];
 
// ── 取得/建立工作表 ────────────────────────────────
// ── API 查詢快取（Cache 工作表）────────────────────────────
const CACHE_SHEET = 'Cache';
const CACHE_EXPIRE_MS = 7 * 24 * 60 * 60 * 1000; // 7 天
 
function getCache(key) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CACHE_SHEET);
  if (!sheet) return null;
  const data = sheet.getDataRange().getValues();
  const now = Date.now();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      const ts = data[i][2];
      if (now - ts < CACHE_EXPIRE_MS) {
        try { return JSON.parse(data[i][1]); } catch(e) { return null; }
      }
      // 過期：刪除此列
      sheet.deleteRow(i + 1);
      return null;
    }
  }
  return null;
}
 
function setCache(key, value) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CACHE_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(CACHE_SHEET);
    sheet.hideSheet();
    sheet.getRange(1,1,1,3).setValues([['key','value','timestamp']]);
  }
  // 先刪舊的
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) { sheet.deleteRow(i + 1); break; }
  }
  sheet.appendRow([key, JSON.stringify(value), Date.now()]);
}
 
function getSheet(type) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const t = String(type || 'game');
  let sheetName, headers, headBg, headFg;
  if (t === 'book' || t === '攻略' || t === '書籍') {
    sheetName = BOOKS_SHEET;   headers = BOOK_HEADERS;
    headBg = '#1a0f2e'; headFg = '#ce93d8';
  } else if (t === 'console' || t === '主機') {
    sheetName = CONSOLE_SHEET; headers = CONSOLE_HEADERS;
    headBg = '#0f2e1a'; headFg = '#69f0ae';
  } else if (t === 'peripheral' || t === '週邊') {
    sheetName = PERIPH_SHEET;  headers = PERIPH_HEADERS;
    headBg = '#2e1a0f'; headFg = '#ffab40';
  } else if (t === 'hunt' || t === '狩獵') {
    sheetName = HUNT_SHEET;    headers = HUNT_HEADERS;
    headBg = '#2e0f1a'; headFg = '#ff6e9c';
  } else if (t === 'digigame') {
    sheetName = DIGIGAME_SHEET; headers = DIGIGAME_HEADERS;
    headBg = '#001f2e'; headFg = '#00e5ff';
  } else if (t === 'digidlc') {
    sheetName = DIGIDLC_SHEET; headers = DIGIDLC_HEADERS;
    headBg = '#001f2e'; headFg = '#40c4ff';
  } else if (t === 'digicomic') {
    sheetName = DIGICOMIC_SHEET; headers = DIGICOMIC_HEADERS;
    headBg = '#0f2e18'; headFg = '#aed581';
  } else if (t === 'digiartbook') {
    sheetName = DIGIARTBOOK_SHEET; headers = DIGIARTBOOK_HEADERS;
    headBg = '#0f2e18'; headFg = '#8bc34a';
  } else if (t === 'digiguide') {
    sheetName = DIGIGUIDE_SHEET; headers = DIGIGUIDE_HEADERS;
    headBg = '#0f2e18'; headFg = '#66bb6a';
  } else if (t === 'digimag') {
    sheetName = DIGIMAG_SHEET; headers = DIGIMAG_HEADERS;
    headBg = '#0f2e18'; headFg = '#9ccc65';
  } else if (t === 'digiaudio') {
    sheetName = DIGIAUDIO_SHEET; headers = DIGIAUDIO_HEADERS;
    headBg = '#1a0f2e'; headFg = '#ff8a65';
  } else if (t === 'digivideo') {
    sheetName = DIGIVIDEO_SHEET; headers = DIGIVIDEO_HEADERS;
    headBg = '#1a0f2e'; headFg = '#f06292';
  } else if (t === 'ost' || t === '原聲帶') {
    sheetName = OST_SHEET;     headers = OST_HEADERS;
    headBg = '#1a0f2e'; headFg = '#b388ff';
  } else if (t === 'artbook' || t === '動漫/美術設定集') {
    sheetName = ARTBOOK_SHEET; headers = ARTBOOK_HEADERS;
    headBg = '#0f2e18'; headFg = '#aed581';
  } else if (t === 'figure' || t === '公仔') {
    sheetName = FIGURE_SHEET;  headers = FIGURE_HEADERS;
    headBg = '#2e2400'; headFg = '#ffab40';
  } else {
    sheetName = GAMES_SHEET;   headers = GAME_HEADERS;
    headBg = '#0f1525'; headFg = '#00e5ff';
  }
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground(headBg).setFontColor(headFg).setFontWeight('bold');
    // 設定欄寬
    sheet.setColumnWidth(1, 60);   // category
    sheet.setColumnWidth(2, 200);  // primary_name
  }
  // 確保欄數足夠（新增欄位後，舊試算表自動補欄，避免讀取超出範圍）
  if (sheet.getMaxColumns() < headers.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
  }
  return { sheet, headers };
}
 
// ── 判斷 category 字串 ────────────────────────────
function resolveType(category, subtype) {
  if (!category) return 'game';
  const s = String(category).trim();
  if (s === '攻略' || s === '書籍' || s === 'book' || s === 'Book') return 'book';
  if (s === '主機' || s === 'console' || s === 'Console')    return 'console';
  if (s === '週邊' || s === '周邊' || s === 'peripheral' || s === 'Peripheral') return 'peripheral';
  if (s === '狩獵' || s === 'hunt' || s === 'Hunt') return 'hunt';
  // v43.01：原聲帶／動漫美術設定集／公仔 改走各自獨立工作表；含舊分類值別名，向下相容既有資料
  if (s === '原聲帶' || s === 'ost' || s === 'OST') return 'ost';
  if (s === '動漫/美術設定集' || s === '畫集' || s === '設定集' || s === 'artbook' || s === 'Artbook') return 'artbook';
  if (s === '公仔' || s === '模型' || s === 'figure' || s === 'Figure') return 'figure';
  // v47.01：數位下載版依子類型再拆到 8 個獨立工作表，不再共用一張 Digital 表
  if (s === '數位下載版' || s === '數位遊戲' || s === 'digital' || s === 'Digital') {
    const sub = String(subtype || '').trim();
    if (sub === '追加下載內容') return 'digidlc';
    if (sub === '電子書（漫畫／單行本）') return 'digicomic';
    if (sub === '電子書（畫冊／美術設定）') return 'digiartbook';
    if (sub === '電子書（攻略／公式書）') return 'digiguide';
    if (sub === '電子書（雜誌／MOOK）') return 'digimag';
    if (sub === '數位音源') return 'digiaudio';
    if (sub === '數位影音') return 'digivideo';
    return 'digigame'; // 含「下載版遊戲」與未選子類型時的預設
  }
  return 'game';
}
 
// ── Drive 圖片存放 ────────────────────────────────
// 圖片改存 Google Drive，工作表格子只存 file ID（避免 base64 撐爆儲存與傳輸）
const IMG_FOLDER_NAME = 'GameVault_Images';
const IMG_COLS = ['cover_img', 'back_img', 'spine_img'];
// v47.04：5 張自訂圖片欄位，存成 JSON 陣列 [{label,img}]，img 可能是 base64(新上傳)或 Drive ID(已存在)，
// 跟 IMG_COLS 的單一 base64 欄位不同格式，需要另外處理，不能塞進 IMG_COLS 迴圈
const EXTRA_IMG_COL = 'extra_images';
// 處理 extra_images 欄位：陣列內每張圖各自呼叫 saveImgToDrive，回傳新 JSON 字串與目前有效的 ID 清單
function processExtraImages(jsonStr) {
  if (!jsonStr) return { json: '', ids: [] };
  let arr;
  try { arr = JSON.parse(jsonStr); } catch (e) { return { json: jsonStr, ids: [] }; }
  if (!Array.isArray(arr)) return { json: jsonStr, ids: [] };
  const ids = [];
  arr.forEach(function(item) {
    if (item && typeof item === 'object') {
      item.img = saveImgToDrive(item.img || '');
      if (isDriveId(item.img)) ids.push(item.img);
    }
  });
  return { json: JSON.stringify(arr), ids: ids };
}
// 從 extra_images JSON 字串取出目前所有 Drive ID（不上傳，供刪除/孤兒檔比對用）
function extractExtraImageIds(jsonStr) {
  if (!jsonStr) return [];
  try {
    const arr = JSON.parse(jsonStr);
    if (!Array.isArray(arr)) return [];
    return arr.map(function(item) { return item && item.img; }).filter(function(v) { return isDriveId(v); });
  } catch (e) { return []; }
}
 
// 取得/建立圖片資料夾，ID 快取於指令碼屬性；並確保資料夾維持私人（只做一次）
function getImgFolder() {
  const props = PropertiesService.getScriptProperties();
  let folder = null;
  const cached = props.getProperty('IMG_FOLDER_ID');
  if (cached) {
    try { folder = DriveApp.getFolderById(cached); } catch (e) { folder = null; }
  }
  if (!folder) {
    const it = DriveApp.getFoldersByName(IMG_FOLDER_NAME);
    folder = it.hasNext() ? it.next() : DriveApp.createFolder(IMG_FOLDER_NAME);
    props.setProperty('IMG_FOLDER_ID', folder.getId());
    props.deleteProperty('IMG_FOLDER_SHARED');
    props.deleteProperty('IMG_FOLDER_PRIVATE'); // 換了資料夾需重新套用權限
  }
  // 私人收藏預設不公開圖片資料夾；同帳號登入時仍可透過 Drive 縮圖顯示。
  if (props.getProperty('IMG_FOLDER_PRIVATE') !== '1') {
    try {
      folder.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE);
      props.setProperty('IMG_FOLDER_PRIVATE', '1');
      props.deleteProperty('IMG_FOLDER_SHARED');
    } catch (e) { /* 權限設定失敗不阻擋，下次再試 */ }
  }
  return folder;
}
 
// 判斷是否為 Drive 檔案 ID（排除 data:/http、長度足夠、合法字元）
function isDriveId(v) {
  return v && typeof v === 'string'
    && v.indexOf('data:') !== 0 && v.indexOf('http') !== 0
    && /^[A-Za-z0-9_-]{20,}$/.test(v);
}
 
// base64 data URL → 存進 Drive，回傳 file ID；非 data: 則原值回傳（已是 ID 或空字串）
// 另支援 http(s) 遠端圖片（如 ScreenScraper 封面/書背/背面）：伺服器端下載後存進 Drive
function saveImgToDrive(val) {
  if (!val || typeof val !== 'string') return val || '';
  // 遠端圖片 URL → 下載存 Drive（下載失敗或非圖片則回空字串，避免存入失效連結）
  if (val.indexOf('http') === 0) {
    try {
      const r = UrlFetchApp.fetch(val, { muteHttpExceptions: true, followRedirects: true });
      if (r.getResponseCode() !== 200) return '';
      const blob = r.getBlob();
      const ct = (blob.getContentType() || '').toLowerCase();
      if (ct.indexOf('image/') !== 0) return '';
      const ex = (ct.split('/')[1] || 'jpg').split(';')[0].replace('jpeg', 'jpg');
      blob.setName('gv_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7) + '.' + ex);
      return getImgFolder().createFile(blob).getId();
    } catch (e) { return ''; }
  }
  if (val.indexOf('data:') !== 0) return val; // 已是 Drive ID / 其他原值
  const m = val.match(/^data:([^;]+);base64,(.*)$/);
  if (!m) return '';
  const mime = m[1];
  const bytes = Utilities.base64Decode(m[2]);
  const ext = (mime.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
  const name = 'gv_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7) + '.' + ext;
  const file = getImgFolder().createFile(Utilities.newBlob(bytes, mime, name));
  // 不再逐檔 setSharing：資料夾已整體公開分享，新檔繼承「知道連結者可檢視」，省去最耗時的呼叫
  return file.getId();
}
 
// 刪除 Drive 圖檔（移到垃圾桶，誤刪可在 30 天內救回）
function trashImg(id) {
  if (!isDriveId(id)) return;
  try { DriveApp.getFileById(id).setTrashed(true); } catch (e) { /* 已不存在則略過 */ }
}
 
// ── 維護工具：清理孤兒圖檔 ─────────────────────────
// 孤兒檔 = 存在於 GameVault_Images 資料夾、但已無任何工作表列引用的圖片
// （成因：手動在 Sheets 刪列、或同步異常）。
//
// 用法（在 Apps Script 編輯器手動執行，不對外開放）：
//   auditOrphanImages()   → 只「列出」孤兒檔，不刪任何東西（建議先跑這個確認）
//   cleanupOrphanImages() → 實際把孤兒檔移到垃圾桶（可在 Drive 垃圾桶 30 天內救回）
 
// 蒐集四張工作表中所有「仍在使用」的圖片 file ID
function collectUsedImgIds_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetDefs = [
    [GAMES_SHEET, GAME_HEADERS], [BOOKS_SHEET, BOOK_HEADERS],
    [CONSOLE_SHEET, CONSOLE_HEADERS], [PERIPH_SHEET, PERIPH_HEADERS],
    [HUNT_SHEET, HUNT_HEADERS],
    [DIGIGAME_SHEET, DIGIGAME_HEADERS], [DIGIDLC_SHEET, DIGIDLC_HEADERS],
    [DIGICOMIC_SHEET, DIGICOMIC_HEADERS], [DIGIARTBOOK_SHEET, DIGIARTBOOK_HEADERS],
    [DIGIGUIDE_SHEET, DIGIGUIDE_HEADERS], [DIGIMAG_SHEET, DIGIMAG_HEADERS],
    [DIGIAUDIO_SHEET, DIGIAUDIO_HEADERS], [DIGIVIDEO_SHEET, DIGIVIDEO_HEADERS],
    [OST_SHEET, OST_HEADERS],
    [ARTBOOK_SHEET, ARTBOOK_HEADERS], [FIGURE_SHEET, FIGURE_HEADERS]
  ];
  const used = {};
  sheetDefs.forEach(function(def) {
    const sheet = ss.getSheetByName(def[0]);
    if (!sheet || sheet.getLastRow() < 2) return;
    const headers = def[1];
    const idxs = IMG_COLS.map(function(c) { return headers.indexOf(c); }).filter(function(i) { return i >= 0; });
    const eiIdxCollect = headers.indexOf(EXTRA_IMG_COL);
    if (!idxs.length && eiIdxCollect < 0) return;
    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues();
    data.forEach(function(row) {
      idxs.forEach(function(i) { if (isDriveId(row[i])) used[row[i]] = true; });
      if (eiIdxCollect >= 0) extractExtraImageIds(row[eiIdxCollect]).forEach(function(id) { used[id] = true; });
    });
  });
  return used;
}
 
// 找出孤兒檔，回傳 {name, id} 陣列；dryRun=false 時順便移到垃圾桶
function findOrphanImages_(dryRun, usedIds) {
  const used = usedIds || collectUsedImgIds_();
  const folder = getImgFolder();
  const files = folder.getFiles();
  const orphans = [];
  while (files.hasNext()) {
    const f = files.next();
    const id = f.getId();
    if (!used[id]) {
      orphans.push({ name: f.getName(), id: id });
      if (!dryRun) f.setTrashed(true);
    }
  }
  return orphans;
}
 
// 只列出孤兒檔，不刪除（安全預覽）
function auditOrphanImages() {
  const used = collectUsedImgIds_();
  const orphans = findOrphanImages_(true, used);
  const usedCount = Object.keys(used).length;
  Logger.log('使用中的圖檔：%s 個', usedCount);
  Logger.log('找到孤兒檔：%s 個', orphans.length);
  orphans.forEach(function(o) { Logger.log('  孤兒 → %s (%s)', o.name, o.id); });
  if (!orphans.length) Logger.log('✓ 沒有孤兒檔，資料夾很乾淨');
  else Logger.log('如要清除，請執行 cleanupOrphanImages()');
  return { ok: true, used: usedCount, orphans: orphans.length, list: orphans };
}
 
// 實際清除孤兒檔（移到垃圾桶）
function cleanupOrphanImages() {
  const orphans = findOrphanImages_(false);
  Logger.log('已將 %s 個孤兒檔移到垃圾桶', orphans.length);
  orphans.forEach(function(o) { Logger.log('  已清除 → %s (%s)', o.name, o.id); });
  if (!orphans.length) Logger.log('✓ 沒有孤兒檔需要清除');
  return { ok: true, trashed: orphans.length, list: orphans };
}
 
// ── GET handler ───────────────────────────────────
function doGet(e) {
  const p = e.parameter || {};
  const action = p.action || 'ping';
  let result;
 
  try {
    switch (action) {
      case 'ping':
        result = { ok: true, msg: 'GameVault Apps Script 正常運行 ✓ (Games/Books/Consoles/Peripherals/Hunt + 數位下載版8子表 + OST/Artbook/Figures，共16工作表)' };
        break;
      case 'list':
        result = listAll(p.type || 'all');
        break;
      case 'search':
        result = searchRows(p.q || '', p.type || 'all');
        break;
      case 'igdb_search':
        result = igdbProxy(p.q || '', p.client_id || '', p.client_secret || '');
        break;
      case 'gb_search':
        result = gbProxy(p.q || '', p.gbkey || '');
        break;
      case 'mb_search':
        result = mobygamesProxy(p.q || '', p.mbkey || '');
        break;
      case 'tgdb_search':
        result = tgdbProxy(p.q || '', p.tgdbkey || '');
        break;
      case 'bl_search':
        result = barcodeLookupProxy(p.barcode || '', p.blkey || '');
        break;
      case 'ss_search':
        result = screenScraperProxy(p.q || '', p.ssid || '', p.sspass || '', p.systemeid || '', p.serialnum || '', p.ssdevid || '', p.ssdevpass || '', p.region || '');
        break;
      case 'rakuten_search':
        result = rakutenProxy(p.q || '', p.rakuten_appid || '', p.rakuten_accesskey || '');
        break;
      case 'rakuten_books_search':
        result = rakutenBooksProxy(p.isbn || '', p.rakuten_appid || '', p.rakuten_accesskey || '');
        break;
      case 'market_estimate':
        result = marketEstimateProxy(p);
        break;
      case 'ndl_search':
        result = ndlProxy(p.isbn || '');
        break;
      case 'google_books_search':
        result = googleBooksProxy(p.isbn || '');
        break;
      case 'fetch_store_page':
        result = fetchStorePageProxy(p.url || '');
        break;
      case 'fix_headers':
        result = fixSheetHeaders();
        break;
      case 'resolve_map':
        result = resolveMapLink(p.url || '');
        break;
      case 'google_image_search':
        result = googleImageSearchProxy(p.q || '', p.gcsekey || '', p.gcxid || '', parseInt(p.num||'1'));
        break;
      default:
        result = { ok: false, error: '不支援的 action: ' + action };
    }
  } catch (err) {
    result = { ok: false, error: err.message };
  }
 
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
 
// ── POST handler ──────────────────────────────────
function doPost(e) {
  let result;
  try {
    const data = JSON.parse(e.postData.contents);
    const type = resolveType(
      data.category || (data.row && data.row[0]),
      (data.fields && data.fields.subtype) || (data.row && data.row[1])
    );
    switch (data.action) {
      case 'add':
        result = addRow(data.row, type, data.fields);
        break;
      case 'update': {
        // 優先用 uuid（精確），否則用 rowNum（type:n 或純數字）
        const updKey = (data.uuid && data.uuid.length >= 30) ? data.uuid : data.rowNum;
        result = updateRow(updKey, data.row, type, data.fields);
        break;
      }
      case 'delete': {
        // 優先用 uuid 精確搜尋，fallback 用 rowNum
        const delKey = data.uuid || data.rowNum;
        if (!delKey) { result = { ok: false, error: '缺少 uuid 或 rowNum' }; break; }
        try {
          result = deleteRow(delKey, type, data.keepImg);
        } catch (e1) {
          // UUID 找不到時，退回用 rowNum（'type:N' 或數字）再試一次
          if (data.uuid && data.rowNum && data.rowNum !== data.uuid) {
            result = deleteRow(data.rowNum, type, data.keepImg);
          } else { throw e1; }
        }
        break;
      }
      case 'deleteMany': {
        result = deleteManyRows(data.keys || [], type, data.keepImg);
        break;
      }
      default:
        result = { ok: false, error: '不支援的 action: ' + data.action };
    }
  } catch (err) {
    result = { ok: false, error: err.message };
  }
 
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
 
// ── 資料操作 ──────────────────────────────────────
function listAll(type) {
  if (type === 'game')       return listSheet('game');
  if (type === 'book')       return listSheet('book');
  if (type === 'console')    return listSheet('console');
  if (type === 'peripheral') return listSheet('peripheral');
  if (type === 'hunt')       return listSheet('hunt');
  if (type === 'digigame')   return listSheet('digigame');
  if (type === 'digidlc')    return listSheet('digidlc');
  if (type === 'digicomic')  return listSheet('digicomic');
  if (type === 'digiartbook')return listSheet('digiartbook');
  if (type === 'digiguide')  return listSheet('digiguide');
  if (type === 'digimag')    return listSheet('digimag');
  if (type === 'digiaudio')  return listSheet('digiaudio');
  if (type === 'digivideo')  return listSheet('digivideo');
  if (type === 'ost')        return listSheet('ost');
  if (type === 'artbook')    return listSheet('artbook');
  if (type === 'figure')     return listSheet('figure');

  // 合併全部工作表，附加來源類型（不含 hunt：狩獵清單獨立，不混入收藏）
  const types = ['game', 'book', 'console', 'peripheral',
    'digigame', 'digidlc', 'digicomic', 'digiartbook', 'digiguide', 'digimag', 'digiaudio', 'digivideo',
    'ost', 'artbook', 'figure'];
  let allRows = [];
  types.forEach(function(tp) {
    let r;
    try { r = listSheet(tp); } catch (e) { r = { rows: [] }; }
    allRows = allRows.concat((r.rows || []).map(function(row) {
      return Object.assign({}, row, { _sheet: tp });
    }));
  });
  return { ok: true, rows: allRows };
}
 
function listSheet(type) {
  const { sheet, headers } = getSheet(type);
  const last = sheet.getLastRow();
  if (last <= 1) return { ok: true, headers, rows: [] };
 
  // 防呆：實體欄數可能少於 headers（剛新增欄位、尚未執行 fixSheetHeaders）→ 夾限讀取寬度，缺欄回空字串
  const readCols = Math.min(headers.length, sheet.getMaxColumns());
  const raw = sheet.getRange(2, 1, last - 1, readCols).getValues();
  const rows = raw.map((r, i) => {
    const sheetRow = i + 2; // 實際工作表列號
    // rowNum 加上工作表前綴避免 Games/Books 衝突
    // 例如：game:3, book:2
    const obj = { rowNum: sheetRow, _type: type };
    headers.forEach((h, j) => { obj[h] = (j < readCols ? r[j] : ''); });
    // _rowKey 用 uuid 欄位（若有），否則 fallback 到 type:row
    const uuidVal = obj['uuid'];
    // UUID 必須含'-'且長度>=30，否則是欄位錯位的舊資料
    const isValidUuid = uuidVal && typeof uuidVal === 'string'
      && uuidVal.length >= 30 && uuidVal.indexOf('-') > 0;
    obj._rowKey = isValidUuid ? String(uuidVal) : (type + ':' + sheetRow);
    return obj;
  });
  return { ok: true, headers, rows };
}
 
// 注意：目前前端未呼叫此端點（搜尋與篩選皆於前端進行）；保留供手動 GET 測試（?action=search&q=...）。
function searchRows(q, type) {
  const all = listAll(type);
  if (!q) return all;
  const ql = q.toLowerCase();
  const filtered = (all.rows || []).filter(row =>
    Object.keys(row)
      .filter(k => k[0] !== '_' && k !== 'rowNum' && k !== 'uuid')
      .some(k => String(row[k]).toLowerCase().includes(ql))
  );
  return { ok: true, rows: filtered };
}
 
function addRow(row, type, fields) {
  const { sheet, headers } = getSheet(type);
  const tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
  const byName = fields && typeof fields === 'object';
  const padded = headers.map((h, i) => {
    const v = byName ? fields[h] : row[i];
    // uuid 欄位：若未傳入則自動生成
    if (h === 'uuid' && !v) return Utilities.getUuid();
    // created_at 欄位：若未傳入則自動填入今天日期（建檔時間）
    if (h === 'created_at' && !v) return Utilities.formatDate(new Date(), tz, 'yyyy/MM/dd');
    return (v !== undefined && v !== null) ? v : '';
  });
  // 圖片欄：base64 → 上傳 Drive，格子改存 file ID
  const imgs = {};
  IMG_COLS.forEach(function(col) {
    const idx = headers.indexOf(col);
    if (idx >= 0) { padded[idx] = saveImgToDrive(padded[idx]); imgs[col] = padded[idx]; }
  });
  // v47.04：extra_images 是 JSON 陣列欄位，個別處理陣列內每張圖，不走上面的單欄位迴圈
  const eiIdxAdd = headers.indexOf(EXTRA_IMG_COL);
  if (eiIdxAdd >= 0) {
    const processedAdd = processExtraImages(padded[eiIdxAdd]);
    padded[eiIdxAdd] = processedAdd.json;
    imgs[EXTRA_IMG_COL] = processedAdd.json;
  }
  sheet.appendRow(padded);
  const newRow = sheet.getLastRow();
  // created_at 防呆（E1）：強制該格為純文字格式並以字串重寫，避免 Sheets 自動把
  // 「YYYY/MM/DD HH:MM」判定為日期型別、回讀時序列化成 UTC ISO（建檔時間編碼亂掉的根因）
  const _caIdx = headers.indexOf('created_at');
  if (_caIdx >= 0) {
    const _caCell = sheet.getRange(newRow, _caIdx + 1);
    _caCell.setNumberFormat('@');
    _caCell.setValue(String(padded[_caIdx]));
  }
  // 取出實際寫入的 uuid（第二欄）
  const uuidIdx = headers.indexOf('uuid');
  const uuid = uuidIdx >= 0 ? padded[uuidIdx] : (type + ':' + newRow);
  return { ok: true, rowNum: newRow, uuid: uuid, sheetType: type, imgs: imgs };
}
 
function updateRow(rowNum, row, type, fields) {
  let actualRow = rowNum;
  let resolvedType = type;
 
  if (typeof rowNum === 'string') {
    if (rowNum.length >= 30 && rowNum.indexOf('-') > 0) {
      // UUID → 用 findRowByUuid 精確找到列號
      const found = findRowByUuid(rowNum);
      if (!found) throw new Error('找不到 UUID：' + rowNum + '（請先執行「修復工作表標題列」）');
      actualRow = found.row;
      resolvedType = found.type;
    } else if (rowNum.indexOf(':') > 0) {
      // 'game:3' 格式
      const parts = rowNum.split(':');
      resolvedType = parts[0];
      actualRow = parseInt(parts[1]);
    } else {
      actualRow = parseInt(rowNum);
    }
  }
 
  const { sheet, headers } = getSheet(resolvedType);
  const last = sheet.getLastRow();
  if (actualRow < 2 || actualRow > last) throw new Error('列號超出範圍：' + actualRow);
  // 讀舊列以比對圖片（換圖/清圖時刪掉舊 Drive 檔，避免孤兒檔）
  const oldRow = sheet.getRange(actualRow, 1, 1, headers.length).getValues()[0];
  const byName = fields && typeof fields === 'object';
  const padded = headers.map((h, i) => {
    const v = byName ? fields[h] : row[i];
    return (v !== undefined && v !== null) ? v : '';
  });
  const imgs = {};
  IMG_COLS.forEach(function(col) {
    const idx = headers.indexOf(col);
    if (idx < 0) return;
    const oldVal = oldRow[idx];
    const newVal = saveImgToDrive(padded[idx]); // base64 才上傳；已是 ID/空字串則原樣
    padded[idx] = newVal;
    imgs[col] = newVal;
    if (isDriveId(oldVal) && oldVal !== newVal) trashImg(oldVal); // 舊檔被換掉或清空
  });
  // v47.04：extra_images 是 JSON 陣列欄位，比對舊/新陣列的 ID 差異，被移除的圖才回收
  const eiIdxUpd = headers.indexOf(EXTRA_IMG_COL);
  if (eiIdxUpd >= 0) {
    const oldExtraIds = extractExtraImageIds(oldRow[eiIdxUpd]);
    const processedUpd = processExtraImages(padded[eiIdxUpd]);
    padded[eiIdxUpd] = processedUpd.json;
    imgs[EXTRA_IMG_COL] = processedUpd.json;
    const newExtraIdSet = {};
    processedUpd.ids.forEach(function(id) { newExtraIdSet[id] = 1; });
    oldExtraIds.forEach(function(id) { if (!newExtraIdSet[id]) trashImg(id); });
  }
  sheet.getRange(actualRow, 1, 1, headers.length).setValues([padded]);
  // created_at 防呆（E1）：與 addRow 一致，強制純文字避免回讀變 ISO
  const _caIdxU = headers.indexOf('created_at');
  if (_caIdxU >= 0) {
    const _caCellU = sheet.getRange(actualRow, _caIdxU + 1);
    _caCellU.setNumberFormat('@');
    _caCellU.setValue(String(padded[_caIdxU]));
  }
  return { ok: true, sheetType: resolvedType, imgs: imgs };
}
 
function deleteRow(rowNum, type, keepImg) {
  let actualRow = rowNum;
  let resolvedType = type;
 
  if (typeof rowNum === 'string') {
    if (rowNum.length >= 30 && rowNum.indexOf('-') > 0) {
      // UUID 格式（如 'f6a974af-14a4-415c-9e66-6661ec80bf12'）
      const found = findRowByUuid(rowNum);
      if (!found) throw new Error('找不到 UUID：' + rowNum);
      actualRow = found.row;
      resolvedType = found.type;
    } else if (rowNum.includes(':')) {
      // 'game:3' 或 'book:2' 格式
      const parts = rowNum.split(':');
      resolvedType = parts[0];
      actualRow = parseInt(parts[1]);
    } else if (!isNaN(parseInt(rowNum))) {
      actualRow = parseInt(rowNum);
    }
  }
 
  const { sheet, headers } = getSheet(resolvedType);
  const last = sheet.getLastRow();
  if (actualRow < 2 || actualRow > last) throw new Error('列號超出範圍：' + actualRow);
  // 刪列前先刪掉該列的 Drive 圖檔（同步刪除，避免孤兒檔）；keepImg 時保留（與收藏共用之圖）
  if (!keepImg) {
    const rowVals = sheet.getRange(actualRow, 1, 1, headers.length).getValues()[0];
    IMG_COLS.forEach(function(col) {
      const idx = headers.indexOf(col);
      if (idx >= 0) trashImg(rowVals[idx]);
    });
    const eiIdxDel = headers.indexOf(EXTRA_IMG_COL);
    if (eiIdxDel >= 0) extractExtraImageIds(rowVals[eiIdxDel]).forEach(function(id) { trashImg(id); });
  }
  sheet.deleteRow(actualRow);
  return { ok: true, sheetType: resolvedType };
}
 
// 大量刪除：keys 可為 UUID / 'type:N' / 數字混合。先全部解析成 {type,row}，
// 再依工作表由大到小刪除，避免刪除過程列號位移。
function deleteManyRows(keys, defType, keepImg) {
  const resolved = [];
  (keys || []).forEach(function(k) {
    try {
      let t = defType, r = null;
      if (typeof k === 'string' && k.length >= 30 && k.indexOf('-') > 0) {
        const f = findRowByUuid(k);
        if (f) { t = f.type; r = f.row; }
      } else if (typeof k === 'string' && k.indexOf(':') >= 0) {
        const p = k.split(':'); t = p[0]; r = parseInt(p[1]);
      } else if (!isNaN(parseInt(k))) {
        r = parseInt(k);
      }
      if (r) resolved.push({ type: t, row: r });
    } catch (e) { /* 跳過無法解析者 */ }
  });
  const byType = {};
  resolved.forEach(function(x) { (byType[x.type] = byType[x.type] || []).push(x.row); });
  let deleted = 0;
  Object.keys(byType).forEach(function(t) {
    try {
      const { sheet, headers } = getSheet(t);
      // 去重後由大到小刪
      const rows = byType[t].filter(function(v, i, a) { return a.indexOf(v) === i; }).sort(function(a, b) { return b - a; });
      rows.forEach(function(r) {
        try {
          if (r < 2 || r > sheet.getLastRow()) return;
          if (!keepImg) {
            const rowVals = sheet.getRange(r, 1, 1, headers.length).getValues()[0];
            IMG_COLS.forEach(function(col) { const idx = headers.indexOf(col); if (idx >= 0) trashImg(rowVals[idx]); });
            const eiIdxDelMany = headers.indexOf(EXTRA_IMG_COL);
            if (eiIdxDelMany >= 0) extractExtraImageIds(rowVals[eiIdxDelMany]).forEach(function(id) { trashImg(id); });
          }
          sheet.deleteRow(r);
          deleted++;
        } catch (e) { /* 單列失敗不中斷 */ }
      });
    } catch (e) { /* 該工作表失敗不中斷 */ }
  });
  return { ok: true, deleted: deleted };
}
 
// ── IGDB 代理 ─────────────────────────────────────
// ── Google Custom Search Image Proxy ─────────────────────────
// 用 Google Custom Search API 搜圖，回傳第一張圖片 URL
// 需要：Google Cloud API Key + Programmable Search Engine ID（cx）
function googleImageSearchProxy(q, gcsekey, gcxid, num) {
  if (!q || !gcsekey || !gcxid) return { ok: false, error: 'missing params', imageUrl: '' };
  const n = Math.min(Math.max(parseInt(num) || 1, 1), 3);
  const url = 'https://www.googleapis.com/customsearch/v1' +
    '?key=' + encodeURIComponent(gcsekey) +
    '&cx=' + encodeURIComponent(gcxid) +
    '&searchType=image' +
    '&num=' + n +
    '&q=' + encodeURIComponent(q);
  try {
    const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const code = res.getResponseCode();
    if (code !== 200) return { ok: false, error: 'Google CSE HTTP ' + code, imageUrl: '' };
    const data = JSON.parse(res.getContentText());
    if (!data.items || !data.items.length) return { ok: false, error: '查無圖片結果', imageUrl: '' };
    return { ok: true, imageUrl: data.items[0].link, items: data.items.map(i => i.link) };
  } catch (e) {
    return { ok: false, error: e.message, imageUrl: '' };
  }
}


function igdbProxy(query, clientId, clientSecret) {
  if (!query || !clientId || !clientSecret)
    return { ok: false, error: 'missing params', games: [] };
 
  const tokenRes = UrlFetchApp.fetch(
    'https://id.twitch.tv/oauth2/token?' +
    'client_id=' + encodeURIComponent(clientId) +
    '&client_secret=' + encodeURIComponent(clientSecret) +
    '&grant_type=client_credentials',
    { method: 'POST', muteHttpExceptions: true }
  );
  const tokenData = JSON.parse(tokenRes.getContentText());
  if (!tokenData.access_token)
    return { ok: false, error: 'Twitch 驗證失敗：' + JSON.stringify(tokenData), games: [] };
 
  const token = tokenData.access_token;
  const igdbRes = UrlFetchApp.fetch('https://api.igdb.com/v4/games', {
    method: 'POST',
    headers: {
      'Client-ID': clientId,
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'text/plain'
    },
    payload: [
      'search "' + query.replace(/"/g, '') + '";',
      'fields name,alternative_names.name,platforms.name,genres.name,',
      'involved_companies.company.name,involved_companies.developer,',
      'involved_companies.publisher,first_release_date,summary,cover.url;',
      'limit 8;'
    ].join(''),
    muteHttpExceptions: true
  });
 
  const games = JSON.parse(igdbRes.getContentText());
  if (!Array.isArray(games))
    return { ok: false, error: 'IGDB 回傳錯誤：' + igdbRes.getContentText(), games: [] };
 
  const mapped = games.map(g => {
    const devC = (g.involved_companies || []).find(c => c.developer);
    const pubC = (g.involved_companies || []).find(c => c.publisher);
    const platforms = (g.platforms || []).map(p => mapPlatform(p.name)).filter(Boolean).join('/');
    const genres    = (g.genres    || []).map(p => mapGenre(p.name)).filter(Boolean).join('/');
    const releaseDate = g.first_release_date
      ? new Date(g.first_release_date * 1000).toISOString().slice(0, 10).replace(/-/g, '/')
      : '';
    const coverUrl = g.cover && g.cover.url
      ? 'https:' + g.cover.url.replace('t_thumb', 't_cover_big')
      : '';
    return {
      name:         g.name || '',
      zh_name:      '',
      jp_name:      '',
      platform:     platforms,
      genre:        genres,
      developer:    devC ? devC.company.name : '',
      publisher:    pubC ? pubC.company.name : '',
      release_date: releaseDate,
      summary:      g.summary || '',
      cover_url:    coverUrl,
      meta:         [platforms, releaseDate ? releaseDate.slice(0, 4) : ''].filter(Boolean).join(' · ')
    };
  });
 
  return { ok: true, games: mapped };
}
 
// ── Giant Bomb API Proxy ──────────────────────────────────────
function gbProxy(q, gbKey) {
  if (!q || !gbKey) return { error: 'missing params', results: [] };
 
  // Giant Bomb API — 注意：需要在 URL 最後加 api_key（不能放 header）
  // Giant Bomb API：search 端點
  // 注意 api_key 必須是第一個參數
  const url = 'https://www.giantbomb.com/api/search/?api_key=' + encodeURIComponent(gbKey) +
    '&format=json' +
    '&query=' + encodeURIComponent(q) +
    '&resources=game' +
    '&field_list=name,platforms,deck,publishers,developers,original_release_date,genres,site_detail_url,id';
  // 備用端點（若 search 失敗）
  const urlAlt = 'https://www.giantbomb.com/api/games/?api_key=' + encodeURIComponent(gbKey) +
    '&format=json' +
    '&filter=name:' + encodeURIComponent(q) +
    '&field_list=name,platforms,deck,publishers,developers,original_release_date,genres,site_detail_url,id' +
    '&limit=5';
 
  // 查快取
  const cacheKey = 'gb:' + q;
  const cached = getCache(cacheKey);
  if (cached) return cached;
 
  const fetchOpts = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36',
      'Accept': 'application/json',
    },
    muteHttpExceptions: true,
    followRedirects: true
  };
 
  function tryFetch(fetchUrl) {
    try {
      const res = UrlFetchApp.fetch(fetchUrl, fetchOpts);
      const code = res.getResponseCode();
      const text = res.getContentText('UTF-8');

      if (code === 404) return null; // 嘗試備用端點
      if (code === 403) return { error: 'API Key 無效或帳號未啟用', results: [] };
      if (code === 429) return { error: '請求過於頻繁，請稍後再試', results: [] };
      if (code !== 200) return { error: 'HTTP ' + code, results: [] };
      if (!text || text.trimStart().startsWith('<')) return null; // HTML → 嘗試備用
 
      let json;
      try { json = JSON.parse(text); } catch(e) { return null; }
 
      if (json.status_code && json.status_code !== 1) {
        return { error: 'GB code=' + json.status_code + '：' + (json.error || ''), results: [] };
      }
      if (json.error && json.error !== 'OK') {
        return { error: json.error, results: [] };
      }
      // /api/games/ 回傳 results，/api/search/ 也回傳 results
      return json;
    } catch(e) {
      return { error: e.message, results: [] };
    }
  }
 
  // 先試主端點，404 時試備用
  let result = tryFetch(url);
  if (result === null) result = tryFetch(urlAlt);
  if (result === null) return { error: 'Giant Bomb 兩個端點都無回應（404），請確認 API Key 是否正確', results: [] };
  // 成功結果寫入快取
  if (result.results && result.results.length > 0) setCache(cacheKey, result);
  return result;
}
 
 
// ── 平台名稱對照 ───────────────────────────────────
function mapPlatform(name) {
  const map = {
    'PlayStation 5': 'PlayStation 5', 'PlayStation 4': 'PlayStation 4',
    'PlayStation 3': 'PlayStation 3', 'PlayStation 2': 'PlayStation 2',
    'PlayStation':   'PlayStation',   'Nintendo Switch': 'Nintendo Switch',
    'Nintendo 3DS':  'Nintendo 3DS',  'Nintendo DS':   'Nintendo DS',
    'Game Boy Advance': 'Game Boy Advance', 'Game Boy Color': 'Game Boy Color',
    'Game Boy':      'Game Boy',      'PC (Microsoft Windows)': 'PC',
    'Sega Saturn':   'Sega Saturn',   'Dreamcast':     'Dreamcast',
    'PlayStation Portable': 'PlayStation Portable',
    'PS Vita':       'PlayStation Vita',
    'Super Nintendo': 'Super Famicom', 'Nintendo Entertainment System': 'Famicom',
    'Sega Mega Drive': 'Sega Mega Drive', 'PC Engine': 'PC Engine',
  };
  for (const k in map) if (name.includes(k)) return map[k];
  return '';
}
 
// ── 遊戲類型對照 ───────────────────────────────────
function mapGenre(name) {
  const map = {
    'Role-playing': 'RPG', 'Hack and slash': 'ARPG', 'Action': 'ACT',
    'Adventure': 'AVG',    'Strategy': 'SLG',         'Sports': 'SPT',
    'Racing': 'RCG',       'Shooter': 'STG',          'Puzzle': 'PZL',
    'Fighting': 'FTG',     'Simulator': 'SIM',        'Platform': 'ACT',
    'Music': 'MUS',
  };
  for (const k in map) if (name.includes(k)) return map[k];
  return '';
}
 
// ── MobyGames API Proxy ──────────────────────────────────────
function mobygamesProxy(q, key) {
  if (!q || !key) return { error: 'missing params' };
  const url = 'https://api.mobygames.com/v1/games?api_key=' + key +
    '&title=' + encodeURIComponent(q) + '&limit=5&format=normal';
  try {
    const res = UrlFetchApp.fetch(url, {
      headers: { 'Accept': 'application/json' },
      muteHttpExceptions: true
    });
    const code = res.getResponseCode();
    const text = res.getContentText('UTF-8');
    if (code === 401 || code === 403) return { error: 'MobyGames API Key 無效，請重新申請' };
    if (code === 429) return { error: '請求過於頻繁，請稍後再試' };
    if (code !== 200) return { error: 'HTTP ' + code };
    if (!text || text.trimStart().startsWith('<')) return { error: 'MobyGames 回傳非 JSON' };
    return JSON.parse(text);
  } catch (e) { return { error: e.message }; }
}
 
// ── 楽天 API 非 200 回應 → 透傳原始錯誤說明──
//    先試 JSON 的 error_description/error；非 JSON 本文（403 常見）則去標籤後截前 100 字
function _rakutenHttpErr(code, text) {
  let detail = '';
  try {
    const ej = JSON.parse(text);
    detail = (ej.error_description || ej.error || '').slice(0, 100);
  } catch (e2) {
    detail = ('' + text).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100);
  }
  return { error: 'HTTP ' + code + (detail ? '：' + detail : '') };
}
 
// ── 楽天市場 商品検索 API Proxy─────────────────────
// JAN 條碼或關鍵字查詢；回傳第一筆商品的精簡欄位；結果走 Cache 工作表（7 天）
function rakutenProxy(q, appid, accesskey) {
  if (!q || !appid || !accesskey) return { error: 'missing params' };
  const ck = 'rakuten_' + q;
  const cached = getCache(ck);
  if (cached) return cached;
  const url = 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20220601?format=json' +
    '&applicationId=' + encodeURIComponent(appid) +
    '&accessKey=' + encodeURIComponent(accesskey) +
    '&keyword=' + encodeURIComponent(q) + '&hits=3&imageFlag=1';
  try {
    // 不依賴後台新增項目的生效延遲）。新版 API 必須帶 Referer/Origin，否則 403 REFERRER_MISSING
    const res = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      headers: { 'Referer': 'https://reteogame.netlify.app/', 'Origin': 'https://reteogame.netlify.app' }
    });
    const code = res.getResponseCode();
    const text = res.getContentText('UTF-8');
    // v21/22.01：所有非 200 一律透傳楽天原始錯誤說明（共用 _rakutenHttpErr）
    if (code !== 200) return _rakutenHttpErr(code, text);
    const d = JSON.parse(text);
    if (!d.Items || !d.Items.length) return { notfound: true };
    const it = d.Items[0].Item || {};
    let img = (it.mediumImageUrls && it.mediumImageUrls[0] && it.mediumImageUrls[0].imageUrl) || '';
    if (img) img = img.replace(/\?_ex=\d+x\d+/, '?_ex=600x600'); // 拉高縮圖解析度
    const out = {
      item_name: it.itemName || '',
      price: it.itemPrice || '',
      item_url: it.itemUrl || '',
      image: img,
      shop: it.shopName || ''
    };
    setCache(ck, out);
    return out;
  } catch (e) { return { error: e.message }; }
}

// ── 市場估值 Proxy─────────────────────────────
// 免費正式來源僅取「目前刊登價」，不是成交價；台灣二手平台改由前端提供搜尋參考連結。
//         回傳 diag（各來源 raw/kept 筆數與被略過樣本），方便定位「查無」成因。
const MARKET_MIN_SCORE = 0.30;   // 標題相似度採計門檻（原 0.38，下修以提高命中）
const MARKET_MIN_USED = 3;       // 二手樣本達此數才只採二手，否則回退全部刊登價

function marketNormRegion_(r) {
  r = ('' + r).toLowerCase();
  if (/jp|japan|日/.test(r)) return 'jp';
  if (/us|usa|america|北美|美/.test(r)) return 'us';
  if (/asia|taiwan|hong|台|港|亞/.test(r)) return 'asia';
  if (r) return 'other';
  return '';
}
function marketRegionCurrency_(region) {
  if (region === 'jp' || region === 'asia') return 'JPY';
  if (region === 'us') return 'USD';
  return '';
}

function marketEstimateProxy(p) {
  const q = (p.q || p.barcode || '').trim();
  if (!q) return { ok: false, error: '缺少查詢關鍵字' };
  const title = (p.title || q).trim();
  const platform = (p.platform || '').trim();
  const model = (p.model || '').trim();
  const category = (p.category || '').trim();
  const titleList = marketTitleList_(title, p.alt_titles || '');

  // 語言對市場分流：日站(楽天/Yahoo JP)用日文名候選；eBay 用英文名候選。
  const jpTitles = marketPickJpTitles_((p.jp_title || '').trim(), titleList, title);
  const enTitles = marketPickEnTitles_((p.en_title || '').trim(), titleList);
  const queries = marketBuildQueries_(jpTitles, enTitles, platform, model);

  const region = marketNormRegion_(p.region || '');
  const ck = 'market_estimate_v39_01_' + q + '_' + platform + '_' + model + '_' + category + '_' + region;
  const cached = getCache(ck);
  if (cached) return cached;

  let kept = [];
  const seenItems = {};
  const diagSources = {};
  const rejected = [];
  function srcRow(src) {
    if (!diagSources[src]) diagSources[src] = { raw: 0, kept: 0 };
    return diagSources[src];
  }
  function collect(list) {
    (list || []).forEach(function(it) {
      const src = it.source || 'unknown';
      const row = srcRow(src);
      row.raw++;
      const price = Number(it.price);
      if (!price || price <= 0 || !it.currency) return;
      const score = marketTitleScoreMulti_(it.title || '', titleList, platform, model);
      if (score < MARKET_MIN_SCORE) {
        if (rejected.length < 8) rejected.push({ source: src, title: String(it.title || '').slice(0, 60), score: Math.round(score * 100) / 100 });
        return;
      }
      const key = [(it.url || ''), (it.title || ''), price, it.currency].join('|');
      if (seenItems[key]) return;
      seenItems[key] = true;
      row.kept++;
      kept.push({
        source: src,
        title: it.title || '',
        price: price,
        currency: it.currency,
        url: it.url || '',
        score: score,
        used: marketIsUsed_(it)
      });
    });
  }

  if (queries.jp.length && p.rakuten_appid && p.rakuten_accesskey) collect(marketRakutenPrices_(queries.jp, p.rakuten_appid, p.rakuten_accesskey));
  if (queries.jp.length && p.yahoo_appid) collect(marketYahooJapanPrices_(queries.jp, p.yahoo_appid));
  if (queries.ebay.length && p.ebay_client_id && p.ebay_client_secret) collect(marketEbayPrices_(queries.ebay, p.ebay_client_id, p.ebay_client_secret));

  const diag = marketDiagOut_(diagSources, rejected, jpTitles, enTitles);
  if (!kept.length) return { ok: false, error: '查無市場可用價格', queries: queries, diag: diag };

  // 二手優先；二手樣本不足則回退採用全部（含全新刊登價），並標記 includes_new。
  const usedPool = kept.filter(function(x) { return x.used; });
  let pool, includesNew;
  if (usedPool.length >= MARKET_MIN_USED) { pool = usedPool; includesNew = false; }
  else { pool = kept; includesNew = usedPool.length < kept.length; }

  const byCur = {};
  pool.forEach(function(it) {
    if (!byCur[it.currency]) byCur[it.currency] = [];
    byCur[it.currency].push(it);
  });
  const prefCur = marketRegionCurrency_(region);
  let currency;
  if (prefCur && byCur[prefCur] && byCur[prefCur].length) currency = prefCur; // 依商品區域優先：美國品→USD、日本/亞洲品→JPY
  else currency = Object.keys(byCur).sort(function(a, b) { return byCur[b].length - byCur[a].length; })[0];
  let selected = byCur[currency].slice().sort(function(a, b) { return a.price - b.price; });
  let prices = selected.map(function(it) { return it.price; });
  let trimmed = prices;
  if (prices.length >= 7) trimmed = prices.slice(1, prices.length - 1);
  const mid = Math.floor(trimmed.length / 2);
  const median = trimmed.length % 2 ? trimmed[mid] : Math.round((trimmed[mid - 1] + trimmed[mid]) / 2);
  const sourceCounts = {};
  selected.forEach(function(it) { sourceCounts[it.source] = (sourceCounts[it.source] || 0) + 1; });
  const sources = Object.keys(sourceCounts).map(function(k) { return { name: k, count: sourceCounts[k] }; });
  const confidence = (!includesNew && selected.length >= 8 && sources.length >= 2) ? '高' : (selected.length >= 3 ? '中' : '低');
  const fx = marketTwdFx_(currency, p);
  const twd = fx && fx.rate ? Math.round(median * fx.rate) : null;
  const out = {
    ok: true,
    region: region,
    estimate: {
      amount: median,
      currency: currency,
      twd_amount: twd,
      fx_rate: fx && fx.rate ? fx.rate : null,
      fx_provider: fx && fx.provider ? fx.provider : '',
      fx_updated_at: fx && fx.updated_at ? fx.updated_at : ''
    },
    count: selected.length,
    sources: sources,
    confidence: confidence,
    includes_new: includesNew,
    min: prices[0],
    max: prices[prices.length - 1],
    min_twd: fx && fx.rate ? Math.round(prices[0] * fx.rate) : null,
    max_twd: fx && fx.rate ? Math.round(prices[prices.length - 1] * fx.rate) : null,
    queries: queries,
    diag: diag,
    samples: selected
  };
  setCache(ck, out);
  return out;
}

// 日站查詢名候選：明確日文名 → 含假名的名稱(必為日文) → 退回主名稱(至少嘗試一次)
function marketPickJpTitles_(jpExplicit, titleList, fallback) {
  let out = [];
  if (jpExplicit) out.push(jpExplicit);
  (titleList || []).forEach(function(t) { if (marketHasKana_(t)) out.push(t); });
  if (!out.length && fallback) out.push(fallback);
  return marketUniqList_(out);
}

// eBay 查詢名候選：明確英文名 → 純 ASCII 拉丁字母名稱；無英文名則回空(略過 eBay，避免噪音)
function marketPickEnTitles_(enExplicit, titleList) {
  let out = [];
  if (enExplicit) out.push(enExplicit);
  (titleList || []).forEach(function(t) { if (marketIsLatin_(t)) out.push(t); });
  return marketUniqList_(out);
}

function marketUniqList_(arr) {
  const seen = {};
  return (arr || []).map(function(x) { return (x || '').replace(/\s+/g, ' ').trim(); }).filter(function(x) {
    if (!x || seen[x]) return false;
    seen[x] = true;
    return true;
  });
}

function marketHasKana_(s) { return /[\u3040-\u30ff]/.test(s || ''); }              // 平假名 / 片假名
function marketIsLatin_(s) { return /[a-z]/i.test(s || '') && !/[\u3040-\u9fff]/.test(s || ''); } // 含拉丁字母且不含日中文字

function marketDiagOut_(diagSources, rejected, jpTitles, enTitles) {
  const sources = Object.keys(diagSources).map(function(k) {
    return { name: k, raw: diagSources[k].raw, kept: diagSources[k].kept };
  });
  return {
    sources: sources,
    rejected: rejected,
    jp_titles: jpTitles,
    en_titles: enTitles,
    min_score: MARKET_MIN_SCORE
  };
}

function marketTitleList_(title, altTitles) {
  const seen = {};
  return [title].concat(String(altTitles || '').split('|||')).map(function(x) {
    return (x || '').replace(/\s+/g, ' ').trim();
  }).filter(function(x) {
    const k = marketNorm_(x);
    if (!k || seen[k]) return false;
    seen[k] = true;
    return true;
  });
}

function marketBuildQueries_(jpTitles, enTitles, platform, model) {
  function clean(x) { return (x || '').replace(/\s+/g, ' ').trim(); }
  function uniq(arr) {
    const seen = {};
    return arr.map(clean).filter(function(x) {
      if (!x || seen[x]) return false;
      seen[x] = true;
      return true;
    });
  }
  let jp = [];
  (jpTitles || []).slice(0, 3).forEach(function(t) {
    const baseFull = clean([t, platform, model].filter(Boolean).join(' '));
    const basePlatform = clean([t, platform].filter(Boolean).join(' '));
    const baseTitle = clean(t);
    jp = jp.concat([
      baseFull + ' 中古',
      basePlatform + ' 中古',
      baseTitle + ' 中古',
      baseTitle + ' ゲーム 中古',
      baseTitle + ' ソフト 中古'
    ]);
  });
  let ebay = [];
  (enTitles || []).slice(0, 3).forEach(function(t) {
    const baseFull = clean([t, platform, model].filter(Boolean).join(' '));
    const basePlatform = clean([t, platform].filter(Boolean).join(' '));
    const baseTitle = clean(t);
    ebay = ebay.concat([
      baseFull + ' used',
      basePlatform + ' used',
      baseTitle + ' used',
      baseTitle + ' game used'
    ]);
  });
  return {
    jp: uniq(jp),
    ebay: uniq(ebay)
  };
}

function marketNorm_(s) {
  const t = (s || '').toString().toLowerCase()
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(ch) { return String.fromCharCode(ch.charCodeAt(0) - 0xFEE0); })
    .replace(/[™®・:：,，.。()（）\[\]【】_\/-]/g, ' ')
    .replace(/\b(used|preowned|pre-owned|secondhand|second hand|中古|二手|美品|良品|ジャンク|動作確認済|送料無料)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  // ponytail: 只折疊長度>=2 的整段羅馬數字(ii..xlix)為阿拉伯數字，讓「XVI」與「16」可互相比對；
  //           單字母 v / x 不折疊，避免誤傷 xbox 等詞；上限 49 對遊戲續作編號已足夠。
  return t.replace(/\b[ivxl]{2,}\b/g, function(tok) {
    const n = marketRoman_(tok);
    return n ? String(n) : tok;
  });
}

function marketRoman_(s) {
  const map = { i: 1, v: 5, x: 10, l: 50 };
  const str = (s || '').toLowerCase();
  let total = 0, prev = 0;
  for (let i = str.length - 1; i >= 0; i--) {
    const v = map[str.charAt(i)];
    if (!v) return 0;
    if (v < prev) total -= v; else { total += v; prev = v; }
  }
  if (total <= 0 || total > 49) return 0;
  return total;
}

function marketPlatformAliases_(platform) {
  const p = marketNorm_(platform);
  const aliases = {
    'playstation 5': ['ps5', 'playstation 5'],
    'playstation 4': ['ps4', 'playstation 4'],
    'playstation 3': ['ps3', 'playstation 3'],
    'playstation 2': ['ps2', 'playstation 2'],
    'playstation': ['ps1', 'psx', 'playstation'],
    'nintendo switch': ['nintendo switch', 'switch', 'nsw'],
    'nintendo switch 2': ['nintendo switch 2', 'switch 2', 'nsw2'],
    'wii u': ['wii u', 'wiiu'],
    'xbox series x|s': ['xbox series', 'series x', 'series s', 'xsx'],
    'xbox one': ['xbox one', 'xone'],
    'xbox 360': ['xbox 360', 'x360']
  };
  return aliases[p] || (p ? [p] : []);
}

// 競爭平台對照表：key 為期望平台(norm後)，value 為應扣分的競爭平台別名
const MARKET_PLATFORM_RIVALS_ = {
  'playstation 5': ['ps4', 'playstation 4', 'ps3', 'playstation 3'],
  'playstation 4': ['ps5', 'playstation 5', 'ps3', 'playstation 3'],
  'playstation 3': ['ps4', 'playstation 4', 'ps2', 'playstation 2'],
  'playstation 2': ['ps3', 'playstation 3', 'ps1', 'psx'],
  'nintendo switch': ['switch 2', 'nsw2', 'wii u', 'wiiu', 'ps4', 'ps5'],
  'nintendo switch 2': ['switch', 'nsw', 'wii u', 'wiiu'],
  'xbox series x|s': ['xbox one', 'xone', 'ps4', 'ps5'],
  'xbox one': ['xbox series', 'series x', 'series s', 'xsx', 'ps4', 'ps5']
};

function marketTitleScore_(itemTitle, expectedTitle, platform, model) {
  const item = marketNorm_(itemTitle);
  const title = marketNorm_(expectedTitle);
  if (!item || !title) return 0;
  let score = 0;
  if (item.indexOf(title) >= 0 || title.indexOf(item) >= 0) score += 0.72;
  else {
    const tokens = title.split(' ').filter(function(t) { return t.length >= 2; });
    if (tokens.length) {
      const hit = tokens.filter(function(t) { return item.indexOf(t) >= 0; }).length;
      score += 0.62 * (hit / tokens.length);
    }
    if (score < 0.38) score += 0.55 * marketCharSimilarity_(item, title);
  }
  const aliases = marketPlatformAliases_(platform);
  if (aliases.length && aliases.some(function(a) { return item.indexOf(a) >= 0; })) score += 0.18;
  const m = marketNorm_(model);
  if (m && item.indexOf(m) >= 0) score += 0.16;
  // ponytail: 若期望標題末尾帶 4 位年份（如 2003），候選必須含相同獨立年份；
  //           年份不符時直接 return 0（不讓 charSimilarity 把錯誤前後作救回門檻以上）。
  //           日文標題無空白分詞，「！2」與「！2003」字元集幾乎相同，相似度接近 1.0，
  //           若只扣分仍可能翻身，需 early return。
  const yearM = title.match(/(\d{4})\s*$/);
  if (yearM) {
    const yr = yearM[1];
    const yrRe = new RegExp('(?<![0-9])' + yr + '(?![0-9])');
    if (!yrRe.test(item)) return 0;
  }
  // ponytail: 若期望標題末尾為兩位數版本號（如 MLB The Show 26 的「26」），且沒有 4 位年份，
  //           候選必須含相同獨立兩位數；不符時 early return 0。
  if (!yearM) {
    const yr2M = title.match(/\b(\d{2})\s*$/);
    if (yr2M) {
      const yr2 = yr2M[1];
      const yr2Re = new RegExp('(?<![0-9])' + yr2 + '(?![0-9])');
      if (!yr2Re.test(item)) return 0;
    }
  }
  // ponytail: 若期望平台明確（有別名），且候選含競爭平台別名，扣 0.20。
  //           刻意不完全排除跨平台樣本——同名遊戲跨平台版價差通常不大，PS5 樣本稀少時 PS4 版
  //           可作為參考下限；扣分後讓 PS5 樣本主導中位數即可。
  const pNorm = marketNorm_(platform);
  const rivals = MARKET_PLATFORM_RIVALS_[pNorm] || [];
  if (aliases.length && rivals.length && rivals.some(function(r) { return item.indexOf(r) >= 0; })) {
    score -= 0.20;
  }
  return Math.min(1, Math.max(0, score));
}

function marketCharSimilarity_(a, b) {
  a = (a || '').replace(/\s+/g, '');
  b = (b || '').replace(/\s+/g, '');
  if (!a || !b) return 0;
  const short = a.length <= b.length ? a : b;
  const long = a.length <= b.length ? b : a;
  let hit = 0;
  const used = {};
  for (let i = 0; i < short.length; i++) {
    const ch = short.charAt(i);
    if (used[ch]) continue;
    used[ch] = true;
    if (long.indexOf(ch) >= 0) hit++;
  }
  return hit / Math.max(1, Object.keys(used).length);
}

function marketTitleScoreMulti_(itemTitle, titles, platform, model) {
  const list = titles && titles.length ? titles : [''];
  let best = 0;
  list.forEach(function(t) {
    const s = marketTitleScore_(itemTitle, t, platform, model);
    if (s > best) best = s;
  });
  return best;
}

function marketIsUsed_(it) {
  // ponytail: 只看實際商品標題與品相，不再採計 query。查詢字串一律含「中古/used」會讓此判定恆真，
  //           導致全新刊登價也被當成二手樣本；改為僅憑標題/品相判斷二手。
  const text = ((it.title || '') + ' ' + (it.condition || '')).toLowerCase();
  return /中古|二手|used|pre-owned|preowned|second hand|secondhand|良品|美品|ジャンク/.test(text);
}

function marketTwdFx_(currency, p) {
  currency = (currency || '').toUpperCase();
  if (!currency) return null;
  if (currency === 'TWD') return { rate: 1, provider: 'TWD', updated_at: '' };
  const settingsRate = currency === 'JPY'
    ? Number(p && p.fx_jpy)
    : (currency === 'USD' ? Number(p && p.fx_usd) : 0);
  if (settingsRate && settingsRate > 0) {
    return { rate: settingsRate, provider: 'GameVault Settings', updated_at: '' };
  }
  try {
    const url = 'https://open.er-api.com/v6/latest/' + encodeURIComponent(currency);
    const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true, headers: { 'Accept': 'application/json' } });
    if (res.getResponseCode() !== 200) return null;
    const d = JSON.parse(res.getContentText('UTF-8'));
    const rate = d && d.rates && Number(d.rates.TWD);
    if (!rate || rate <= 0) return null;
    return {
      rate: rate,
      provider: 'ExchangeRate-API',
      updated_at: d.time_last_update_utc || ''
    };
  } catch (e) {
    return null;
  }
}

function marketRakutenPrices_(queries, appid, accesskey) {
  let out = [];
  (queries || []).slice(0, 6).forEach(function(q) {
  const url = 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20220601?format=json' +
    '&applicationId=' + encodeURIComponent(appid) +
    '&accessKey=' + encodeURIComponent(accesskey) +
    '&keyword=' + encodeURIComponent(q) + '&hits=10&sort=%2BitemPrice';
  try {
    const res = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      headers: { 'Referer': 'https://reteogame.netlify.app/', 'Origin': 'https://reteogame.netlify.app' }
    });
    if (res.getResponseCode() !== 200) return [];
    const d = JSON.parse(res.getContentText('UTF-8'));
    out = out.concat((d.Items || []).map(function(x) {
      const it = x.Item || {};
      return { source: 'Rakuten JP', title: it.itemName || '', price: it.itemPrice, currency: 'JPY', url: it.itemUrl || '', query: q };
    }));
  } catch (e) {}
  });
  return out;
}

function marketYahooJapanPrices_(queries, appid) {
  let out = [];
  (queries || []).slice(0, 6).forEach(function(q) {
  const url = 'https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch?appid=' +
    encodeURIComponent(appid) + '&query=' + encodeURIComponent(q) + '&results=10&sort=%2Bprice';
  try {
    const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true, headers: { 'Accept': 'application/json' } });
    if (res.getResponseCode() !== 200) return [];
    const d = JSON.parse(res.getContentText('UTF-8'));
    out = out.concat((d.hits || []).map(function(it) {
      return { source: 'Yahoo JP', title: it.name || '', price: it.price, currency: 'JPY', url: it.url || '', query: q, condition: it.condition || '' };
    }));
  } catch (e) {}
  });
  return out;
}

function marketEbayToken_(clientId, clientSecret) {
  const raw = Utilities.base64Encode(clientId + ':' + clientSecret);
  const res = UrlFetchApp.fetch('https://api.ebay.com/identity/v1/oauth2/token', {
    method: 'post',
    muteHttpExceptions: true,
    headers: {
      'Authorization': 'Basic ' + raw,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    payload: 'grant_type=client_credentials&scope=' + encodeURIComponent('https://api.ebay.com/oauth/api_scope')
  });
  if (res.getResponseCode() !== 200) return '';
  const d = JSON.parse(res.getContentText('UTF-8'));
  return d.access_token || '';
}

function marketEbayPrices_(queries, clientId, clientSecret) {
  try {
    const token = marketEbayToken_(clientId, clientSecret);
    if (!token) return [];
    let out = [];
    (queries || []).slice(0, 6).forEach(function(q) {
    const url = 'https://api.ebay.com/buy/browse/v1/item_summary/search?q=' + encodeURIComponent(q) + '&limit=10';
    const res = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      headers: { 'Authorization': 'Bearer ' + token, 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US', 'Accept': 'application/json' }
    });
    if (res.getResponseCode() !== 200) return;
    const d = JSON.parse(res.getContentText('UTF-8'));
    out = out.concat((d.itemSummaries || []).map(function(it) {
      const price = it.price || {};
      const cond = it.condition || it.conditionId || '';
      return { source: 'eBay US', title: it.title || '', price: price.value, currency: price.currency || 'USD', url: it.itemWebUrl || '', query: q, condition: cond };
    }));
    });
    return out;
  } catch (e) { return []; }
}
 
// ── 楽天ブックス 書籍検索 API Proxy─────────────────
// ISBN 直查日文書籍書誌＋書影；共用楽天雙鑰與 Referer 設定；結果走 Cache 工作表（7 天）
function rakutenBooksProxy(isbn, appid, accesskey) {
  if (!isbn || !appid || !accesskey) return { error: 'missing params' };
  const ck = 'rakutenbk_' + isbn;
  const cached = getCache(ck);
  if (cached) return cached;
  const url = 'https://openapi.rakuten.co.jp/services/api/BooksBook/Search/20170404?format=json' +
    '&applicationId=' + encodeURIComponent(appid) +
    '&accessKey=' + encodeURIComponent(accesskey) +
    '&isbn=' + encodeURIComponent(isbn) + '&hits=1';
  try {
    const res = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      headers: { 'Referer': 'https://reteogame.netlify.app/', 'Origin': 'https://reteogame.netlify.app' }
    });
    const code = res.getResponseCode();
    const text = res.getContentText('UTF-8');
    if (code !== 200) return _rakutenHttpErr(code, text);
    const d = JSON.parse(text);
    if (!d.Items || !d.Items.length) return { notfound: true };
    const it = d.Items[0].Item || {};
    let img = it.largeImageUrl || it.mediumImageUrl || '';
    if (img) img = img.replace(/\?_ex=\d+x\d+/, '?_ex=600x600'); // 拉高書影解析度
    const out = {
      title: it.title || '',
      author: it.author || '',
      publisher: it.publisherName || '',
      sales_date: it.salesDate || '',
      isbn: it.isbn || '',
      image: img,
      caption: it.itemCaption || '',
      item_url: it.itemUrl || ''
    };
    setCache(ck, out);
    return out;
  } catch (e) { return { error: e.message }; }
}
 
// ── NDL Search（國立國會圖書館）OpenSearch Proxy────
// ISBN 查詢日本出版品書誌；XML → JSON；結果走 Cache 工作表（7 天）
function ndlProxy(isbn) {
  if (!isbn) return { error: 'missing params' };
  const ck = 'ndl_' + isbn;
  const cached = getCache(ck);
  if (cached) return cached;
  const url = 'https://ndlsearch.ndl.go.jp/api/opensearch?isbn=' + encodeURIComponent(isbn) + '&cnt=1';
  try {
    const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (res.getResponseCode() !== 200) return { error: 'HTTP ' + res.getResponseCode() };
    const doc = XmlService.parse(res.getContentText('UTF-8'));
    const channel = doc.getRootElement().getChild('channel');
    if (!channel) return { notfound: true };
    const item = channel.getChild('item');
    if (!item) return { notfound: true };
    const dc = XmlService.getNamespace('dc', 'http://purl.org/dc/elements/1.1/');
    const dcterms = XmlService.getNamespace('dcterms', 'http://purl.org/dc/terms/');
    const t = function (name, ns) {
      const c = ns ? item.getChild(name, ns) : item.getChild(name);
      return c ? c.getText() : '';
    };
    const out = {
      title: t('title'),
      publisher: t('publisher', dc),
      author: t('creator', dc),
      pub_date: t('issued', dcterms) || t('date', dc) || t('pubDate')
    };
    if (!out.title) return { notfound: true };
    setCache(ck, out);
    return out;
  } catch (e) { return { error: e.message }; }
}

// ── Google Books API Proxy（ISBN 直查；免金鑰）────────────
// 作為 Open Library / openBD / NDL 的後備來源，補英文攻略本與海外書籍的封面、作者、簡介。
function googleBooksProxy(isbn) {
  if (!isbn) return { error: 'missing params' };
  isbn = String(isbn).replace(/[-\s]/g, '');
  const ck = 'googlebooks_' + isbn;
  const cached = getCache(ck);
  if (cached) return cached;
  const url = 'https://www.googleapis.com/books/v1/volumes?q=isbn:' +
    encodeURIComponent(isbn) + '&maxResults=1&printType=books';
  try {
    const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const code = res.getResponseCode();
    const text = res.getContentText('UTF-8');
    if (code !== 200) return { error: 'Google Books HTTP ' + code };
    const d = JSON.parse(text);
    if (!d.items || !d.items.length) return { notfound: true };
    const info = d.items[0].volumeInfo || {};
    const ids = info.industryIdentifiers || [];
    const foundIsbn = (ids.find(function(x) { return x.type === 'ISBN_13'; }) ||
      ids.find(function(x) { return x.type === 'ISBN_10'; }) || {}).identifier || isbn;
    const imageLinks = info.imageLinks || {};
    const img = imageLinks.extraLarge || imageLinks.large || imageLinks.medium ||
      imageLinks.thumbnail || imageLinks.smallThumbnail || '';
    const out = {
      title: info.title || '',
      subtitle: info.subtitle || '',
      author: (info.authors || []).join(', '),
      publisher: info.publisher || '',
      published_date: info.publishedDate || '',
      isbn: foundIsbn,
      image: img ? img.replace(/^http:/, 'https:') : '',
      caption: info.description || '',
      item_url: info.infoLink || info.previewLink || '',
      page_count: info.pageCount || '',
      language: info.language || '',
      categories: (info.categories || []).join(', ')
    };
    if (!out.title) return { notfound: true };
    setCache(ck, out);
    return out;
  } catch (e) { return { error: e.message }; }
}

// ── 數位遊戲：商店頁面 Meta 標籤擷取 Proxy（v42.14）──────────────
// 只抓 Open Graph / meta 標籤，不解析整頁 DOM，避免 token 浪費；JS 動態渲染的頁面（如 PSN 網頁版）可能抓不到。
function fetchStorePageProxy(url) {
  if (!url) return { error: 'missing params' };
  if (!/^https?:\/\//i.test(url)) return { error: 'invalid url' };
  // v42.20a1：改用 MD5 雜湊整個網址產生快取鍵。舊版 base64 截斷前 40 碼的做法，
  // 對 Steam 這種共同前綴（https://store.steampowered.com/app/）超過 30 bytes 的網址，
  // 前 40 碼 base64 完全由前 30 bytes 決定，導致不同商品網址算出同一把快取鍵、永遠回傳第一次快取的結果。
  const ck = 'storepage_' + Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, url)
    .map(function(b){ return (b < 0 ? b + 256 : b).toString(16).padStart(2, '0'); }).join('');
  const cached = getCache(ck);
  if (cached) return cached;
  // v42.14a2：Steam 官方 API 優先，失敗（含被雲端 IP 擋掉）時退回 meta 標籤擷取當備援，不直接放棄
  let steamErr = '';
  const steamMatch = url.match(/store\.steampowered\.com\/app\/(\d+)/i);
  if (steamMatch) {
    const out = fetchSteamAppDetails(steamMatch[1], url);
    if (out && !out.error) { setCache(ck, out); return out; }
    steamErr = (out && out.error) || 'Steam API 無回應';
  }
  try {
    const out = fetchMetaTagsWithAgeGateRetry(url);
    if (!out.title) {
      return { error: 'no_meta_found', hint: steamErr ? ('Steam API 失敗（' + steamErr + '），meta 標籤也擷取不到') : '此頁面可能由 JS 動態載入內容，原始 HTML 內取不到標題' };
    }
    setCache(ck, out);
    return out;
  } catch (e) { return { error: e.message, hint: steamErr ? ('Steam API 失敗：' + steamErr) : '' }; }
}

// Steam 官方商店 API：不需要金鑰，直接回傳結構化資料，繞開年齡驗證頁問題
function fetchSteamAppDetails(appid, originalUrl) {
  const url = 'https://store.steampowered.com/api/appdetails?appids=' + encodeURIComponent(appid) + '&l=tchinese';
  try {
    const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (res.getResponseCode() !== 200) return { error: 'Steam API HTTP ' + res.getResponseCode() };
    const d = JSON.parse(res.getContentText('UTF-8'));
    const entry = d && d[appid];
    if (!entry || !entry.success || !entry.data) return { error: 'Steam API 查無此商品，appid=' + appid };
    const g = entry.data;
    return {
      title: g.name || '',
      description: (g.short_description || '').slice(0, 500),
      image: g.header_image || '',
      siteName: 'Steam',
      url: originalUrl,
      developer: (g.developers || []).join(', '),
      publisher: (g.publishers || []).join(', '),
      release_date: g.release_date ? (g.release_date.date || '') : '',
      genre: (g.genres || []).map(function(x){ return x.description; }).join(', ')
    };
  } catch (e) { return { error: e.message }; }
}

// 一般商店頁 meta 標籤擷取：先不帶 cookie 試一次，若標題像年齡驗證頁再帶生日/成人內容 cookie 重試一次
function fetchMetaTagsWithAgeGateRetry(url) {
  function doFetch(withAgeCookie) {
    const opts = {
      muteHttpExceptions: true,
      followRedirects: true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'zh-TW,zh;q=0.9,ja;q=0.8,en;q=0.7'
      }
    };
    if (withAgeCookie) {
      opts.headers['Cookie'] = 'birthtime=0; lastagecheckage=1-0-1970; wants_mature_content=1; age_gate=1';
    }
    const res = UrlFetchApp.fetch(url, opts);
    if (res.getResponseCode() !== 200) return { error: 'HTTP ' + res.getResponseCode() };
    return { html: res.getContentText('UTF-8') };
  }
  function extract(html) {
    const pick = function(re) {
      const m = html.match(re);
      if (!m) return '';
      return m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&#x27;/g, "'").trim();
    };
    const title = pick(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
                  pick(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i) ||
                  pick(/<title[^>]*>([^<]+)<\/title>/i);
    const description = pick(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
                         pick(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i) ||
                         pick(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
    const image = pick(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                  pick(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    const siteName = pick(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i);
    return { title: title, description: description.slice(0, 500), image: image, siteName: siteName };
  }
  const r1 = doFetch(false);
  if (r1.error) return { title: '' };
  let ext = extract(r1.html);
  // 標題疑似年齡驗證/國家選擇頁（常見字樣），帶 cookie 重試一次
  const looksLikeGate = !ext.title || /age.?check|age.?gate|年齡|verify|welcome to steam|country/i.test(ext.title);
  if (looksLikeGate) {
    const r2 = doFetch(true);
    if (!r2.error) {
      const ext2 = extract(r2.html);
      if (ext2.title) ext = ext2;
    }
  }
  ext.url = url;
  return ext;
}
 
// ── TheGamesDB API Proxy ──────────────────────────────────────
function tgdbProxy(q, key) {
  if (!q || !key) return { error: 'missing params' };
  const url = 'https://api.thegamesdb.net/v1/Games/ByGameName?apikey=' + encodeURIComponent(key) +
    '&name=' + encodeURIComponent(q) +
    '&fields=overview,genres,developers,publishers,platform,release_date' +
    '&include=genres';
  try {
    const res = UrlFetchApp.fetch(url, {
      headers: { 'Accept': 'application/json' },
      muteHttpExceptions: true
    });
    const code = res.getResponseCode();
    const text = res.getContentText('UTF-8');
    if (code === 401 || code === 403) return { error: 'TheGamesDB API Key 無效，請重新申請', data: null };
    if (code === 404) return { error: 'TheGamesDB 端點不存在（API 版本可能有變）', data: null };
    if (code !== 200) return { error: 'HTTP ' + code, data: null };
    if (!text || text.trimStart().startsWith('<')) return { error: 'TGDB 回傳非 JSON', data: null };
    return JSON.parse(text);
  } catch (e) { return { error: e.message, data: null }; }
}
 
// ── Barcode Lookup API Proxy ──────────────────────────────────
function barcodeLookupProxy(barcode, key) {
  if (!barcode || !key) return { error: 'missing params' };
  const url = 'https://api.barcodelookup.com/v3/products?barcode=' + barcode +
    '&formatted=y&key=' + key;
  try {
    const res = UrlFetchApp.fetch(url, {
      headers: { 'Accept': 'application/json' },
      muteHttpExceptions: true
    });
    const code = res.getResponseCode();
    const text = res.getContentText('UTF-8');
    if (code === 401 || code === 403) return { error: 'Barcode Lookup API Key 無效，請重新申請' };
    if (code === 429) return { error: '請求過於頻繁，請稍後再試' };
    if (code !== 200) return { error: 'HTTP ' + code };
    if (!text || text.trimStart().startsWith('<')) return { error: 'Barcode Lookup 回傳非 JSON' };
    return JSON.parse(text);
  } catch (e) { return { error: e.message }; }
}
 
// ── ScreenScraper.fr API Proxy ──────────────────────────────
// 光碟媒體的系統 systemeid（序號查詢時才帶 romtype=iso；其餘卡帶/卡片系統不帶）
const DISC_SYSIDS = {
  '13':1,'16':1,'18':1,'20':1,'22':1,'23':1,'29':1,'32':1,'33':1,'34':1,
  '57':1,'58':1,'59':1,'60':1,'61':1,'70':1,'72':1,'114':1,'130':1,'133':1,'171':1,'172':1
};
// API 文件：https://www.screenscraper.fr/api2.php
// 查詢端點：jeuInfos.php（支援序號、名稱查詢）
// 開發者帳號：https://www.screenscraper.fr/forumsujets.php?frub=12
function screenScraperProxy(q, ssid, sspass, systemeid, serialnum, devid, devpass, region) {
  if (!q && !serialnum) return { error: 'missing query', game: null };
  if (!ssid || !sspass) return { error: 'missing ScreenScraper credentials', game: null };
 
  const devId = (devid || '').trim();
  const devPass = (devpass || '').trim();
  if (!devId || !devPass) return { error: '尚未設定 ScreenScraper 開發者帳密（請至設定頁填入 devid / devpassword）', game: null };
  const softname = 'GameVault';
  // 媒體（封面/書背/背面）下載授權字串：附在 SS 圖片 URL 後讓伺服器端可取得圖檔
  const authQS = '&softname=' + encodeURIComponent(softname) +
    '&ssid=' + encodeURIComponent(ssid) + '&sspassword=' + encodeURIComponent(sspass) +
    '&devid=' + encodeURIComponent(devId) + '&devpassword=' + encodeURIComponent(devPass);
 
  // 建立查詢 URL
  let url = 'https://www.screenscraper.fr/api2/jeuInfos.php' +
    '?devid=' + encodeURIComponent(devId) +
    '&devpassword=' + encodeURIComponent(devPass) +
    '&softname=' + encodeURIComponent(softname) +
    '&ssid=' + encodeURIComponent(ssid) +
    '&sspassword=' + encodeURIComponent(sspass) +
    '&output=json';
 
  // 序號查詢優先（最精確）
  if (serialnum) {
    url += '&serialnum=' + encodeURIComponent(serialnum);
    // 僅光碟系統帶 romtype=iso；卡帶/卡片系統不帶（否則序號比對失準）
    if (systemeid && DISC_SYSIDS[String(systemeid)]) url += '&romtype=iso';
  } else {
    // 文字名稱查詢（jeuRecherche.php）
    url = 'https://www.screenscraper.fr/api2/jeuRecherche.php' +
      '?devid=' + encodeURIComponent(devId) +
      '&devpassword=' + encodeURIComponent(devPass) +
      '&softname=' + encodeURIComponent(softname) +
      '&ssid=' + encodeURIComponent(ssid) +
      '&sspassword=' + encodeURIComponent(sspass) +
      '&output=json' +
      '&recherche=' + encodeURIComponent(q);
  }
 
  if (systemeid) url += '&systemeid=' + encodeURIComponent(systemeid);
 
  try {
    const res = UrlFetchApp.fetch(url, {
      headers: {
        'User-Agent': 'GameVault/2.0 (Google Apps Script)',
        'Accept': 'application/json'
      },
      muteHttpExceptions: true
    });
 
    const code = res.getResponseCode();
    const text = res.getContentText('UTF-8');
 
    if (code === 401) return { error: 'ScreenScraper 帳號密碼錯誤', game: null };
    if (code === 403) return { error: 'ScreenScraper 每日限額已用完，明天再試', game: null };
    if (code === 404) return { error: 'ScreenScraper 找不到遊戲', game: null };
    if (code === 430) return { error: 'ScreenScraper API 關閉中，請稍後', game: null };
    if (code !== 200) return { error: 'ScreenScraper HTTP ' + code, game: null };
 
    if (!text || text.trim() === '') return { error: 'ScreenScraper 回傳空白', game: null };
 
    // 先嘗試解析 JSON：成功代表 SS 正常回應，一律依結構判斷。
    // 注意：SS 正常回應的 ssuser 區塊含 quotarefu 等欄位名，故下方關鍵字掃描
    // 必須「僅在 JSON 解析失敗時」執行，否則 /quota/ 會誤撞 quotarefu 把成功回應判成登入失敗。
    let json = null;
    try { json = JSON.parse(text); }
    catch (e) { json = null; }
 
    if (json) {
      // jeuInfos 回傳格式：{ response: { jeu: {...} } }
      if (json.response && json.response.jeu) {
        return { game: parseSSGame(json.response.jeu, authQS), source: 'screenscraper' };
      }
      // jeuRecherche 回傳格式：{ response: { jeux: [...] } }
      if (json.response && json.response.jeux && json.response.jeux.length > 0) {
        return { game: parseSSGame(json.response.jeux[0], authQS), source: 'screenscraper' };
      }
      return { error: 'ScreenScraper 無資料', game: null };
    }
 
    // JSON 解析失敗 → SS 以純文字回傳錯誤（登入失敗 / 配額 / API 關閉）
    if (/Erreur de login|Identifiants|API totalement ferm|API fermé|API closed|quota/i.test(text)) {
      return { error: 'ScreenScraper 登入失敗：請確認開發者帳密(devid/devpassword)與會員帳密是否正確（原訊息：' + text.slice(0, 80).replace(/\s+/g, ' ').trim() + '）', game: null };
    }
    return { error: 'ScreenScraper 回應非預期格式：' + text.slice(0, 100).replace(/\s+/g, ' ').trim(), game: null };
 
  } catch (e) {
    return { error: '連線失敗：' + e.message, game: null };
  }
}
 
// 解析 ScreenScraper 回傳的遊戲資料
function parseSSGame(jeu, authQS) {
  if (!jeu) return {};
  authQS = authQS || '';
 
  // 取出多語言文字（優先順序：zh-Hant > zh > en > ja > fr > 第一個）
  function getText(arr, field) {
    if (!arr) return '';
    const items = Array.isArray(arr) ? arr : [arr];
    const pref = ['zh-Hant','zh','en','en-us','ja','fr'];
    for (const lang of pref) {
      const found = items.find(i => i.langue === lang && i[field]);
      if (found) return found[field];
    }
    return items[0] ? (items[0][field] || '') : '';
  }
 
  // 取出指定語言的文字（日文名用）
  function getLang(arr, field, lang) {
    if (!arr) return '';
    const items = Array.isArray(arr) ? arr : [arr];
    const f = items.find(i => i.langue === lang && i[field]);
    return f ? (f[field] || '') : '';
  }
 
  // 取出日期（優先順序：jp > wor > us > eu）
  function getDate(arr) {
    if (!arr) return '';
    const items = Array.isArray(arr) ? arr : [arr];
    const pref = ['jp','wor','us','eu'];
    for (const r of pref) {
      const found = items.find(i => i.region === r && i.text);
      if (found) return found.text;
    }
    return items[0] ? (items[0].text || '') : '';
  }
 
  // 各地區發售日（region→date），供前端依手上版本挑選
  function getDatesByRegion(arr) {
    if (!arr) return {};
    const items = Array.isArray(arr) ? arr : [arr];
    const out = {};
    items.forEach(i => { if (i.region && i.text && !out[i.region]) out[i.region] = i.text; });
    return out;
  }
 
  // 對 SS 媒體 URL 附上授權參數（伺服器端下載圖檔需要）
  function authMedia(u) {
    if (!u) return '';
    if (authQS && u.indexOf('screenscraper.fr') >= 0 && u.indexOf('ssid=') < 0) {
      return u + (u.indexOf('?') >= 0 ? authQS : ('?' + authQS.replace(/^&/, '')));
    }
    return u;
  }
 
  // 取出指定媒體類型的 URL（日版優先：jp > asi > wor > us > eu）
  function getMediaUrl(medias, type) {
    if (!medias || !medias.jeuMedias) return '';
    const list = medias.jeuMedias.filter(m => m.type === type);
    // 依使用者選擇的區域動態調整優先序；未指定或未匹配時退回預設順序
    let pref = ['jp','asi','wor','us','eu',''];
    if (region) {
      const rg = String(region).toLowerCase();
      let primary = '';
      if (rg.indexOf('jp') >= 0 || rg.indexOf('japan') >= 0) primary = 'jp';
      else if (rg.indexOf('us') >= 0 || rg.indexOf('usa') >= 0 || rg.indexOf('america') >= 0) primary = 'us';
      else if (rg.indexOf('eu') >= 0 || rg.indexOf('europe') >= 0) primary = 'eu';
      else if (rg.indexOf('asi') >= 0 || rg.indexOf('taiwan') >= 0 || rg.indexOf('hong') >= 0) primary = 'asi';
      else if (rg.indexOf('multi') >= 0 || rg.indexOf('world') >= 0) primary = 'wor';
      if (primary) pref = [primary].concat(pref.filter(p => p !== primary));
    }
    for (const r of pref) {
      const found = list.find(c => (c.region === r) || (r === '' && !c.region));
      if (found) return authMedia(found.url || '');
    }
    return list[0] ? authMedia(list[0].url || '') : '';
  }
 
  const title = getText(jeu.noms, 'text') || jeu.romnom || '';
  const jpName = getLang(jeu.noms, 'text', 'ja');
  const genre = (jeu.genres && jeu.genres.length > 0)
    ? jeu.genres.map(g => getText(g.noms, 'text') || g.id).filter(Boolean).join(', ')
    : '';
  const synopsis = getText(jeu.synopsis, 'text');
 
  return {
    primary_name: title,
    jp_name: jpName,
    platform: jeu.systeme ? (jeu.systeme.text || '') : '',
    developer: jeu.developpeur ? (jeu.developpeur.text || '') : '',
    publisher: jeu.editeur ? (jeu.editeur.text || '') : '',
    release_date: getDate(jeu.dates),
    release_dates: getDatesByRegion(jeu.dates),
    genre: genre,
    summary: synopsis,
    players: jeu.joueurs ? (jeu.joueurs.text || '') : '',
    age_rating: (jeu.classifications && jeu.classifications.length > 0)
      ? jeu.classifications[0].text || '' : '',
    ref_link: 'https://www.screenscraper.fr/gameinfos.php?plateforme=0&gameid=' + (jeu.id || ''),
    cover_url: getMediaUrl(jeu.medias, 'box-2D'),       // 封面
    spine_url: getMediaUrl(jeu.medias, 'box-2D-side'),  // 書背/側邊
    back_url: getMediaUrl(jeu.medias, 'box-2D-back')    // 背面
  };
}
 
// ── UUID 搜尋函數 ──────────────────────────────────────────
function findRowByUuid(uuid) {
  const types = ['game', 'book', 'console', 'peripheral', 'hunt',
    'digigame', 'digidlc', 'digicomic', 'digiartbook', 'digiguide', 'digimag', 'digiaudio', 'digivideo',
    'ost', 'artbook', 'figure'];
  for (const type of types) {
    try {
      const { sheet, headers } = getSheet(type);
      const uuidCol = headers.indexOf('uuid');
      if (uuidCol < 0) continue;
      const last = sheet.getLastRow();
      if (last <= 1) continue;
      const col = sheet.getRange(2, uuidCol + 1, last - 1, 1).getValues();
      for (let i = 0; i < col.length; i++) {
        if (col[i][0] === uuid) return { row: i + 2, type };
      }
    } catch(e) { continue; }
  }
  return null;
}
 
// ── 解析 Google 地圖分享連結 → 座標或地址（狩獵縮圖用）──
//    座標優先（@lat,lng 或 !3d!4d）；無座標則回 /place/ 路徑的地址字串。
function resolveMapLink(url) {
  url = (url || '').trim();
  if (!url) return { ok: false, error: '缺少 url' };
  try {
    let finalUrl = url;
    for (let i = 0; i < 5; i++) {
      const res = UrlFetchApp.fetch(finalUrl, { followRedirects: false, muteHttpExceptions: true });
      const code = res.getResponseCode();
      if (code >= 300 && code < 400) {
        const hdr = res.getHeaders() || {};
        const loc = hdr['Location'] || hdr['location'];
        if (!loc) break;
        finalUrl = loc;
      } else {
        break;
      }
    }
    let m = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (m) return { ok: true, lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
    m = finalUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (m) return { ok: true, lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
    m = finalUrl.match(/\/place\/([^\/@?]+)/);
    if (m) {
      let addr = '';
      try { addr = decodeURIComponent(m[1].replace(/\+/g, ' ')).trim(); } catch (e) { addr = m[1].replace(/\+/g, ' ').trim(); }
      if (addr) return { ok: true, addr: addr };
    }
    return { ok: false, error: '無法從連結解析位置' };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
 
// ── 修復工作表標題列 ──────────────────────────────
function fixSheetHeaders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const results = {};
 
  function fixSheet(sheetName, headers) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
      return 'created';
    }
    const lastCol = sheet.getLastColumn();
    // 確保欄數足夠（新增欄位後自動補欄，避免 setValues 超出範圍）
    if (sheet.getMaxColumns() < headers.length) {
      sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
    }
    const headerRow = sheet.getRange(1, 1, 1, Math.max(lastCol, headers.length)).getValues()[0];
    const firstCell = headerRow[0];
 
    // 偵測 uuid 欄在錯誤位置（第2欄）的情況
    if (firstCell === 'category' && headerRow[1] === 'uuid') {
      // uuid 在第2欄是舊錯誤部署造成的，需刪除第2欄
      sheet.deleteColumn(2);
      Logger.log('fixSheet: 刪除錯誤位置的 uuid 欄（col 2）in ' + sheetName);
      // 重新讀取 header 並擴展到正確欄數
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
      return 'uuid_col_removed_and_header_updated';
    } else if (firstCell !== 'category') {
      sheet.insertRowBefore(1);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
      return 'header_inserted';
    } else {
      // 確保 header 完整正確
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      return 'header_updated';
    }
  }
 
  results.games       = fixSheet(GAMES_SHEET,   GAME_HEADERS);
  results.books       = fixSheet(BOOKS_SHEET,    BOOK_HEADERS);
  results.consoles    = fixSheet(CONSOLE_SHEET,  CONSOLE_HEADERS);
  results.peripherals = fixSheet(PERIPH_SHEET,   PERIPH_HEADERS);
  results.hunt        = fixSheet(HUNT_SHEET,     HUNT_HEADERS);
  results.digigame    = fixSheet(DIGIGAME_SHEET,    DIGIGAME_HEADERS);
  results.digidlc     = fixSheet(DIGIDLC_SHEET,     DIGIDLC_HEADERS);
  results.digicomic   = fixSheet(DIGICOMIC_SHEET,   DIGICOMIC_HEADERS);
  results.digiartbook = fixSheet(DIGIARTBOOK_SHEET, DIGIARTBOOK_HEADERS);
  results.digiguide   = fixSheet(DIGIGUIDE_SHEET,   DIGIGUIDE_HEADERS);
  results.digimag     = fixSheet(DIGIMAG_SHEET,     DIGIMAG_HEADERS);
  results.digiaudio   = fixSheet(DIGIAUDIO_SHEET,   DIGIAUDIO_HEADERS);
  results.digivideo   = fixSheet(DIGIVIDEO_SHEET,   DIGIVIDEO_HEADERS);
  results.ost         = fixSheet(OST_SHEET,      OST_HEADERS);
  results.artbook     = fixSheet(ARTBOOK_SHEET,  ARTBOOK_HEADERS);
  results.figures     = fixSheet(FIGURE_SHEET,   FIGURE_HEADERS);
  // 補全舊資料的 uuid（無 uuid 的列自動填入）
  results.uuids_filled = backfillUuids();
  Logger.log('fixSheetHeaders: ' + JSON.stringify(results));
  return { ok: true, results };
}

// ── v43.01 一次性遷移工具：把原本混在 Games 表的四個分類搬到各自獨立工作表 ──
// 使用方式（建議先在試算表「檔案 > 建立副本」備份一份再執行，以防萬一）：
//   1. 在 Apps Script 編輯器上方函式下拉選單選 migrateLegacyCategoriesToNewSheets，按執行
//   2. 到試算表檢查 Digital / OST / Artbook / Figures 四個新分頁資料是否正確
//   3. 確認無誤後，再執行 deleteLegacyMigratedRowsFromGames() 清掉 Games 表裡的舊資料列
//   注意：Games 表原本就沒有 illustrator/binding/composer/character 等分類專屬欄位，
//   這些欄位的舊資料本來就沒存到，遷移只能搬「原本就有存到」的欄位，救不回本來就沒存到的部分。
function migrateLegacyCategoriesToNewSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const gamesSheet = ss.getSheetByName(GAMES_SHEET);
  if (!gamesSheet) return { ok: false, error: '找不到 Games 工作表' };
  const last = gamesSheet.getLastRow();
  if (last <= 1) return { ok: true, msg: 'Games 工作表沒有資料列' };

  const gameHeaders = gamesSheet.getRange(1, 1, 1, gamesSheet.getLastColumn()).getValues()[0];
  const catIdx = gameHeaders.indexOf('category');
  if (catIdx < 0) return { ok: false, error: 'Games 工作表找不到 category 欄' };

  const data = gamesSheet.getRange(2, 1, last - 1, gameHeaders.length).getValues();

  const targets = {
    'digital': { match: ['數位下載版', '數位遊戲'] },
    'ost':     { match: ['原聲帶'] },
    'artbook': { match: ['動漫/美術設定集', '畫集', '設定集'] },
    'figure':  { match: ['公仔', '模型'] }
  };

  const counts = {};
  Object.keys(targets).forEach(function(key) {
    const t = targets[key];
    const destSheetObj = getSheet(key); // 確保工作表存在且標題列正確
    const destSheet = destSheetObj.sheet;
    const destHeaders = destSheetObj.headers;
    let n = 0;
    data.forEach(function(row) {
      const cat = String(row[catIdx] || '').trim();
      if (t.match.indexOf(cat) < 0) return;
      const mapped = destHeaders.map(function(h) {
        const srcIdx = gameHeaders.indexOf(h);
        return srcIdx >= 0 ? row[srcIdx] : '';
      });
      destSheet.appendRow(mapped);
      n++;
    });
    counts[key] = n;
  });

  Logger.log('migrateLegacyCategoriesToNewSheets: ' + JSON.stringify(counts));
  return { ok: true, msg: '已複製到新工作表（Games 表原始資料未刪除，請先核對再執行 deleteLegacyMigratedRowsFromGames）', counts: counts };
}

// 第二步：確認新工作表資料無誤後才執行，刪除 Games 表裡已搬移的舊分類列
function deleteLegacyMigratedRowsFromGames() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const gamesSheet = ss.getSheetByName(GAMES_SHEET);
  if (!gamesSheet) return { ok: false, error: '找不到 Games 工作表' };
  const last = gamesSheet.getLastRow();
  if (last <= 1) return { ok: true, msg: 'Games 工作表沒有資料列' };

  const gameHeaders = gamesSheet.getRange(1, 1, 1, gamesSheet.getLastColumn()).getValues()[0];
  const catIdx = gameHeaders.indexOf('category');
  if (catIdx < 0) return { ok: false, error: 'Games 工作表找不到 category 欄' };

  const matchAll = ['數位下載版', '數位遊戲', '原聲帶', '動漫/美術設定集', '畫集', '設定集', '公仔', '模型'];
  const data = gamesSheet.getRange(2, 1, last - 1, gameHeaders.length).getValues();
  let deleted = 0;
  // 由下往上刪，避免刪除過程列號位移
  for (let i = data.length - 1; i >= 0; i--) {
    const cat = String(data[i][catIdx] || '').trim();
    if (matchAll.indexOf(cat) >= 0) {
      gamesSheet.deleteRow(i + 2);
      deleted++;
    }
  }
  Logger.log('deleteLegacyMigratedRowsFromGames: deleted ' + deleted + ' rows');
  return { ok: true, deleted: deleted };
}

// ── v47.01 一次性遷移工具：把舊的單一 Digital 表資料依子類型搬到 8 個新工作表 ──
// 使用方式（建議先在試算表「檔案 > 建立副本」備份一份再執行）：
//   1. 執行 migrateDigitalToSubtypeSheets，複製到 DigiGame/DigiDLC/DigiComic/... 8 個新分頁
//   2. 到試算表檢查 8 個新分頁資料是否正確（舊 Digital 表原始資料不會被動到）
//   3. 確認無誤後，執行 deleteDigitalSheetAfterMigration() 整張刪除舊的 Digital 表
function migrateDigitalToSubtypeSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const oldSheet = ss.getSheetByName('Digital');
  if (!oldSheet) return { ok: true, msg: '找不到舊的 Digital 工作表，可能本來就沒有資料或已經搬移過' };
  const last = oldSheet.getLastRow();
  if (last <= 1) return { ok: true, msg: 'Digital 工作表沒有資料列' };

  const actualHeaders = oldSheet.getRange(1, 1, 1, oldSheet.getLastColumn()).getValues()[0];
  const data = oldSheet.getRange(2, 1, last - 1, oldSheet.getLastColumn()).getValues();
  const subIdx = actualHeaders.indexOf('subtype');

  const routeMap = {
    '追加下載內容': 'digidlc',
    '電子書（漫畫／單行本）': 'digicomic',
    '電子書（畫冊／美術設定）': 'digiartbook',
    '電子書（攻略／公式書）': 'digiguide',
    '電子書（雜誌／MOOK）': 'digimag',
    '數位音源': 'digiaudio',
    '數位影音': 'digivideo'
  };
  const counts = {};
  data.forEach(function(row) {
    const sub = subIdx >= 0 ? String(row[subIdx] || '').trim() : '';
    const type = routeMap[sub] || 'digigame'; // 含「下載版遊戲」與空白/無法辨識的子類型
    const destObj = getSheet(type); // 確保目的地工作表存在且表頭正確
    const mapped = destObj.headers.map(function(h) {
      const srcIdx = actualHeaders.indexOf(h);
      return srcIdx >= 0 ? row[srcIdx] : '';
    });
    destObj.sheet.appendRow(mapped);
    counts[type] = (counts[type] || 0) + 1;
  });

  Logger.log('migrateDigitalToSubtypeSheets: ' + JSON.stringify(counts));
  return { ok: true, msg: '已複製到 8 個子類型工作表（原 Digital 工作表未刪除，請先核對再執行 deleteDigitalSheetAfterMigration）', counts: counts };
}

// 第二步：確認 8 個新分頁資料無誤後才執行，整張刪除舊的 Digital 工作表
function deleteDigitalSheetAfterMigration() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const oldSheet = ss.getSheetByName('Digital');
  if (!oldSheet) return { ok: true, msg: '找不到 Digital 工作表，可能已經刪除過' };
  ss.deleteSheet(oldSheet);
  Logger.log('deleteDigitalSheetAfterMigration: Digital 工作表已刪除');
  return { ok: true, msg: '已刪除舊的 Digital 工作表' };
}

// 為舊資料（uuid 欄位為空）補全 UUID
function backfillUuids() {
  let filled = 0;
  for (const sheetName of [GAMES_SHEET, BOOKS_SHEET, CONSOLE_SHEET, PERIPH_SHEET, HUNT_SHEET,
    DIGIGAME_SHEET, DIGIDLC_SHEET, DIGICOMIC_SHEET, DIGIARTBOOK_SHEET, DIGIGUIDE_SHEET, DIGIMAG_SHEET, DIGIAUDIO_SHEET, DIGIVIDEO_SHEET,
    OST_SHEET, ARTBOOK_SHEET, FIGURE_SHEET]) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) continue;
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const uuidCol = headers.indexOf('uuid');
    if (uuidCol < 0) continue;
    const last = sheet.getLastRow();
    if (last <= 1) continue;
    const uuidData = sheet.getRange(2, uuidCol + 1, last - 1, 1).getValues();
    const updates = [];
    for (let i = 0; i < uuidData.length; i++) {
      if (!uuidData[i][0] || String(uuidData[i][0]).length < 8) {
        updates.push([Utilities.getUuid()]);
        filled++;
      } else {
        updates.push([uuidData[i][0]]);
      }
    }
    if (filled > 0) {
      sheet.getRange(2, uuidCol + 1, last - 1, 1).setValues(updates);
    }
  }
  return filled + ' rows filled';
}
 
