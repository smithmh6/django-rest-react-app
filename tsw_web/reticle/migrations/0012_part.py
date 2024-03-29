# Generated by Django 4.0.8 on 2024-01-26 17:46

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('contenttypes', '0002_remove_content_type_name'),
        ('reticle', '0011_alter_oldpart_plate'),
    ]

    operations = [
        migrations.CreateModel(
            name='Part',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('notes', models.CharField(max_length=250, null=True)),
                ('batch_object_id', models.PositiveIntegerField(null=True)),
                ('shipment_object_id', models.PositiveIntegerField(null=True)),
                ('step_object_id', models.PositiveIntegerField()),
                ('serial', models.CharField(max_length=50, null=True)),
                ('index', models.PositiveIntegerField()),
                ('fail1_object_id', models.PositiveIntegerField(null=True)),
                ('fail2_object_id', models.PositiveIntegerField(null=True)),
                ('fail3_object_id', models.PositiveIntegerField(null=True)),
                ('photo_cd', models.FloatField(null=True)),
                ('etch_cd', models.FloatField(null=True)),
                ('width', models.FloatField(null=True)),
                ('length', models.FloatField(null=True)),
                ('thickness', models.FloatField(null=True)),
                ('diced', models.DateTimeField(null=True)),
                ('wip3_in', models.DateTimeField(null=True)),
                ('wip3_out', models.DateTimeField(null=True)),
                ('batch_content_type', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='%(app_label)s_%(class)s_batch_items', to='contenttypes.contenttype')),
                ('fail1_content_type', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='%(app_label)s_%(class)s_fail1_parts', to='contenttypes.contenttype')),
                ('fail2_content_type', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='%(app_label)s_%(class)s_fail2_parts', to='contenttypes.contenttype')),
                ('fail3_content_type', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='%(app_label)s_%(class)s_fail3_parts', to='contenttypes.contenttype')),
                ('plate', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='part_set', to='reticle.plate')),
                ('shipment_content_type', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='%(app_label)s_%(class)s_shipped_items', to='contenttypes.contenttype')),
                ('step_content_type', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='%(app_label)s_%(class)s_step_items', to='contenttypes.contenttype')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
