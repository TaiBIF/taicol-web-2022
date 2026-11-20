"""
容器啟動時從 tbia-portal 抓取異體字 / 組合字對照表，存成本地快取檔。
- 單一來源仍是 tbia-portal repo，這裡只是快取（data/cache/ 已加入 .gitignore）
- 抓取失敗時沿用上次的快取檔；連快取都沒有才中止啟動
"""
import json
import sys
from pathlib import Path

import requests

SOURCE = 'https://raw.githubusercontent.com/TaiBIF/tbia-portal/main/data/'
FILES = ['variants.json', 'composites.json']
CACHE_DIR = Path(__file__).resolve().parent.parent / 'data' / 'cache'


def main():
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    ok = True
    for name in FILES:
        target = CACHE_DIR / name
        try:
            resp = requests.get(SOURCE + name, timeout=10)
            resp.raise_for_status()
            data = resp.json()  # 確認內容是合法 JSON 才覆蓋
            tmp = target.with_suffix('.tmp')
            tmp.write_text(json.dumps(data, ensure_ascii=False), encoding='utf-8')
            tmp.replace(target)
            print(f'[fetch_char_maps] 已更新 {name}')
        except Exception as e:
            if target.exists():
                print(f'[fetch_char_maps] 警告：{name} 抓取失敗（{e}），沿用既有快取', file=sys.stderr)
            else:
                print(f'[fetch_char_maps] 錯誤：{name} 抓取失敗且無快取（{e}）', file=sys.stderr)
                ok = False
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
