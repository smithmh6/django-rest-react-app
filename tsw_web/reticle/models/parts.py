"""
Part model used in reticle.
"""

# import dependencies
from django.db import models
from django.db.models import FloatField, ForeignKey, DateTimeField, PROTECT
from django.conf import settings
from .plates import Plate
from common.models import AbstractBaseModel, GenericPart

class SheetFieldsMixin(AbstractBaseModel):
    """
    Mixin class providing attributes related to sheet processing.

    Attributes:
        photo_cd (float or None): The photolithography critical dimension in microns. Can be None.
        etch_cd (float or None): The etching critical dimension in microns. Can be None.

    Meta:
        abstract (bool): Indicates that this is an abstract model and should not be used to create database tables directly.
    """
    photo_cd = FloatField(null=True)
    etch_cd = FloatField(null=True)

    class Meta:
        abstract = True

class DiceFieldsMixin(AbstractBaseModel):
    """
    Mixin class providing attributes related to dice processing.

    Attributes:
        width (float or None): The width of the dice in mm. Can be None.
        length (float or None): The length of the dice in mm. Can be None.
        thickness (float or None): The thickness of the dice in mm. Can be None.
        diced (datetime.datetime or None): The datetime when the plate was diced. Can be None.

    Meta:
        abstract (bool): Indicates that this is an abstract model and should not be used to create database tables directly.
    """
    width = FloatField(null=True)
    length = FloatField(null=True)
    thickness = FloatField(null=True)
    diced = DateTimeField(null=True)

    class Meta:
        abstract = True

class QcFieldsMixin(AbstractBaseModel):
    """
    Mixin class providing attributes related to Quality Control (QC).

    Attributes:
        wip3_in (datetime.datetime or None): The datetime when the plate entered Work-in-Process 3 (WIP3). Can be None.
        wip3_out (datetime.datetime or None): The datetime when the plate exited Work-in-Process 3 (WIP3). Can be None.

    Meta:
        abstract (bool): Indicates that this is an abstract model and should not be used to create database tables directly.

    Properties:
        wip3 (bool): Computes whether the plate is in Work-in-Process 3 (WIP3).
    """
    wip3_in = DateTimeField(null=True)
    wip3_out = DateTimeField(null=True)

    class Meta:
        abstract = True

    @property
    def wip3(self):
        """
        Computes if the plate is in Work-in-Process 3 (WIP3).

        Returns:
            bool: True if the plate is in WIP3, False otherwise.
        """
        return self.wip3_in is not None and self.wip3_out is None

class Part(GenericPart, SheetFieldsMixin, DiceFieldsMixin, QcFieldsMixin):
    """
    Part model for reticle.

    Attributes:
        plate (Plate): The associated plate for the part.

    Methods:
        save(*args, **kwargs): Override 'save' to generate a part serial automatically.
    """
    plate = ForeignKey(Plate,
                       on_delete=PROTECT,
                       to_field='id',
                       related_name='part_set')

    def save(self, *args, **kwargs):
        """
        Override 'save' to generate a part serial automatically.
        """
        # check if part_serial is blank
        if self.serial == "" or self.serial is None:

            # add leading 0 if index less than 10
            idx = f"0{self.index}" if self.index < 10 else self.index

            # set the part serial
            self.serial = f"{self.plate.serial}-{idx}"

        # call parent method
        super().save(*args, **kwargs)