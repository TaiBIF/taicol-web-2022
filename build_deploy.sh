#!/bin/bash
set -euo pipefail

ENV=${1:-}
if [[ "$ENV" != "staging" && "$ENV" != "production" ]]; then
  echo "用法: ./scripts/build_deploy.sh [staging|production]"
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

echo "=== [$ENV] 建置 Django 前端 (react_src) using .env.$ENV ==="
ENV_FILE=".env.$ENV" npx webpack --mode production

echo "=== [$ENV] 建置 React backend (Next.js) using .env.$ENV ==="
rm -rf react-backend/app/.next
(
  cd react-backend/app
  npx dotenv -e ".env.$ENV" -- npm run build
)

echo ""
echo "=== [$ENV] 準備 rsync 到 $TARGET ==="
echo "先以 dry-run 顯示 .next 會被刪除/變更的檔案："
rsync -aRv --no-perms --delete -n react-backend/app/.next "$TARGET:$REMOTE_PATH" -e "$SSH_OPT"

echo ""
read -r -p "以上 .next 變更無誤？按 Enter 實際同步，Ctrl-C 取消： " _

# React backend .next（--delete 移除目標端殘留的舊/dev 檔案）
rsync -aRv --no-perms --delete react-backend/app/.next "$TARGET:$REMOTE_PATH" -e "$SSH_OPT"

# Django 前端 bundle（*.js glob，覆蓋即可，不需 --delete）
rsync -aRv --no-perms static/react_component/*.js "$TARGET:$REMOTE_PATH" -e "$SSH_OPT"

echo ""
echo "部署完成。接著登入 $TARGET，於專案目錄執行："
if [ "$ENV" == "production" ]; then
  echo "  make prod-up   （必要時先 make prod-build）"
else
  echo "  make stag-up   （必要時先 make stag-build）"
fi