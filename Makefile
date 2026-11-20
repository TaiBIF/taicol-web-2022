#SHELL := bash
#.ONESHELL:
#.SHELLFLAGS := -eu -o pipefail -c
#.DELETE_ON_ERROR:
#MAKEFLAGS += --warn-undefined-variables
#MAKEFLAGS += --no-builtin-rules

# ===== 本機開發 =====
dev-up:
	docker compose up -d

dev-down:
	docker compose down

dev-build:
	docker compose build

dev-watch-logs:
	docker compose logs -f webpack

# 管理後台（Next.js dev 模式，存檔自動更新），網址 http://localhost:3000
dev-admin-up:
	docker compose -f react-backend/docker-compose.yml up -d

dev-admin-down:
	docker compose -f react-backend/docker-compose.yml down

# 改了本機 .env 時用（restart 不會重新讀取 .env）
dev-reload:
	docker compose up -d django

# ===== 測試站 (staging) =====
stag-build:
	docker compose -f staging.yml build
	docker compose -f react-backend/staging.yml build

stag-build-admin:
	docker compose -f react-backend/staging.yml build

stag-up:
	docker compose -f staging.yml up -d
	docker compose -f react-backend/staging.yml up -d

stag-down:
	docker compose -f staging.yml down
	docker compose -f react-backend/staging.yml down

# 只重啟容器（程式碼或 bundle 改動，不需要 build）
stag-restart-web:
	docker compose -f staging.yml restart django

stag-restart-admin:
	docker compose -f react-backend/staging.yml restart react_app

# 改了 .env 的變數時用這組（restart 不會重新讀取 .env，要重建容器）
stag-reload-web:
	docker compose -f staging.yml up -d django

stag-reload-admin:
	docker compose -f react-backend/staging.yml up -d react_app

# ===== 正式站 (production) =====
prod-build:
	docker compose -f production.yml build
	docker compose -f react-backend/production.yml build

prod-build-admin:
	docker compose -f react-backend/production.yml build

prod-up:
	docker compose -f production.yml up -d
	docker compose -f react-backend/production.yml up -d

prod-down:
	docker compose -f production.yml down
	docker compose -f react-backend/production.yml down

# 只重啟容器（程式碼或 bundle 改動，不需要 build）
prod-restart-web:
	docker compose -f production.yml restart django

prod-restart-admin:
	docker compose -f react-backend/production.yml restart react_app

# 改了 .env 的變數時用這組（restart 不會重新讀取 .env，要重建容器）
prod-reload-web:
	docker compose -f production.yml up -d django

prod-reload-admin:
	docker compose -f react-backend/production.yml up -d react_app
