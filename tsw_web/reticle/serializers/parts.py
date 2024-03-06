"""
Serializers for Part objects.
"""

# import dependencies
from django.utils import timezone
from rest_framework import serializers
from .base import DynamicFieldSerializer
from ..models import DiceBatch, Part, Step

class PartListSerializer(serializers.ListSerializer):
    """
    Serialize a list of Part objects.
    """

    @classmethod
    def many_init(cls, *args, **kwargs):
        kwargs['child'] = cls()
        return PartListSerializer(*args, **kwargs)

    def create(self, validated_data):
        """
        Bulk create Part objects.
        """

        parts = [Part(**record) for record in validated_data]
        return Part.objects.bulk_create(parts)

    def update(self, instance, validated_data):
        """
        Override 'update' method to update records
        in bulk with derived serializers.

        Returns
        ---------
        Returns the list of updated part instances.
        """
        # map instance id's and data id's
        obj_map = {obj.id: obj for obj in instance}
        data_map = {data['id']: data for data in validated_data}

        # list to store updated instances
        updates = []

        # iterate data map and perform updates
        for item_id, item in data_map.items():
            record = obj_map.get(item_id)

            if record is not None:

                # Reset fails 2 and 3 if fail1 is not failed (e.g. == 1)
                fail1_id = item.get('fail1_object_id')
                if fail1_id == 1:
                    item['fail2_object_id'] = 1
                    item['fail3_object_id'] = 1
                        
                # Update timestamps for relevant steps
                step = item.get('step')
                if (step is not None):
                    if (step.step_code == 'WIP3' and fail1_id == 1):
                        item['wip3_in'] = timezone.now()

                    if (step.step_code == 'DICING'):
                        item['diced'] = timezone.now()

                # update the record with item data
                # append to 'updates'
                updates.append(self.child.update(record, item))

        # return instance list
        return updates

class DynamicPartSerializer(DynamicFieldSerializer):
    """
    Serialize Part objects. Inherits from DynamicFieldSerializer
    derived class. PartListSerializer is used as the list serializer
    in order to support bulk creates and updates.

    Example Usage
    --------------
    >>> PartSerializer(data=data, many=True, fields=('id', 'serial'))
    """
    id = serializers.IntegerField(required=False)
    class Meta:
        model = Part
        fields = '__all__'
        list_serializer_class = PartListSerializer

class SheetPartSerializer(serializers.ModelSerializer):
    """
    Specifies Part model fields to expose in SHEET route.
    """
    id = serializers.IntegerField(required=False)

    class Meta:
        model = Part
        fields = ['id', 'plate', 'index', 'step_object_id', 'step_content_type', 'photo_cd', 'etch_cd',
                  'fail1_object_id', 'fail2_object_id', 'fail3_object_id', 
                  'fail1_content_type', 'fail2_content_type', 'fail3_content_type', 'notes', 'serial']
        list_serializer_class = PartListSerializer

class DicePartSerializer(serializers.ModelSerializer):
    """
    Specifies Part model fields to expose in DICE route.
    """
    id = serializers.IntegerField(required=False)

    class Meta:
        model = Part
        fields = ['id', 'plate', 'index', 'step_object_id', 'step_content_type', 'batch_object_id', 'width', 'length', 'diced',
                  'thickness', 'fail1_object_id', 'fail2_object_id', 'fail3_object_id', 'notes', 'serial']
        list_serializer_class = PartListSerializer

class ShipPartSerializer(serializers.ModelSerializer):
    """
    Specifies the Part model data to be exposed in the SHIP route.
    """
    id = serializers.IntegerField(required=False)
    batch = serializers.SlugRelatedField(slug_field="name", queryset=DiceBatch.objects.all())
    step = serializers.SlugRelatedField(slug_field="name", queryset=Step.objects.all())
    class Meta:
        model = Part
        fields = ['id', 'plate', 'index', 'step_object_id', 'step', 'serial', 'batch',
                   'batch_object_id', 'wip3_in', 'wip3_out', 'notes' ]
        list_serializer_class = PartListSerializer
