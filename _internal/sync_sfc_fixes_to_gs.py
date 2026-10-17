import os
import sys
import json
import csv
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DATA_DIR = os.path.join(BASE_DIR, 'data')

GS_URL = 'https://script.google.com/macros/s/AKfycbz1WWw9O_GmQsam9zmSaiHa88A0uLxb9gW7bSzPFTuwHJ9FPx_Vnqfe_NwB0ZJaUOF5/exec'
APP_TOKEN = 'Compaqmv740+-*//*-+'

# 1. Fetch current rows from Google Sheet
print("[*] 正在從 Google Sheet 取得現有遊戲清單...")
req = urllib.request.Request(f"{GS_URL}?action=list&type=game", headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, timeout=20) as resp:
    gs_data = json.loads(resp.read().decode('utf-8'))

gs_rows = gs_data.get('rows', [])
gs_sfc_by_code = {r.get('code'): r for r in gs_rows if r.get('platform') == 'Super Famicom' and r.get('code')}
print(f"[✓] Google Sheet 現有 SFC 遊戲: {len(gs_sfc_by_code)} 款")

# 2. Load latest full import CSV (57 columns)
csv_by_code = {}
with open(os.path.join(DATA_DIR, 'RetroVault_GS_Games_全量匯入檔.csv'), 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        if row['platform'] == 'Super Famicom':
            csv_by_code[row['code']] = row

print(f"[✓] 本地全量檔 SFC 遊戲: {len(csv_by_code)} 款")

# 3. Target codes that had broken / 404 or duplicate / collided covers
CHANGED_CODES = [
    # Augusta 1 & 2
    'SHVC-GA', 'SHVC-O2',
    # 10 previously 404 missing covers
    'SHVC-IZ', 'SHVC-NK', 'SHVC-A98J', 'SHVC-AH3J-JPN', 'SHVC-2Z',
    'SHVC-DB', 'SHVC-JE', 'SHVC-OJ', 'SHVC-N3', 'SHVC-A4GJ-JPN',
    # Series disambiguation (duplicate / substring collisions)
    'SHVC-S3', 'SHVC-8L-1', 'SHVC-I4', 'SHVC-DQ', 'SHVC-D5', 'SHVC-D6',
    'SHVC-E7', 'SHVC-3M', 'SHVC-2N', 'SHVC-AJ3J-JPN',
    'SHVC-Y1', 'SHVC-Y2', 'SHVC-AYYJ-JPN', 'SHVC-8X', 'SHVC-ADNJ', 'SHVC-A3CJ',
    'SHVC-FN', 'SHVC-A2SJ-JPN', 'SHVC-ANIJ-JPN', 'SHVC-AFGJ-JPN',
    'SHVC-P-ASEJ', 'SHVC-G8', 'SHVC-MW', 'SHVC-P-APXJ', 'SHVC-B9',
    'SHVC-W3', 'SHVC-S8', 'SHVC-OB', 'SHVC-QI', 'SHVC-PM', 'SHVC-8K', 'SHVC-28',
    'SHVC-AO7J', 'SHVC-TK', 'SHVC-TK-1', 'SHVC-AKFE', 'SHVC-P2', 'SHVC-4M',
    'SHVC-EN', 'SHVC-K2', 'SHVC-A3TJ-JPN', 'SHVC-AQ8J-JPN', 'SHVC-AL'
]

targets = []
for code in CHANGED_CODES:
    if code in gs_sfc_by_code and code in csv_by_code:
        gs_row = gs_sfc_by_code[code]
        csv_row = csv_by_code[code]
        # Keep rowNum and uuid from GS row
        fields = dict(csv_row)
        fields['uuid'] = gs_row.get('uuid') or csv_row.get('uuid')
        targets.append({
            'code': code,
            'name': csv_row['primary_name'],
            'rowNum': gs_row['rowNum'],
            'uuid': gs_row.get('uuid'),
            'fields': fields
        })

print(f"[*] 待同步修正至 Google Sheet 的 SFC 遊戲共: {len(targets)} 款")

def update_single(item):
    payload = {
        'action': 'update',
        'rowNum': item['rowNum'],
        'category': '遊戲',
        'fields': item['fields'],
        'app_token': APP_TOKEN
    }
    data_bytes = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(GS_URL, data=data_bytes, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            res = json.loads(resp.read().decode('utf-8'))
            return item['code'], item['name'], item['rowNum'], res.get('ok'), res.get('error')
    except Exception as e:
        return item['code'], item['name'], item['rowNum'], False, str(e)

print(f"[*] 開始多執行緒 (4 workers) 更新 Google Sheet...")
success = 0
failed = []

with ThreadPoolExecutor(max_workers=4) as executor:
    futures = [executor.submit(update_single, item) for item in targets]
    for fut in as_completed(futures):
        code, name, rowNum, ok, err = fut.result()
        if ok:
            success += 1
            print(f"  [✓] 列 {rowNum} [{code}] {name} 更新成功 ({success}/{len(targets)})")
        else:
            failed.append((code, name, rowNum, err))
            print(f"  [✗] 列 {rowNum} [{code}] {name} 失敗: {err}")

print(f"\n=== 同步完成: 成功 {success} 款, 失敗 {len(failed)} 款 ===")
