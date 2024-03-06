"""
Serializers for SKU objects.
"""

# import dependencies
from rest_framework import serializers
from ..models import (RawMaterialSku,
                      CoatSku,
                      PhotomaskSku,
                      SheetSku,
                      DiceSku,
                      FinalProductSku)
from purchasing.models import Vendor

class RawMaterialSkuSerializer(serializers.ModelSerializer):
    """
    Serialize Raw Material SKUs.
    """

    class Meta:
        model = RawMaterialSku
        fields = '__all__'

class CoatSkuSerializer(serializers.ModelSerializer):
    """
    Serialize Coat SKUs.
    """

    class Meta:
        model = CoatSku
        fields = '__all__'

class PhotoMaskSkuSerializer(serializers.ModelSerializer):
    """
    Serialize Photomask SKUs.
    """
    
    sheet_sku = serializers.SlugRelatedField(many=True, slug_field="name", queryset=SheetSku.objects.all())
    vendor = serializers.SlugRelatedField(slug_field="name", queryset=Vendor.objects.all())

    class Meta:
        model = PhotomaskSku
        fields = '__all__'

class SheetSkuSerializer(serializers.ModelSerializer):
    """
    Serialize Sheet SKUs.
    """
    pm_sku = PhotoMaskSkuSerializer(read_only=True, many=True)

    class Meta:
        model = SheetSku
        fields = '__all__'

class DiceSkuSerializer(serializers.ModelSerializer):
    """
    Serialize Dice SKUs.
    """
    plate_percentage = serializers.ReadOnlyField()
    sheet_sku_detail = SheetSkuSerializer(read_only=True, many=False, source='sheet_sku')

    class Meta:
        model = DiceSku
        fields = '__all__'

class FinalProductSkuSerializer(serializers.ModelSerializer):
    """
    Serialize Final Product SKUs.
    """

    class Meta:
        model = FinalProductSku
        fields = '__all__'
