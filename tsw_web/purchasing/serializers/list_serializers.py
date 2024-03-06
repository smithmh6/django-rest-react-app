from django.utils import timezone
from rest_framework import serializers
from ..models import PurchaseItem, PurchaseRequest

class PurchaseItemListSerializer(serializers.ListSerializer):
    """
    List Serializer for serializing multiple PurchaseItem objects.
    """

    @classmethod
    def many_init(cls, *args, **kwargs):
        kwargs['child'] = cls()
        return PurchaseItemListSerializer(*args, **kwargs)

    def create(self, validated_data):
        """
        Bulk create Plate objects.
        """

        instance = []
        for record in validated_data:
            new_record = PurchaseItem.objects.create(**record)
            instance.append(new_record)

        return instance

    def update(self, instance, validated_data):
        """
        Override 'update' method to update records
        in bulk with derived serializers.

        Returns
        ---------
        Returns a queryset of objects.
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
                # add 'modified' field to each item
                #item['modified'] = timezone.now()

                # update the record with item data and append to 'updates'
                # calls the update() method from child serializer
                updates.append(self.child.update(record, item))

        # return instance list
        return updates

class PurchaseRequestListSerializer(serializers.ListSerializer):
    """
    List Serializer for serializing multiple PurchaseRequest objects.
    """

    @classmethod
    def many_init(cls, *args, **kwargs):
        kwargs['child'] = cls()
        return PurchaseRequestListSerializer(*args, **kwargs)

    def create(self, validated_data):
        """
        Bulk create Plate objects.
        """

        instance = []
        for record in validated_data:
            new_record = PurchaseItem.objects.create(**record)
            instance.append(new_record)

        return instance

    def update(self, instance, validated_data):
        """
        Override 'update' method to update records
        in bulk with derived serializers.

        Returns
        ---------
        Returns a queryset of objects.
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
                # add 'modified' field to each item
                #item['modified'] = timezone.now()

                # update the record with item data and append to 'updates'
                # calls the update() method from child serializer
                updates.append(self.child.update(record, item))

        # return instance list
        return updates
