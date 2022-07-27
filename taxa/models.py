from django.db import models


class Expert(models.Model):
    name = models.CharField(max_length=100, blank=True, null=True)
    name_e = models.CharField(max_length=100, blank=True, null=True) # 英文名
    email = models.CharField(max_length=1000, blank=True, null=True)
    taxon_id = models.CharField(max_length=7, blank=True, null=True)
    taxon_group = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)


class SearchStat(models.Model): # 熱門搜尋階層
    taxon_id = models.CharField(max_length=7, blank=False, null=False)
    count = models.IntegerField()
    updated_at = models.DateTimeField(auto_now_add=True)
