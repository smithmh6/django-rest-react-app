# Generated by Django 4.0.8 on 2024-01-25 16:11

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('contenttypes', '0002_remove_content_type_name'),
        ('reticle', '0003_remove_oldmaintenancerequest_created_by_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='CoatSku',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=250, unique=True)),
                ('description', models.CharField(max_length=250, null=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('notes', models.CharField(max_length=250, null=True)),
                ('location', models.CharField(max_length=250, null=True)),
                ('stock_min', models.IntegerField(default=0)),
                ('cost', models.DecimalField(decimal_places=2, max_digits=12)),
                ('active', models.BooleanField(default=True)),
                ('special', models.BooleanField(default=False)),
                ('replaced', models.ForeignKey(db_column='replaced_name', null=True, on_delete=django.db.models.deletion.PROTECT, related_name='replaced_skus', to='reticle.coatsku', to_field='name')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='DiceRoute',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=250, unique=True)),
                ('description', models.CharField(max_length=250, null=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='DiceSku',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=250, unique=True)),
                ('description', models.CharField(max_length=250, null=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('notes', models.CharField(max_length=250, null=True)),
                ('location', models.CharField(max_length=250, null=True)),
                ('stock_min', models.IntegerField(default=0)),
                ('cost', models.DecimalField(decimal_places=2, max_digits=12)),
                ('active', models.BooleanField(default=True)),
                ('special', models.BooleanField(default=False)),
                ('length_target', models.FloatField()),
                ('length_min', models.FloatField()),
                ('length_max', models.FloatField()),
                ('width_target', models.FloatField()),
                ('width_min', models.FloatField()),
                ('width_max', models.FloatField()),
                ('min_part_index', models.IntegerField(default=0)),
                ('max_part_index', models.IntegerField(default=100)),
                ('replaced', models.ForeignKey(db_column='replaced_name', null=True, on_delete=django.db.models.deletion.PROTECT, related_name='replaced_skus', to='reticle.dicesku', to_field='name')),
                ('route', models.ForeignKey(db_column='route_name', on_delete=django.db.models.deletion.PROTECT, to='reticle.diceroute', to_field='name')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='PhotomaskSku',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=250, unique=True)),
                ('description', models.CharField(max_length=250, null=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('notes', models.CharField(max_length=250, null=True)),
                ('vendor_object_id', models.PositiveIntegerField()),
                ('alternate_vendor_object_id', models.PositiveIntegerField()),
                ('location', models.CharField(max_length=250, null=True)),
                ('stock_min', models.IntegerField(default=0)),
                ('cost', models.DecimalField(decimal_places=2, max_digits=12)),
                ('active', models.BooleanField(default=True)),
                ('special', models.BooleanField(default=False)),
                ('designed', models.DateField(null=True)),
                ('version', models.CharField(max_length=50)),
                ('serial', models.CharField(max_length=50)),
                ('ordered', models.DateField(null=True)),
                ('started', models.DateField(null=True)),
                ('ended', models.DateField(null=True)),
                ('cleaned', models.DateField(null=True)),
                ('alternate_vendor_content_type', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='%(app_label)s_%(class)s_alt_vendor_skus', to='contenttypes.contenttype')),
                ('replaced', models.ForeignKey(db_column='replaced_name', null=True, on_delete=django.db.models.deletion.PROTECT, related_name='replaced_skus', to='reticle.photomasksku', to_field='name')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='ProductCategory',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=250, unique=True)),
                ('description', models.CharField(max_length=250, null=True)),
                ('code', models.CharField(max_length=250, unique=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='SheetSku',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=250, unique=True)),
                ('description', models.CharField(max_length=250, null=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('notes', models.CharField(max_length=250, null=True)),
                ('location', models.CharField(max_length=250, null=True)),
                ('stock_min', models.IntegerField(default=0)),
                ('cost', models.DecimalField(decimal_places=2, max_digits=12)),
                ('active', models.BooleanField(default=True)),
                ('special', models.BooleanField(default=False)),
                ('part_qty', models.IntegerField()),
                ('cd_required', models.BooleanField(default=False)),
                ('cd_target', models.FloatField()),
                ('cd_min', models.FloatField()),
                ('cd_max', models.FloatField()),
                ('coat_sku', models.ForeignKey(db_column='coat_sku_name', on_delete=django.db.models.deletion.PROTECT, to='reticle.coatsku', to_field='name')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='VendorSku',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=250, unique=True)),
                ('description', models.CharField(max_length=250, null=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('notes', models.CharField(max_length=250, null=True)),
                ('vendor_object_id', models.PositiveIntegerField()),
                ('alternate_vendor_object_id', models.PositiveIntegerField()),
                ('location', models.CharField(max_length=250, null=True)),
                ('stock_min', models.IntegerField(default=0)),
                ('cost', models.DecimalField(decimal_places=2, max_digits=12)),
                ('active', models.BooleanField(default=True)),
                ('special', models.BooleanField(default=False)),
                ('alternate_vendor_content_type', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='%(app_label)s_%(class)s_alt_vendor_skus', to='contenttypes.contenttype')),
                ('replaced', models.ForeignKey(db_column='replaced_name', null=True, on_delete=django.db.models.deletion.PROTECT, related_name='replaced_skus', to='reticle.vendorsku', to_field='name')),
                ('vendor_content_type', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='%(app_label)s_%(class)s_vendor_skus', to='contenttypes.contenttype')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='SheetToPhotomask',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('pm_sku', models.ForeignKey(db_column='pm_sku_name', on_delete=django.db.models.deletion.PROTECT, to='reticle.photomasksku', to_field='name')),
                ('sheet_sku', models.ForeignKey(db_column='sheet_sku_name', on_delete=django.db.models.deletion.PROTECT, to='reticle.sheetsku', to_field='name')),
            ],
        ),
        migrations.AddField(
            model_name='sheetsku',
            name='pm_sku',
            field=models.ManyToManyField(through='reticle.SheetToPhotomask', to='reticle.photomasksku'),
        ),
        migrations.AddField(
            model_name='sheetsku',
            name='replaced',
            field=models.ForeignKey(db_column='replaced_name', null=True, on_delete=django.db.models.deletion.PROTECT, related_name='replaced_skus', to='reticle.sheetsku', to_field='name'),
        ),
        migrations.CreateModel(
            name='RawMaterialSku',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=250, unique=True)),
                ('description', models.CharField(max_length=250, null=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('notes', models.CharField(max_length=250, null=True)),
                ('location', models.CharField(max_length=250, null=True)),
                ('stock_min', models.IntegerField(default=0)),
                ('cost', models.DecimalField(decimal_places=2, max_digits=12)),
                ('active', models.BooleanField(default=True)),
                ('special', models.BooleanField(default=False)),
                ('qty', models.IntegerField()),
                ('recycled_sku', models.ForeignKey(db_column='recycled_sku_name', null=True, on_delete=django.db.models.deletion.PROTECT, related_name='recycled_skus', to='reticle.rawmaterialsku', to_field='name')),
                ('replaced', models.ForeignKey(db_column='replaced_name', null=True, on_delete=django.db.models.deletion.PROTECT, related_name='replaced_skus', to='reticle.rawmaterialsku', to_field='name')),
                ('vendor_sku', models.ForeignKey(db_column='vendor_sku_name', on_delete=django.db.models.deletion.PROTECT, related_name='related_rmskus', to='reticle.vendorsku', to_field='name')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='photomasksku',
            name='sheet_sku',
            field=models.ManyToManyField(through='reticle.SheetToPhotomask', to='reticle.sheetsku'),
        ),
        migrations.AddField(
            model_name='photomasksku',
            name='vendor_content_type',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='%(app_label)s_%(class)s_vendor_skus', to='contenttypes.contenttype'),
        ),
        migrations.CreateModel(
            name='FinalProductSku',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=250, unique=True)),
                ('description', models.CharField(max_length=250, null=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('notes', models.CharField(max_length=250, null=True)),
                ('location', models.CharField(max_length=250, null=True)),
                ('stock_min', models.IntegerField(default=0)),
                ('cost', models.DecimalField(decimal_places=2, max_digits=12)),
                ('active', models.BooleanField(default=True)),
                ('special', models.BooleanField(default=False)),
                ('price', models.DecimalField(decimal_places=2, max_digits=10, null=True)),
                ('released', models.DateField(null=True)),
                ('category', models.ForeignKey(db_column='category_name', null=True, on_delete=django.db.models.deletion.PROTECT, related_name='related_fpskus', to='reticle.productcategory', to_field='name')),
                ('dice_sku', models.ForeignKey(db_column='dice_sku_name', on_delete=django.db.models.deletion.PROTECT, to='reticle.dicesku', to_field='name')),
                ('replaced', models.ForeignKey(db_column='replaced_name', null=True, on_delete=django.db.models.deletion.PROTECT, related_name='replaced_skus', to='reticle.finalproductsku', to_field='name')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='dicesku',
            name='sheet_sku',
            field=models.ForeignKey(db_column='sheet_sku_name', on_delete=django.db.models.deletion.PROTECT, to='reticle.sheetsku', to_field='name'),
        ),
        migrations.AddField(
            model_name='coatsku',
            name='rm_sku',
            field=models.ForeignKey(db_column='rm_sku_name', on_delete=django.db.models.deletion.PROTECT, to='reticle.rawmaterialsku', to_field='name'),
        ),
    ]
