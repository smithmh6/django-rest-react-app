"""
Serializers for the shipping app.
"""

from rest_framework.serializers import ModelSerializer, IntegerField, SlugRelatedField
from .models import Shipment, Customer, Warehouse, Status
from texturedar.models import Part, TarBatch
from texturedar.serializers import PartListSerializer

class StatusSerializer(ModelSerializer):
    """
    Serializes Status objects.
    """

    class Meta:
        model = Status
        fields = '__all__'

class ShipmentSerializer(ModelSerializer):
    """
    Serialize Shipment objects.
    """

    class Meta:
        model = Shipment
        fields= '__all__'

class CustomerSerializer(ModelSerializer):
    """
    Serailize Customer objects.
    """

    class Meta:
        model = Customer
        fields= '__all__'

class WarehouseSerializer(ModelSerializer):
    """
    Serialize Warhouse objects.
    """

    class Meta:
        model = Warehouse
        fields= '__all__'

class TARPartSerializer(ModelSerializer):
    """
    Serialize Part objects for shipment viewing.
    Used to return batch name to avoid fetching all batches to get name.
    """
    id = IntegerField(required=False)
    batch = SlugRelatedField(slug_field="name", queryset=TarBatch.objects.all())
    class Meta:
        model = Part
        fields = '__all__'
        list_serializer_class = PartListSerializer