"""
Batch models used in reticle.
"""

# import dependencies

from django.conf import settings
from django.core.files import File
from django.db.models import (
    Model, CharField, ForeignKey, FileField, BooleanField, IntegerField,
    DateTimeField, DateField, DecimalField, CASCADE, PROTECT
)
from django.contrib.contenttypes.fields import GenericRelation
import pyqrcode
from io import BytesIO
from PIL import Image
from reportlab.pdfgen.canvas import Canvas
from common.models import GenericBatch

class CoatBatch(GenericBatch):
    """
    Class definition of CoatBatch model. Inherits fields from GenericBatch.
    """
    
    coat_plate_set = GenericRelation('Plate', 'batch_object_id', 'batch_content_type')
    
    @property
    def pass_qty(self):
        "Read-only property for pass qty."
        return self.coat_plate_set.exclude(fail1_object_id__gt=1).count()

    @property
    def fail_qty(self):
        """
        Read-only property for plate fail qty.
        """
        return self.coat_plate_set.filter(fail1_object_id__gt=1).count()

class SheetBatch(GenericBatch):
    """
    Class definition of SheetBatch model. Inherits fields from GenericBatch.
    """
    
    sheet_plate_set = GenericRelation('Plate', 'sheet_batch_object_id', 'sheet_batch_content_type')
    
    @property
    def pass_qty(self):
        "Read-only property for pass qty."
        return self.sheet_plate_set.exclude(fail1_object_id__gt=1).count()

    @property
    def fail_qty(self):
        """
        Read-only property for plate fail qty.
        """
        return self.sheet_plate_set.filter(fail1_object_id__gt=1).count()

class DiceBatch(GenericBatch):
    """
    Class definition of DiceBatch model. Inherits fields from GenericBatch.
    """
    
    plate_qty = IntegerField(null=True)
    dice_part_set = GenericRelation('Part', 'batch_object_id', 'batch_content_type')

    @property
    def pass_qty(self):
        "Read-only property for pass qty."
        return self.dice_part_set.exclude(fail1_object_id__gt=1).count()

    @property
    def fail_qty(self):
        """
        Read-only property for plate fail qty.
        """
        return self.dice_part_set.filter(fail1_object_id__gt=1).count()
    
    @property
    def value(self):
        "Read-only property for the total value of all parts in the batch."
        num_parts = self.dice_part_set.exclude(fail1_object_id__gt=1).count()
        cost_per_part = self.sku.cost
        return num_parts * cost_per_part