"""
GameVault GitHub 部署腳本
用法：python3 github_deploy.py <新版本號> <版本資料夾路徑>
例如：python3 github_deploy.py v40_34 /home/claude/v40_34

流程：
1. 讀取 GameVault/old/ 現有備份列表
2. 若已有 3 個，刪最舊的
3. 把目前 GameVault/ 核心檔案複製到 GameVault/old/<舊版本號>/
4. 推新版本檔案到 GameVault/
"""

import urllib.request, json, base64, sys, os

TOKEN = os.environ.get('GH_TOKEN', '')  # 執行前設定: export GH_TOKEN=ghp_...
REPO  = 'Kevinte67228/Retro-library'
BASE  = f'https://api.github.com/repos/{REPO}/contents'

# 每次部署要推送的檔案（本機路徑 → GitHub 路徑）
# 呼叫時動態填入版本號
DEPLOY_FILES = [
    ('index.html',                    'GameVault/index.html'),
    ('{ver}_index.html',              'GameVault/{ver}_index.html'),
    ('sw.js',                         'GameVault/sw.js'),
    ('manifest.json',                 'GameVault/manifest.json'),
]

# 備份時要複製的 GameVault/ 檔案（不含 old/ 和協作規則）
BACKUP_FILES = [
    'index.html',
    'sw.js',
    'manifest.json',
    'bg.webp',
    'GameVault_AppsScript.gs',
]

MAX_OLD = 3  # 最多保留幾個舊版本

# ── API 工具函式 ─────────────────────────────────

def api(path, method='GET', data=None):
    url = f'{BASE}/{path}'
    headers = {'Authorization': f'token {TOKEN}'}
    if data:
        headers['Content-Type'] = 'application/json'
    req = urllib.request.Request(url,
        data=json.dumps(data).encode() if data else None,
        headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        return {'error': e.code, 'msg': e.read().decode()[:200]}

def ls(path):
    r = api(path)
    return r if isinstance(r, list) else []

def get_sha(path):
    r = api(path)
    return r.get('sha', '') if isinstance(r, dict) else ''

def push_local(gh_path, local_path, msg):
    """從本機推檔案到 GitHub"""
    content = open(local_path, 'rb').read()
    b64 = base64.b64encode(content).decode()
    sha = get_sha(gh_path)
    data = {'message': msg, 'content': b64}
    if sha:
        data['sha'] = sha
    res = api(gh_path, 'PUT', data)
    if 'commit' in res:
        print(f'  ✓ push {gh_path} ({len(content):,} bytes)')
        return True
    else:
        print(f'  ✗ push {gh_path}: {res}')
        return False

def copy_gh(src, dest, msg):
    """在 GitHub 內複製檔案"""
    r = api(src)
    if 'content' not in r:
        print(f'  skip copy {src}')
        return
    b64 = r['content'].replace('\n', '')
    sha = get_sha(dest)
    data = {'message': msg, 'content': b64}
    if sha:
        data['sha'] = sha
    res = api(dest, 'PUT', data)
    if 'commit' in res:
        print(f'  ✓ copy → {dest}')
    else:
        print(f'  ✗ copy → {dest}: {res}')

def delete_tree(path, msg_prefix):
    """遞迴刪除 GitHub 資料夾內所有檔案"""
    items = ls(path)
    for item in items:
        if item['type'] == 'dir':
            delete_tree(f'{path}/{item["name"]}', msg_prefix)
        else:
            res = api(f'{path}/{item["name"]}', 'DELETE',
                      {'message': f'{msg_prefix} {item["name"]}', 'sha': item['sha']})
            if 'commit' in res:
                print(f'  deleted {path}/{item["name"]}')

# ── 主流程 ───────────────────────────────────────

def get_current_version():
    """從 GameVault/ 的版本 HTML 檔名推斷目前版號"""
    files = ls('GameVault')
    for f in files:
        name = f['name']
        if name.startswith('GameVault_v') and name.endswith('_index.html'):
            # GameVault_v40_33_index.html → v40_33
            ver = name.replace('GameVault_', '').replace('_index.html', '')
            return ver
    return None

def backup_current(current_ver):
    """把目前 GameVault/ 備份到 old/<current_ver>/"""
    print(f'\n[1] 備份目前版本 {current_ver} → old/{current_ver}/')

    # 核心檔案
    for fname in BACKUP_FILES:
        copy_gh(f'GameVault/{fname}',
                f'GameVault/old/{current_ver}/{fname}',
                f'backup {fname} to old/{current_ver}')

    # 版本 HTML（名稱含版號）
    copy_gh(f'GameVault/GameVault_{current_ver}_index.html',
            f'GameVault/old/{current_ver}/GameVault_{current_ver}_index.html',
            f'backup version HTML to old/{current_ver}')

    # icons/
    for f in ls('GameVault/icons'):
        copy_gh(f'GameVault/icons/{f["name"]}',
                f'GameVault/old/{current_ver}/icons/{f["name"]}',
                f'backup icons/{f["name"]} to old/{current_ver}')

def prune_old():
    """保留最新 MAX_OLD 個，刪最舊的"""
    old_dirs = sorted(
        [f['name'] for f in ls('GameVault/old') if f['type'] == 'dir']
    )
    print(f'\n[2] old/ 現有版本: {old_dirs}')
    while len(old_dirs) > MAX_OLD:
        oldest = old_dirs.pop(0)
        print(f'  刪除最舊版本: {oldest}')
        delete_tree(f'GameVault/old/{oldest}', f'prune old/{oldest}')

def deploy_new(new_ver, local_dir):
    """推送新版本到 GameVault/"""
    print(f'\n[3] 推送新版本 {new_ver}')
    files_to_push = [
        ('index.html',                               'GameVault/index.html'),
        (f'GameVault_{new_ver}_index.html',          f'GameVault/GameVault_{new_ver}_index.html'),
        ('sw.js',                                    'GameVault/sw.js'),
        ('manifest.json',                            'GameVault/manifest.json'),
    ]
    # 若有 GS 或 md 也一起推
    optional = [
        ('GameVault_AppsScript.gs', 'GameVault/GameVault_AppsScript.gs'),
    ]
    for local_name, gh_path in files_to_push + optional:
        local_path = os.path.join(local_dir, local_name)
        if os.path.exists(local_path):
            push_local(gh_path, local_path, f'deploy {new_ver}: {local_name}')
        else:
            print(f'  skip (not found): {local_path}')

    # 刪掉舊的版本 HTML（不同版號）
    for f in ls('GameVault'):
        if (f['name'].startswith('GameVault_v') and
            f['name'].endswith('_index.html') and
            f['name'] != f'GameVault_{new_ver}_index.html'):
            api(f'GameVault/{f["name"]}', 'DELETE',
                {'message': f'remove old version HTML {f["name"]}', 'sha': f['sha']})
            print(f'  removed old: {f["name"]}')

# ── 入口 ─────────────────────────────────────────

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print('用法: python3 github_deploy.py <新版本號> <版本資料夾路徑>')
        print('例如: python3 github_deploy.py v40_34 /home/claude/v40_34')
        sys.exit(1)

    new_ver   = sys.argv[1]   # 例如 v40_34
    local_dir = sys.argv[2]   # 例如 /home/claude/v40_34

    print(f'=== GameVault 部署：{new_ver} ===')

    # 推斷目前版號
    current_ver = get_current_version()
    print(f'目前版本: {current_ver}')
    print(f'新版本:   {new_ver}')

    if current_ver == new_ver:
        print('版本號相同，直接覆蓋部署（不備份）')
        deploy_new(new_ver, local_dir)
    else:
        # 備份 → 清理 → 部署
        if current_ver:
            backup_current(current_ver)
        prune_old()
        deploy_new(new_ver, local_dir)

    print('\n=== 完成，Netlify 將自動部署 ===')
