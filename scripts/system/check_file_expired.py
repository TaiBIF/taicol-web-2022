from datetime import datetime, timedelta
import os
from pathlib import Path

# 下載檔案僅保留一個月

# /tc-web-volumes/media/match_result
# /tc-web-volumes/media/download

exp = datetime.now() - timedelta(days=31)


paths = ['/tc-web-volumes/media/match_result', '/tc-web-volumes/media/download']

for pp in paths:
    files = os.listdir(pp)
    for f in files:
        file_timestamp = os.path.getmtime(os.path.join(pp, f))
        file_datetime = datetime.fromtimestamp(file_timestamp)
        if file_datetime < exp:
            my_file = Path(os.path.join(pp, f))
            my_file.unlink(missing_ok=True)

