from django.utils import timezone
from ..models import *
from ..serializers import *
import datetime, pytz
from common.tests.common import AuthenticatedTestCase

class PurchasingTestCase(AuthenticatedTestCase):
    """
    Test case for automatically preparing item and approval statuses
    to be used in purchasing-related test cases
    """
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.pending = ApprovalStatus.objects.create(status="Pending")
        cls.approved = ApprovalStatus.objects.create(status="Approved")
        cls.not_approved = ApprovalStatus.objects.create(status="Not Approved")
        cls.requested = ItemStatus.objects.create(status="Requested")
        cls.purchased = ItemStatus.objects.create(status="Purchased")

    def create_approved_purchase(self, purchase_cost):
        return PurchaseItem.objects.create(description="", requested_by=self.test_user, total_cost=purchase_cost, approved=self.approved, qty=1, item_cost=purchase_cost)

    def create_unapproved_purchase(self, purchase_cost):
        return PurchaseItem.objects.create(description="", requested_by=self.test_user, total_cost=purchase_cost, qty=1, item_cost=purchase_cost)

    def set_requested_date(self, purchase, date):
        purchase.requested = date
        purchase.save()
        return purchase

    def create_approved_purchase_with_date(self, cost, date):
        purchase = self.create_approved_purchase(cost)
        self.set_requested_date(purchase, date)
        return purchase

    def date_this_year(self, month, day):
        return datetime.datetime(timezone.now().year, month, day, tzinfo=pytz.UTC)
