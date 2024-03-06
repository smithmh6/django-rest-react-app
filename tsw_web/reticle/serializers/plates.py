"""
Serializers for Plate objects.
"""

# import dependencies
from django.utils import timezone
from rest_framework import serializers
from .base import DynamicFieldSerializer
from ..models import Plate, Fail, Step

class PlateListSerializer(serializers.ListSerializer):
    """
    Serialize a list of Plate objects.
    """

    @classmethod
    def many_init(cls, *args, **kwargs):
        kwargs['child'] = cls()
        return PlateListSerializer(*args, **kwargs)

    def create(self, validated_data):
        """
        Bulk create Plate objects.
        """

        instance = []
        for record in validated_data:
            new_record = Plate.objects.create(**record)
            instance.append(new_record)

        return instance

    def update(self, instance, validated_data):
        """
        Override 'update' method to update records
        in bulk with derived serializers.

        Returns
        ---------
        Returns a queryset of Plate objects
        where scrapped/recycled fields are 'False'.
        """
        # if needed, context can be accessed via
        # self.context['key']

        # map instance id's and data id's
        obj_map = {obj.id: obj for obj in instance}
        data_map = {data['id']: data for data in validated_data}

        # list to store updated instances
        updates = []

        # iterate data map and perform updates
        for item_id, item in data_map.items():
            # get object instance where id's match
            record = obj_map.get(item_id, None)

            if record is not None:

                # get plate data
                fail1_id = item['fail1_object_id']
                recycled = item.get('recycled', None)

                # if the first fail ID is > 1, handle scrap/recycle
                if fail1_id is not None:
                    if fail1_id > 1:
                        if recycled == True and item['recycled_out'] is None:
                            # if 'recycled_out' is not Null, that means this
                            # is going out of queue
                            item['recycled_in'] = timezone.now()
                            item['scrapped'] = False
                        elif recycled == False:
                            item['scrapped'] = True
                    elif fail1_id == 1:
                        # reset failure mode
                        item['recycled'] = False
                        item['recycled_in'] = None
                        item['recycled_out'] = None
                        item['scrapped'] = False
                        item['fail2_object_id'] = 1
                        item['fail3_object_id'] = 1

                # Update timestamps for inventory/WIP step changes
                if (recycled == False and fail1_id == 1 and item['scrapped'] == False):
                    step = Step.objects.get(id=item['step_object_id'])

                    # update wip1 if needed
                    if step.name == 'WIP1':
                        item['wip1_in'] = timezone.now()

                    # update wip 2 if needed
                    elif step.name == 'WIP2':
                        item['wip2_in'] = timezone.now()

                # update the record with item data and append to 'updates'
                # calls the update() method from child serializer
                updates.append(self.child.update(record, item))

        # return instance list
        return updates

class DynamicPlateSerializer(DynamicFieldSerializer):
    """
    Serialize Plate objects. Inherits from DynamicFieldSerializer
    derived class. PlateListSerializer is used as the list serializer
    in order to support bulk creates and updates.

    Example Usage
    --------------
    >>> PlateSerializer(data=data, many=True, fields=('id', 'serial'))
    """
    id = serializers.IntegerField(required=False)
    step = serializers.SlugRelatedField(
        slug_field="name", queryset=Step.objects.all())

    class Meta:
        model = Plate
        fields = '__all__'
        list_serializer_class = PlateListSerializer

class CoatPlateSerializer(serializers.ModelSerializer):
    """
    Specifies Plate model data required during the COAT route.
    """
    id = serializers.IntegerField(required=False)

    class Meta:
        model = Plate
        fields = [
            'id', 'serial', 'batch_object_id', 'batch_content_type', 
            'created', 'modified', 'step_object_id', 'step_content_type',
            'recycled', 'recycled_in', 'recycled_out', 'in_queue',
            'scrapped', 'fail1_object_id', 'fail2_object_id', 'fail3_object_id',
            'fail1_content_type', 'fail2_content_type', 'fail3_content_type',
            'notes', 'high_grade', 'coated', 'wip1', 'wip1_in', 'rm_sku'
        ]
        list_serializer_class = PlateListSerializer

class SheetPlateSerializer(serializers.ModelSerializer):
    """
    Specifies the Plate model data exposed during the SHEET route.
    """

    id = serializers.IntegerField(required=False)
    
    class Meta:
        model = Plate
        fields = [
            'id', 'serial', 'wip1', 'wip1_out', 'wip2', 'wip2_in',
            'index', 'exposed', 'pm_sku', 'etched', 'etch_time', 'fail1_object_id', 'fail2_object_id',
            'fail3_object_id', 'recycled', 'recycled_in', 'recycled_out', 'scrapped', 'part_qty', 'part_fail_qty',
            'notes', 'step_object_id', 'step_content_type', 'high_grade', 'available_parts',
            'sheet_batch_object_id', 'sheet_batch_content_type'
        ]
        list_serializer_class = PlateListSerializer
        
class DicePlateSerializer(serializers.ModelSerializer):
    """
    Specifies the Plate model data exposed for dice batch initialization.
    """
    
    id = serializers.IntegerField(required=False)
    
    class Meta:
        model = Plate
        fields = [
            'id', 'serial', 'fail1_object_id', 'fail2_object_id', 'fail3_object_id', 'recycled', 'recycled_in', 'recycled_out', 'scrapped', 'part_qty', 'part_fail_qty',
            'notes', 'step_object_id', 'step_content_type', 'available_parts'
        ]
        list_serializer_class = PlateListSerializer
        



