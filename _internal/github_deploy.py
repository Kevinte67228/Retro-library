"""
GameVault GitHub 部署腳本 v2 ── 改用 gh_batch.py 的 Git Data API 單一 commit 批次方式

用法：python3 github_deploy.py <新版本號> <版本資料夾路徑>
例如：python3 github_deploy.py v01_02 /home/claude/v01_02

跟 v1 的差異（v1 已過時，內容跟現行規則不符，這版修正）：
- 備份路徑 GameVault/old/ → _internal/old/（符合現行 Repo 結構）
- 備份輪替數量 3 → 5（符合現行 5 版輪替規則）
- 支援永久保留例外清單 PERMANENT_EXCEPTIONS（清理輪替時跳過，不刪除）
- 備份/清理/部署／刪舊版HTML 全部包在同一次 atomic commit 內完成（用 gh_batch.batch_commit）
  而不是像 v1 那樣逐檔案呼叫 Contents API（一個檔案一個 commit，又慢又容易留下不一致的中間狀態）
- 備份時直接複製既有 blob sha（build_path_index），不需要重新下載+上傳內容

流程：
1. 讀取 GameVault/ 目前版本號（從 GameVault_vXX_YY_index.html 檔名推斷）
2. 備份目前版本核心檔案 → _internal/old/<目前版號>/（複製既有 blob，不重新上傳）
3. 若一般備份（排除 PERMANENT_EXCEPTIONS）超過 MAX_OLD(5) 個，清理最舊的
4. 推送新版本檔案到 GameVault/，並刪除舊版本 HTML
5. 以上全部包在同一次 commit 內完成
"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gh_batch import _req, _retry, get_branch_head, build_path_index, batch_commit

# ── 設定 ──────────────────────────────────────────
MAX_OLD = 5  # 一般備份最多保留幾個（5 版輪替）

# 永久保留的備份版號清單，清理輪替時一律跳過。
# 目前（v01.01 發布版本重置後）為空；若之後使用者要求把某版標記永久保留，在此加入版號字串。
PERMANENT_EXCEPTIONS = []

# 備份時要複製的 GameVault/ 核心檔案
BACKUP_FILES = [
    'index.html',
    'sw.js',
    'manifest.json',
    'bg.webp',
    'GameVault_AppsScript.gs',
    'appsscript.json',
]

# 部署新版本時要推送的檔案（本機檔名 → GitHub 路徑，{ver} 會被替換成新版號）
DEPLOY_FILES = {
    'index.html':                       'GameVault/index.html',
    'GameVault_{ver}_index.html':       'GameVault/GameVault_{ver}_index.html',
    'sw.js':                            'GameVault/sw.js',
    'manifest.json':                    'GameVault/manifest.json',
    'GameVault_AppsScript.gs':          'GameVault/GameVault_AppsScript.gs',
}


def get_current_version(path_index):
    """從目前 tree 裡的 GameVault_vXX_YY_index.html 檔名推斷目前版號"""
    for path in path_index:
        if path.startswith('GameVault/GameVault_v') and path.endswith('_index.html'):
            name = path.split('/')[-1]
            return name.replace('GameVault_', '').replace('_index.html', '')
    return None


def deploy(new_ver, local_dir):
    parent_sha, tree_sha = get_branch_head()
    path_index = build_path_index(tree_sha)  # {path: blob_sha} 完整對照表

    current_ver = get_current_version(path_index)
    same_version = (current_ver == new_ver)
    print(f'目前版本: {current_ver}　→　新版本: {new_ver}')

    adds = {}      # path -> 新內容 bytes（需要上傳）
    copies = {}    # path -> 既有 blob sha（直接複製，不重新上傳）
    deletes = []   # 要刪除的 path

    # ── 1. 備份目前版本（複製既有 blob，不重新下載上傳） ──
    if current_ver and not same_version:
        print(f'[1] 備份 {current_ver} → _internal/old/{current_ver}/')
        for fname in BACKUP_FILES:
            src = f'GameVault/{fname}'
            if src in path_index:
                copies[f'_internal/old/{current_ver}/{fname}'] = path_index[src]
        ver_html = f'GameVault/GameVault_{current_ver}_index.html'
        if ver_html in path_index:
            copies[f'_internal/old/{current_ver}/GameVault_{current_ver}_index.html'] = path_index[ver_html]
        for path, sha in path_index.items():
            if path.startswith('GameVault/icons/'):
                icon_name = path[len('GameVault/icons/'):]
                copies[f'_internal/old/{current_ver}/icons/{icon_name}'] = sha

        # ── 2. 清理超過 MAX_OLD 的最舊一般備份（跳過永久保留例外） ──
        old_dirs = sorted(set(
            p.split('/')[2] for p in path_index
            if p.startswith('_internal/old/') and len(p.split('/')) > 2
        ))
        old_dirs = [d for d in old_dirs if d not in PERMANENT_EXCEPTIONS and d != current_ver]
        print(f'[2] 一般備份現有（不含永久例外）: {old_dirs}')
        while len(old_dirs) >= MAX_OLD:
            oldest = old_dirs.pop(0)
            for path in path_index:
                if path.startswith(f'_internal/old/{oldest}/'):
                    deletes.append(path)
            print(f'  將清理最舊版本: {oldest}')

    # ── 3. 推送新版本檔案 ──
    print(f'[3] 推送新版本 {new_ver}')
    for local_name_tpl, gh_path_tpl in DEPLOY_FILES.items():
        local_name = local_name_tpl.replace('{ver}', new_ver)
        gh_path = gh_path_tpl.replace('{ver}', new_ver)
        local_path = os.path.join(local_dir, local_name)
        if os.path.exists(local_path):
            with open(local_path, 'rb') as f:
                adds[gh_path] = f.read()
        else:
            print(f'  skip（本機找不到）: {local_path}')

    # 刪除舊版本 HTML（不同版號才需要）
    if not same_version:
        for path in path_index:
            if (path.startswith('GameVault/GameVault_v') and path.endswith('_index.html')
                    and path != f'GameVault/GameVault_{new_ver}_index.html'):
                deletes.append(path)
                print(f'  將移除舊版本HTML: {path}')

    if not adds and not copies and not deletes:
        print('沒有任何異動，中止。')
        return None

    # ── 4. 全部包在同一次 commit ──
    msg = f'部署 {new_ver}'
    if current_ver and not same_version:
        msg += f'（備份 {current_ver} 並清理輪替）'
    sha = batch_commit(msg, adds=adds, deletes=deletes, copies=copies,
                        base_tree_sha=tree_sha, parent_sha=parent_sha)
    print(f'\n=== 完成，commit={sha[:10]}，Netlify 將自動偵測部署 ===')
    return sha


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print('用法: python3 github_deploy.py <新版本號> <版本資料夾路徑>')
        print('例如: python3 github_deploy.py v01_02 /home/claude/v01_02')
        sys.exit(1)
    deploy(sys.argv[1], sys.argv[2])
