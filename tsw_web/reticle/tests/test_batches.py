# Create test for data models

from ..models import *
from ..serializers import *
from .common import ReticleTestCase

"""
    Test cases start here! 
"""

# BatchTestCase authenticates client and sets up basic data
class GeneralBatchTests(ReticleTestCase):
    
    test_init_qty = 4
    
    def postCoatBatch(self):
        self.client.post("/api/batches/reticle/coat/", {"coat_batch": "CB000001", "coat_order": "1", "coat_sku": "test-coat-sku", "coat_qty": 16}, format="json")
    
    def postSheetBatch(self):
        self.client.post("/api/batches/reticle/sheet/", {"sheet_batch": "SB000001", "sheet_order": "1", "sheet_sku": "test-sheet-sku", "plate_qty": self.test_init_qty}, format="json")
    
    def postDiceBatch(self):
        self.client.post("/api/batches/reticle/dice/", {"dice_batch": "DB000001", "dice_sku": "test-dice-sku", "dice_order": 1, "part_qty": self.test_init_qty}, format="json")
    
    def test_coat_batch_creation(self):
        self.postCoatBatch()
        cb = COAT_Batch.objects.get(coat_batch="CB000001")
        self.assertEqual(cb.pass_qty, cb.coat_qty, msg=f"Expected pass_qty to be {cb.coat_qty}, got {cb.pass_qty}")
        self.assertTrue(cb.order_open, msg=f"Expected order_open to be True, got {cb.order_open}")
        self.assertEqual(cb.coat_step, self.ser_step, msg=f"Expected coat_step to be {self.ser_step}, got {cb.coat_step}")
        plates_with_cb = len(Plate.objects.filter(coat_batch="CB000001"))
        self.assertEqual(plates_with_cb, cb.coat_qty, msg=f"Coat Batch has {cb.coat_qty} plates specified, but {plates_with_cb} plates with coat batch's ID exist in database")
    
    def test_sheet_batch_creation(self):
        self.postSheetBatch()
        sb = SHEET_Batch.objects.get(sheet_batch="SB000001")
        self.assertEqual(sb.plate_qty, self.test_init_qty, msg=f"Sheet batch plate_qty differs than the amount sent in the POST request")
        self.assertTrue(sb.order_open, msg=f"Newly created sheet batch is not open")
        self.assertEqual(sb.sheet_step, self.init_photo_step,  msg=f"Expected new sheet batch to have step {self.init_photo_step}, found {sb.sheet_step}")
    
    def test_dice_batch_creation(self):
        self.postDiceBatch()
        db = DICE_Batch.objects.get(dice_batch="DB000001")
        self.assertTrue(db is not None, msg="No dice batch with matching ID found after dice batch creation")
        self.assertEqual(db.part_qty, self.test_init_qty, msg=f"Dice batch part_qty differs than the amount sent in the POST request")
        self.assertTrue(db.order_open, msg=f"Newly created dice batch is not open")
        self.assertEqual(db.dice_step, self.init_dice_step, msg=f"Expected new dice batch to have step {self.init_dice_step}, found {db.dice_step}")
        
    def test_dice_batch_patch(self):
        self.postDiceBatch()
        db = DICE_Batch.objects.get(dice_batch="DB000001")
        self.client.patch(f"/api/batches/reticle/dice/{db.id}/", {"dice_step": self.dice_coat_step.step_code })
        db = DICE_Batch.objects.get(dice_batch="DB000001")
        self.assertEqual(db.dice_step, self.dice_coat_step, msg=f"Dice Batch PATCH failed to update step")
    
    def test_dice_batch_initialization(self):
        
        sb_plate_num = 8
        
        self.postDiceBatch()
        dice_batch = DICE_Batch.objects.get(dice_batch="DB000001")
        sheet_batch = SHEET_Batch.objects.create(sheet_batch="SB000001", 
                                                 sheet_order="1", 
                                                 sheet_sku=self.sheet_sku, 
                                                 plate_qty=sb_plate_num, 
                                                 sheet_step=self.wip2_step, 
                                                 created_by=self.test_user, 
                                                 order_open=False)
        
        for n in range(sb_plate_num):
            p = Plate.objects.create(
                serial=n+1, 
                step=self.wip2_step, 
                wip2 = True,
                rm_sku=self.rm_sku,
                sheet_batch=sheet_batch)
            
            Part.objects.create(
                plate=p,
                part_index=1,
                step=self.wip2_step,
            )
        
        num_plates = len(Plate.objects.all())
        self.assertEqual(len(Plate.objects.all()), sb_plate_num, msg=f"Dice batch initialization created {num_plates} plates, expected {sb_plate_num}")
        
        response = self.client.get(f'/api/batches/reticle/dice/{dice_batch.id}/init_dice/')
        plates = response.data
        
        self.assertEqual(len(plates), sb_plate_num, msg=f"GET to init_dice returns the wrong number of valid plates")
        
        self.client.patch(f"/api/batches/reticle/dice/{dice_batch.id}/init_dice/", plates, format='json')
        
        num_parts_in_batch = len(Part.objects.filter(dice_batch="DB000001"))
        self.assertEqual(num_parts_in_batch, sb_plate_num, msg=f"Expected {sb_plate_num} parts with matching batch ID, got {num_parts_in_batch}")
        self.assertEqual(num_parts_in_batch, sb_plate_num, msg=f"Wrong number of parts assigned to dice batch in INIT_DICE")
        
    def test_order_open(self):
        cb_one = COAT_Batch(coat_batch="CB000001", coat_order=1, coat_sku=self.coat_sku, coat_qty=16, coat_step=self.ser_step)
        cb_one.save()
        self.assertTrue(cb_one.order_open, msg=f"Expected COAT_Batch constructor to set order_open to True, got {cb_one.order_open}")
        cb_two = COAT_Batch.objects.create(coat_batch="CB000002", coat_order=1, coat_sku=self.coat_sku, coat_qty=16, coat_step=self.ser_step)
        self.assertTrue(cb_two.order_open, msg=f"Epected COAT_Batch `.create()` to set  order_open to True, got {cb_two.order_open}")
        
class HighestBatchNumberTests(ReticleTestCase):
    
    test_init_qty = 4
    highest_batch_url = '/api/batches/highest/coat/'
    
    def test_endpoint(self):
        response = self.client.get(self.highest_batch_url)
        self.assertEqual(response.status_code, 200, msg=f"HighestBatchNumber returned status {response.status_code} instead of 200 OK")
    
    def test_no_batches(self):
        response = self.client.get(self.highest_batch_url)
        self.assertEqual(response.data, [], msg=f"HighestBatchNumber returned {response.data} with no coat batches")
    
    def test_open_batch(self):
        COAT_Batch.objects.create(coat_batch="CB000005", coat_order=1, coat_sku=self.coat_sku, coat_qty=16, coat_step=self.ser_step)
        response = self.client.get(self.highest_batch_url)
        self.assertEqual(len(response.data), 1, msg=f"HighestBatchNumber ignored an open batch")
        self.assertEqual(response.data[0]['coat_batch'], "CB000005", msg=f"HighestBatchNumber found a batch, but not the correct one")
        
    def test_open_closed_batch(self):
        COAT_Batch.objects.create(coat_batch="CB000005", coat_order=1, coat_sku=self.coat_sku, coat_qty=16, coat_step=self.ser_step) 
        COAT_Batch.objects.create(coat_batch="CB000010", coat_order=1, coat_sku=self.coat_sku, coat_qty=16, coat_step=self.ser_step, order_open=False) 
        response = self.client.get(self.highest_batch_url)
        self.assertEqual(response.data[0]['coat_batch'], "CB000010", msg=f"HighestBatchNumber ignored a higher, closed batch number")
    
    def test_non_standard_batch_number(self):
        COAT_Batch.objects.create(coat_batch="CB000005", coat_order=1, coat_sku=self.coat_sku, coat_qty=16, coat_step=self.ser_step) 
        COAT_Batch.objects.create(coat_batch="XX000010", coat_order=1, coat_sku=self.coat_sku, coat_qty=16, coat_step=self.ser_step, order_open=False) 
        response = self.client.get(self.highest_batch_url)
        self.assertEqual(response.data[0]['coat_batch'], "CB000005", msg=f"HighestBatchNumber failed with a non-standard batch number in the system")
        