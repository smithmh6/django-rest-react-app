# Generated by Django 4.0.8 on 2024-02-13 14:54

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('reticle', '0023_plate_wip2_in_plate_wip2_out'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='coat_skus',
            name='rm_sku',
        ),
        migrations.RemoveField(
            model_name='dice_batch',
            name='created_by',
        ),
        migrations.RemoveField(
            model_name='dice_batch',
            name='dice_sku',
        ),
        migrations.RemoveField(
            model_name='dice_batch',
            name='dice_step',
        ),
        migrations.RemoveField(
            model_name='dice_skus',
            name='sheet_sku',
        ),
        migrations.RemoveField(
            model_name='fp_skus',
            name='coat_sku',
        ),
        migrations.RemoveField(
            model_name='fp_skus',
            name='dice_sku',
        ),
        migrations.RemoveField(
            model_name='fp_skus',
            name='rm_sku',
        ),
        migrations.RemoveField(
            model_name='fp_skus',
            name='sheet_sku',
        ),
        migrations.RemoveField(
            model_name='oldpart',
            name='dice_batch',
        ),
        migrations.RemoveField(
            model_name='oldpart',
            name='diced_by',
        ),
        migrations.RemoveField(
            model_name='oldpart',
            name='fail_1',
        ),
        migrations.RemoveField(
            model_name='oldpart',
            name='fail_2',
        ),
        migrations.RemoveField(
            model_name='oldpart',
            name='fail_3',
        ),
        migrations.RemoveField(
            model_name='oldpart',
            name='inspected_by',
        ),
        migrations.RemoveField(
            model_name='oldpart',
            name='plate',
        ),
        migrations.RemoveField(
            model_name='oldpart',
            name='ship_batch',
        ),
        migrations.RemoveField(
            model_name='oldpart',
            name='step',
        ),
        migrations.RemoveField(
            model_name='oldplate',
            name='coat_batch',
        ),
        migrations.RemoveField(
            model_name='oldplate',
            name='coated_by',
        ),
        migrations.RemoveField(
            model_name='oldplate',
            name='etched_by',
        ),
        migrations.RemoveField(
            model_name='oldplate',
            name='fail_1',
        ),
        migrations.RemoveField(
            model_name='oldplate',
            name='fail_2',
        ),
        migrations.RemoveField(
            model_name='oldplate',
            name='fail_3',
        ),
        migrations.RemoveField(
            model_name='oldplate',
            name='pm_sku',
        ),
        migrations.RemoveField(
            model_name='oldplate',
            name='rm_sku',
        ),
        migrations.RemoveField(
            model_name='oldplate',
            name='sheet_batch',
        ),
        migrations.RemoveField(
            model_name='oldplate',
            name='step',
        ),
        migrations.RemoveField(
            model_name='oldstep',
            name='next_step',
        ),
        migrations.RemoveField(
            model_name='pm_skus',
            name='sheet_sku',
        ),
        migrations.RemoveField(
            model_name='sheet_batch',
            name='created_by',
        ),
        migrations.RemoveField(
            model_name='sheet_batch',
            name='sheet_sku',
        ),
        migrations.RemoveField(
            model_name='sheet_batch',
            name='sheet_step',
        ),
        migrations.RemoveField(
            model_name='sheet_skus',
            name='coat_sku',
        ),
        migrations.RemoveField(
            model_name='sheet_skus',
            name='pm_sku',
        ),
        migrations.RemoveField(
            model_name='sheet_to_mask',
            name='pm_sku',
        ),
        migrations.RemoveField(
            model_name='sheet_to_mask',
            name='sheet_sku',
        ),
        migrations.RemoveField(
            model_name='ship_batch',
            name='fp_sku',
        ),
        migrations.RemoveField(
            model_name='ship_batch',
            name='ship_step',
        ),
        migrations.RemoveField(
            model_name='ship_batch',
            name='ship_to',
        ),
        migrations.RemoveField(
            model_name='ship_batch',
            name='shipped_by',
        ),
        migrations.DeleteModel(
            name='COAT_Batch',
        ),
        migrations.DeleteModel(
            name='COAT_skus',
        ),
        migrations.DeleteModel(
            name='DICE_Batch',
        ),
        migrations.DeleteModel(
            name='DICE_skus',
        ),
        migrations.DeleteModel(
            name='FP_skus',
        ),
        migrations.DeleteModel(
            name='OldPart',
        ),
        migrations.DeleteModel(
            name='OldPlate',
        ),
        migrations.DeleteModel(
            name='OldStep',
        ),
        migrations.DeleteModel(
            name='PM_skus',
        ),
        migrations.DeleteModel(
            name='RM_skus',
        ),
        migrations.DeleteModel(
            name='SHEET_Batch',
        ),
        migrations.DeleteModel(
            name='SHEET_skus',
        ),
        migrations.DeleteModel(
            name='SHEET_TO_MASK',
        ),
        migrations.DeleteModel(
            name='SHIP_Batch',
        ),
    ]