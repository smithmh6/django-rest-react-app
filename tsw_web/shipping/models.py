"""
Model definitions for shipping app.
"""

from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db.models import PositiveIntegerField, ForeignKey, CharField, DecimalField, PROTECT, BooleanField
from common.models import UniqueCodeMixin, GenericAddress, TimestampsMixin, NotesMixin, AbstractNamedItemModel, DescriptionMixin

class Status(AbstractNamedItemModel, DescriptionMixin, UniqueCodeMixin):
    """
    Shipment status model representation.
    """

class Customer(GenericAddress, UniqueCodeMixin):
    """
    Database model representation of a customer object.
    """
    department = CharField(max_length=250, null=True)

class Warehouse(GenericAddress, UniqueCodeMixin):
    """
    Shipping warehouse database model.
    """

class Shipment(TimestampsMixin, NotesMixin):
    """
    Model representation of a shipment.
    """
    item_object_id = PositiveIntegerField(null=True)
    item_content_type = ForeignKey(
        ContentType, null=True, on_delete=PROTECT, related_name='%(app_label)s_%(class)s_items')
    item = GenericForeignKey('item_content_type', 'item_object_id')
    transfer = CharField(max_length=50, null=True)
    tracking = CharField(max_length=50, null=True)
    final = CharField(max_length=50, null=True) # Tracks final_orders for reticle shipments
    value = DecimalField(max_digits=12, decimal_places=2, null=True)
    qty = PositiveIntegerField()
    status = ForeignKey(Status, to_field='code', db_column='status_code', on_delete=PROTECT)
    destination_object_id = PositiveIntegerField(null=True)
    destination_content_type = ForeignKey(
        ContentType, null=True, on_delete=PROTECT, related_name='%(app_label)s_%(class)s_destinations')
    destination = GenericForeignKey('destination_content_type', 'destination_object_id')
    user = ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=PROTECT,
        to_field='username',
        null=True,
        related_name='related_users',
        db_column='user_name')

    def __str__(self):
        """"""
        return f"{self.id}-{self.item}-{self.destination}-{self.modified}"
