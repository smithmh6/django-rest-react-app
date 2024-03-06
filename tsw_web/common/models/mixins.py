"""
Provides mixins that can be combined with generic model definitions
for more flexibility.
"""

from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db.models import CharField, DateTimeField, DateField, TextField, DecimalField, PositiveIntegerField, ForeignKey
from django.db.models import PROTECT
from .abcmodel import AbstractBaseModel

class DescriptionMixin(AbstractBaseModel):
    """"""
    description = CharField(max_length=250, null=True)

    class Meta:
        abstract = True

class UniqueCodeMixin(AbstractBaseModel):
    """"""
    code = CharField(max_length=250, unique=True)

    class Meta:
        abstract = True

class TimestampsMixin(AbstractBaseModel):
    """"""
    created = DateTimeField(auto_now_add=True)
    modified = DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class NotesMixin(AbstractBaseModel):
    """"""
    notes = CharField(max_length=250, null=True)

    class Meta:
        abstract = True

class QuoteMixin(AbstractBaseModel):
    """"""
    quote_price = DecimalField(max_digits=12, decimal_places=2)
    quote = TextField(max_length=2000, null=True)
    quoted = DateField(null=True)

    class Meta:
        abstract = True

class InvoiceMixin(AbstractBaseModel):
    """"""
    invoice = TextField(max_length=2000, null=True)
    invoiced = DateField(null=True)

    class Meta:
        abstract = True

class PurchaseOrderMixin(AbstractBaseModel):
    """"""
    purchase_order = TextField(max_length=2000, null=True)

    class Meta:
        abstract = True

class VendorSkuMixin(AbstractBaseModel):
    """
    Mixin to add fields for Vendor skus.
    """
    vendor_object_id = PositiveIntegerField()
    vendor_content_type = ForeignKey(ContentType, on_delete=PROTECT, related_name='%(app_label)s_%(class)s_vendor_skus')
    vendor = GenericForeignKey('vendor_content_type', 'vendor_object_id')
    alternate_vendor_object_id = PositiveIntegerField()
    alternate_vendor_content_type = ForeignKey(ContentType, on_delete=PROTECT, related_name='%(app_label)s_%(class)s_alt_vendor_skus')
    alternate_vendor = GenericForeignKey('alternate_vendor_content_type', 'alternate_vendor_object_id')

    class Meta:
        abstract = True

class BatchableMixin(AbstractBaseModel):
    """Add a generic relation to a batch"""
    batch_object_id = PositiveIntegerField(null=True)
    batch_content_type = ForeignKey(ContentType, on_delete=PROTECT, related_name='%(app_label)s_%(class)s_batch_items', null=True)
    batch = GenericForeignKey('batch_content_type', 'batch_object_id')

    class Meta:
        abstract = True

class ShippableMixin(AbstractBaseModel):
    """Add a generic relation to shipment"""
    shipment_object_id = PositiveIntegerField(null=True)
    shipment_content_type = ForeignKey(ContentType, on_delete=PROTECT, related_name='%(app_label)s_%(class)s_shipped_items', null=True)
    shipment = GenericForeignKey('shipment_content_type', 'shipment_object_id')

    class Meta:
        abstract = True

class SteppableMixin(AbstractBaseModel):
    """Add generic relation to steps"""
    step_object_id = PositiveIntegerField()
    step_content_type = ForeignKey(ContentType, on_delete=PROTECT, related_name='%(app_label)s_%(class)s_step_items')
    step = GenericForeignKey('step_content_type', 'step_object_id')

    class Meta:
        abstract = True

