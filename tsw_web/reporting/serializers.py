from rest_framework import serializers
from .models import *
from pytz import timezone

class MaintenanceRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceRequest
        fields = '__all__'

    def create(self, validated_data):
        """
        Override create() for 'created_by' updating
        """

        # add user who sent request to 'created_by' field
        request = self.context.get('request', None)
        validated_data['created_by'] = request.user if request else None

        return MaintenanceRequest.objects.create(**validated_data)

class GeneralNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneralNote
        fields = '__all__'

    def update(self, instance, validated_data):
        """
        Override update() for 'modified' field updates
        """
        request = self.context.get('request', None)
        validated_data['last_modified_by'] = request.user if request else None

        # update instance with validated data
        for field, value in validated_data.items():
            setattr(instance, field, value)

        # save the instance
        instance.save()

        # return updated instance
        return instance
        