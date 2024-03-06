"""
Serializers for Batch objects.
"""

# import dependencies
from django.utils import timezone
from rest_framework import serializers
from ..models import *
from .skus import CoatSkuSerializer, SheetSkuSerializer, DiceSkuSerializer

class CoatBatchSerializer(serializers.ModelSerializer):
    
    pass_qty = serializers.ReadOnlyField()
    fail_qty = serializers.ReadOnlyField()
    coat_sku_detail = CoatSkuSerializer(read_only=True, many=False, source='sku')
    
    class Meta:
        model = CoatBatch
        fields = '__all__'
        
    def update(self, instance, validated_data):
        """
        Override 'update' method to close batch on WIP1 step
        """

        step_id =  validated_data['step_object_id']
        if step_id == 7: # hardcoded to WIP1. Ideally, we reference against Step objects.
            validated_data['closed'] = True

        # iterate items in validated_data
        for field, value in validated_data.items():
            # don't modify batch name
            if field != 'name':
                # update record attributes
                setattr(instance, field, value)

        # Save and return instance
        instance.save()
        return instance

class SheetBatchSerializer(serializers.ModelSerializer):
   
    pass_qty = serializers.ReadOnlyField()
    fail_qty = serializers.ReadOnlyField()
    sheet_sku_detail = SheetSkuSerializer(read_only=True, many=False, source='sku')
    
    class Meta:
        model = SheetBatch
        fields = '__all__'
        
    def update(self, instance, validated_data):
        """
        Override 'update' method to close batch on WIP2 step
        """

        step_id =  validated_data['step_object_id']
        if step_id == 19: # ID for WIP2.
            validated_data['closed'] = True

        # iterate items in validated_data
        for field, value in validated_data.items():
            # don't modify batch name
            if field != 'name':
                # update record attributes
                setattr(instance, field, value)

        # save the instance
        instance.save()

        # return updated instance
        return instance
        
class DiceBatchSerializer(serializers.ModelSerializer):
    
    pass_qty = serializers.ReadOnlyField()
    fail_qty = serializers.ReadOnlyField()
    value = serializers.ReadOnlyField()
    dice_sku_detail = DiceSkuSerializer(read_only=True, many=False, source='sku')
    
    class Meta:
        model = DiceBatch
        fields = '__all__'
    
    def update(self, instance, validated_data):
        """
        Override 'update' method to close batch on WIP3 step
        """

        step_id =  validated_data['step_object_id']
        if step_id == 29: # ID of WIP3 step
            validated_data['closed'] = True

        # iterate items in validated_data
        for field, value in validated_data.items():
            # don't modify batch name
            if field != 'name':
                # update record attributes
                setattr(instance, field, value)

        # save the instance
        instance.save()

        # return updated instance
        return instance