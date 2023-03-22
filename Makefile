#SHELL := bash
#.ONESHELL:
#.SHELLFLAGS := -eu -o pipefail -c
#.DELETE_ON_ERROR:
#MAKEFLAGS += --warn-undefined-variables
#MAKEFLAGS += --no-builtin-rules

dev-up:
	docker-compose up -d

dev-down:
	docker-compose down

dev-build:
	docker-compose build

stag-build:
	docker-compose -f staging.yml build

stag-up:
	docker-compose -f staging.yml up -d
	docker-compose -f react-backend/staging.yml up -d
	cd ~/tc-web-volumes/static
	sudo rm -rf upload/
	ln -s ../../taicol-web-2022/react-backend/app/public/upload

stag-down:
	docker-compose -f staging.yml down
	docker-compose -f react-backend/staging.yml down
	cd ~/tc-web-volumes/static
	unlink upload
	cd ~/taicol-web-2022

prod-build:
	docker-compose -f production.yml build

prod-up:
	docker-compose -f production.yml up -d

prod-down:
	docker-compose -f production.yml down
