from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from ..models import *
from common.tests.common import AuthenticatedTestCase

class ReticleTestCase(AuthenticatedTestCase):
    """
    TestCase class that sets up necessary data for testing
    batches, such as Step objects, basic SKUs, and fail codes
    """
    
    # We ignore any irrelevant intermediate steps
    # that aren't important for backend processing
    # We end on WIP3, as shipping will be later
    step_data = [['SER', 'SRD1'],
        ['SRD1', 'COAT_QC'],
        ['COAT_QC', 'WIP1'],
        ['WIP1', 'INIT_PHOTO'],
        ['INIT_PHOTO', 'EXPOSE'],
        ['EXPOSE', 'ETCH_QC'],
        ['ETCH_QC', 'WIP2'],
        ['WIP2', 'INIT_DICE'],
        ['INIT_DICE','DICE_COAT'],
        ['DICE_COAT', 'FINAL_QC'],
        ['FINAL_QC', 'WIP3'],
        ['WIP3', None],
        ]
    step_data.reverse() # for easier processing
    
    @classmethod
    def setUpTestData(cls):
        # Make authenticated by calling parent
        AuthenticatedTestCase.setUpTestData()
        
        # Create Step objects in database
        cls.steps = {}
        for step in cls.step_data:
            next_step = None if step[1] is None else Step.objects.get(step_code=step[1])
            new_step = Step.objects.create(step_code=step[0], next_step=next_step)
            cls.steps[step[0]] = new_step
        
        # Create test SKUs
        cls.rm_sku = RM_skus.objects.create(
            rm_sku='test-rm-sku',
            location='test a location',
            description='test sku description',
            vendor_name='vendorTest',
            vendor_sku='test_sku',
            unit_cost='0.0')
        cls.coat_sku = COAT_skus.objects.create(
            coat_sku='test-coat-sku',
            rm_sku=cls.rm_sku,
            location='test coat location',
            description='test coat description',
            coat_part_cost='100.00')
        cls.sheet_sku = SHEET_skus.objects.create(
            sheet_sku='test-sheet-sku',
            coat_sku=cls.coat_sku,
            part_qty=1,
            cd_target=100,
            cd_min=90,
            cd_max=110,
            sheet_stock_min=25,
            sheet_part_cost=10
        )
        cls.dice_sku = DICE_skus.objects.create(
            dice_sku='test-dice-sku',
            sheet_sku=cls.sheet_sku,
            length_target=100,
            length_min=90,
            length_max=110,
            width_target=100,
            width_min=90,
            width_max=110,
            dice_part_cost=10
        )
        cls.fp_sku = FP_skus.objects.create(
            fp_sku='test_fp_sku',
            rm_sku=cls.rm_sku,
            coat_sku=cls.coat_sku,
            sheet_sku=cls.sheet_sku,
            dice_sku=cls.dice_sku
        )
        
        # Create basic fails
        cls.fail_1 = Fail.objects.create(name="None", description="no failure")
        cls.fail_2 = Fail.objects.create(name="General", description="general failure code")
        
        # Expose some steps for current cases
        # Should eventually be removed
        cls.ser_step = cls.steps["SER"]
        cls.init_photo_step = cls.steps["INIT_PHOTO"]
        cls.wip2_step = cls.steps["WIP2"]
        cls.init_dice_step = cls.steps["INIT_DICE"]
        cls.dice_coat_step = cls.steps["DICE_COAT"]