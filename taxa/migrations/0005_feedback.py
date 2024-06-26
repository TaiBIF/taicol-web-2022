# Generated by Django 4.0.6 on 2022-08-19 08:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('taxa', '0004_searchstat'),
    ]

    operations = [
        migrations.CreateModel(
            name='Feedback',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('taxon_id', models.CharField(max_length=7)),
                ('type', models.SmallIntegerField(blank=True, choices=[(1, '學名和中文名'), (2, '照片'), (3, '分類資訊'), (4, '分類階層'), (5, '物種資訊'), (6, '學名變遷'), (7, '文獻'), (8, '專家'), (9, '相關連結'), (10, '變更歷史')], null=True)),
                ('title', models.CharField(blank=True, max_length=1000, null=True)),
                ('description', models.TextField(blank=True, null=True)),
                ('notify', models.BooleanField(default=True)),
                ('name', models.CharField(blank=True, max_length=1000, null=True)),
                ('email', models.CharField(blank=True, max_length=1000, null=True)),
                ('response', models.TextField(blank=True, null=True)),
                ('is_solved', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
    ]
