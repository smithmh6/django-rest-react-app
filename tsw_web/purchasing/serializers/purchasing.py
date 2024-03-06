"""
Serializers for purchase items and requests.
"""

from rest_framework.serializers import ModelSerializer, IntegerField, ReadOnlyField, SerializerMethodField
from ..models import Vendor, PurchaseItem, PurchaseRequest
from .list_serializers import PurchaseItemListSerializer, PurchaseRequestListSerializer

class VendorSerializer(ModelSerializer):
    """
    Serializer for vendor objects.
    """

    class Meta:
        model = Vendor
        fields = '__all__'

class PurchaseItemSerializer(ModelSerializer):
    """
    Serialize an instance of a Purchase object.
    """
    id = IntegerField(required=False)

    def get_username(self, obj):
        """
        Returns username from related purchase.
        """
        return obj.purchase.user.username

    def get_request_modified(self, obj):
        """
        Get the modified date of the related PurchaseRequest.
        """
        return obj.purchase.modified

    username = SerializerMethodField("get_username")
    request_modified = SerializerMethodField("get_request_modified")

    class Meta:
        model = PurchaseItem
        fields = '__all__'
        list_serializer_class = PurchaseItemListSerializer

class PurchaseRequestSerializer(ModelSerializer):
    """
    Serializes PurchaseRequest objects.
    """
    id = IntegerField(required=False)
    item_count = ReadOnlyField()
    total_cost = ReadOnlyField()
    total_approved = ReadOnlyField()

    class Meta:
        model = PurchaseRequest
        fields = '__all__'
        list_serializer_class = PurchaseRequestListSerializer
