#!/bin/bash
set -euo pipefail

ENV=${1:-}
if [[ "$ENV" != "staging" && "$ENV" != "production" ]]; then
  echo "用法: ./scripts/build_deploy.sh [staging|production]"
  exit 1
fi

# 依環境綁定目標主機，避免 build 了某環境卻 rsync 到另一台
if [ "$ENV" == "production" ]; then
  TARGET="tc-prod"
else
  TARGET="tc-stag"
fi
# Node 版本：照 .nvmrc（16）。nvm 是 shell 函式，腳本裡要先載入 nvm.sh；
# nvm.sh 跟 set -euo pipefail 不相容（載入時就會非 0 結束），載入與切換時暫時關掉
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  echo "找不到 nvm（$NVM_DIR/nvm.sh），請先安裝 nvm 或設定 NVM_DIR"
  exit 1
fi
set +euo pipefail
. "$NVM_DIR/nvm.sh"
nvm use
NVM_RC=$?
set -euo pipefail
if [ "$NVM_RC" -ne 0 ]; then
  echo "nvm 切換失敗：沒有 .nvmrc 指定的 Node $(cat .nvmrc)？請先執行 nvm install $(cat .nvmrc)"
  exit 1
fi
echo "=== 使用 Node $(node -v) ==="

REMOTE_PATH="~/taicol-web-2022/"
SSH_OPT="ssh -p 22 -i ~/.ssh/aws-taibif-21.pem"

# build 時會寫死進程式的變數：缺任何一個就停。
# 不檢查的話，缺的值會被默默補上：webpack 變成 undefined，Next.js 則會沿用本機 app/.env 或 .env.production 的值
check_env() {  # 用法：check_env <檔案> <變數>...
  local f=$1; shift
  if [ ! -f "$f" ]; then
    echo "找不到 ${f}，請參考同一層的 dotenv.build.example 建立"
    exit 1
  fi
  local k
  for k in "$@"; do
    grep -qE "^${k}=.+" "$f" || { echo "${f} 缺少 ${k}"; exit 1; }
  done
  echo "  ${f}"
  grep -E "^($(IFS='|'; echo "$*"))=" "$f" | sed 's/^/    /'
}

echo "=== [$ENV] 這次 build 會寫死的值 ==="
check_env ".env.$ENV" REACT_API_URL TAICOL_API_URL NEXT_PUBLIC_PAGINATE_LIMIT
check_env "react-backend/app/.env.$ENV" NEXT_PUBLIC_DOMAIN NEXT_PUBLIC_WEB_PUBLIC_DOMAIN NEXT_PUBLIC_PAGINATE_LIMIT
echo ""

echo "=== [$ENV] 建置 Django 前端 (react_src) using .env.$ENV ==="
ENV_FILE=".env.$ENV" npx webpack --mode production

echo "=== [$ENV] 建置 React backend (Next.js) using .env.$ENV ==="
rm -rf react-backend/app/.next
(
  cd react-backend/app
  # dotenv-cli 不在 package.json，用 --package 指定（只有 npx dotenv 會找不到執行檔）
  npx --yes --package=dotenv-cli@7.4.2 dotenv -e ".env.$ENV" -- npm run build
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
echo "部署完成。接著登入 ${TARGET}，於專案目錄執行："
if [ "$ENV" == "production" ]; then
  echo "  make prod-up   （必要時先 make prod-build）"
else
  echo "  make stag-up   （必要時先 make stag-build）"
fi