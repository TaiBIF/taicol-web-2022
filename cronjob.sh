#!/bin/sh
# 0 16 * * * docker compose exec django /code/cronjob.sh >> /tmp/stat.log 2>&1

python ./manage.py shell < ./scripts/system/check_file_expired.py

