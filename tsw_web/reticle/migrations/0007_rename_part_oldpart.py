# Generated by Django 4.0.8 on 2024-01-25 16:15

from django.conf import settings
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('reticle', '0006_rename_plate_oldplate'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Part',
            new_name='OldPart',
        ),
    ]
