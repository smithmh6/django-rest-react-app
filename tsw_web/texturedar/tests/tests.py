from .common import ARTestCase, AuthenticatedTestCase
from shipping.models import Shipment, Status
from reticle.models import Warehouse
from django.utils import timezone
import datetime, pytz

class ARBatchTests(ARTestCase):
    
    ar_batch_url = '/api/batches/textured_ar/'
    
    def test_endpoint(self):
        response = self.client.get(self.ar_batch_url)
        self.assertEqual(response.status_code, 200, msg=f"AR Batch endpoint returns {response.status_code} instead of 200 OK")
    
    def test_no_batches(self):
        response = self.client.get(self.ar_batch_url)
        self.assertEqual(response.data, [], msg=f"AR Batches sent {response.data} even though no batches exist")

    def test_single_batch(self):
        self.create_batch()

class ARShippedValueTestCase(ARTestCase):
    
    shipped_value_url = '/api/shipping/shipments/textured-ar/ytd-value'
    
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.pending_status = Status.objects.create(name="Pending", code="PENDING")
        cls.delivered_status = Status.objects.create(name="Delivered", code="DELIVERED")

    # Helper Methods
    def create_warehouse(self):
        return Warehouse.objects.create(name="Dummy Warehouse",
                                 street_1="123 St",
                                 zip_code="12345",
                                 city="Columbia",
                                 state="SC",
                                 country="United States")
    
    def create_shipment_with_status(self, value, status):
        return Shipment.objects.create(item_object_id=1, item_content_type=self.fp_sku_content_type, value=value, qty=1, status=status)

    def create_delivered_shipment(self, value=100):
        return self.create_shipment_with_status(value, status=self.delivered_status);
    
    def create_pending_shipment(self, value=100):
        return self.create_shipment_with_status(value, status=self.pending_status)

    # Tests Start Here
    def test_endpoint(self):
        response = self.client.get(self.shipped_value_url)
        self.assertEqual(response.status_code, 200, msg=f"AR Shipped total value endpoint returns {response.status_code} instead of 200 OK")

    def test_no_shipments(self):
        response = self.client.get(self.shipped_value_url)
        self.assertEqual(response.data['current_total'], 0, msg=f"AR Shipped Value is {response.data} even though no batches exist")

    def test_one_shipment(self):
        value_to_test = 300
        self.create_delivered_shipment(value_to_test)
        response = self.client.get(self.shipped_value_url)
        self.assertEqual(response.data['current_total'], value_to_test, msg=f"AR Shipped Value does not match value of single batch in system")

    def test_multiple_shipments(self):
        values_to_test = [15, 300, 20, 13, 840]
        for value in values_to_test:
            self.create_delivered_shipment(value)
        response = self.client.get(self.shipped_value_url)
        self.assertEqual(response.data['current_total'], sum(values_to_test), msg=f"AR Shipped Value does not match total of batches' fp_values in system")

    def test_shipment_date_override(self):
         # Example date is the last day of the previous calendar year
        example_date = datetime.datetime(timezone.now().year - 1, 12, 31, tzinfo=pytz.UTC)
        shipment = self.create_delivered_shipment()
        shipment.created = example_date
        shipment.save()
        self.assertEqual(shipment.created, example_date, msg=f"Sheet batch created_date was not overridden")

    def test_one_shipment_old(self):
        value_to_test = 300
        example_date = datetime.datetime(timezone.now().year - 1, 12, 31, tzinfo=pytz.UTC)
        shipment = self.create_delivered_shipment(value_to_test)
        shipment.created = example_date
        shipment.save()
        response = self.client.get(self.shipped_value_url)
        self.assertEqual(response.data['current_total'], 0, msg=f"AR Shipped Value isn't zero with a single AR shipment from last year")

    def test_old_and_new_shipment(self):
        # Example date is the last day of the previous calendar year
        first_batch_value = 800
        second_batch_value = 350
        example_date = datetime.datetime(timezone.now().year - 1, 12, 31, tzinfo=pytz.UTC)
        shipment = self.create_delivered_shipment(first_batch_value)
        self.create_delivered_shipment(second_batch_value)
        shipment.created = example_date
        shipment.save()
        response = self.client.get(self.shipped_value_url)
        self.assertEqual(response.data['current_total'], second_batch_value, msg=f"AR Shipped value incorrect when a batch from this year and a batch from last year exist. Should include this year's value, but not last year's.")

    def test_one_shipment_not_delivered(self):
        value_to_test = 300
        self.create_pending_shipment(value_to_test)
        response = self.client.get(self.shipped_value_url)
        self.assertEqual(response.data['current_total'], 0, msg=f"AR Shipped Value isn't zero with a single unshipped AR_Shipment")

    def test_pending_and_delivered_batch(self):
        first_batch_value = 800
        second_batch_value = 350
        self.create_pending_shipment(first_batch_value)
        self.create_delivered_shipment(second_batch_value)
        response = self.client.get(self.shipped_value_url)
        self.assertEqual(response.data['current_total'], second_batch_value, msg=f"AR Shipped value incorrect with one shipped/unshipped batch each; should only include shipped.")
