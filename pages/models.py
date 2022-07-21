from pydoc import describe
from django.db import models
from ckeditor.fields import RichTextField


class Article(models.Model):
    CATEGORY_CHOICE = (
        ('t', '分類系統'), # taxonomy
        ('c', '保育指標'), # conservation
    )
    category = models.CharField(choices=CATEGORY_CHOICE, max_length=1, null=True, blank=True)
    title = models.CharField(max_length=100, blank=True, null=True)
    content = RichTextField(blank=True, null=True)
    author = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)


class News(models.Model):
    CATEGORY_CHOICE = (
        ('a', '網站公告'), # announcement
        ('t', '名錄增修'), # taxonomy
    )
    category = models.CharField(choices=CATEGORY_CHOICE, max_length=1, null=True, blank=True)
    title = models.CharField(max_length=100, blank=True, null=True)
    content = RichTextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)


class Download(models.Model):
    CATEGORY_CHOICE = (
        ('d', '說明文件'), # document
        ('n', '名錄檔案（學名）'), # name
        ('t', '名錄檔案（物種）'), # taxa
    )
    category = models.CharField(choices=CATEGORY_CHOICE, max_length=1, null=True, blank=True)
    title = models.CharField(max_length=100, blank=True, null=True)
    description = models.CharField(max_length=1000, blank=True, null=True)
    path = models.CharField(max_length=1000, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)