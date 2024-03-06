# Generated by Django 4.0.8 on 2024-02-01 17:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reticle', '0021_alter_plate_serial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='coatbatch',
            name='batch_type',
            field=models.CharField(choices=[('PRODUCTION', 'PRODUCTION'), ('DEVELOPMENT', 'DEVELOPMENT'), ('TEST', 'TEST'), ('CUSTOM', 'CUSTOM')], default='PRODUCTION', max_length=25),
        ),
        migrations.AlterField(
            model_name='dicebatch',
            name='batch_type',
            field=models.CharField(choices=[('PRODUCTION', 'PRODUCTION'), ('DEVELOPMENT', 'DEVELOPMENT'), ('TEST', 'TEST'), ('CUSTOM', 'CUSTOM')], default='PRODUCTION', max_length=25),
        ),
        migrations.AlterField(
            model_name='sheetbatch',
            name='batch_type',
            field=models.CharField(choices=[('PRODUCTION', 'PRODUCTION'), ('DEVELOPMENT', 'DEVELOPMENT'), ('TEST', 'TEST'), ('CUSTOM', 'CUSTOM')], default='PRODUCTION', max_length=25),
        ),
    ]
