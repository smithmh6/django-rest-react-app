# Tests for data models

from django.test import TestCase
from django.db.utils import IntegrityError
from shipping.models import Customer

"""
    Test cases start here! 
"""

class MOERevenue(TestCase):
    
    def test_customer_model(self):
        Customer.objects.create(name="FooBar Inc", street1="123 Avenue", street2="ABC", city="Columbia", state="SC", zip_code="29201", email="example@test.com", contact="John Smith", phone="8030000000")
        Customer.objects.create(name="FooBar Inc", street2="ABC", city="Columbia", state="SC", zip_code="29201")