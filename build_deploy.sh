#!/bin/bash
set -euo pipefail

ENV=${1:-}
TARGET_PART=${2:-all}

if [[ "$ENV" != "staging" && "$ENV" != "production" ]]; then
  echo "用法: ./scripts/build_deploy.sh [staging|production] [web|admin|all]"
  echo "  web   = 只 build 網頁前台 (Django react_src bundle)"
  echo "  admin = 只 build 管理介面 (React backend / Next.js)"
  echo "  all   = 兩者都 build (預設)"
  exit 1
fi
if [[ "$TARGET_PART" != "web" && "$TARGET_PART" != "admin" && "$TARGET_PART" != "all" ]]; then
  echo "第二參數需為 web / admin / all，收到: $TARGET_PART"
  exit 1
fi

# 依環境綁定目標主機，避免 build 了某環境卻 rsync 到另一台
if [ "$ENV" == "production" ]; then
  TARGET="tcweb-prod"
else
  TARGET="tcweb-stag"
fi
REMOTE_PATH="~/taicol-web-2022/"
SSH_OPT="ssh -p 22 -i ~/.ssh/aws-taibif-21.pem"

# ===== 網頁前台 (Django react_src) =====
if [[ "$TARGET_PART" == "web" || "$TARGET_PART" == "all" ]]; then
  echo "=== [$ENV] 建置網頁前台 (react_src) using .env.$ENV ==="
  ENV_FILE=".env.$ENV" npm run build
fi

# ===== 管理介面 (React backend / Next.js) =====
if [[ "$TARGET_PART" == "admin" || "$TARGET_PART" == "all" ]]; then
  echo "=== [$ENV] 建置管理介面 (Next.js) using .env.$ENV ==="
  rm -rf react-backend/app/.next
  (
    cd react-backend/app
    npx dotenv -e ".env.$ENV" -- npm run build
  )
fi

# ===== rsync =====
echo ""
echo "=== [$ENV] 準備 rsync 到 $TARGET (範圍: $TARGET_PART) ==="

if [[ "$TARGET_PART" == "admin" || "$TARGET_PART" == "all" ]]; then
  echo "先以 dry-run 顯示 .next 會被刪除/變更的檔案："
  rsync -aRv --no-perms --delete -n react-backend/app/.next "$TARGET:$REMOTE_PATH" -e "$SSH_OPT"
  echo ""
  read -r -p "以上 .next 變更無誤？按 Enter 實際同步，Ctrl-C 取消： " _
  # React backend .next（--delete 移除目標端殘留的舊/dev 檔案）
  rsync -aRv --no-perms --delete react-backend/app/.next "$TARGET:$REMOTE_PATH" -e "$SSH_OPT"
fi

if [[ "$TARGET_PART" == "web" || "$TARGET_PART" == "all" ]]; then
  # Django 前端 bundle（*.js glob，覆蓋即可，不需 --delete）
  rsync -aRv --no-perms static/react_component/*.js "$TARGET:$REMOTE_PATH" -e "$SSH_OPT"
fi

echo ""
echo "部署完成。接著登入 $TARGET，於專案目錄執行："
if [ "$ENV" == "production" ]; then
  echo "  make prod-up   （必要時先 make prod-build）"
else
  echo "  make stag-up   （必要時先 make stag-build）"
fi