# Generated by Django 4.0.8 on 2023-10-13 18:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('purchasing', '0002_remove_moecustomerpayment_project_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='RequestStatus',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=250)),
                ('description', models.CharField(max_length=250, null=True)),
                ('code', models.CharField(max_length=250, unique=True)),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
