# Generated by Django 4.0.8 on 2023-10-12 00:56

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('moe', '0002_project_customer_content_type_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='delivery',
            field=models.DateField(default=django.utils.timezone.now),
            preserve_default=False,
        ),
    ]
