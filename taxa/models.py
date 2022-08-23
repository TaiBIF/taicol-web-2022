from django.db import models
from django import forms
from ckeditor_uploader.fields import RichTextUploadingField


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


class Feedback(models.Model): # 錯誤回報
    TYPE_CHOICE = (
        (1, '學名和中文名'),
        (2, '照片'),
        (3, '分類資訊'),
        (4, '分類階層'),
        (5, '物種資訊'),
        (6, '學名變遷'),
        (7, '文獻'),
        (8, '專家'),
        (9, '相關連結'),
        (10, '變更歷史')
    )
    taxon_id = models.CharField(max_length=7, blank=False, null=False)
    type = models.SmallIntegerField(choices=TYPE_CHOICE, null=True, blank=True)
    title = models.CharField(max_length=1000, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    notify = models.BooleanField(default=True)
    name = models.CharField(max_length=1000, blank=True, null=True)
    email = models.CharField(max_length=1000, blank=True, null=True)
    response = RichTextUploadingField(blank=True, null=True)
    is_solved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)