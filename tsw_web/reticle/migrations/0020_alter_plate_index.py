# Generated by Django 4.0.8 on 2024-01-29 18:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reticle', '0019_fail_active_alter_fail_description'),
    ]

    operations = [
        migrations.AlterField(
            model_name='plate',
            name='index',
            field=models.PositiveIntegerField(null=True),
        ),
    ]
