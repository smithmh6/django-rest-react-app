# Create test for data models

from django.test import TestCase
from django.utils import timezone
from .common import ReticleTestCase
from ..models import *
import datetime, pytz

"""
    Group of functions used to create objects
    needed for testing.
"""
# create a raw materials object
def create_rm_object():
    return RM_skus.objects.create(rm_sku='test-rm-sku',location='test a location',
                            description='test sku description',vendor_name='vendorTest',
                            vendor_sku='test_sku',unit_cost='0.0')

# create a coat sku object using fk from rm_sku object
def create_coat_object(fk_in):
    return COAT_skus.objects.create(coat_sku='test-coat-sku',rm_sku=fk_in,location='test coat location',
                                description='test coat description',coat_part_cost='100.00')


"""
    Test cases start here! 
"""

# Test cases for RM_Skus model
class RawMaterialsTestCase(TestCase):
    def setUp(self):
        # create a rm_sku object
        create_rm_object()

    def test_create_rm_sku(self):
        """
            Check that the rm_sku is added correctly,
            and that the default booleans are correct
        """
        testRM = RM_skus.objects.first()
        self.assertEqual(testRM.rm_sku,'test-rm-sku', msg=f"Expected rm_sku to be 'test-rm-sku', got {testRM.rm_sku}")
        self.assertTrue(testRM.active, msg=f"Expected active to be True, got {testRM.active}")
        self.assertFalse(testRM.special, msg=f"Expected special to be False, got {testRM.special}")

# Test cases for COAT_Skus Model
class CoatSkusTestCase(TestCase):
    def setUp(self):
        # add an object to RM_Sku, then get it as queryset
        create_rm_object()      
        self.rm_fk = RM_skus.objects.first()
        # create coat_sku obj w/ foreign key from rm_sku
        create_coat_object(self.rm_fk)

    def test_create_coat_sku(self):
        """
            Ensure that the coat_sku model functions correctly,
            verify that the foreign key of rm_sku is working.
            Check default fields as well.
        """
        checkCoat = COAT_skus.objects.first()
        self.assertEqual(checkCoat.rm_sku, self.rm_fk, msg=f"Expected rm_sku to be foreign key {self.rm_fk}, got {checkCoat.rm_sku}")
        self.assertTrue(checkCoat.active, msg=f"Expected active to be True, got {checkCoat.active}")
        self.assertFalse(checkCoat.special, msg=f"Expected special to be False, got {checkCoat.special}")

class SheetBatchProperties(ReticleTestCase):
    
    
    def test_fail_qty_property(self):
        sb1 = SHEET_Batch.objects.create(sheet_batch="SB000001", sheet_order="TBD", sheet_sku=self.sheet_sku, plate_qty=0, created_by=self.test_user, sheet_step=self.steps["EXPOSE"])
        self.assertEqual(sb1.fail_qty_property, 0, msg="fail_qty_property nonzero with no plates")
        Plate.objects.create(serial=1, sheet_batch=sb1, step=self.steps["EXPOSE"])
        self.assertEqual(sb1.fail_qty_property, 0, msg="fail_qty_property nonzero with one non-failed plate")
        Plate.objects.create(serial=2, sheet_batch=sb1, step=self.steps["EXPOSE"], fail_1=self.fail_2)
        self.assertEqual(sb1.fail_qty_property, 1, msg="fail_qty_property not 1 with one failed plate")
        Plate.objects.create(serial=3, sheet_batch=sb1, step=self.steps["EXPOSE"], fail_1=self.fail_2)
        self.assertEqual(sb1.fail_qty_property, 2, msg="fail_qty_property not 2 with two failed plates")

class ShipBatchTest(ReticleTestCase):
    
    def test_created_date_override(self):
        # Example date is the last day of the previous calendar year
        example_date = datetime.datetime(timezone.now().year - 1, 12, 31, tzinfo=pytz.UTC)
        sb = SHIP_Batch.objects.create(ship_batch="SH000001", fp_sku=self.fp_sku, final_order="TBD", part_qty=8, value_to_inv=800, ship_step=self.steps["WIP3"])        
        sb.created_date = example_date
        sb.save()
        self.assertEqual(sb.created_date, example_date, msg=f"Sheet batch created_date was not overridden")
    