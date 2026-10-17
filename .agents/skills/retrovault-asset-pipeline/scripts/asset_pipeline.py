"""
RetroVault 圖資爬取、自建鏡像、資料庫同步與 GitHub 發佈一體化自動化工具 (Asset Pipeline)
支援模組化單獨執行或全流程 --all 執行。
"""

import os
import sys
import re
import csv
import time
import urllib.request
from urllib.parse import urlparse
from concurrent.futures import ThreadPoolExecutor, as_completed

try:
    import openpyxl
except ImportError:
    openpyxl = None

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
DOCS_DIR = os.path.join(BASE_DIR, 'docs')
CDN_DIR = os.path.join(DOCS_DIR, 'cdn')
DATA_DIR = os.path.join(BASE_DIR, 'data')
INTERNAL_DIR = os.path.join(BASE_DIR, '_internal')

sys.path.insert(0, INTERNAL_DIR)
try:
    from gh_batch import _req, _retry, get_branch_head, create_blob, batch_commit, BRANCH
except ImportError:
    pass

RAW_CDN_BASE = "https://raw.githubusercontent.com/Kevinte67228/Retro-library/main/docs/cdn/"

CSV_FILES = [
    os.path.join(DATA_DIR, 'RetroVault_遊戲_FC.csv'),
    os.path.join(DATA_DIR, 'RetroVault_遊戲_MD.csv'),
    os.path.join(DATA_DIR, 'RetroVault_GS_Games_全量匯入檔.csv'),
]
XLSX_FILE = os.path.join(DATA_DIR, 'RetroVault_GS_Games_全量匯入檔.xlsx')


def scan_external_cdn_urls():
    """掃描全專案中屬於外部無 CORS CDN 的圖檔 URL"""
    domains = ['images.launchbox-app.com', 'gamesdb-images.launchbox.gg']
    urls = set()
    regex = re.compile(r'https?://(?:images\.launchbox-app\.com|gamesdb-images\.launchbox\.gg)/([a-zA-Z0-9_.-]+)')
    
    for root, dirs, files in os.walk(BASE_DIR):
        if any(skip in root for skip in ['.git', '_internal\\old', 'node_modules', '.temp']):
            continue
        for f in files:
            if f.endswith(('.csv', '.html', '.js')):
                p = os.path.join(root, f)
                try:
                    with open(p, 'r', encoding='utf-8', errors='ignore') as fh:
                        for m in regex.finditer(fh.read()):
                            urls.add(m.group(0))
                except Exception:
                    pass
    return sorted(list(urls))


def crawl_images(urls=None, max_workers=8):
    """將外部 CDN 圖資爬取下載至 docs/cdn/"""
    os.makedirs(CDN_DIR, exist_ok=True)
    if urls is None:
        urls = scan_external_cdn_urls()
    print(f"[*] 開始爬取外部圖資，待處理共 {len(urls)} 筆...")

    def _dl(url):
        fn = os.path.basename(urlparse(url).path)
        dest = os.path.join(CDN_DIR, fn)
        if os.path.exists(dest) and os.path.getsize(dest) > 1000:
            return url, True, f"已快取 ({os.path.getsize(dest)} bytes)"
        
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        req = urllib.request.Request(url, headers=headers)
        for _ in range(3):
            try:
                with urllib.request.urlopen(req, timeout=15) as resp:
                    if resp.status == 200:
                        data = resp.read()
                        if len(data) > 0:
                            with open(dest, 'wb') as f:
                                f.write(data)
                            return url, True, f"成功 ({len(data)} bytes)"
            except Exception:
                time.sleep(1)
        return url, False, "下載失敗"

    success, failed = 0, []
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(_dl, u): u for u in urls}
        for fut in as_completed(futures):
            u, ok, msg = fut.result()
            if ok:
                success += 1
            else:
                failed.append(u)

    print(f"[✓] 爬取完成！成功: {success}/{len(urls)}, 失敗: {len(failed)}")
    return success, failed


def sync_database_urls():
    """更新 CSV 檔案與重新生成 XLSX 匯入檔"""
    print("[*] 正在同步資料庫 URL (指向本地 GitHub Raw CDN)...")
    for csv_path in CSV_FILES:
        if not os.path.exists(csv_path):
            continue
        with open(csv_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 替換外部 CDN
        content = re.sub(r'https?://(?:images\.launchbox-app\.com|gamesdb-images\.launchbox\.gg)/', RAW_CDN_BASE, content)
        with open(csv_path, 'w', encoding='utf-8', newline='') as f:
            f.write(content)
        print(f"  [✓] 更新: {os.path.basename(csv_path)}")

    # 重新生成 Excel
    if openpyxl and os.path.exists(CSV_FILES[2]):
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = 'RetroVault_Games'
        with open(CSV_FILES[2], 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            for r_idx, row in enumerate(reader, 1):
                for c_idx, val in enumerate(row, 1):
                    ws.cell(row=r_idx, column=c_idx, value=val)
        wb.save(XLSX_FILE)
        print(f"  [✓] 全量重新生成: {os.path.basename(XLSX_FILE)}")


def upload_cdn_blobs_to_github(max_workers=8):
    """上傳 docs/cdn 圖檔至 GitHub 倉庫並建立 commit"""
    if not os.path.exists(CDN_DIR):
        print("[!] docs/cdn 目錄不存在")
        return
    files = [f for f in os.listdir(CDN_DIR) if os.path.isfile(os.path.join(CDN_DIR, f))]
    print(f"[*] 準備上傳 {len(files)} 個 CDN 圖檔至 GitHub...")

    def _up(fn):
        p = os.path.join(CDN_DIR, fn)
        with open(p, 'rb') as f:
            data = f.read()
        sha = create_blob(data)
        return fn, sha

    file_blobs = {}
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(_up, fn): fn for fn in files}
        c = 0
        for fut in as_completed(futures):
            fn, sha = fut.result()
            file_blobs[fn] = sha
            c += 1
            if c % 30 == 0 or c == len(files):
                print(f"  已建立 blob: {c}/{len(files)}...")

    parent_sha, base_tree_sha = get_branch_head()
    tree_entries = [{"path": f"docs/cdn/{fn}", "mode": "100644", "type": "blob", "sha": sha} for fn, sha in file_blobs.items()]
    
    new_tree = _retry(_req, "POST", "/git/trees", {"base_tree": base_tree_sha, "tree": tree_entries})
    new_commit = _retry(_req, "POST", "/git/commits", {
        "message": f"feat(cdn): 同步 {len(files)} 筆圖資至 docs/cdn (解除 CORS 限制)",
        "tree": new_tree["sha"],
        "parents": [parent_sha]
    })
    _retry(_req, "PATCH", f"/git/refs/heads/{BRANCH}", {"sha": new_commit["sha"], "force": False})
    print(f"[✓] GitHub CDN 圖資上傳完成！Commit: {new_commit['sha'][:10]}")


if __name__ == '__main__':
    args = sys.argv[1:]
    if not args or '--scan' in args:
        found = scan_external_cdn_urls()
        print(f"掃描發現 {len(found)} 筆外部無 CORS CDN 圖資")
    if '--crawl' in args:
        crawl_images()
    if '--sync-db' in args:
        sync_database_urls()
    if '--upload' in args:
        upload_cdn_blobs_to_github()
    if '--all' in args:
        crawl_images()
        sync_database_urls()
        upload_cdn_blobs_to_github()
