"""
SKU models used in reticle.
"""

from django.db.models import Model
from django.db.models import CASCADE, PROTECT
from django.db.models import ManyToManyField, DateTimeField, IntegerField, ForeignKey, DateField, CharField, FloatField, DecimalField, BooleanField
from common.models import GenericSku, VendorSkuMixin, DescriptionMixin, AbstractNamedItemModel

class VendorSku(GenericSku, VendorSkuMixin):
    """
    VendorSku object model.
    """

class RawMaterialSku(GenericSku):
    """
    Raw Material BOM level sku. Inherits from GenericSku.
    """
    qty = IntegerField()
    vendor_sku = ForeignKey(VendorSku,
                            null=True,
                            on_delete=PROTECT,
                            to_field='name',
                            related_name='related_rmskus',
                            db_column='vendor_sku_name')
    recycled_sku = ForeignKey('self',
                              on_delete=PROTECT,
                              to_field='name',
                              null=True,
                              related_name='recycled_skus',
                              db_column='recycled_sku_name')

class CoatSku(GenericSku):
    """
    Model for COAT production route sku's. Inherits from GenericSku.
    """
    rm_sku = ForeignKey(RawMaterialSku,
                        on_delete=PROTECT,
                        to_field='name',
                        db_column='rm_sku_name')

class SheetToPhotomask(Model):
    """
    Through table for Many-to-Many relationship between PhotomaskSku's
    and SheetSku's.
    """
    sheet_sku = ForeignKey('SheetSku',
                           on_delete=PROTECT,
                           to_field='name',
                           db_column='sheet_sku_name')
    pm_sku = ForeignKey('PhotomaskSku',
                        on_delete=PROTECT,
                        to_field='name',
                        db_column='pm_sku_name')

class PhotomaskSku(GenericSku, VendorSkuMixin):
    """
    Model for Photomask Sku's used in the SHEET route. Inherits from
    GenericSku.
    """
    sheet_sku = ManyToManyField('SheetSku', through=SheetToPhotomask)
    designed = DateField(null=True)
    version = CharField(max_length=50)
    serial = CharField(max_length=50)
    ordered = DateField(null=True)
    started = DateField(null=True)
    ended = DateField(null=True)
    cleaned = DateField(null=True)

class SheetSku(GenericSku):
    """
    Model for SHEET route production sku's. Inherits from GenericSku.
    """
    coat_sku = ForeignKey(CoatSku, on_delete=PROTECT, to_field='name', db_column='coat_sku_name')
    pm_sku = ManyToManyField(PhotomaskSku, through=SheetToPhotomask,)
    part_qty = IntegerField()
    cd_required = BooleanField(default=False)
    cd_target = FloatField()
    cd_min = FloatField()
    cd_max = FloatField()

class DiceRoute(AbstractNamedItemModel, DescriptionMixin):
    """Route model for dice skus"""


class DiceSku(GenericSku):
    """
    Model for DICE production route sku's. Inherits from GenericSku.
    """
    sheet_sku = ForeignKey(SheetSku,
                           on_delete=PROTECT,
                           to_field='name',
                           db_column='sheet_sku_name')
    length_target = FloatField()
    length_min = FloatField()
    length_max = FloatField()
    width_target = FloatField()
    width_min = FloatField()
    width_max = FloatField()
    min_part_index = IntegerField(default=0)
    max_part_index = IntegerField(default=100)
    route = ForeignKey(DiceRoute,
                       on_delete=PROTECT,
                       to_field='name',
                       db_column='route_name')

    @property
    def plate_percentage(self):
        """
        Return how much of a plate (as a decimal) a DICE SKU consumes.
        A dice SKU consuming all indices on a sheet SKU will consume 1 whole plate
        But a SKU consuming indicies 1-3 on a nine part plate consumes only 1/3.
        """
        if self.max_part_index >= 100:
            return 1;

        sku_parts = (self.max_part_index - self.min_part_index) + 1
        total_parts = self.sheet_sku.part_qty
        if total_parts == 0:
            return 0
        return sku_parts / total_parts

    @property
    def part_qty(self):
        if self.max_part_index >= 100:
            return self.sheet_sku.part_qty
        return (self.max_part_index - self.min_part_index) + 1

class ProductCategory(AbstractNamedItemModel, DescriptionMixin):
    """
    Model representation of Brainwave product categories.
    """

class FinalProductSku(GenericSku):
    """
    Model for Final Product sku's. Inherits from GenericSku.
    """
    category = ForeignKey(ProductCategory,
                          on_delete=PROTECT,
                          to_field='name',
                          null=True,
                          related_name='related_fpskus',
                          db_column='category_name')
    price = DecimalField(max_digits=10, decimal_places=2, null=True)
    released = DateField(null=True)
    dice_sku = ForeignKey(DiceSku,
                          on_delete=PROTECT,
                          to_field='name',
                          db_column='dice_sku_name')