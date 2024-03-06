"""
Models for moe app.
"""

from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db.models import Model, ForeignKey, DateField, DecimalField, PositiveIntegerField
from django.db.models import PROTECT
from common.models import (GenericProject,
                           UniqueCodeMixin,
                           QuoteMixin,
                           PurchaseOrderMixin,
                           InvoiceMixin)

class Project(GenericProject, QuoteMixin, PurchaseOrderMixin, InvoiceMixin, UniqueCodeMixin):
    """
    """
    customer_object_id = PositiveIntegerField(null=True)
    customer_content_type = ForeignKey(
        ContentType,
        null=True,
        on_delete=PROTECT,
        related_name='%(app_label)s_%(class)s_customers')
    customer = GenericForeignKey('customer_content_type', 'customer_object_id')
    delivery = DateField()

    # default='157',  # content_type ID of shipping.customer model
    # NOTE: Add method to set correct content type on creation

class Payment(Model):
    """
    """
    project = ForeignKey(Project, to_field='code', on_delete=PROTECT)
    paid = DateField()
    amount = DecimalField(max_digits=12, decimal_places=2)