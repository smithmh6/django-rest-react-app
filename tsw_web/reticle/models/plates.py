"""
Plate model used in reticle.
"""

# import dependencies
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.conf import settings
from django.db.models import Model, PROTECT, CASCADE
from django.db.models import CharField, BooleanField, DateTimeField, ForeignKey, IntegerField, FloatField, PositiveIntegerField
from .base import Fail

# New models
from .skus import RawMaterialSku, PhotomaskSku
from common.models.abcmodel import AbstractBaseModel
from common.models import GenericPart

class CoatPlateFieldsMixin(AbstractBaseModel):
    """
    A mixin class providing attributes related to the COAT (Coating) process for a plate.

    Attributes:
        high_grade (bool): Indicates whether the plate has a high-grade coating. Default is False.
        coated (datetime.datetime or None): The datetime when the plate was coated. Can be None.
        wip1_in (datetime.datetime or None): The datetime when the plate entered Work-in-Process 1 (WIP1). Can be None.
        wip1_out (datetime.datetime or None): The datetime when the plate exited Work-in-Process 1 (WIP1). Can be None.

    Meta:
        abstract (bool): Indicates that this is an abstract model and should not be used to create database tables directly.

    Properties:
        wip1 (bool): Computes whether the plate is in Work-in-Process 1 (WIP1).
    """
    high_grade = BooleanField(default=False)
    coated = DateTimeField(null=True)
    wip1_in = DateTimeField(null=True)
    wip1_out = DateTimeField(null=True)

    class Meta:
        abstract = True

    @property
    def wip1(self):
        """
        Computes if the plate is in Work-in-Process 1 (WIP1).

        Returns:
            bool: True if the plate is in WIP1, False otherwise.
        """
        return self.wip1_in is not None and self.wip1_out is None

class SheetPlateFieldsMixin(AbstractBaseModel):
    """
    A mixin class providing attributes related to the SHEET process for a plate.

    Attributes:
        sheet_index (int or None): The index of the sheet. Can be None.
        exposed (datetime.datetime or None): The datetime when the plate was exposed. Can be None.
        pm_sku (PhotomaskSku or None): The PhotomaskSku associated with the plate. Can be None.
        etched (datetime.datetime or None): The datetime when the plate was etched. Can be None.
        etch_time (float or None): The time taken for etching in seconds. Default is '0.0'. Can be None.

    Meta:
        abstract (bool): Indicates that this is an abstract model and should not be used to create database tables directly.
    """
    exposed = DateTimeField(null=True)
    pm_sku = ForeignKey(
        PhotomaskSku,
        on_delete=PROTECT,
        to_field='name',
        null=True,
        db_column='pm_sku_name'
    )
    etched = DateTimeField(null=True)
    etch_time = FloatField(default='0.0', null=True)

    class Meta:
        abstract = True

class RecycledPlateMixin(AbstractBaseModel):
    """
    A mixin class providing attributes related to recycled plates.

    Attributes:
        recycled (bool): Indicates whether the plate has been recycled. Default is False.
        recycled_in (datetime.datetime or None): The datetime when the plate was recycled. Can be None.
        recycled_out (datetime.datetime or None): The datetime when the plate was taken out of the recycling process. Can be None.

    Meta:
        abstract (bool): Indicates that this is an abstract model and should not be used to create database tables directly.

    Properties:
        in_queue (bool): Computes whether the plate is currently in the recycling queue.
    """
    recycled = BooleanField(default=False)
    recycled_in = DateTimeField(null=True)
    recycled_out = DateTimeField(null=True)

    class Meta:
        abstract = True

    @property
    def in_queue(self):
        """
        Computes if the plate is currently in the recycling queue.

        Returns:
            bool: True if the plate is in the recycling queue, False otherwise.
        """
        return self.recycled_in is not None and self.recycled_out is None

class QcPlateFieldsMixin(AbstractBaseModel):
    """
    A mixin class providing attributes related to the Quality Control (QC) process for a plate.

    Attributes:
        wip2_in (datetime.datetime or None): The datetime when the plate entered Work-in-Process 2 (WIP2). Can be None.
        wip2_out (datetime.datetime or None): The datetime when the plate exited Work-in-Process 2 (WIP2). Can be None.

    Meta:
        abstract (bool): Indicates that this is an abstract model and should not be used to create database tables directly.

    Properties:
        wip2 (bool): Computes whether the plate is in Work-in-Process 2 (WIP2).
    """
    wip2_in = DateTimeField(null=True)
    wip2_out = DateTimeField(null=True)

    class Meta:
        abstract = True

    @property
    def wip2(self):
        """
        Computes if the plate is in Work-in-Process 2 (WIP2).

        Returns:
            bool: True if the plate is in WIP2, False otherwise.
        """
        return self.wip2_in is not None and self.wip2_out is None

class Plate(GenericPart, CoatPlateFieldsMixin, SheetPlateFieldsMixin, RecycledPlateMixin, QcPlateFieldsMixin):
    """
    Data model for production plates.

    Attributes:
        sheet_batch_object_id (int or None): The ID of the associated sheet batch. Can be None.
        sheet_batch_content_type (ContentType or None): The content type of the associated sheet batch. Can be None.
        sheet_batch (GenericForeignKey): The generic foreign key to the associated sheet batch.
        rm_sku (RawMaterialSku or None): The raw material SKU associated with the plate. Can be None.
        scrapped (bool): Indicates whether the plate has been scrapped. Default is False.

    Properties:
        part_qty (int): Read-only property representing the part quantity derived from the associated sheet batch.

    Meta:
        abstract (bool): Indicates that this is an abstract model and should not be used to create database tables directly.
    """
    serial = IntegerField(null=True) # override character field to integer for ordering
    sheet_batch_object_id = PositiveIntegerField(null=True)
    sheet_batch_content_type = ForeignKey(
        ContentType,
        on_delete=PROTECT,
        related_name='%(app_label)s_%(class)s_sheet_batch_items',
        null=True
    )
    sheet_batch = GenericForeignKey('sheet_batch_content_type', 'sheet_batch_object_id')
    rm_sku = ForeignKey(
        RawMaterialSku,
        on_delete=PROTECT,
        to_field='name',
        null=True,
        db_column='rm_sku_name'
    )
    index = PositiveIntegerField(null=True)
    scrapped = BooleanField(default=False)

    @property
    def part_qty(self):
        """
        Read-only property representing the part quantity derived from the associated sheet batch.

        Returns:
            int: The part quantity.
        """
        return self.sheet_batch.sku.part_qty

    @property
    def available_parts(self):
        """
        Read-only property which retrieves the available parts associated with the plate.

        This property returns a queryset of parts that are currently available on the plate,
        excluding any parts that have failed or are already in Dice batches.

        Returns:
            QuerySet: A queryset of available parts on the plate.
        """
        if self.step.name == 'WIP2':
            # NOTE: test both of these
            #step_obj = Step.objects.get(name='WIP2')
            #return step_obj.reticles_parts_step_items.filter(plate=self)
            return self.part_set.filter(
                batch_object_id__isnull=True, fail1_object_id=1).count()

        return 0

    @property
    def part_fail_qty(self):
        """
        Read-only property for the number of failing parts on a plate.

        Returns:
            int: The count of failing parts on the plate.
        """
        return self.part_set.exclude(fail1_object_id=1).count()