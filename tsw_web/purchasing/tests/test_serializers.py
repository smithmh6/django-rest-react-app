# Tests for data models

from django.test import TestCase
from django.db.utils import IntegrityError
from shipping.serializers import CustomerSerializer

"""
    Test cases start here!
"""

class MOERevenue(TestCase):

    aperture_data = {"name": "Aperture Science", "street1": "123 Road", "city": "Columbia", "state": "SC", "zip_code": "29201", "country": "United States"}

    def test_customer_serializer(self):
        ser1 = CustomerSerializer(data=self.aperture_data)
        self.assertTrue(ser1.is_valid(), msg="Customer serializer not valid with correct data")
        ser2 = CustomerSerializer(data={})
        self.assertFalse(ser2.is_valid(), msg="Customer serializer valid with no data")