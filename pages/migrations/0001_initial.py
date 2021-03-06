# Generated by Django 4.0.6 on 2022-07-21 02:38

import ckeditor.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Article',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('category', models.CharField(blank=True, choices=[('t', '分類系統'), ('c', '保育指標')], max_length=1, null=True)),
                ('title', models.CharField(blank=True, max_length=100, null=True)),
                ('content', ckeditor.fields.RichTextField(blank=True, null=True)),
                ('author', models.JSONField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='Download',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('category', models.CharField(blank=True, choices=[('d', '說明文件'), ('n', '名錄檔案（學名）'), ('t', '名錄檔案（物種）')], max_length=1, null=True)),
                ('title', models.CharField(blank=True, max_length=100, null=True)),
                ('description', models.CharField(blank=True, max_length=1000, null=True)),
                ('path', models.CharField(blank=True, max_length=1000, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='News',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('category', models.CharField(blank=True, choices=[('a', '網站公告'), ('t', '名錄增修')], max_length=1, null=True)),
                ('title', models.CharField(blank=True, max_length=100, null=True)),
                ('content', ckeditor.fields.RichTextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
