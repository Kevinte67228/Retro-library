#!/usr/bin/env python3
"""
gen_field_mapping.py — 產生 _internal/FIELD_MAPPING.md（欄位對照表）
用法：python3 gen_field_mapping.py <index.html路徑> <輸出路徑>

掃描 index.html 裡所有 ['id','label','type','group'] 格式的欄位定義，
按欄位 id 分組，列出每個 id 底下看過的所有 (顯示名稱, 型別, 分組) 變體，
產生一份 Markdown 對照表。
"""
import re, sys
from collections import defaultdict

TYPE_NAMES = {
    'txt':'單行文字', 'area':'多行文字', 'sel':'單選下拉', 'date':'日期（YYYY/MM/DD）',
    'dateq':'日期（可只填年/年月）', 'price':'金額', 'comp':'完整度', 'multiimg':'多張自訂圖片',
    'imgupload':'圖片上傳', 'autolink':'自動產生查詢連結', 'booktype':'書籍類型選單',
    'genresel':'類型選單', 'langchip':'語言標籤', 'mediasel':'媒體格式選單',
    'platchip':'平台標籤', 'platsel':'平台選單', 'playersel':'人數選單',
    'ratingsel':'分級選單', 'region':'地區', 'regionsel':'地區選單',
    'storagesel':'保管位置選單', 'acctsel':'數位帳號選單', 'hidden':'隱藏欄位（不顯示於表單）',
    'br':'（版面分隔標記，非資料欄位）',
}
DATE_IDS = ['created_at', 'buy_date', 'resale_date', 'release_date', 'test_date', 'event_date', 'loan_due', 'market_value_updated_at']

def main():
    if len(sys.argv) < 3:
        print("用法：python3 gen_field_mapping.py <index.html路徑> <輸出路徑>")
        sys.exit(1)
    html = open(sys.argv[1], encoding='utf-8').read()
    fields = re.findall(r"\['([a-z_0-9]+)','([^']*)','([a-z]+)','([^']+)'\]", html)

    by_id = defaultdict(lambda: defaultdict(int))
    for fid, label, ftype, group in fields:
        by_id[fid][(label, ftype, group)] += 1

    lines = []
    lines.append('# RetroVault 欄位對照表（Google 試算表欄位 ↔ App 顯示名稱）')
    lines.append('')
    lines.append('這份文件列出目前所有分類/子類型用到的欄位，每個欄位的 **id** 就是 Google 試算表的欄位名稱（標題列文字），')
    lines.append('也是 GAS 後端與前端 JS 資料物件裡的 key；**顯示名稱** 是 App 畫面上實際看到的中文標籤。')
    lines.append('')
    lines.append('⚠️ **同一個欄位 id 在不同分類/子類型下，顯示名稱、所屬分組可能不同**（例如 `release_date` 在遊戲類顯示')
    lines.append('「發售日期」，在攻略類顯示「出版日期」）——這是欄位共用機制的設計（不同分類重用同一個底層欄位存資料，')
    lines.append('只是呈現給使用者的標籤依語境調整），不是資料錯誤。下表把同一個 id 底下看過的所有變體都列出來。')
    lines.append('')
    lines.append('此文件由程式碼自動掃描產生（掃描 `docs/index.html` 裡的欄位定義），如果之後新增/修改欄位，')
    lines.append('重新執行同一套掃描腳本即可更新，不需要手動維護（腳本存放在 `_internal/gen_field_mapping.py`）。')
    lines.append('')
    lines.append('---')
    lines.append('')
    lines.append(f'## 依欄位 id 排序的完整對照表（共 {len(by_id)} 個不重複欄位）')
    lines.append('')
    lines.append('| 欄位 id（試算表欄位名稱） | 顯示名稱 | 型別 | 所屬分組 |')
    lines.append('|---|---|---|---|')

    for fid in sorted(by_id.keys()):
        variants = by_id[fid]
        first = True
        for (label, ftype, group), count in sorted(variants.items(), key=lambda x: -x[1]):
            type_display = TYPE_NAMES.get(ftype, ftype)
            id_display = f'`{fid}`' if first else ''
            lines.append(f'| {id_display} | {label} | {type_display} | {group} |')
            first = False

    lines.append('')
    lines.append('---')
    lines.append('')
    lines.append('## 日期型欄位快速索引（呼應 v09.01 的日期格式修正）')
    lines.append('')
    lines.append('這幾個欄位是 GAS 後端 `DATE_TEXT_COLS` 清單裡明確做過純文字格式防呆的日期欄位')
    lines.append('（詳見 `_internal/CHANGELOG.md` v09.01 條目）：')
    lines.append('')
    lines.append('| 欄位 id | 顯示名稱（依分類可能不同） |')
    lines.append('|---|---|')
    for did in DATE_IDS:
        if did in by_id:
            label_set = sorted(set(l for (l,t,g) in by_id[did].keys()))
            lines.append(f'| `{did}` | {"、".join(label_set)} |')
        else:
            lines.append(f'| `{did}` | 建檔時間，系統自動寫入，不在使用者可編輯的欄位表定義中 |')

    content = '\n'.join(lines) + '\n'
    open(sys.argv[2], 'w', encoding='utf-8').write(content)
    print(f'產生完成：{sys.argv[2]}（共 {len(lines)} 行，{len(content)} 字元，{len(by_id)} 個不重複欄位）')

if __name__ == "__main__":
    main()
