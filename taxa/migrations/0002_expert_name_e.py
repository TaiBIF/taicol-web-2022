# Generated by Django 4.0.6 on 2022-07-20 02:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('taxa', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='expert',
            name='name_e',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
