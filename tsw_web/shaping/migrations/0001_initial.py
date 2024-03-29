# Generated by Django 4.0.8 on 2023-10-11 13:46

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='ServiceType',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=250)),
                ('description', models.CharField(max_length=250, null=True)),
                ('code', models.CharField(max_length=250, unique=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Service',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=250)),
                ('description', models.CharField(max_length=250, null=True)),
                ('notes', models.CharField(max_length=250, null=True)),
                ('qty', models.PositiveIntegerField(null=True)),
                ('yield_qty', models.PositiveIntegerField(null=True)),
                ('customer_file', models.FileField(null=True, upload_to='customer_files')),
                ('order_no', models.CharField(max_length=250, null=True)),
                ('service', models.ForeignKey(db_column='service_code', on_delete=django.db.models.deletion.PROTECT, to='shaping.servicetype', to_field='code')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
