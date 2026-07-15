import logging

from django.contrib.staticfiles.storage import ManifestStaticFilesStorage

logger = logging.getLogger(__name__)


class LenientManifestStaticFilesStorage(ManifestStaticFilesStorage):
    """
    跟 ManifestStaticFilesStorage 完全相同，差別在於：
    當 CSS/JS 裡引用的靜態檔案實際不存在時，只記錄警告並保留原本的路徑，
    而不是讓整個 collectstatic 直接失敗中斷。
    """

    def hashed_name(self, name, content=None, filename=None):
        try:
            return super().hashed_name(name, content, filename)
        except ValueError:
            logger.warning("Missing staticfile referenced, skipping hash: %s", name)
            return name