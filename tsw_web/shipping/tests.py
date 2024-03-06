from django.contrib.contenttypes.models import ContentType
from shipping.models import Shipment, Status
from texturedar.models import Part
from texturedar.tests.common import ARTestCase

class ShipmentTestCase(ARTestCase):
    
    shipment_url = '/api/shipping/shipments/'
    
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        # Add pending and delivered statuses
        cls.pending_status = Status.objects.create(name="Pending", code="PENDING")
        cls.delivered_status = Status.objects.create(name="Delivered", code="DELIVERED")
        
    # Helper Method
    def create_shipment(self):
        Shipment.objects.create(qty=1, status=self.pending_status)
    
    def post_shipment(self, data):
        return self.client.post(self.shipment_url, data, format="json")
    
    def patch_shipment(self, shipment_id, data):
        return self.client.patch(self.shipment_url + str(shipment_id) + '/' , data, format="json")
    
    def oc_shipment_data_with_parts(self, parts):
        oc_sku_content_type = ContentType.objects.get(app_label='texturedar', model='opticalcoatsku')
        return {"qty": 1, "status": "PENDING", "parts": parts, "item_content_type": oc_sku_content_type.id, "item_object_id": 1}

    def fp_shipment_data_with_parts(self, parts):
        fp_sku_content_type = ContentType.objects.get(app_label='texturedar', model='finalproductsku')
        return {"qty": 1, "status": "PENDING", "parts": parts, "item_content_type": fp_sku_content_type.id, "item_object_id": self.fp_sku.id}

    # Tests Start Here
    def test_post_no_parts(self):
        shipment = {"qty": 1, "status": "PENDING"}
        response = self.post_shipment(shipment)
        self.assertEqual(response.status_code, 400, msg=f"Shipment creation returns {response.status_code} instead of 400 Bad Request when provided no part IDs")
    
    def test_post_with_nonexistent_parts(self):
        shipment = {"qty": 4, "status": "PENDING", "parts": [1, 2, 3, 4]}
        response = self.post_shipment(shipment)
        self.assertEqual(response.status_code, 400, msg=f"Shipment creation returns {response.status_code} instead of 400 Bad Request when given non-existent part IDs")
        
    def test_post_with_existing_parts(self):
        p = self.create_part()
        shipment_data = {"qty": 1, "status": "PENDING", "parts": [p.id]}
        response = self.post_shipment(shipment_data)
        self.assertEqual(response.status_code, 201, msg=f"Shipment creation returns {response.status_code} instead of 201 when given real part IDs")
        self.assertEqual(response.data.get('qty'), shipment_data['qty'], msg="Shipment qty not correctly assigned")
        self.assertEqual(response.data.get('status'), shipment_data['status'], msg="Shipment status not correctly assigned")
        shipment_id = response.data.get('id')
        p = Part.objects.get(id=p.id) # refresh part object with new data
        self.assertEqual(p.shipment_object_id, shipment_id, msg=f"Part was assigned incorrect shipment ID on creation")
    
    def test_shipment_closing_open_oc_batch(self):
        batch = self.create_batch()
        p = self.create_part_with_batch(batch)
        shipment_data = self.oc_shipment_data_with_parts([p.id])
        response = self.post_shipment(shipment_data)
        shipment_id = response.data.get('id')
        shipment_patch_data = {"status": "DELIVERED"}
        response = self.patch_shipment(shipment_id, shipment_patch_data)
        self.assertEquals(response.status_code, 400, msg=f"Closing an OC shipment with an open batch returns {response.status_code} instead of 400 Bad Request")
        
    def test_shipment_closing_oc(self):
        batch = self.create_batch(closed=True)
        p = self.create_part_with_batch(batch)
        shipment_data = self.oc_shipment_data_with_parts([p.id])
        response = self.post_shipment(shipment_data)
        shipment_id = response.data.get('id')
        shipment_patch_data = {"status": "DELIVERED"}
        response = self.patch_shipment(shipment_id, shipment_patch_data)
        self.assertEquals(response.status_code, 200, msg=f"Closing an OC shipment with a closed batch returns {response.status_code} instead of 200 OK")
        self.assertEquals(float(response.data['value']), self.oc_sku.cost, msg="OC Shipment value doesn't match OC SKU cost")

    def test_shipment_closing_oc_to_fp(self):
        fp_sku_content_type = ContentType.objects.get(app_label='texturedar', model='finalproductsku')
        batch = self.create_batch(closed=True)
        p = self.create_part_with_batch(batch)
        shipment_data = self.oc_shipment_data_with_parts([p.id])
        response = self.post_shipment(shipment_data)
        shipment_id = response.data.get('id')
        shipment_patch_data = {"status": "DELIVERED", "item_content_type": fp_sku_content_type.id, "item_object_id": self.fp_sku.id}
        response = self.patch_shipment(shipment_id, shipment_patch_data)
        self.assertEquals(response.status_code, 200, msg=f"Closing an OC shipment and patching to FP SKU with a closed batch returns {response.status_code} instead of 200 OK")
        self.assertEquals(float(response.data['value']), self.fp_sku.price, msg="OC to FP Shipment value doesn't match FP SKU price")
        
    def test_shipment_closing_fp(self):
        batch = self.create_batch(closed=True)
        p = self.create_part_with_batch(batch)
        shipment_data = self.fp_shipment_data_with_parts([p.id])
        response = self.post_shipment(shipment_data)
        shipment_id = response.data.get('id')
        shipment_patch_data = {"status": "DELIVERED"}
        response = self.patch_shipment(shipment_id, shipment_patch_data)
        self.assertEquals(response.status_code, 200, msg=f"Closing an FP SKU shipment returns {response.status_code} instead of 200 OK")
        self.assertEquals(float(response.data['value']), self.fp_sku.price, msg="FP Shipment value doesn't match FP SKU price")
        
    def test_shipment_closing_multiple_parts(self):
        batch = self.create_batch(closed=True)
        num_parts = 5
        ids = []
        for n in range(num_parts):
            p = self.create_part_with_batch(batch)
            ids.append(p.id)
        shipment_data = self.fp_shipment_data_with_parts(ids)
        response = self.post_shipment(shipment_data)
        shipment_id = response.data.get('id')
        shipment_patch_data = {"status": "DELIVERED"}
        response = self.patch_shipment(shipment_id, shipment_patch_data)
        self.assertEquals(response.status_code, 200, msg=f"Closing an FP SKU shipment returns {response.status_code} instead of 200 OK")
        self.assertEquals(float(response.data['value']), self.fp_sku.price * num_parts, msg="FP Shipment with multiple parts value doesn't match FP SKU price")