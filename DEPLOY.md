# TaiCOL 網站部署說明

部署只需要一個指令，會自動完成：本機 build → 上傳 build 產物 → 伺服器 `git pull` → 重啟容器。

```
./build_deploy.sh <環境> <範圍>
```

## 本機確認開發結果

啟動（第一次啟動會先 `npm install`，需等幾分鐘）：

```
make dev-up          # Django + 資料庫 + Solr + 前台 React 自動 build
make dev-admin-up    # 需要改或看管理後台時才啟動
```

本機第一次啟動前需要兩個設定檔（都不在 git 裡）：
- 前台：專案根目錄的 `.env`，參考 `dotenv.example`
- 後台：`react-backend/app/.env`，參考 `react-backend/app/dotenv.example`（只有要跑後台時才需要）

- 前台網站：http://localhost:8007
- 管理後台：http://localhost:3000

改完之後要做什麼：

| 改了什麼 | 要做什麼 |
|---|---|
| Python、templates | 不用做任何事，直接重新整理瀏覽器 |
| 前台 React（`react_src/`） | 等幾秒自動 build 完成（可用 `make dev-watch-logs` 看進度），再重新整理 |
| 管理後台（`react-backend/`） | 不用做任何事，畫面會自動更新 |
| 翻譯檔 `.po` | 執行 `docker compose exec django python manage.py compilemessages`，再重新整理（產生的 `.mo` 也要 commit） |
| 本機 `.env` | `make dev-reload` |

關閉：`make dev-down`、`make dev-admin-down`

## 一般流程

1. 本機修改、測試完成
2. `git commit`，`git push`
3. `nvm use 16`
4. 先部署測試站：`./build_deploy.sh staging <範圍>`
5. 到 https://web-staging.taicol.tw 檢查（見「部署後檢查」）
6. 沒問題再部署正式站：`./build_deploy.sh production <範圍>`

## 範圍怎麼選

| 這次改了什麼 | 範圍 |
|---|---|
| 只有 Django：Python、templates、翻譯檔（`.po` / `.mo`）、static 圖片或 CSS | `code` |
| 前台 React（`react_src/`） | `web` |
| 管理後台（`react-backend/`） | `admin` |
| 前台 React 與管理後台都有 | `all` |
| 不確定 | `all`（最慢，但一定涵蓋） |

說明：
- `code` 以外的範圍都包含 `git pull` 與重啟 Django，所以 Django 的修改不需要另外部署。
- 正式站部署前會要求按 Enter 確認；加上 `-y` 可略過所有確認。

## 部署後檢查

- [ ] 首頁、物種名錄、物種資訊頁可以正常開啟
- [ ] 中英文切換正常
- [ ] 改到的功能正常
- [ ] 改到管理後台時：https://admin.taicol.tw（測試站 https://web-admin.taicol.tw）可以登入

## 特殊情況（不常發生）

在伺服器的 `~/taicol-web-2022` 目錄執行，正式站用 `prod-`，測試站用 `stag-`：

| 情況 | 指令 |
|---|---|
| 修改了伺服器上的 `.env` | `make prod-reload-web`（後台的 `react-backend/app/.env` 則用 `make prod-reload-admin`） |
| 管理後台新增或更新了 npm 套件 | 請聯絡 Kim，目前伺服器上安裝套件可能當機 |
| 網站整個沒有回應 | `make prod-restart-web` 或 `make prod-restart-admin` |
| 部署後發現問題要退回 | 本機 `git revert <commit>`，push 後重新部署一次 |

## 第一次使用前的設定（只需做一次）

- [ ] 安裝 nvm 與 Node 16：`nvm install 16`
- [ ] 取得 SSH 金鑰 `~/.ssh/aws-taibif-21.pem`，並在 `~/.ssh/config` 設定 `tc-prod`、`tc-stag` 兩台主機
- [ ] 專案根目錄放 `.env.staging`、`.env.production`（前台 build 用，參考 `dotenv.build.example`）
- [ ] `react-backend/app/` 放 `.env.staging`、`.env.production`（後台 build 用，參考 `react-backend/app/dotenv.build.example`）
- [ ] 前台與後台各執行一次 `npm install`

## 常見錯誤

| 錯誤訊息 | 處理方式 |
|---|---|
| 需要 Node 16 | 執行 `nvm use 16` |
| 有尚未 push 的 commit | 執行 `git push` |
| 本機落後遠端 | 執行 `git pull` |
| 伺服器 `git pull` 失敗（Not possible to fast-forward、local changes） | 伺服器上有人直接改了檔案。請勿在伺服器上修改檔案，聯絡 Kim 處理 |
| `Permission denied (publickey)` | SSH 金鑰或 `~/.ssh/config` 設定有誤 |