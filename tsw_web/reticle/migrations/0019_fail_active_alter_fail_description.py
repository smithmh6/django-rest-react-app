# Generated by Django 4.0.8 on 2024-01-29 17:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reticle', '0018_rename_oldfail_fail'),
    ]

    operations = [
        migrations.AddField(
            model_name='fail',
            name='active',
            field=models.BooleanField(default=True),
        ),
        migrations.AlterField(
            model_name='fail',
            name='description',
            field=models.CharField(max_length=250, null=True),
        ),
    ]
