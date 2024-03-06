"""
Part model used in texturedar.
"""

from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db.models import (IntegerField,
                              FloatField,
                              ForeignKey,
                              ImageField,
                              FileField,
                              BooleanField,
                              PositiveIntegerField,
                              PROTECT)
from common.models import GenericPart

class Part(GenericPart):
    """
    Model representation of a Part for AR manufacturing.
    """
    pocket = IntegerField()
    in_inventory = BooleanField(default=False)
    trans_300_pre = FloatField(null=True)
    trans_500_pre = FloatField(null=True)
    trans_1385_pre = FloatField(null=True)
    trans_300_post = FloatField(null=True)
    trans_500_post = FloatField(null=True)
    trans_700_post = FloatField(null=True)
    trans_900_post = FloatField(null=True)
    trans_1100_post = FloatField(null=True)
    trans_1300_post = FloatField(null=True)
    trans_1500_post = FloatField(null=True)
    trans_1650_post = FloatField(null=True)
    act_time = FloatField(null=True)
    image_data_pre = ImageField(upload_to='ar_data/production/image_data/pre/', null=True)
    image_data_post = ImageField(upload_to='ar_data/production/image_data/post/', null=True)
    sem_data = ImageField(upload_to='ar_data/production/sem_data/', null=True)
    uv_vis_data_pre = FileField(upload_to='ar_data/production/uv_vis_data/pre/', null=True)
    uv_vis_data_post = FileField(upload_to='ar_data/production/uv_vis_data/post/', null=True)
    ir_data_pre = FileField(upload_to='ar_data/production/ir_data/pre/', null=True)
    ir_data_post = FileField(upload_to='ar_data/production/ir_data/post/', null=True)
    tap_data = FileField(upload_to='ar_data/production/tap_data/', null=True)
    uv_object_id = PositiveIntegerField(null=True)
    uv_content_type = ForeignKey(ContentType, on_delete=PROTECT, related_name='%(app_label)s_%(class)s_uv_parts', null=True)
    uv = GenericForeignKey('uv_content_type', 'uv_object_id')
    vis_object_id = PositiveIntegerField(null=True)
    vis_content_type = ForeignKey(ContentType, on_delete=PROTECT, related_name='%(app_label)s_%(class)s_vis_parts', null=True)
    vis = GenericForeignKey('vis_content_type', 'vis_object_id')
    ir_object_id = PositiveIntegerField(null=True)
    ir_content_type = ForeignKey(ContentType, on_delete=PROTECT, related_name='%(app_label)s_%(class)s_ir_parts', null=True)
    ir = GenericForeignKey('ir_content_type', 'ir_object_id')
