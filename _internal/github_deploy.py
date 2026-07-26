"""
GameVault GitHub 部署腳本 v2 ── 改用 gh_batch.py 的 Git Data API 單一 commit 批次方式

用法：python3 github_deploy.py <新版本號> <版本資料夾路徑> [CHANGELOG.md路徑]
例如：python3 github_deploy.py v01_02 /home/claude/v01_02 /home/claude/v01_02/CHANGELOG_new.md

跟 v1 的差異（v1 已過時，內容跟現行規則不符，這版修正）：
- 備份路徑 docs/old/ → _internal/old/（符合現行 Repo 結構）
- 備份輪替數量 3 → 5（符合現行 5 版輪替規則）
- 支援永久保留例外清單 PERMANENT_EXCEPTIONS（清理輪替時跳過，不刪除）
- 備份/清理/部署／刪舊版HTML 全部包在同一次 atomic commit 內完成（用 gh_batch.batch_commit）
  而不是像 v1 那樣逐檔案呼叫 Contents API（一個檔案一個 commit，又慢又容易留下不一致的中間狀態）
- 備份時直接複製既有 blob sha（build_path_index），不需要重新下載+上傳內容
- v3（2026-07-25）：CHANGELOG.md 更新併入同一次 commit（選填第三參數），不再另外開一次 commit。
  原因：CHANGELOG.md 雖然放在 _internal/（不在 docs/ 發布範圍），但 GitHub Pages 的
  「Deploy from a branch」是整個 main 分支只要有任何 push 就會觸發重建，不會只挑 docs/ 路徑。
  之前部署完 docs/ 後緊接著另外 push CHANGELOG，等於短時間內連續觸發兩次 Pages 自動建置，
  兩次建置管線互相干擾，其中一次容易被中斷回報失敗（即使最終內容仍正確部署成功，
  也會收到失敗通知信）。併入同一次 commit 後只觸發一次建置，可避免此問題。
- v4（2026-07-26）：App 改名 GameVault→RetroVault，版本 HTML 命名規則同步從
  GameVault_vXX_YY_index.html 改成 RetroVault_vXX_YY_index.html。get_current_version()／
  備份／刪舊檔三處都做了「新舊前綴都比對」的過渡期相容處理，只需要在 v02.29→v02.30
  這次轉換時派上用場（v02.29 以前是舊前綴、v02.30 起全部是新前綴），之後可以移除相容判斷，
  但保留著也無害。GAS 檔名（GameVault_AppsScript.gs）這次沒有一起改，因為 workflow 觸發路徑
  寫死在 .github/workflows/deploy-gas.yml，Claude 沒有 workflow scope 不能直接改，
  需要使用者先手動更新該檔案，確認後才能安全把 GAS 檔名也換掉（見協作規則.md 相關章節）。

流程：
1. 讀取 docs/ 目前版本號（從 GameVault_vXX_YY_index.html 檔名推斷）
2. 備份目前版本核心檔案 → _internal/old/<目前版號>/（複製既有 blob，不重新上傳）
3. 若一般備份（排除 PERMANENT_EXCEPTIONS）超過 MAX_OLD(5) 個，清理最舊的
4. 推送新版本檔案到 docs/，並刪除舊版本 HTML
5. 併入 CHANGELOG.md（若有提供第三參數）
6. 以上全部包在同一次 commit 內完成
"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gh_batch import _req, _retry, get_branch_head, build_path_index, batch_commit

# ── 設定 ──────────────────────────────────────────
MAX_OLD = 5  # 一般備份最多保留幾個（5 版輪替）

# 永久保留的備份版號清單，清理輪替時一律跳過。
# 目前為空；v02_17（大改版「統一整個程式碼渲染函式」前的基準版本）已於大改版 Phase 1-4 完成、
# 使用者 2026-07-25 確認後解除永久保留，恢復正常 5 版輪替。若之後使用者要求把某版標記永久保留，在此加入版號字串。
PERMANENT_EXCEPTIONS = []

# 備份時要複製的 docs/ 核心檔案
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
    'index.html':                       'docs/index.html',
    'RetroVault_{ver}_index.html':      'docs/RetroVault_{ver}_index.html',
    'sw.js':                            'docs/sw.js',
    'manifest.json':                    'docs/manifest.json',
    'GameVault_AppsScript.gs':          'docs/GameVault_AppsScript.gs',
}


def get_current_version(path_index):
    """從目前 tree 裡的 RetroVault_vXX_YY_index.html 檔名推斷目前版號
    （v02.30 起改名；v02.29 以前是 GameVault_vXX_YY_index.html，向下相容判斷）"""
    for path in path_index:
        if path.startswith('docs/RetroVault_v') and path.endswith('_index.html'):
            name = path.split('/')[-1]
            return name.replace('RetroVault_', '').replace('_index.html', '')
        if path.startswith('docs/GameVault_v') and path.endswith('_index.html'):
            name = path.split('/')[-1]
            return name.replace('GameVault_', '').replace('_index.html', '')
    return None


def deploy(new_ver, local_dir, changelog_path=None):
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
            src = f'docs/{fname}'
            if src in path_index:
                copies[f'_internal/old/{current_ver}/{fname}'] = path_index[src]
        ver_html = None
        for prefix in ('RetroVault_', 'GameVault_'):  # 過渡期：v02.30起新前綴，v02.29以前是舊前綴
            candidate = f'docs/{prefix}{current_ver}_index.html'
            if candidate in path_index:
                ver_html = candidate
                break
        if ver_html:
            ver_html_name = ver_html.split('/')[-1]
            copies[f'_internal/old/{current_ver}/{ver_html_name}'] = path_index[ver_html]
        for path, sha in path_index.items():
            if path.startswith('docs/icons/'):
                icon_name = path[len('docs/icons/'):]
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

    # 刪除舊版本 HTML（不同版號才需要；過渡期同時比對新舊兩種前綴）
    if not same_version:
        for path in path_index:
            is_ver_html = (
                (path.startswith('docs/RetroVault_v') or path.startswith('docs/GameVault_v'))
                and path.endswith('_index.html')
            )
            if is_ver_html and path != f'docs/RetroVault_{new_ver}_index.html':
                deletes.append(path)
                print(f'  將移除舊版本HTML: {path}')

    # 併入 CHANGELOG.md（若有提供）：跟 docs/ 部署包在同一次 commit，
    # 避免額外一次 push 觸發 GitHub Pages 的自動建置管線、跟前一次部署 push 時間太近而互相干擾。
    if changelog_path and os.path.exists(changelog_path):
        with open(changelog_path, 'rb') as f:
            adds['_internal/CHANGELOG.md'] = f.read()
        print('  併入 CHANGELOG.md（同一次 commit）')

    if not adds and not copies and not deletes:
        print('沒有任何異動，中止。')
        return None

    # ── 4. 全部包在同一次 commit ──
    msg = f'部署 {new_ver}'
    if current_ver and not same_version:
        msg += f'（備份 {current_ver} 並清理輪替）'
    sha = batch_commit(msg, adds=adds, deletes=deletes, copies=copies,
                        base_tree_sha=tree_sha, parent_sha=parent_sha)
    print(f'\n=== 完成，commit={sha[:10]}，GitHub Pages 將自動偵測部署 ===')
    return sha


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print('用法: python3 github_deploy.py <新版本號> <版本資料夾路徑> [CHANGELOG.md路徑]')
        print('例如: python3 github_deploy.py v01_02 /home/claude/v01_02')
        sys.exit(1)
    deploy(sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else None)
