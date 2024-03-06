"""
Main database models used in purchasing.
"""

from django.conf import settings
from django.core.validators import URLValidator
from django.db.models import Sum
from django.db.models import (CharField,
                              ForeignKey,
                              IntegerField,
                              TextField,
                              DecimalField,
                              DateField,
                              PositiveIntegerField)
from django.db.models import PROTECT
from common.models import GenericAddress, UniqueCodeMixin, TimestampsMixin, NotesMixin
from .projects import Group, Category, Project
from .status import ItemStatus, ApprovalStatus, AccountType, RequestStatus

class Vendor(GenericAddress, UniqueCodeMixin):
    """
    Database model for Vendor objects.
    """
    account_type = ForeignKey(AccountType, on_delete=PROTECT, null=True, to_field='code')

class PurchaseItem(TimestampsMixin, NotesMixin):
    """
    Database model for a single purchase item.
    """
    purchase = ForeignKey('PurchaseRequest', on_delete=PROTECT, related_name='requested_items')
    description = CharField(max_length=250)
    product_no = CharField(max_length=250, null=True)
    package_size = CharField(max_length=250, null=True)
    min_order_qty = CharField(max_length=250, null=True)
    cost = DecimalField(max_digits=12, decimal_places=2)
    qty = PositiveIntegerField()
    total = DecimalField(max_digits=12, decimal_places=2)
    url = TextField(validators=[URLValidator], max_length=2000, null=True)
    received = IntegerField(null=True)
    purchase_order = CharField(max_length=50, null=True)
    quote = CharField(max_length=50, null=True)
    approved = ForeignKey(ApprovalStatus, on_delete=PROTECT, to_field='code', default='PEND', related_name='approved_items')
    authorized = ForeignKey(ApprovalStatus, on_delete=PROTECT, to_field='code', default='PEND', related_name='authorized_items')
    status = ForeignKey(ItemStatus, on_delete=PROTECT, to_field='code', default='CREATE', related_name='requested_items')
    group = ForeignKey(Group, on_delete=PROTECT, to_field='code', related_name='group_items', null=True)
    category = ForeignKey(Category,on_delete=PROTECT, to_field='code', related_name='category_items', null=True)
    project = ForeignKey(Project, on_delete=PROTECT, to_field='code', related_name='project_items', null=True)
    vendor = ForeignKey(Vendor, on_delete=PROTECT, to_field='code', related_name='vendor_items')
    est_delivery = DateField(null=True)

class PurchaseRequest(TimestampsMixin, NotesMixin):
    """
    Database model representation of a purchasing request.
    """
    user = ForeignKey(settings.AUTH_USER_MODEL, on_delete=PROTECT, to_field='username', related_name='user_requests')
    status = ForeignKey(RequestStatus,
                        on_delete=PROTECT,
                        to_field='code',
                        db_column='status_code',
                        default='OPEN',
                        related_name='status_requests')

    def add_item(self, purchase_item: 'PurchaseItem') -> 'PurchaseItem':
        """
        Adds a PurchaseItem object to a PurchaseRequest object.
        """
        return PurchaseItem.objects.update(pk=purchase_item.pk, purchase=self)

    @property
    def item_count(self):
        """
        Computes the total number of items in
        the request. Read-only property.
        """
        return self.requested_items.all().count()

    @property
    def total_cost(self):
        """
        Returns the total cost of all items
        for a single request. Read-only property.
        """
        _total = self.requested_items.all().aggregate(Sum('total'))
        return _total['total__sum']

    @property
    def total_approved(self):
        """
        Returns the total cost of all items with status 'Approved'
        for a single request. Read-only property.
        """
        _approval = ApprovalStatus.objects.get(name='Approved')
        _total = self.requested_items.all().filter(approved=_approval.code).aggregate(Sum('total'))
        return _total['total__sum']