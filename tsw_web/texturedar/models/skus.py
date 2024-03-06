"""
SKU models used in texturedar.
"""

# import dependencies
from django.db.models import (FloatField,
                              ForeignKey,
                              IntegerField,
                              DecimalField,
                              DateField,
                              CharField)
from django.db.models import PROTECT
from common.models import GenericSku, UniqueCodeMixin, AbstractNamedItemModel, DescriptionMixin, VendorSkuMixin

class VendorSku(GenericSku, VendorSkuMixin):
    """
    Model representation of incoming vendor sku's.
    """

class RawMaterialSku(GenericSku):
    """
    Model representation of Raw Material sku. 'qty' represents the current
    quantity available in inventory for consumption.
    """
    qty = IntegerField()
    vendor_sku = ForeignKey(VendorSku,
                            on_delete=PROTECT,
                            to_field='name',
                            related_name='related_rmskus')
    min_trans_300 = FloatField(default='0.00')
    min_trans_500 = FloatField(default='0.00')
    min_trans_1385 = FloatField(default='0.00')

class OpticalCoatSku(GenericSku):
    """
    Model representation of OC Sku.
    """
    rm_sku = ForeignKey(RawMaterialSku,
                        on_delete=PROTECT,
                        to_field='name',
                        related_name='related_ocskus')
    scratch = IntegerField(default=0)
    dig = IntegerField(default=0)
    clear_aperture = FloatField(default='0.00')

    # Transmission fields
    min_trans_300 = FloatField(default='0.00')
    min_trans_500 = FloatField(default='0.00')
    min_trans_700 = FloatField(default='0.00')
    min_trans_900 = FloatField(default='0.00')
    min_trans_1100 = FloatField(default='0.00')
    min_trans_1300 = FloatField(default='0.00')
    min_trans_1500 = FloatField(default='0.00')
    min_trans_1650 = FloatField(default='0.00')

    # Diameter and thickness
    min_diameter_mm = FloatField(default='0.00')
    max_diameter_mm = FloatField(default='0.00')
    min_thickness_mm = FloatField(default='0.00')
    max_thickness_mm = FloatField(default='0.00')

class ProductCategory(AbstractNamedItemModel, DescriptionMixin, UniqueCodeMixin):
    """
    Model representation of Brainwave product categories.
    """
    name = CharField(max_length=250)

class FinalProductSku(GenericSku):
    """
    Model representation of a Final Product sku in the
    Thorlabs catalog.
    """
    category = ForeignKey(ProductCategory,
                          on_delete=PROTECT,
                          to_field='code',
                          related_name='category_fpskus')
    price = DecimalField(max_digits=12, decimal_places=2, null=True)
    released = DateField(null=True)
    oc_sku = ForeignKey(OpticalCoatSku,
                        on_delete=PROTECT,
                        to_field='name',
                        related_name='related_fpskus')
