"""
Abstract class GenericSku provides a common sku interface
for children models.
"""

from django.db.models import CharField, DecimalField, BooleanField, IntegerField, ForeignKey
from django.db.models import PROTECT
from .abcmodel import AbstractNamedItemModel
from .mixins import TimestampsMixin, NotesMixin, DescriptionMixin

class GenericSku(AbstractNamedItemModel, TimestampsMixin, NotesMixin, DescriptionMixin):
    """
    GenericSku model representation.
    """
    location = CharField(max_length=250, null=True)
    stock_min = IntegerField(default=0)
    cost = DecimalField(max_digits=12, decimal_places=2)
    active = BooleanField(default=True)
    special = BooleanField(default=False)
    # FK here is the SKU being replaced. This SKU replaces FK SKU
    replaced = ForeignKey('self',
                          on_delete=PROTECT,
                          to_field='name',
                          null=True,
                          related_name='replaced_skus',
                          db_column='replaced_name')

    class Meta:
        abstract = True
