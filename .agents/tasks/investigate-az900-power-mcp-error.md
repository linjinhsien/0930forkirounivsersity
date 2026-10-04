# Investigation Report: ENOENT Error — az900-microsoft-learn Power MCP Server

**Date:** 2025-10-04  
**Investigated by:** Kiro investigation step  
**Error:** `[Error] ENOENT: no such file or directory, mkdir 'C:\Users\iven8.kiro\sessions\221ad160211ac9e0\sess_39e9afc0-d2ec-4dd1-86ec-8be8c03b0290\snapshots\b3dbd6e2\c:\Users\iven8\.kiro\powers\installed\az900-micros'`

---

## Summary Answer (Read This First)

**Root cause:** Kiro's session snapshotting mechanism calls `path.join(snapshotRoot, scriptPath)` where `scriptPath` is an **absolute Windows path** (beginning with `c:\`). On Windows, Node.js `path.join()` does NOT treat a second argument starting with a drive letter as an override — it concatenates it as a relative segment. This produces a garbage compound path like `<snapshotRoot>\c:\Users\iven8\.kiro\powers\...`, which cannot be created because the intermediate directories don't exist.

**The trigger:** The power's own `mcp.json` (`.kiro/powers/az900-microsoft-learn/mcp.json`) uses the `${workspaceFolder}` variable in the `args` array. After substitution, this becomes an absolute Windows path. When Kiro reads this to snapshot the power's MCP server, the absolute path gets passed to `path.join` as a relative segment, breaking the `mkdir` call.

**Secondary issue:** The installed power directory (`C:\Users\iven8\.kiro\powers\installed\az900-microsoft-learn\`) has **no `mcp.json`** at all — unlike every other power with an MCP server (aws-agentcore, cloud-architect, context7, etc., all have an `mcp.json` in their installed directory). This missing file is likely what forces Kiro to fall back to reading the workspace's copy of `mcp.json`, where the `${workspaceFolder}` absolute-path variable triggers the bug.

**Recommended fix:** Add an `mcp.json` to the installed power directory at `C:\Users\iven8\.kiro\powers\installed\az900-microsoft-learn\mcp.json` using the workspace-relative path (no `${workspaceFolder}`), **and** update the workspace `mcp.json` (`.kiro/powers/az900-microsoft-learn/mcp.json`) to use a relative path instead of `${workspaceFolder}`.

---

## Evidence

### 1. The ENOENT path decoded

```
Error path:  C:\Users\iven8.kiro\sessions\221ad160211ac9e0\sess_39e9afc0-d2ec-4dd1-86ec-8be8c03b0290\snapshots\b3dbd6e2\c:\Users\iven8\.kiro\powers\installed\az900-micros
                                                                                                                                                                              ^^^^^ TRUNCATED
```

Breaking this down:
- **Snapshot base:** `C:\Users\iven8\.kiro\sessions\221ad160211ac9e0\sess_39e9afc0-...\snapshots\b3dbd6e2\`
- **Wrongly appended segment:** `c:\Users\iven8\.kiro\powers\installed\az900-microsoft-learn\mcp-server\index.cjs` (truncated to `az900-micros` in the error message)

This is `path.join(snapshotBase, absoluteScriptPath)` — confirmed with Node.js:

```sh
$ node -e "const path = require('path'); console.log(path.join('C:/snapshot/dir', 'c:/Users/iven8/.kiro/powers/installed/az900-microsoft-learn/mcp-server/index.cjs'))"
C:\snapshot\dir\c:\Users\iven8\.kiro\powers\installed\az900-microsoft-learn\mcp-server\index.cjs
```

### 2. The power's `mcp.json` uses `${workspaceFolder}`

**File:** `c:\Users\iven8\Downloads\0930forkirounivsersity\.kiro\powers\az900-microsoft-learn\mcp.json`

```json
{
  "mcpServers": {
    "ms-learn": {
      "command": "node",
      "args": ["${workspaceFolder}/.kiro/powers/az900-microsoft-learn/mcp-server/index.cjs"],
      "description": "Microsoft Learn AZ-900 content fetcher — ...",
      "env": {
        "MS_LEARN_LOCALE": "zh-tw",
        "MS_LEARN_FALLBACK_LOCALE": "en-us"
      }
    }
  }
}
```

After `${workspaceFolder}` substitution → `C:\Users\iven8\Downloads\0930forkirounivsersity/.kiro/powers/az900-microsoft-learn/mcp-server/index.cjs` — an **absolute path**. Passing this as a `path.join` argument on Windows produces the compound path in the error.

### 3. The workspace `mcp.json` uses a RELATIVE path (correct, but Kiro may read power's own mcp.json first)

**File:** `c:\Users\iven8\Downloads\0930forkirounivsersity\.kiro\settings\mcp.json`

```json
{
  "mcpServers": {
    "ms-learn": {
      "command": "node",
      "args": [
        ".kiro/powers/az900-microsoft-learn/mcp-server/index.cjs"
      ],
      "disabled": false
    }
  }
}
```

This uses a **relative path** — it would work correctly because Kiro resolves it from the workspace root CWD. However, the power system also reads the power's own `mcp.json` (declared in `plugin.json` as `"mcp": "mcp.json"`), and that file uses the absolute `${workspaceFolder}` substitution — which triggers the bug during snapshotting.

### 4. The `plugin.json` declares an `mcp` field

**File:** `c:\Users\iven8\Downloads\0930forkirounivsersity\.kiro\powers\az900-microsoft-learn\plugin.json`

```json
{
  "name": "az900-microsoft-learn",
  ...
  "mcp": "mcp.json",
  ...
}
```

This tells Kiro to read `mcp.json` from the power directory, so the power's own `mcp.json` (with `${workspaceFolder}`) is the one Kiro processes for the power's MCP configuration.

### 5. Installed power has NO `mcp.json`

**Directory:** `C:\Users\iven8\.kiro\powers\installed\az900-microsoft-learn\`

```
C:\Users\iven8\.kiro\powers\installed\az900-microsoft-learn\steering\   (empty)
C:\Users\iven8\.kiro\powers\installed\az900-microsoft-learn\POWER.md
```

**No `mcp.json` present.** Compare with every other MCP-enabled installed power:

| Power | Has mcp.json in installed dir? |
|---|---|
| aws-agentcore | ✅ Yes |
| aws-devops-agent | ✅ Yes |
| cloud-architect | ✅ Yes |
| context7 | ✅ Yes |
| ecs-express-power | ✅ Yes |
| figma | ✅ Yes |
| kiro-unity-accelerator | ✅ Yes |
| migration-to-aws | ✅ Yes |
| miro-codegen | ✅ Yes |
| opensearch-launchpad | ✅ Yes |
| saas-builder | ✅ Yes |
| terraform-skill | ✅ Yes |
| **az900-microsoft-learn** | ❌ **Missing** |

### 6. The `index.cjs` file exists and is valid

**File:** `c:\Users\iven8\Downloads\0930forkirounivsersity\.kiro\powers\az900-microsoft-learn\mcp-server\index.cjs`

- **Exists:** ✅ Yes
- **Valid Node.js:** ✅ Yes — the script starts normally and waits on stdin for MCP protocol messages (expected behavior for a stdio MCP server). It times out on invocation only because there is no stdin input; there is no immediate crash.
- **What it does:** Implements an MCP stdio server calling the Microsoft Learn Catalog API (`learn.microsoft.com`), providing four tools: `search_modules`, `get_az900_domains`, `search_services`, `get_learning_path`.

### 7. Node.js is available

```
Node.js v20.20.2
```

### 8. Key path difference: `${workspaceFolder}` vs workspace-root-relative

The workspace `mcp.json` registers the server with a **relative path** (correct for CWD-based resolution). The power's own `mcp.json` uses `${workspaceFolder}` (produces an absolute path that breaks Windows `path.join` in Kiro's snapshot code). Both point to the same physical `index.cjs` file.

---

## Conclusions

1. **The ENOENT error is caused by a Windows-specific `path.join` behavior**: when an absolute Windows path (`c:\...`) is passed as the second argument to `path.join`, it is treated as a relative segment and appended to the base path rather than replacing it. Kiro's session snapshot code does this when it tries to copy the MCP server script into the snapshot directory.

2. **The trigger is the `${workspaceFolder}` variable** in `.kiro/powers/az900-microsoft-learn/mcp.json`. After substitution on this machine, it resolves to an absolute path. Kiro then tries to `mkdir` the intermediate directories under the snapshot root, using that absolute path as-is — resulting in the invalid compound path.

3. **The missing `mcp.json` in the installed power directory** is a secondary contributing factor. All other MCP-enabled powers have their `mcp.json` in the installed location; the az900-microsoft-learn power was apparently registered/installed without copying its `mcp.json` to the installed directory. This may cause Kiro to fall back to reading the workspace's power `mcp.json` at an unexpected time (e.g., during session snapshot), triggering the absolute-path bug.

4. **The `index.cjs` MCP server itself is fine** — it exists, is syntactically valid, starts correctly, and waits for MCP protocol input.

5. **The workspace `mcp.json` at `.kiro/settings/mcp.json` already uses a relative path** — that registration path is correct and should work. The problem originates from the power's own `mcp.json`, not from the settings-level registration.

---

## Recommendations

### Fix A (Preferred): Change the power's `mcp.json` to use a relative path

Edit `c:\Users\iven8\Downloads\0930forkirounivsersity\.kiro\powers\az900-microsoft-learn\mcp.json` to remove `${workspaceFolder}` and use a plain relative path instead:

```json
{
  "mcpServers": {
    "ms-learn": {
      "command": "node",
      "args": [".kiro/powers/az900-microsoft-learn/mcp-server/index.cjs"],
      "description": "Microsoft Learn AZ-900 content fetcher",
      "env": {
        "MS_LEARN_LOCALE": "zh-tw",
        "MS_LEARN_FALLBACK_LOCALE": "en-us"
      }
    }
  }
}
```

This keeps the path relative (resolved from workspace root CWD), consistent with what `.kiro/settings/mcp.json` already uses. It avoids the Windows `path.join` bug entirely.

### Fix B: Add an `mcp.json` to the installed power directory

Create `C:\Users\iven8\.kiro\powers\installed\az900-microsoft-learn\mcp.json` with the same content as Fix A. This makes the installed power consistent with all other MCP-enabled installed powers and eliminates the fallback-to-workspace-mcp.json scenario.

**Recommended:** Apply **both Fix A and Fix B** together for completeness. Fix A addresses the root cause (absolute path in power mcp.json). Fix B makes the installed power directory complete and consistent.

### Do NOT do

- Do not change `.kiro/settings/mcp.json` to use an absolute path — it is already correct with the relative path.
- Do not delete `${workspaceFolder}` from the settings-level file (it isn't there).
- Do not replace `index.cjs` — the script is valid.

---

## File Inventory

| File | Status | Notes |
|---|---|---|
| `.kiro/powers/az900-microsoft-learn/plugin.json` | ✅ Present | Declares `"mcp": "mcp.json"` |
| `.kiro/powers/az900-microsoft-learn/mcp.json` | ⚠️ Buggy | Uses `${workspaceFolder}` — produces absolute path → triggers ENOENT |
| `.kiro/powers/az900-microsoft-learn/mcp-server/index.cjs` | ✅ Present, valid | Stdio MCP server, starts correctly |
| `.kiro/settings/mcp.json` (ms-learn entry) | ✅ Correct | Uses relative path |
| `C:\Users\iven8\.kiro\powers\installed\az900-microsoft-learn\mcp.json` | ❌ Missing | Needs to be created |
| `C:\Users\iven8\.kiro\powers\installed\az900-microsoft-learn\POWER.md` | ✅ Present | Documents the power |
| `C:\Users\iven8\.kiro\powers\installed\az900-microsoft-learn\steering\` | ⚠️ Empty | Steering dir exists but has no files |
