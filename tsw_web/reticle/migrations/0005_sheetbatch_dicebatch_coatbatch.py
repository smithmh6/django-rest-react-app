# Generated by Django 4.0.8 on 2024-01-25 16:12

import common.models.generic_batch
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('contenttypes', '0002_remove_content_type_name'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('reticle', '0004_coatsku_diceroute_dicesku_photomasksku_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='SheetBatch',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('notes', models.CharField(max_length=250, null=True)),
                ('step_object_id', models.PositiveIntegerField()),
                ('name', models.CharField(max_length=50, unique=True)),
                ('order_no', models.CharField(max_length=50, null=True)),
                ('qty', models.PositiveIntegerField()),
                ('ordered', models.DateField(null=True)),
                ('needed', models.DateField(default=common.models.generic_batch.date_needed)),
                ('closed', models.BooleanField(default=False)),
                ('hold', models.BooleanField(default=False)),
                ('qrcode', models.FileField(blank=True, null=True, upload_to='qrcodes')),
                ('sku_object_id', models.PositiveIntegerField()),
                ('batch_type', models.CharField(choices=[('PRODUCTION', 'PRODUCTION'), ('DEVELOPMENT', 'DEVELOPMENT'), ('TEST', 'TEST'), ('CUSTOM', 'CUSTOM')], default='PROD', max_length=25)),
                ('sku_content_type', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='%(app_label)s_%(class)s_batch_skus', to='contenttypes.contenttype')),
                ('step_content_type', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='%(app_label)s_%(class)s_step_items', to='contenttypes.contenttype')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL, to_field='username')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='DiceBatch',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('notes', models.CharField(max_length=250, null=True)),
                ('step_object_id', models.PositiveIntegerField()),
                ('name', models.CharField(max_length=50, unique=True)),
                ('order_no', models.CharField(max_length=50, null=True)),
                ('qty', models.PositiveIntegerField()),
                ('ordered', models.DateField(null=True)),
                ('needed', models.DateField(default=common.models.generic_batch.date_needed)),
                ('closed', models.BooleanField(default=False)),
                ('hold', models.BooleanField(default=False)),
                ('qrcode', models.FileField(blank=True, null=True, upload_to='qrcodes')),
                ('sku_object_id', models.PositiveIntegerField()),
                ('batch_type', models.CharField(choices=[('PRODUCTION', 'PRODUCTION'), ('DEVELOPMENT', 'DEVELOPMENT'), ('TEST', 'TEST'), ('CUSTOM', 'CUSTOM')], default='PROD', max_length=25)),
                ('sku_content_type', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='%(app_label)s_%(class)s_batch_skus', to='contenttypes.contenttype')),
                ('step_content_type', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='%(app_label)s_%(class)s_step_items', to='contenttypes.contenttype')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL, to_field='username')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='CoatBatch',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('notes', models.CharField(max_length=250, null=True)),
                ('step_object_id', models.PositiveIntegerField()),
                ('name', models.CharField(max_length=50, unique=True)),
                ('order_no', models.CharField(max_length=50, null=True)),
                ('qty', models.PositiveIntegerField()),
                ('ordered', models.DateField(null=True)),
                ('needed', models.DateField(default=common.models.generic_batch.date_needed)),
                ('closed', models.BooleanField(default=False)),
                ('hold', models.BooleanField(default=False)),
                ('qrcode', models.FileField(blank=True, null=True, upload_to='qrcodes')),
                ('sku_object_id', models.PositiveIntegerField()),
                ('batch_type', models.CharField(choices=[('PRODUCTION', 'PRODUCTION'), ('DEVELOPMENT', 'DEVELOPMENT'), ('TEST', 'TEST'), ('CUSTOM', 'CUSTOM')], default='PROD', max_length=25)),
                ('sku_content_type', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='%(app_label)s_%(class)s_batch_skus', to='contenttypes.contenttype')),
                ('step_content_type', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='%(app_label)s_%(class)s_step_items', to='contenttypes.contenttype')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL, to_field='username')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
