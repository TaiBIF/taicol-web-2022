from django.db import models
from django import forms


class SearchStat(models.Model): # 熱門搜尋階層
    taxon_id = models.CharField(max_length=8, blank=False, null=False)
    count = models.IntegerField()
    updated_at = models.DateTimeField(auto_now_add=True)