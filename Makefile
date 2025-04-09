#SHELL := bash
#.ONESHELL:
#.SHELLFLAGS := -eu -o pipefail -c
#.DELETE_ON_ERROR:
#MAKEFLAGS += --warn-undefined-variables
#MAKEFLAGS += --no-builtin-rules

dev-up:
	docker compose up -d

dev-down:
	docker compose down

dev-build:
	docker compose build

stag-build:
	docker compose -f staging.yml build

stag-up:
	docker compose -f staging.yml up -d
	docker compose -f react-backend/staging.yml up -d

stag-down:
	docker compose -f staging.yml down
	docker compose -f react-backend/staging.yml down
	unlink ~/tc-web-volumes/static/upload

prod-build:
	docker compose -f production.yml build
	docker compose -f react-backend/production.yml build

prod-up:
	docker compose -f production.yml up -d
	docker compose -f react-backend/production.yml up -d

prod-down:
	docker compose -f production.yml down
	docker compose -f react-backend/production.yml down
	unlink ~/tc-web-volumes/static/upload

