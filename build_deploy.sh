#!/bin/bash
# 一鍵部署：本機 build → 同步到伺服器 → 伺服器 git pull → 重啟對應容器
# 詳細說明見 DEPLOY.md
set -euo pipefail

ENV=${1:-}
TARGET_PART=${2:-}
ASSUME_YES=${3:-}   # 加上 -y 會略過所有確認

usage() {
  echo "用法: ./build_deploy.sh [staging|production] [code|web|admin|all] [-y]"
  echo "  code  = 只改了 Django（Python、模板、翻譯檔），不需 build"
  echo "  web   = 改了前台 React（react_src）"
  echo "  admin = 改了管理後台（react-backend）"
  echo "  all   = 前台與後台都改了"
  echo "  -y    = 略過確認（選用）"
  exit 1
}
[[ "$ENV" == "staging" || "$ENV" == "production" ]] || usage
[[ "$TARGET_PART" =~ ^(code|web|admin|all)$ ]] || usage

if [ "$ENV" == "production" ]; then
  TARGET="tc-prod"; MK="prod"
else
  TARGET="tc-stag"; MK="stag"
fi
REMOTE_PATH="~/taicol-web-2022/"
SSH_OPT="ssh -p 22 -i ~/.ssh/aws-taibif-21.pem"

confirm() {
  if [[ "$ASSUME_YES" != "-y" ]]; then
    read -r -p "$1 按 Enter 繼續，Ctrl-C 取消： " _
  fi
}

DO_WEB=false; DO_ADMIN=false
[[ "$TARGET_PART" == "web" || "$TARGET_PART" == "all" ]] && DO_WEB=true
[[ "$TARGET_PART" == "admin" || "$TARGET_PART" == "all" ]] && DO_ADMIN=true

# ===== 部署前檢查 =====
# 1) 伺服器是 git pull 遠端，所以本機的 commit 必須已 push
if git rev-parse --abbrev-ref '@{u}' >/dev/null 2>&1; then
  git fetch -q
  if [ -n "$(git log '@{u}..HEAD' --oneline)" ]; then
    echo "錯誤：有尚未 push 的 commit，請先 git push。"; exit 1
  fi
  if [ -n "$(git log 'HEAD..@{u}' --oneline)" ]; then
    echo "錯誤：本機落後遠端，請先 git pull。"; exit 1
  fi
fi
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo "警告：有尚未 commit 的修改，build 出來的內容會和伺服器 pull 到的程式碼不一致。"
  confirm "確定要繼續？"
fi

# 2) build 一律用 Node 16（前台與後台相同）
if $DO_WEB || $DO_ADMIN; then
  NODE_MAJOR=$(node -v 2>/dev/null | sed -E 's/^v([0-9]+).*/\1/' || true)
  if [[ "$NODE_MAJOR" != "16" ]]; then
    echo "錯誤：需要 Node 16，目前是 $(node -v 2>/dev/null || echo '未安裝')。請先執行 nvm use 16"; exit 1
  fi
fi

if [ "$ENV" == "production" ]; then
  confirm "即將部署到【正式站】($TARGET)，範圍：$TARGET_PART。"
fi

# ===== build =====
if $DO_WEB; then
  echo "=== [$ENV] 建置網頁前台 (react_src) using .env.$ENV ==="
  ENV_FILE=".env.$ENV" npm run build
fi

if $DO_ADMIN; then
  echo "=== [$ENV] 建置管理介面 (Next.js) using .env.$ENV ==="
  rm -rf react-backend/app/.next
  (
    cd react-backend/app
    # package-lock 有變動或 node_modules 不存在時才重新安裝
    if [ ! -d node_modules ] || [ package-lock.json -nt node_modules/.package-lock.json ]; then
      npm ci
    fi
    npx dotenv -e ".env.$ENV" -- npm run build
  )
fi

# ===== 同步 build 產物 =====
if $DO_ADMIN; then
  echo "=== 以 dry-run 顯示 .next 會被刪除/變更的檔案 ==="
  rsync -aRv --no-perms --delete -n react-backend/app/.next "$TARGET:$REMOTE_PATH" -e "$SSH_OPT"
  confirm "以上 .next 變更無誤？"
  rsync -aRv --no-perms --delete react-backend/app/.next "$TARGET:$REMOTE_PATH" -e "$SSH_OPT"
fi

if $DO_WEB; then
  rsync -aRv --no-perms static/react_component/*.js "$TARGET:$REMOTE_PATH" -e "$SSH_OPT"
fi

# ===== 伺服器：git pull + 重啟 =====
# django 重啟時會自動 collectstatic，所以前台 bundle 與程式碼更新都只需重啟 django
REMOTE_CMD="cd $REMOTE_PATH && git pull --ff-only"
if [[ "$TARGET_PART" != "admin" ]]; then
  REMOTE_CMD="$REMOTE_CMD && make $MK-restart-web"
fi
if $DO_ADMIN; then
  REMOTE_CMD="$REMOTE_CMD && make $MK-restart-admin"
fi

echo "=== 在 $TARGET 執行：$REMOTE_CMD ==="
$SSH_OPT -t "$TARGET" "$REMOTE_CMD"

echo ""
echo "部署完成（$ENV / $TARGET_PART）。請依 DEPLOY.md 的「部署後檢查」確認網站正常。"
