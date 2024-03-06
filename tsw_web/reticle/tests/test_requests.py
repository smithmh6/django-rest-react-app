from ..models import *
from ..serializers import *
from .common import ReticleTestCase
import datetime, pytz
from django.utils import timezone

class PostBatches(ReticleTestCase):
    
    # Class variables for test cases
    coat_url = "/api/batches/reticle/coat/"
    sheet_url = "/api/batches/reticle/sheet/"
    dice_url = "/api/batches/reticle/dice/"
    coat_batch_data = {"coat_batch": "CB000001", "coat_order": "1", "coat_sku": "test-coat-sku", "coat_qty": 16}
    sheet_batch_data = {"sheet_batch": "SB000001", "sheet_order": "1", "sheet_sku": "test-sheet-sku", "plate_qty": 4}
    dice_batch_data = {"dice_batch": "DB000001", "dice_sku": "test-dice-sku", "dice_order": 1, "part_qty": 4}
    
    def test_coat_batch_post(self):
        response = self.client.post(self.coat_url, self.coat_batch_data, format="json")
        self.assertEqual(response.status_code, 201, msg=f"Expected POST to return 201 Created, got {response.status_code}")
    
    def test_duplicate_coat_batch(self):
        self.client.post(self.coat_url, self.coat_batch_data)
        response = self.client.post(self.coat_url, self.coat_batch_data, format="json")
        self.assertEqual(response.status_code, 400, msg=f"Expected POST with duplicate batch ID to return 400 Bad Request, got {response.status_code}")
    
    def test_sheet_batch_post(self):
        response = self.client.post(self.sheet_url, self.sheet_batch_data, format="json")
        self.assertEqual(response.status_code, 201, msg=f"Expected POST to return 201 Created, got {response.status_code}")
    
    def test_duplicate_sheet_batch(self):
        self.client.post(self.sheet_url, self.sheet_batch_data)
        response = self.client.post(self.sheet_url, self.sheet_batch_data, format="json")
        self.assertEqual(response.status_code, 400, msg=f"Expected POST with duplicate batch ID to return 400 Bad Request, got {response.status_code}")
    
    def test_dice_batch_post(self):
        response = self.client.post(self.dice_url, self.dice_batch_data, format="json")
        self.assertEqual(response.status_code, 201, msg=f"Expected POST to return 201 Created, got {response.status_code}")
    
    def test_duplicate_dice_batch(self):
        self.client.post(self.dice_url, self.dice_batch_data)
        response = self.client.post(self.dice_url, self.dice_batch_data, format="json")
        self.assertEqual(response.status_code, 400, msg=f"Expected POST with duplicate batch ID to return 400 Bad Request, got {response.status_code}")
        
class RTTYTDRevenueTest(ReticleTestCase):
    
    total_value_url = '/api/batches/reticle/ship/ytd-value/'
    
    def test_value_response(self):
        response = self.client.get(self.total_value_url)
        self.assertEqual(response.status_code, 200, msg=f"Expected GET to return 200 OK, got {response.status_code}")
    
    def test_value_no_batches(self):
        response = self.client.get(self.total_value_url)
        self.assertEqual(response.data['current_total'], 0, msg=f"Total RTT shipped value is {response.data} even with no ship batches")
        
    def test_value_one_batch(self):
        ship_value = 800
        sb = SHIP_Batch.objects.create(ship_batch="SH000001", fp_sku=self.fp_sku, final_order="TBD", part_qty=8, value_to_inv=800, ship_step=self.steps["WIP3"])
        self.assertEqual(ship_value, 800, msg=f"Expected created ship batch to have value {ship_value}, got {sb.value_to_inv}")
        response = self.client.get(self.total_value_url)
        self.assertEqual(response.data['current_total'], ship_value, msg=f"Total RTT ship value does not match single ship batch value_to_inv")
        
    def test_value_multiple_batches(self):
        values_to_inventory = [400, 1000, 200, 80, 10]
        for index, value in enumerate(values_to_inventory):
            SHIP_Batch.objects.create(ship_batch=f"SH00000{index+1}", fp_sku=self.fp_sku, final_order="TBD", part_qty=8, value_to_inv=value, ship_step=self.steps["WIP3"])
        response = self.client.get(self.total_value_url)
        self.assertEqual(response.data['current_total'], sum(values_to_inventory), msg=f"Total RTT ship value does not match total ship batches' values")

    def test_one_batch_old(self):
        # Example date is the last day of the previous calendar year
        example_date = datetime.datetime(timezone.now().year - 1, 12, 31, tzinfo=pytz.UTC)
        sb = SHIP_Batch.objects.create(ship_batch="SH000001", fp_sku=self.fp_sku, final_order="TBD", part_qty=8, value_to_inv=800, ship_step=self.steps["WIP3"])        
        sb.created_date = example_date
        sb.save()
        response = self.client.get(self.total_value_url)
        self.assertEqual(response.data['current_total'], 0, msg=f"Total RTT value not zero with one batch created last year")
        
    def test_old_and_new_batch(self):
        # Example date is the last day of the previous calendar year
        first_batch_value = 800
        second_batch_value = 350
        example_date = datetime.datetime(timezone.now().year - 1, 12, 31, tzinfo=pytz.UTC)
        sb = SHIP_Batch.objects.create(ship_batch="SH000001", fp_sku=self.fp_sku, final_order="TBD", part_qty=8, value_to_inv=first_batch_value, ship_step=self.steps["WIP3"])        
        SHIP_Batch.objects.create(ship_batch="SH000002", fp_sku=self.fp_sku, final_order="TBD", part_qty=8, value_to_inv=second_batch_value, ship_step=self.steps["WIP3"])        
        sb.created_date = example_date
        sb.save()
        response = self.client.get(self.total_value_url)
        self.assertEqual(response.data['current_total'], second_batch_value, msg=f"RTT shipped value incorrect when a batch from this year and a batch from last year exist. Should include this year's value, but not last year's.")