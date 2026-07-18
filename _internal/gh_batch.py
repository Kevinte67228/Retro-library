"""
GitHub Git Data API 批次操作工具
用單一 commit 完成多檔案的新增/修改/刪除,取代逐檔案呼叫 Contents API。
"""
import urllib.request, json, base64, time

TOKEN = ""  # 由使用者每次對話提供，不寫死在檔案內
REPO = "Kevinte67228/Retro-library"
API = f"https://api.github.com/repos/{REPO}"
BRANCH = "main"

def _req(method, path, body=None):
    url = f"{API}{path}"
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method, headers={
        "Authorization": f"token {TOKEN}",
        "Content-Type": "application/json"
    })
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode())

def _retry(fn, *a, tries=5, **kw):
    for i in range(tries):
        try:
            return fn(*a, **kw)
        except Exception as e:
            print("retry:", e)
            time.sleep(3)
    raise RuntimeError("failed after retries: " + str(a))

def get_branch_head():
    """回傳 (commit_sha, tree_sha)"""
    ref = _retry(_req, "GET", f"/git/ref/heads/{BRANCH}")
    commit_sha = ref["object"]["sha"]
    commit = _retry(_req, "GET", f"/git/commits/{commit_sha}")
    tree_sha = commit["tree"]["sha"]
    return commit_sha, tree_sha

def list_tree_recursive(tree_sha):
    """回傳整個 repo 底下所有檔案路徑清單(該tree往下遞迴)"""
    t = _retry(_req, "GET", f"/git/trees/{tree_sha}?recursive=1")
    return [item["path"] for item in t["tree"] if item["type"] == "blob"]

def create_blob(content_bytes):
    b64 = base64.b64encode(content_bytes).decode()
    result = _retry(_req, "POST", "/git/blobs", {"content": b64, "encoding": "base64"})
    return result["sha"]

def batch_commit(message, adds=None, deletes=None, base_tree_sha=None, parent_sha=None):
    """
    一次 commit 完成多檔案新增/修改/刪除。
    adds: {path: content_bytes, ...}  (新增或覆蓋)
    deletes: [path, path, ...]        (刪除)
    回傳新的 commit sha。
    """
    adds = adds or {}
    deletes = deletes or []
    if base_tree_sha is None or parent_sha is None:
        parent_sha, base_tree_sha = get_branch_head()

    tree_entries = []
    for path, content in adds.items():
        blob_sha = create_blob(content)
        tree_entries.append({"path": path, "mode": "100644", "type": "blob", "sha": blob_sha})
    for path in deletes:
        tree_entries.append({"path": path, "mode": "100644", "sha": None})

    new_tree = _retry(_req, "POST", "/git/trees", {"base_tree": base_tree_sha, "tree": tree_entries})
    new_commit = _retry(_req, "POST", "/git/commits", {
        "message": message, "tree": new_tree["sha"], "parents": [parent_sha]
    })
    _retry(_req, "PATCH", f"/git/refs/heads/{BRANCH}", {"sha": new_commit["sha"], "force": False})
    return new_commit["sha"]
