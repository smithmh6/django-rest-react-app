# Generated by Django 4.0.8 on 2024-01-25 16:20

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('reticle', '0008_rename_fail_oldfail_rename_step_oldstep'),
    ]

    operations = [
        migrations.CreateModel(
            name='Fail',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('description', models.CharField(max_length=250, null=True)),
                ('name', models.CharField(max_length=25, unique=True)),
                ('active', models.BooleanField(default=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Step',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('description', models.CharField(max_length=250, null=True)),
                ('name', models.CharField(max_length=50, unique=True)),
                ('location', models.CharField(max_length=100, null=True)),
                ('next_step', models.ForeignKey(db_column='next_step_name', null=True, on_delete=django.db.models.deletion.PROTECT, related_name='%(app_label)s_%(class)s_next_related_steps', to='reticle.step', to_field='name')),
                ('previous_step', models.ForeignKey(db_column='previous_step_name', null=True, on_delete=django.db.models.deletion.PROTECT, related_name='%(app_label)s_%(class)s_prev_related_steps', to='reticle.step', to_field='name')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
