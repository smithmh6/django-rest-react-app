"""
This module contains 'Serializer' classes that
inherit from the REST Framework's Serializers class.
These can be used to validate data and work with data
in native python data types.
"""

# import dependencies
from django.utils import timezone
from rest_framework import serializers
from .models import *

class DynamicFieldSerializer(serializers.ModelSerializer):
    """
    Takes an additional 'fields' argument that controls
    which fields to be used during serialization. Inherits
    from 'ModelSerializer' base class.
    """

    def __init__(self, *args, **kwargs):
        """
        Instantiate the serializer.
        """
        # don't pass 'fields' arg up to superclass
        fields = kwargs.pop('fields', None)

        # instantiate superclass
        super(DynamicFieldSerializer, self).__init__(*args, **kwargs)

        if fields is not None:
            # drop fields not specified in 'fields' argument
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)


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

        # add 'created_date' field
        ## for row in validated_data:
        ##     row['created'] = timezone.now()

        plates = [Part(**record) for record in validated_data]
        return Part.objects.bulk_create(plates)

    def update(self, instance, validated_data):
        """
        Override 'update' method to update records
        in bulk with derived serializers.

        Returns
        ---------
        Returns a queryset of Part objects
        where scrapped/recycled fields are 'False'.
        """
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
                # add 'modified' field to each item
                ## item['modified'] = timezone.now()

                # update the record with item data
                # append to 'updates'
                updates.append(self.child.update(record, item))

        # use context to filter on batch
        query_filter = {}

        #batch_field = self.context['batch_type'] + '_batch'
        #query_filter[batch_field] = self.context['batch_name']

        # return instance list
        return updates


class PartSerializer(serializers.ModelSerializer):
    """
    Serialize Part objects. Inherits from DynamicFieldSerializer
    derived class. PartListSerializer is used as the list serializer
    in order to support bulk creates and updates.

    Example Usage
    --------------
    >>> PlateSerializer(data=data, many=True, fields=('id', 'serial'))
    """
    id = serializers.IntegerField(required=False)
    class Meta:
        model = Part
        fields = '__all__'
        list_serializer_class = PartListSerializer


class BatchSerializer(serializers.ModelSerializer):
    """
    Serialize TarBatch objects.
    """
    
    fails = serializers.ReadOnlyField()

    class Meta:
        model = TarBatch
        fields = '__all__'

class FailSerializer(serializers.ModelSerializer):
    """
    """

    class Meta:
        model = Fail
        fields = '__all__'

class StepSerializer(serializers.ModelSerializer):
    """
    """

    class Meta:
        model = Step
        fields = '__all__'
     

class VendorSkuSerializer(serializers.ModelSerializer):
    """
    """
    
    class Meta:
        model = VendorSku
        fields = '__all__'

class RawMaterialSkuSerializer(serializers.ModelSerializer):
    """
    """

    class Meta:
        model = RawMaterialSku
        fields = '__all__'
        
class OpticalCoatSkuSerializer(serializers.ModelSerializer):
    """
    """

    class Meta:
        model = OpticalCoatSku
        fields = '__all__'
        
class ProductCategorySerializer(serializers.ModelSerializer):
    """
    """
    
    class Meta:
        model = ProductCategory
        fields = '__all__'

class FinalProductSkuSerailizer(serializers.ModelSerializer):
    """
    """

    class Meta:
        model = FinalProductSku
        fields = '__all__'
        
class RieSystemSerializer(serializers.ModelSerializer):
    """
    """
    class Meta:
        model = RieSystem
        fields = ['name', 'description', 'code']
        
class EtchRecipeSerializer(serializers.ModelSerializer):
    """
    """
    class Meta:
        model = EtchRecipe
        fields = ['id', 'name', 'rie']
        
class RieToolingSerializer(serializers.ModelSerializer):
    """
    """
    class Meta:
        model = RieTooling
        fields = ['id', 'code']

