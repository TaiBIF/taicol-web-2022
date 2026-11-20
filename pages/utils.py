from django.contrib.staticfiles.finders import find
from django.contrib.staticfiles.storage import staticfiles_storage
import requests
from conf.settings import env

def static_fallback_open(static_path, mode="r"):
    """
    attempts to open static_path first within collected
    staticfiles storage.

    if that doesn't work then next does a file system search
    for the file and if located then attempts opening using
    standard file i/o.
    """
    writing = "w" in mode or "a" in mode

    if writing or staticfiles_storage.exists(static_path):
        return staticfiles_storage.open(static_path, mode)

    # fall back to finders path
    absolute_path = find(static_path)
    if absolute_path is None:
        raise IOError("{0} does not exist".format(static_path))

    return open(absolute_path, mode)


def verify_turnstile(token):
    if not token:
        return False
    try:
        r = requests.post(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            data={
                'secret': env('TURNSTILE_SECRET_KEY'),
                'response': token,
            },
            timeout=5,
        )
        return r.json().get('success', False)
    except Exception:
        return False

def article_meta(kind, slug):
    """
    Fetch a news/article from the public API on the server side so that
    crawlers (e.g. Facebook) receive the title and the first image in the HTML.
    kind: 'news' or 'article'. Returns {} when the API is unreachable,
    {'not_found': True} when the API answers but the slug does not exist.
    """
    import re
    from urllib.parse import quote
    from django.core.cache import cache
    from django.utils.translation import get_language

    lang = get_language()
    key = f"article_meta:{kind}:{slug}:{lang}"
    cached = cache.get(key)
    if cached is not None:
        return cached

    import logging
    from urllib.parse import urlsplit, urlunsplit
    logger = logging.getLogger(__name__)

    api = env('REACT_API_URL', default='')
    # 依序嘗試：內部網址（正式/測試站容器互連）→ 公開網址
    # 本機 Docker 中 localhost/127.0.0.1 指向 Django 容器自己，另外改用 host.docker.internal 再試
    candidates = []
    for base in (env('REACT_WEB_INTERNAL_API_URL', default=''), api):
        if not base:
            continue
        candidates.append(base)
        parts = urlsplit(base)
        if parts.hostname in ('localhost', '127.0.0.1'):
            netloc = parts.netloc.replace(parts.hostname, 'host.docker.internal', 1)
            candidates.append(urlunsplit(parts._replace(netloc=netloc)))
    candidates = list(dict.fromkeys(c.rstrip('/') for c in candidates))

    meta = {}
    current = {}
    for base in candidates:
        try:
            resp = requests.get(f"{base}/api/{kind}/info", params={"slug": slug}, timeout=3)
            resp.raise_for_status()
            current = (resp.json() or {}).get('current') or {}
            if not current:
                meta['not_found'] = True  # API 有回應但查無此文章（current 為 null）
            break
        except (requests.RequestException, ValueError) as e:
            logger.warning("article_meta: %s/api/%s/info?slug=%s 失敗：%s", base, kind, slug, e)

    if current:
        title = current.get('title') or ''
        if title:
            site = 'Catalogue of Life in Taiwan' if lang == 'en-us' else '臺灣物種名錄 Catalogue of Life in Taiwan'
            meta['og_title'] = f"{title} | {site}"
            m = re.search(r'<img\b[^>]*?(?<![\w-])src="([^"]+)"', current.get('description') or '')
            if m:
                src = m.group(1)
                if src.startswith('/'):
                    src = api + src
                meta['og_image'] = quote(src, safe=':/%?=&#')

    # 成功快取 10 分鐘；連線失敗或查無文章快取 1 分鐘（避免 API 掛掉時每次都等逾時，新文章也能很快出現）
    cache.set(key, meta, 600 if meta.get('og_title') else 60)
    return meta