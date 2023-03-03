from django.db import models
from django import forms
from ckeditor_uploader.fields import RichTextUploadingField


class Expert(models.Model):
    name = models.CharField(max_length=100, blank=True, null=True)
    name_e = models.CharField(max_length=100, blank=True, null=True) # 英文名
    email = models.CharField(max_length=1000, blank=True, null=True)
    taxon_id = models.CharField(max_length=8, blank=True, null=True)
    taxon_group = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)


class SearchStat(models.Model): # 熱門搜尋階層
    taxon_id = models.CharField(max_length=8, blank=False, null=False)
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
        (10, '變更歷史'),
        (11, '有效名版本紀錄')
    )
    taxon_id = models.CharField('物種編號',max_length=8, blank=False, null=False)
    type = models.SmallIntegerField('類型',choices=TYPE_CHOICE, null=True, blank=True)
    title = models.CharField('主旨',max_length=1000, blank=True, null=True)
    description = models.TextField('錯誤描述',blank=True, null=True)
    notify = models.BooleanField('更新通知與否',default=True)
    name = models.CharField('姓名',max_length=1000, blank=True, null=True)
    email = models.CharField('email',max_length=1000, blank=True, null=True)
    response = RichTextUploadingField('回覆模板',blank=True, null=True)
    is_solved = models.BooleanField('已解決',default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)