"""
Models for shaping app.
"""

from django.db.models import ForeignKey, PositiveIntegerField, FileField, CharField
from django.db.models import PROTECT
from common.models import AbstractNamedItemModel, DescriptionMixin, UniqueCodeMixin, NotesMixin

class ServiceType(AbstractNamedItemModel, DescriptionMixin, UniqueCodeMixin):
    """
    """

class Service(AbstractNamedItemModel, DescriptionMixin, NotesMixin):
    """
    """
    service_code = ForeignKey(
        ServiceType, to_field='code', db_column='service_code', on_delete=PROTECT)
    qty = PositiveIntegerField(null=True)
    yield_qty = PositiveIntegerField(null=True)
    customer_file = FileField(upload_to='customer_files', null=True)
    order_no = CharField(max_length=250, null=True)
