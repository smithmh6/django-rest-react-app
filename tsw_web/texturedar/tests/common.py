from django.contrib.contenttypes.models import ContentType
from ..models import *
from common.tests.common import AuthenticatedTestCase

class ARTestCase(AuthenticatedTestCase):
    """
    WIP TestCase class that sets up necessary data for testing
    AR batches.
    """
    
    @classmethod
    def setUpTestData(cls):
        # Make authenticated by calling parent
        super().setUpTestData()
        cls.dummy_content_type = ContentType.objects.create()
        cls.oc_sku_content_type = ContentType.objects.get(app_label='texturedar', model='opticalcoatsku')
        cls.fp_sku_content_type = ContentType.objects.get(app_label='texturedar', model='finalproductsku')

        cls.vendor_sku = VendorSku.objects.create(name="test-vendor-sku", 
                                                  cost=0, 
                                                  vendor_object_id=1, 
                                                  vendor_content_type=cls.dummy_content_type, 
                                                  alternate_vendor_object_id=1, 
                                                  alternate_vendor_content_type=cls.dummy_content_type)
        cls.rm_sku = RawMaterialSku.objects.create(name='test-rm-sku', cost=0, qty=10, vendor_sku=cls.vendor_sku)
        cls.oc_sku = OpticalCoatSku.objects.create(name='test-oc-sku', cost=50, rm_sku=cls.rm_sku)
        cls.product_category = ProductCategory.objects.create(name='test-product.category', code="TEST")
        cls.fp_sku = FinalProductSku.objects.create(name='test-fp-sku', cost=40, price=100, oc_sku= cls.oc_sku, category=cls.product_category)
        cls.rie_system = RieSystem.objects.create(name='test-rie-system', 
                                                  code='TEST', 
                                                  vendor_content_type=cls.dummy_content_type, 
                                                  vendor_object_id=1, 
                                                  alternate_vendor_content_type=cls.dummy_content_type, 
                                                  alternate_vendor_object_id=1)
        cls.etch_recipe = EtchRecipe.objects.create(name='test-etch-recipe', rie=cls.rie_system, oc_sku=cls.oc_sku)
        cls.rie_tooling = RieTooling.objects.create(name='test-rie-tooling', code='TEST')
    
    def create_batch(cls, name="TAR000001", order_no="TBD", qty=1, closed=False, batch_type="PRODUCTION"):
        return TarBatch.objects.create(name=name, 
                                order_no=order_no, 
                                qty=qty, 
                                closed=closed,
                                sku_content_type=ContentType.objects.get(app_label="texturedar", model="opticalcoatsku"),
                                sku_object_id=cls.oc_sku.id,
                                step_content_type=cls.dummy_content_type,
                                step_object_id=1,
                                batch_type=batch_type,
                                recipe=cls.etch_recipe,
                                tooling=cls.rie_tooling,
                                user=cls.test_user)
    
    def create_part(cls):
        return Part.objects.create(index=1, pocket=1, step_content_type=cls.dummy_content_type, step_object_id=1, fail1_object_id=1)
        
    def create_part_with_batch(cls, batch):
        p = cls.create_part()
        p.batch = batch
        p.save()
        return p
    
    def test_setup(self):
        try:
            VendorSku.objects.get()
            RawMaterialSku.objects.get()
            OpticalCoatSku.objects.get()
            FinalProductSku.objects.get()
        except:
            self.fail(msg="Setup for ARTestCase failed.")
